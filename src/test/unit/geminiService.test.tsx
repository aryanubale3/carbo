import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getGeminiClient, processReceiptScan, processChat } from "../../services/geminiService";

describe("GeminiService Unit Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should return null from getGeminiClient when GEMINI_API_KEY is not set", () => {
    process.env.GEMINI_API_KEY = "";
    expect(getGeminiClient()).toBeNull();
  });

  it("should parse receipts with localized fallbacks for Mumbai and Pune when offline", async () => {
    process.env.GEMINI_API_KEY = "";
    
    // Mumbai manual text scan fallback
    const resultMumbai = await processReceiptScan({ rawText: "Mumbai mart purchase" });
    expect(resultMumbai.totalCo2).toBe(11.2);
    expect(resultMumbai.items.length).toBeGreaterThan(0);

    // Pune manual text scan fallback
    const resultPune = await processReceiptScan({ rawText: "Pune dairy purchase" });
    expect(resultPune.totalCo2).toBe(4.7);

    // Generic receipt split fallback
    const resultGeneric = await processReceiptScan({ rawText: "milk\nchicken\nbread" });
    expect(resultGeneric.items.length).toBe(3);
  });

  it("should return sample data directly if sampleId matches", async () => {
    const result = await processReceiptScan({ sampleId: "bengaluru-cafe" });
    expect(result.totalCo2).toBe(3.8);
  });

  it("should return appropriate fallback chat counselor answers based on message contents when offline", async () => {
    process.env.GEMINI_API_KEY = "";

    // Test why/footprint queries
    const resultWhy = await processChat({
      messages: [{ id: "test-m1", role: "user", content: "Why is my carbon footprint increasing?", timestamp: "12:00 PM" }],
      scanHistory: [{ id: "1", name: "Pure Cow Ghee", co2: 4.8, category: "Fats", alternative: "Mustard Oil", quantity: "500g", ecoRating: "E" }]
    });
    expect(resultWhy.text).toContain("Ghee Carbon Premium");

    // Test replace suggestions
    const resultReplace = await processChat({
      messages: [{ id: "test-m2", role: "user", content: "What should I replace first?", timestamp: "12:00 PM" }],
      scanHistory: [{ id: "1", name: "Fresh Paneer", co2: 2.8, category: "Dairy", alternative: "Tofu", quantity: "500g", ecoRating: "C" }]
    });
    expect(resultReplace.text).toContain("Swap");

    // Test low cost/money reduction
    const resultMoney = await processChat({
      messages: [{ id: "test-m3", role: "user", content: "How to reduce without spending money?", timestamp: "12:00 PM" }]
    });
    expect(resultMoney.text).toContain("No-Cost and Low-Cost Mitigation Steps");

    // Test city comparisons
    const resultCity = await processChat({
      messages: [{ id: "test-m4", role: "user", content: "compare with bengaluru", timestamp: "12:00 PM" }]
    });
    expect(resultCity.text).toContain("Bengaluru Avg");
  });
});
