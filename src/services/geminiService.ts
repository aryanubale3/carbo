import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper to safely initialize and retrieve the Gemini Client
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY is not configured or is set to placeholder. Using intelligent local calculations.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// High-fidelity static sample calculation database
export const sampleData: Record<string, { items: any[]; totalCo2: number; explanation: string }> = {
  "bengaluru-cafe": {
    items: [
      { id: "1", name: "Sourdough Bread Toast", co2: 0.4, quantity: "2 slices", category: "Bakery", ecoRating: "A", alternative: "None needed (Already optimal)" },
      { id: "2", name: "Classic Paneer Tikka Tikka", co2: 2.1, quantity: "200g", category: "Dairy", ecoRating: "C", alternative: "Tofu Tikka (0.5kg CO₂)" },
      { id: "3", name: "Organic Avocado Salad", co2: 0.3, quantity: "1 plate", category: "Produce", ecoRating: "B", alternative: "None (Local organic produce)" },
      { id: "4", name: "Grass-Fed Butter Brownie & Almond Latte", co2: 1.0, quantity: "1 unit", category: "Dessert/Beverage", ecoRating: "D", alternative: "Plant-butter brownie + Oat Milk (0.3kg CO₂)" }
    ],
    totalCo2: 3.8,
    explanation: "This premium café selection carries a baseline emissions profile. Although the Salad and Sourdough are highly optimized, the carbon weight is elevated by dairy elements—specifically the paneer and butter. Swapping cows-milk paneer with locally sourced soy tofu and migrating to cold-pressed plant fats can cut emissions by up to 60%, matching Vercel/Linear level climate-friendly diet profiles."
  },
  "mumbai-mart": {
    items: [
      { id: "1", name: "Basmati Rice Premium", co2: 1.6, quantity: "2kg", category: "Grains", ecoRating: "B", alternative: "Traditional Millets (Ragi/Jowar) (0.4kg CO₂)" },
      { id: "2", name: "Pure Cow Ghee", co2: 4.8, quantity: "500g", category: "Fats", ecoRating: "E", alternative: "Cold-Pressed Mustard Oil / Plant Ghee (0.8kg CO₂)" },
      { id: "3", name: "Fresh Paneer Blocks", co2: 2.8, quantity: "500g", category: "Dairy", ecoRating: "C", alternative: "Fresh Firm Tofu (0.7kg CO₂)" },
      { id: "4", name: "Full Cream Fresh Milk", co2: 1.2, quantity: "2L", category: "Dairy", ecoRating: "C", alternative: "Local Homemade Oat Milk (0.3kg CO₂)" },
      { id: "5", name: "Imported Red Apples", co2: 0.8, quantity: "1kg", category: "Produce", ecoRating: "B", alternative: "Himachal Local Apples (0.2kg CO₂)" }
    ],
    totalCo2: 11.2,
    explanation: "This supermarket basket reveals major dairy-related emission spikes. Cow Ghee and full-cream milk have intensely high methane and energy footprints from cattle-rearing. Basmati rice has moderate emissions due to traditional flooded paddy farming. Transitioning to Indian heritage grains (ragi, bajra) and switching ghee for premium cold-pressed sesame or mustard oil offers high health and carbon gains."
  },
  "pune-dairy": {
    items: [
      { id: "1", name: "Salted Cooking Butter", co2: 1.8, quantity: "200g", category: "Fats", ecoRating: "D", alternative: "Achar Oil or Vegan Butter (0.4kg CO₂)" },
      { id: "2", name: "Fresh Paneer Cubes", co2: 1.4, quantity: "250g", category: "Dairy", ecoRating: "C", alternative: "Tempeh / Soybean Paneer (0.3kg CO₂)" },
      { id: "3", name: "Greek Style Strawberry Yogurt", co2: 0.9, quantity: "400g", category: "Dairy", ecoRating: "C", alternative: "Coconut Milk Yogurt (0.2kg CO₂)" },
      { id: "4", name: "Full Cream Packet Milk", co2: 0.6, quantity: "1L", category: "Dairy", ecoRating: "B", alternative: "Nut or Soy Milk (0.15kg CO₂)" }
    ],
    totalCo2: 4.7,
    explanation: "A standard family dairy-run basket in Pune. Dairy production in Western Maharashtra represents intense carbon footprints due to bovine methane output and pasteurization facilities. Transitioning even 50% of the basket's dairy content to regional plant alternatives will prevent roughly 2.3kg of CO₂ from entering Pune's environment per transaction."
  }
};

