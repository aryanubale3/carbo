import { ReceiptItem } from "../types";

/**
 * Calculates the optimized twin emissions value for a specific year
 */
export const calculateOptimizedTwin = (
  year: number,
  baseProjections: Record<number, number>,
  dairyReductionPercent: number,
  altAdoptionPercent: number,
  energyTransitionActive: boolean
): number => {
  const base = baseProjections[year] || 0;
  
  // Sliders effect: Dairy reductions subtracts up to 120 units
  const dairyReductionImpact = (dairyReductionPercent / 100) * 120;
  
  // Alternative adoption subtracts up to 90 units
  const altReductionImpact = (altAdoptionPercent / 100) * 90;
  
  // Clean energy transition subtracts a flat value based on year
  const energyReductionImpact = energyTransitionActive ? (year === 2026 ? 30 : year === 2027 ? 70 : 115) : 0;

  const multiplier = year === 2026 ? 0.7 : year === 2027 ? 0.9 : 1.1;
  const optimizedVal = Math.round(base - (dairyReductionImpact + altReductionImpact + energyReductionImpact) * multiplier);
  
  return Math.max(optimizedVal, 190);
};

/**
 * Generates an eco rating letter grade based on the carbon footprint and food category.
 */
export const calculateEcoRating = (co2: number, category: string): "A" | "B" | "C" | "D" | "E" => {
  const cat = category.toLowerCase();
  if (cat.includes("meat")) {
    if (co2 < 1.5) return "B";
    if (co2 < 3.0) return "C";
    if (co2 < 5.0) return "D";
    return "E";
  } else if (cat.includes("dairy")) {
    if (co2 < 0.6) return "A";
    if (co2 < 1.2) return "B";
    if (co2 < 2.0) return "C";
    if (co2 < 3.5) return "D";
    return "E";
  } else if (cat.includes("fat") || cat.includes("oil")) {
    if (co2 < 0.5) return "A";
    if (co2 < 1.5) return "C";
    if (co2 < 3.0) return "D";
    return "E";
  } else {
    // Produce, grains, bakery
    if (co2 < 0.3) return "A";
    if (co2 < 0.8) return "B";
    if (co2 < 1.5) return "C";
    if (co2 < 2.5) return "D";
    return "E";
  }
};

/**
 * Calculates emissions metrics from a list of receipt items
 */
export const calculateReceiptEmissions = (items: ReceiptItem[]) => {
  const totalCo2 = items.reduce((sum, item) => sum + item.co2, 0);
  const byCategory = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.co2;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalCo2: parseFloat(totalCo2.toFixed(2)),
    byCategory,
  };
};

/**
 * Core recommendation engine rules: provides high-impact alternatives
 * based on carbon footprint and categories.
 */
export interface Recommendation {
  itemId: string;
  itemName: string;
  originalCo2: number;
  potentialCo2: number;
  saving: number;
  swapAlternative: string;
  impactLevel: "High" | "Medium" | "Low";
}

export const generateSwaps = (items: ReceiptItem[]): Recommendation[] => {
  return items
    .map(item => {
      const name = item.name.toLowerCase();
      let swapAlternative = item.alternative;
      let potentialCo2 = item.co2;
      
      const hasGhee = name.includes("ghee");
      const hasPaneer = name.includes("paneer");
      const hasMeat = name.includes("chicken") || name.includes("meat") || name.includes("mutton");
      const hasButter = name.includes("butter");
      const hasMilk = name.includes("milk");
      const hasRice = name.includes("rice") || name.includes("basmati");

      if (hasGhee) {
        swapAlternative = "Cold-Pressed Mustard Oil / Plant Ghee (0.8kg CO₂)";
        potentialCo2 = 0.8;
      } else if (hasPaneer) {
        swapAlternative = "Fresh Firm Soy Tofu (0.6kg CO₂)";
        potentialCo2 = 0.6;
      } else if (hasMeat) {
        swapAlternative = "Plant-based Meat Substitute (0.8kg CO₂)";
        potentialCo2 = 0.8;
      } else if (hasButter) {
        swapAlternative = "Plant-butter or Cold-pressed sesame oil (0.4kg CO₂)";
        potentialCo2 = 0.4;
      } else if (hasMilk) {
        swapAlternative = "Homemade Local Oat Milk (0.3kg CO₂)";
        potentialCo2 = 0.3;
      } else if (hasRice) {
        swapAlternative = "Traditional Millets (Ragi/Jowar) (0.4kg CO₂)";
        potentialCo2 = 0.4;
      }

      const saving = Math.max(0, item.co2 - potentialCo2);
      let impactLevel: "High" | "Medium" | "Low" = "Low";
      if (saving > 1.5) {
        impactLevel = "High";
      } else if (saving > 0.5) {
        impactLevel = "Medium";
      }

      return {
        itemId: item.id,
        itemName: item.name,
        originalCo2: item.co2,
        potentialCo2: parseFloat(potentialCo2.toFixed(2)),
        saving: parseFloat(saving.toFixed(2)),
        swapAlternative,
        impactLevel
      };
    })
    .sort((a, b) => b.saving - a.saving);
};
