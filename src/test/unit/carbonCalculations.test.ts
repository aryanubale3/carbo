// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { 
  calculateOptimizedTwin
} from '../../utils/carbonCalculations';

describe('CarbonIQ Core Unit Tests', () => {

  describe('calculateOptimizedTwin()', () => {
    const baseProjections = {
      2026: 420,
      2027: 510,
      2028: 590
    };

    it('should return base projections when no reduction is applied', () => {
      // multiplier for 2026 is 0.7. (420 - 0 * 0.7) = 420
      expect(calculateOptimizedTwin(2026, baseProjections, 0, 0, false)).toBe(420);
      // multiplier for 2027 is 0.9. (510 - 0 * 0.9) = 510
      expect(calculateOptimizedTwin(2027, baseProjections, 0, 0, false)).toBe(510);
      // multiplier for 2028 is 1.1. (590 - 0 * 1.1) = 590
      expect(calculateOptimizedTwin(2028, baseProjections, 0, 0, false)).toBe(590);
    });

    it('should compute dairy reduction slider impacts correctly', () => {
      // 50% dairy reduction percent. impact = (50/100) * 120 = 60 units.
      // 2028 projection: 590 - 60 * 1.1 = 590 - 66 = 524
      const result = calculateOptimizedTwin(2028, baseProjections, 50, 0, false);
      expect(result).toBe(524);
    });

    it('should compute alternative adoption and clean energy transition impacts together', () => {
      // 100% dairy reduction (120 units) + 100% alt adoption (90 units) + clean energy (115 units for 2028)
      // Total reduction impact = 120 + 90 + 115 = 325 units.
      // 2028 projection: 590 - (325 * 1.1) = 590 - 357.5 = 232.5 -> Math.round -> 232
      const result = calculateOptimizedTwin(2028, baseProjections, 100, 100, true);
      expect(result).toBe(232);
    });

    it('should enforce the global minimum emissions floor of 190kg CO2', () => {
      // Forcing extreme reductions that theoretically dip below 190
      const result = calculateOptimizedTwin(2028, baseProjections, 500, 500, true);
      expect(result).toBeGreaterThanOrEqual(190);
    });
  });

});