export async function processReceiptScan({ imageBase64, mimeType, sampleId, rawText, gcsUrl }: { imageBase64?: string; mimeType?: string; sampleId?: string; rawText?: string; gcsUrl?: string }) {
  if (sampleId && sampleData[sampleId]) {
    return sampleData[sampleId];
  }

  // Size limit & input validation: truncate heavy payload strings to prevent buffer overflow/crashes
  const safeText = rawText ? rawText.substring(0, 10000) : "";

  // MIME type & file upload validation
  if (imageBase64) {
    const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
    const cleanMime = mimeType ? mimeType.toLowerCase().trim() : "";
    if (!allowedMimes.includes(cleanMime)) {
      console.warn("Security Alert: Invalid MIME type blocked:", cleanMime);
      return processReceiptScan({ rawText: `Invalid file attachment of type ${cleanMime}` });
    }

    if (imageBase64.length > 5 * 1024 * 1024) {
      console.warn("Security Alert: File upload size limit exceeded.");
      return processReceiptScan({ rawText: "Heavy file attachment size limit exceeded" });
    }
  }

  const ai = getGeminiClient();

  if (!ai) {
    console.log("No Gemini API key. Running smart localized parser...");
    
    let matchedData = sampleData["bengaluru-cafe"];
    if (safeText && safeText.toLowerCase().includes("mumbai")) {
      matchedData = sampleData["mumbai-mart"];
    } else if (safeText && safeText.toLowerCase().includes("pune")) {
      matchedData = sampleData["pune-dairy"];
    } else if (safeText) {
      const items = safeText.split("\n")
        .filter((line: string) => line.trim().length > 3)
        .slice(0, 5)
        .map((line: string, index: number) => {
          const hasDairy = /milk|paneer|butter|cheese|ghee|curd|yogurt/i.test(line);
          const hasMeat = /chicken|meat|fish|egg|mutton/i.test(line);
          const co2 = hasDairy ? 1.5 : (hasMeat ? 3.5 : 0.3);
          const ecoRating = hasMeat ? "D" : (hasDairy ? "C" : "A");
          const category = hasMeat ? "Meat" : (hasDairy ? "Dairy" : "Produce");
          const cleanName = line.replace(/[^a-zA-Z\s]/g, "").trim();
          return {
            id: String(index + 1),
            name: cleanName || `Item ${index + 1}`,
            co2,
            quantity: "1 unit",
            category,
            ecoRating,
            alternative: hasMeat ? "Plant-based Meat (0.8kg CO₂)" : (hasDairy ? "Almond/Oat Alternative (0.3kg CO₂)" : "None needed")
          };
        });

      const totalCo2 = items.reduce((sum: number, item: any) => sum + item.co2, 0);
      matchedData = {
        items,
        totalCo2: parseFloat(totalCo2.toFixed(1)),
        explanation: `Analyzed customized carbon indices for your manually entered items. Products categorised as dairy or meat contribute the majority share of carbon footprints. Transitioning to Indian heritage millets, local legumes, and fresh produce substantially lowers your environmental burden.`
      };
    }

    return matchedData;
  }

  let prompt = `Analyze this purchase receipt for CarbonIQ, an Indian Carbon Intelligence Platform.
Identify every line item or food item, its approximate carbon weight in kilograms of CO2 based on Indian lifecycle metrics, category, quantity, and a premium localized swap alternative (incorporating Indian alternatives like soy tofu, millets, local plant butter, cold pressed oils).

Return an accurate, structured JSON object representation matching this format exactly:
{
  "items": [
    {
      "name": "Item Name",
      "co2": 2.8,
      "quantity": "500g",
      "category": "Dairy",
      "ecoRating": "C", // one of A, B, C, D, E based on eco impact
      "alternative": "Tofu / Millets alternative"
    }
  ],
  "totalCo2": 4.3,
  "explanation": "Expert description of why this footprint stands out, Indian agricultural factors, and carbon saving targets."
}`;

  let contents: any;
  if (imageBase64 && mimeType) {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    contents = {
      parts: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ]
    };
  } else {
    contents = `${prompt}\n\nInput Receipt Text or Description:\n${safeText || "Standard organic items: bread, curd, butter."}`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are the premium CarbonIQ Intelligence engine. You scan Indian bills and convert purchases into a high-credibility carbon budget estimation. Assign proper ID to each parsed item starting from 1.",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                co2: { type: Type.NUMBER },
                quantity: { type: Type.STRING },
                category: { type: Type.STRING },
                ecoRating: { type: Type.STRING },
                alternative: { type: Type.STRING }
              },
              required: ["name", "co2", "quantity", "category", "ecoRating", "alternative"]
            }
          },
          totalCo2: { type: Type.NUMBER },
          explanation: { type: Type.STRING }
        },
        required: ["items", "totalCo2", "explanation"]
      }
    }
  });

  const parsedResponse = JSON.parse(response.text || "{}");
  if (parsedResponse.items && Array.isArray(parsedResponse.items)) {
    parsedResponse.items = parsedResponse.items.map((it: any, index: number) => ({
      ...it,
      id: String(index + 1)
    }));
  }

  return parsedResponse;
}

