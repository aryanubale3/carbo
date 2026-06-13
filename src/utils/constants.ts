import { AnalysisResult, Message, CityData } from "../types";

export const INITIAL_RECEIPTS_HISTORY: AnalysisResult[] = [
  {
    items: [
      { id: "h1", name: "Full Cream Packet Milk", co2: 1.2, quantity: "2 Litres", category: "Dairy", ecoRating: "C", alternative: "Oat Milk or Soy Milk (0.3kg CO₂)" },
      { id: "h2", name: "Premium Raw Honey", co2: 0.4, quantity: "250g", category: "Produce", ecoRating: "A", alternative: "None needed (Local Organic)" }
    ],
    totalCo2: 1.6,
    explanation: "Initial account setup placeholder baseline. Organic sweeteners exhibit stable carbon weights, while milk drives dairy logistics indices."
  }
];

export const INITIAL_SCAN_RESULT: AnalysisResult = {
  items: [
    { id: "1", name: "Fresh Paneer", co2: 2.8, quantity: "500g", category: "Dairy", ecoRating: "C", alternative: "Firm Soy Tofu (0.6kg CO₂)" },
    { id: "2", name: "Pure Cow Ghee", co2: 4.8, quantity: "500ml", category: "Fats", ecoRating: "E", alternative: "Cold-Pressed Mustard Oil (0.8kg CO₂)" },
    { id: "3", name: "Organic Basmati Grains", co2: 1.6, quantity: "1kg", category: "Grains", ecoRating: "B", alternative: "Heritage Finger Millets (0.4kg CO₂)" }
  ],
  totalCo2: 9.2,
  explanation: "High dairy-fat loading (ghee and paneer) drives over 85% of this purchase's carbon load. Cow milk methane output in the local supply chain remains the critical bottleneck. Transitioning Ghee to wood-pressed plant fats lowers total footprint by nearly 4.0kg CO2."
};

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-1",
    role: "model",
    content: "Hello! I am your CarbonIQ Coach. Powered by Gemini-3.5 Intelligence, I leverage India's Carbon Intelligence Network agricultural and supply chain lifecycle metrics.\n\nI monitor your scanned receipts, carbon twin trajectories, and municipal trends. Ask me anything, such as 'Why is my footprint increasing?', 'What should I replace first?', or 'Compare me with Bengaluru averages'.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

export const INITIAL_CITIES_DATA: CityData[] = [
  { name: "Bengaluru", avgCo2: 4.2, rank: 2, trend: "improving", emissionLeader: "Siddharth Verma (-24%)", topSector: "Transport Decarbonization" },
  { name: "Mumbai", avgCo2: 5.1, rank: 3, trend: "increasing", emissionLeader: "Priya Sanghavi (-11%)", topSector: "Local Rail Commuting" },
  { name: "Pune", avgCo2: 3.7, rank: 1, trend: "improving", emissionLeader: "Aniket Deshpande (-32%)", topSector: "Dietary Substitution" },
  { name: "Delhi Node", avgCo2: 6.2, rank: 4, trend: "increasing", emissionLeader: "Siddharth Goel (-6%)", topSector: "EV Logistics Hub" }
];

export const INITIAL_WEEKLY_MISSIONS = [
  { id: "m1", title: "Substitute Dairy Butter for plant fat", co2Saving: 2.4, monetarySaving: 40, status: "available", isCommit: false },
  { id: "m2", title: "Reduce home dairy volume by 10%", co2Saving: 3.5, monetarySaving: 120, status: "active", isCommit: true },
  { id: "m3", title: "Complete 3 low-carbon grocery trips", co2Saving: 1.8, monetarySaving: 60, status: "available", isCommit: false },
  { id: "m4", title: "Switch Basmati rice with Finger Millets", co2Saving: 1.2, monetarySaving: 30, status: "completed", isCommit: false }
];
