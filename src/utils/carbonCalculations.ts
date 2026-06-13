import { ReceiptItem } from "../types";

const DAIRY_REDUCTION_MAX_IMPACT = 120;
const ALT_ADOPTION_MAX_IMPACT = 90;
const SOLAR_TRANSITION_BASE_VAL_2026 = 30;
const SOLAR_TRANSITION_BASE_VAL_2027 = 70;
const SOLAR_TRANSITION_BASE_VAL_2028 = 115;
const YEAR_MULTIPLIER_2026 = 0.7;
const YEAR_MULTIPLIER_2027 = 0.9;
const YEAR_MULTIPLIER_2028 = 1.1;
const MIN_ALLOWED_TWIN_CO2 = 190;

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
  
  // Sliders effect: Dairy reductions subtracts up to max impact units
  const dairyReductionImpact = (dairyReductionPercent / 100) * DAIRY_REDUCTION_MAX_IMPACT;
  
  // Alternative adoption subtracts up to max impact units
  const altReductionImpact = (altAdoptionPercent / 100) * ALT_ADOPTION_MAX_IMPACT;
  
  // Clean energy transition subtracts a flat value based on year
  const energyReductionImpact = energyTransitionActive 
    ? (year === 2026 ? SOLAR_TRANSITION_BASE_VAL_2026 : year === 2027 ? SOLAR_TRANSITION_BASE_VAL_2027 : SOLAR_TRANSITION_BASE_VAL_2028) 
    : 0;

  const multiplier = year === 2026 ? YEAR_MULTIPLIER_2026 : year === 2027 ? YEAR_MULTIPLIER_2027 : YEAR_MULTIPLIER_2028;
  const optimizedVal = Math.round(base - (dairyReductionImpact + altReductionImpact + energyReductionImpact) * multiplier);
  
  return Math.max(optimizedVal, MIN_ALLOWED_TWIN_CO2);
};