export async function processChat({ messages, scanHistory }: { messages: any[]; scanHistory?: any[] }) {
  if (!messages || !Array.isArray(messages)) {
    throw new Error("Messages array is required");
  }

  // Prompt injection protection / Content Moderation
  const injectionKeywords = [
    "ignore previous instructions",
    "ignore all rules",
    "system override",
    "you are now",
    "bypass instructions",
    "bypass constraints"
  ];
  const lastMessage = messages[messages.length - 1]?.content || "";
  const lowerMsg = lastMessage.toLowerCase();
  
  const hasInjection = injectionKeywords.some(keyword => lowerMsg.includes(keyword));
  if (hasInjection) {
    console.warn("Security Alert: Prompt injection attempt detected and mitigated:", lastMessage);
    return {
      text: "Security Warning: Prompt injection pattern detected. CarbonIQ Carbon Coach remains committed to climate and carbon footprint advice. Let's discuss your carbon footprint instead!"
    };
  }

  const ai = getGeminiClient();

  let historyDesc = "None yet. Encourage the user to scan their first receipt.";
  if (scanHistory && Array.isArray(scanHistory) && scanHistory.length > 0) {
    historyDesc = scanHistory.map(item => `- ${item.name}: ${item.co2}kg CO2 (Category: ${item.category}, Alternative: ${item.alternative})`).join("\n");
  }

  if (!ai) {
    let reply = "Hello! I am your CarbonIQ Carbon Coach. I provide deep insights into India's greenhouse emission factors and help you align your personal carbon budgets. How can I assist today?";

    const hasGhee = lowerMsg.includes("ghee") || (scanHistory && scanHistory.some(i => i.name.toLowerCase().includes("ghee")));
    const hasPaneer = lowerMsg.includes("paneer") || (scanHistory && scanHistory.some(i => i.name.toLowerCase().includes("paneer")));
    const hasButter = lowerMsg.includes("butter") || (scanHistory && scanHistory.some(i => i.name.toLowerCase().includes("butter")));

    if (lowerMsg.includes("increasing") || lowerMsg.includes("why") || lowerMsg.includes("footprint")) {
      reply = `Analyzing your CarbonIQ dynamic history, here is why your footprint presents this trajectory:

${scanHistory && scanHistory.length > 0 ? `**Your Scanned Items Carbon Profile:**\n${scanHistory.map(i => `* **${i.name}**: ${i.co2}kg CO₂e`).join('\n')}` : ""}

**Key Carbon Nodes identified:**
${hasGhee ? `- **Ghee Carbon Premium**: Ghee has a carbon coefficient of up to **9x higher** than local seasonal grains due to ruminant enteric fermentation emissions and energy-intensive manufacturing.` : ""}
${hasPaneer ? `- **Paneer Production Factor**: Dairy-milk paneer represents intense dairy methane outputs. It takes ~5L of cow's milk to obtain just 1kg of high-grade paneer.` : ""}
- **Metropolitan Cold Chain Overhead**: Sourcing refrigerated or imported products (like apples or Greek yogurt) introduces transport cooling leakages.

**Tactical Recommendations:**
- Try replacing cow ghee in your base cooking with cold-pressed mustard, peanut or sesame oils. This immediately drops the carbon weight of that item by over **80%**.
- Substitute paneer with fresh regional soybean-based organic tofu. `;
    } else if (lowerMsg.includes("replace first") || lowerMsg.includes("replace") || lowerMsg.includes("replace first")) {
      reply = `Here is your high-impact carbon replacement blueprint, customized from your uploaded purchase receipt profile:

**Custom Swappings priority list:**
1. ${hasGhee ? `**Pure Cow Ghee (${scanHistory?.find(i => i.name.toLowerCase().includes("ghee"))?.co2 || 4.8}kg CO₂e)** $\\rightarrow$ Swap with **Wood-Pressed Mustard / Til Oil (0.8kg CO₂)**. Saves **81% carbon** and retains healthy monosaturated fats.` : `**Pure Cow Ghee (4.8kg CO₂ per 500g)** $\\rightarrow$ Swap with **Cold-pressed Sesame/Coconut Oil (0.9kg CO₂)**.`}
2. ${hasPaneer ? `**Fresh Paneer (${scanHistory?.find(i => i.name.toLowerCase().includes("paneer"))?.co2 || 2.8}kg CO₂e)** $\\rightarrow$ Swap with **Firm Soybean Tofu (0.6kg CO₂)**. Saves **75% carbon** with equal protein performance.` : `**Fresh Paneer (2.8kg CO₂ per 500g)** $\\rightarrow$ Swap with **Fresh Firm Tofu (0.7kg CO₂)**.`}
3. ${hasButter ? `**Premium Salted Butter (${scanHistory?.find(i => i.name.toLowerCase().includes("butter"))?.co2 || 1.8}kg CO₂e)** $\\rightarrow$ Swap with **Extra Virgin Avocado or Olive Spread (0.4kg CO₂)**.` : `**Full Cream Cow Milk (1.2kg CO₂ per 2L)** $\\rightarrow$ Swap with **Local Oat / Soy Milk (0.35kg CO₂)**.`}

Would you like me to simulate the long-term impact on your **Carbon Twin** for any of these swaps?`;
    } else if (lowerMsg.includes("spending") || lowerMsg.includes("reduce") || lowerMsg.includes("money") || lowerMsg.includes("without spending")) {
      reply = `Reducing your carbon emissions doesn't require premium high-cost 'eco-labeled' goods. In fact, standard localized swappings are **actually cheaper**:

**No-Cost and Low-Cost Mitigation Steps:**
1. **Heritage Grains Switch (Saves ₹30/kg)**: Migrate twice-weekly from premium Basmati rice to non-polished regional **Ragi (Finger Millet) or Jowar (Sorghum)**. Paddies use enormous water pumping energy, while millets require almost no artificial irrigation.
2. **Local Seasonal Sourcing**: Avoid cold-stored winter vegetables in June. Buy from push-cart street vendors who source directly from mandi hubs. This eliminates secondary warehousing cooling carbon.
3. **Bring-your-own bag discount**: Consolidating delivery tasks. Avoiding instant 10-minute grocery delivery cycles saves at least **₹45 delivery premium** and cuts associated petrol delivery runoffs.

Your active **Carbon Twin** can simulate these zero-cost measures right now in the Metrics Hub!`;
    } else if (lowerMsg.includes("compare") || lowerMsg.includes("city") || lowerMsg.includes("bengaluru") || lowerMsg.includes("mumbai") || lowerMsg.includes("pune")) {
      reply = `Here is how your current carbon profile compares to municipal averages across Indian smart cities:

| Metric | Your Profile | Bengaluru Avg | Mumbai Avg | Pune Avg |
| :--- | :--- | :--- | :--- | :--- |
| **Basket Avg** | **${scanHistory && scanHistory.length > 0 ? (scanHistory.reduce((s, i) => s + i.co2, 0)).toFixed(1) : "9.2"} kg** | 4.2 kg | 5.1 kg | 3.7 kg |
| **Dominant Sector** | **Dairy Fats** | Multi-passenger cabs | Rail commuting | Dietary proteins |
| **Grid Rank** | **Tier 3** | Rank 2 | Rank 3 | Rank 1 |

*Note: Scanning receipts automatically updates our Community Carbon Intelligence Node, helping your city climb the national leadership rankings.*`;
    }

    return { text: reply };
  }

  const chatContents = messages.map((m: any) => ({
    role: m.role || "user",
    parts: [{ text: m.content }]
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: chatContents,
    config: {
      systemInstruction: `You are CarbonIQ AI Carbon Coach, Canada and India's finest Carbon Intelligence sustainability advisor.
You are built by Google's top sustainability design team. Speak with extreme integrity, calm, clarity, and precision. Follow these instructions:
1. Always base carbon calculations and comparison on real lifecycle studies in Indian agricultural and metro sectors.
2. Highlight key figures, CO2 values, percentages using clean markdown grids, tables or bold headers.
3. Keep the tone premium, warm, sophisticated, objective, and highly action-oriented.
4. Give specific advice on Indian context (millets, basmati, paneer, ghee, local rail, BMTC, metro, auto-rickshaw, Himachal apples, Nagpur oranges).
5. Compare user trends against standard city averages: Bengaluru (4.2kg avg), Mumbai (5.1kg avg), Pune (3.7kg avg), Delhi (6.2kg avg).
6. Avoid fluff, dry repetitive AI phrases, or corporate sales slogans. Be precise and clean like Stripe or Linear.

CRITICAL USER PROFILE CONTEXT (MEMORY):
The user's current or last scanned receipt contains the following item log:
${historyDesc}

Use this concrete item log to answer user questions with incredible custom memory! (e.g. if their receipt contains ghee, reference it directly when they ask why footprint is high or what to replace!).`
    }
  });

  return { text: response.text || "I am processing. Please try again." };
}
