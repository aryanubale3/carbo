import express from "express";
import path from "path";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { createServer as createViteServer } from "vite";
import { processReceiptScan, processChat } from "./src/services/geminiService";
import { 
  insertReceiptTelemetry, 
  getCityBenchmarks 
} from "./src/services/bigqueryService";
import { rateLimiter } from "./src/middleware/rateLimiter";

dotenv.config();

async function initializeFirebaseAdmin() {
  if (admin.apps.length) return;
  try {
    let credential;
    if (process.env.USE_SECRET_MANAGER === "true") {
      try {
        const { SecretManagerServiceClient } = (await import("@google-cloud/secret-manager")) as {
          SecretManagerServiceClient: new () => {
            accessSecretVersion: (args: { name: string }) => Promise<[{ payload?: { data?: { toString: () => string } } }]>;
          };
        };
        const client = new SecretManagerServiceClient();
        const name = `projects/${process.env.GCP_PROJECT_ID}/secrets/FIREBASE_SERVICE_ACCOUNT_KEY/versions/latest`;
        const [version] = await client.accessSecretVersion({ name });
        const secretPayload = version.payload?.data?.toString();
        if (secretPayload) {
          const sa = JSON.parse(secretPayload);
          if (sa.private_key) {
            sa.private_key = sa.private_key.replace(/\\n/g, '\n');
          }
          credential = admin.credential.cert(sa);
        }
      } catch (smErr: unknown) {
        const message = smErr instanceof Error ? smErr.message : String(smErr);
        console.warn("Secret Manager authentication failed, trying local credentials:", message);
      }
    }

    if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON);
      if (sa.private_key) {
        sa.private_key = sa.private_key.replace(/\\n/g, '\n');
      }
      credential = admin.credential.cert(sa);
    }

    admin.initializeApp({
      ...(credential ? { credential } : {}),
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || `${process.env.VITE_FIREBASE_PROJECT_ID || "mock-project-id"}.appspot.com`
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (err) {
    console.warn("Using Firebase Application Default Credentials (ADC) / Workload Identity:", err);
    admin.initializeApp();
  }
}

const app = express();
app.set("trust proxy", true);
app.disable("x-powered-by");
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; frame-src 'self' https://*.firebaseapp.com; img-src 'self' data: https://*; connect-src 'self' https://*;");
  next();
});

// Custom memory-based rate-limiter middleware to mitigate DoS / brute-force attacks
app.use(rateLimiter);

// API Route: Generate GCS Signed URL for receipt image upload
app.post("/api/get-signed-url", async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      return res.status(400).json({ error: "Filename and contentType are required" });
    }

    const bucket = admin.storage().bucket();
    const file = bucket.file(filename);

    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType
    });

    const gcsUrl = `gs://${bucket.name}/${filename}`;
    return res.json({ signedUrl, gcsUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("GCS Signed URL Generation failed (using local mock upload fallback):", message);
    const mockFilename = req.body.filename || "mock-receipt.jpg";
    return res.json({
      signedUrl: `http://localhost:${PORT}/api/mock-upload?file=${encodeURIComponent(mockFilename)}`,
      gcsUrl: `gs://mock-bucket/${mockFilename}`
    });
  }
});

// Mock uploading endpoint for offline/fallback/test suite use
app.put("/api/mock-upload", (_req, res) => {
  res.sendStatus(200);
});
app.get("/api/mock-upload", (_req, res) => {
  res.sendStatus(200);
});

// API Route: Scan and Calculate Receipt Carbon Footprint
app.post("/api/scan-receipt", async (req, res) => {
  try {
    const { imageBase64, mimeType, sampleId, rawText, gcsUrl } = req.body;
    const result = await processReceiptScan({ imageBase64, mimeType, sampleId, rawText, gcsUrl });
    
    // Ingest scanned items telemetry into BigQuery
    if (result && result.items && Array.isArray(result.items)) {
      const city = req.body.city || "Bengaluru";
      insertReceiptTelemetry(result.items, city).catch((bqErr) => {
        console.error("Failed to insert telemetry to BigQuery:", bqErr);
      });
    }

    return res.json(result);
  } catch (error: unknown) {
    console.error("Gemini Scan Error:", error);
    res.status(500).json({ error: "Failed to scan receipt carbon footprint" });
  }
});

// API Route: AI Carbon Coach Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, scanHistory } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }
    const result = await processChat({ messages, scanHistory });
    return res.json(result);
  } catch (error: unknown) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: "Failed to communicate with AI Coach" });
  }
});

// API Route: Retrieve live city benchmarks from BigQuery
app.get("/api/city-benchmarks", async (_req, res) => {
  try {
    const benchmarks = await getCityBenchmarks();
    return res.json(benchmarks);
  } catch (error: unknown) {
    console.error("Get City Benchmarks Error:", error);
    res.status(500).json({ error: "Failed to retrieve city benchmarks" });
  }
});

// Configure GCS Bucket Lifecycle policies
async function configureBucketLifecycle() {
  try {
    const bucket = admin.storage().bucket();
    await bucket.setMetadata({
      lifecycle: {
        rule: [
          {
            action: { type: "Delete" },
            condition: { age: 7 } // Auto delete after 7 days
          }
        ]
      }
    });
    console.log("Cloud Storage lifecycle cleanup configured (7 days retention).");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("Storage lifecycle configuration skipped (using fallback):", message);
  }
}

// Configure Vite or Static delivery depending on environment
async function startServer() {
  // Initialize admin SDK
  await initializeFirebaseAdmin();
  // Configure storage lifecycle policy
  await configureBucketLifecycle();

  if (process.env.NODE_ENV !== "production") {
    console.log("Enabling development mode with Vite hot module replacement middle-layer...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Enabling production mode with secure static distribution of optimized client assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CarbonIQ backend server running at http://0.0.0.0:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export { app, startServer };
