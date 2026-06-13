import { BigQuery } from "@google-cloud/bigquery";
import { ReceiptItem } from "../types";

const projectId = process.env.GCP_PROJECT_ID || "mock-project-id";

// Initialize the BigQuery client. Fallback to null if not in production or mock credentials are used.
let bqClient: BigQuery | null = null;
try {
  if (process.env.NODE_ENV === "production" || (process.env.GCP_PROJECT_ID && !process.env.GCP_PROJECT_ID.includes("mock"))) {
    bqClient = new BigQuery({ projectId });
  }
} catch (err) {
  console.warn("BigQuery Client initialization skipped (credentials not configured):", err);
}

const DATASET_ID = "carboniq_analytics";
const TABLE_ID = "receipt_items";

export async function initBigQuerySchema() {
  if (!bqClient) return;
  try {
    const [datasets] = await bqClient.getDatasets();
    const datasetExists = datasets.some((d) => d.id === DATASET_ID);
    if (!datasetExists) {
      await bqClient.createDataset(DATASET_ID);
      console.log(`Created BigQuery dataset: ${DATASET_ID}`);
    }

    const dataset = bqClient.dataset(DATASET_ID);
    const [tables] = await dataset.getTables();
    const tableExists = tables.some((t) => t.id === TABLE_ID);
    if (!tableExists) {
      const schema = [
        { name: "id", type: "STRING", mode: "REQUIRED" },
        { name: "name", type: "STRING", mode: "REQUIRED" },
        { name: "co2", type: "FLOAT", mode: "REQUIRED" },
        { name: "quantity", type: "STRING", mode: "NULLABLE" },
        { name: "category", type: "STRING", mode: "REQUIRED" },
        { name: "ecoRating", type: "STRING", mode: "REQUIRED" },
        { name: "alternative", type: "STRING", mode: "NULLABLE" },
        { name: "timestamp", type: "TIMESTAMP", mode: "REQUIRED" },
        { name: "city", type: "STRING", mode: "REQUIRED" }
      ];
      await dataset.createTable(TABLE_ID, { schema });
      console.log(`Created BigQuery table: ${TABLE_ID}`);
    }
  } catch (err) {
    console.error("Failed to initialize BigQuery dataset/table schema:", err);
  }
}

export async function insertReceiptTelemetry(items: ReceiptItem[], city: string) {
  if (!bqClient) {
    console.log(`[Offline BigQuery] Mock-inserted ${items.length} items for city ${city}`);
    return;
  }
  try {
    const rows = items.map((item) => ({
      id: item.id || `item-${Date.now()}-${Math.random()}`,
      name: item.name,
      co2: item.co2,
      quantity: item.quantity || "",
      category: item.category,
      ecoRating: item.ecoRating,
      alternative: item.alternative || "",
      timestamp: new Date().toISOString(),
      city: city || "Bengaluru"
    }));

    await bqClient.dataset(DATASET_ID).table(TABLE_ID).insert(rows);
    console.log(`Streamed ${rows.length} rows to BigQuery telemetry.`);
  } catch (err) {
    console.error("BigQuery Streaming Insert Error:", err);
  }
}

export async function getCityBenchmarks(): Promise<any[]> {
  if (!bqClient) {
    return [
      { name: "Bengaluru", avgCo2: 4.25, rank: 1, trend: "improving", emissionLeader: "Koramangala Node", topSector: "Dairy" },
      { name: "Mumbai", avgCo2: 5.62, rank: 2, trend: "stable", emissionLeader: "Bandra Core Node", topSector: "Logistics" },
      { name: "Pune", avgCo2: 5.89, rank: 3, trend: "increasing", emissionLeader: "Kothrud South", topSector: "Grains" },
      { name: "Chennai", avgCo2: 6.12, rank: 4, trend: "stable", emissionLeader: "Adyar Grid", topSector: "Meat" },
      { name: "Delhi NCR", avgCo2: 7.84, rank: 5, trend: "increasing", emissionLeader: "Dwarka Node", topSector: "Imported Fruits" }
    ];
  }
  try {
    const query = `
      SELECT 
        city as name, 
        ROUND(AVG(co2), 2) as avgCo2,
        COUNT(DISTINCT id) as scanCount,
        'improving' as trend,
        CONCAT(city, ' Central') as emissionLeader,
        category as topSector
      FROM \`${projectId}.${DATASET_ID}.${TABLE_ID}\`
      GROUP BY city, category
      ORDER BY avgCo2 ASC
      LIMIT 10
    `;
    const [rows] = await bqClient.query({ query });
    
    // Assign ranks dynamically based on sorted averages
    return rows.map((row, index) => ({
      name: row.name,
      avgCo2: Number(row.avgCo2),
      rank: index + 1,
      trend: row.avgCo2 > 6 ? "increasing" : "improving",
      emissionLeader: row.emissionLeader,
      topSector: row.topSector || "Dairy"
    }));
  } catch (err) {
    console.error("BigQuery Query Error (getCityBenchmarks):", err);
    // Return default values in case of schema errors or query issues
    return [
      { name: "Bengaluru", avgCo2: 4.25, rank: 1, trend: "improving", emissionLeader: "Koramangala Node", topSector: "Dairy" }
    ];
  }
}
