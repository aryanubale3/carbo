export interface ReceiptItem {
  id: string;
  name: string;
  co2: number;
  quantity: string;
  category: string;
  ecoRating: "A" | "B" | "C" | "D" | "E";
  alternative: string;
}

export interface AnalysisResult {
  items: ReceiptItem[];
  totalCo2: number;
  explanation: string;
}

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface CityData {
  name: string;
  avgCo2: number;
  rank: number;
  trend: "improving" | "stable" | "increasing";
  emissionLeader: string;
  topSector: string;
}

export interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  color: string;
}

export interface TrendPoint {
  week: string;
  personal: number;
  bengaluruAvg: number;
  mumbaiAvg: number;
}
