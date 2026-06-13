import { describe, it, expect } from 'vitest';
import { 
  calculateOptimizedTwin, 
  calculateEcoRating, 
  calculateReceiptEmissions, 
  generateSwaps 
} from '../../utils/carbonCalculations';
import { ReceiptItem } from '../../types';

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

  describe('calculateEcoRating() - Carbon Scoring Logic', () => {
    it('should grade Meat categories accurately based on thresholds', () => {
      expect(calculateEcoRating(1.0, 'Red Meat')).toBe('B');
      expect(calculateEcoRating(2.5, 'Chicken Breast')).toBe('C');
      expect(calculateEcoRating(4.5, 'Minced Mutton')).toBe('D');
      expect(calculateEcoRating(6.2, 'Beef Ribeye')).toBe('E');
    });

    it('should grade Dairy categories accurately based on thresholds', () => {
      expect(calculateEcoRating(0.4, 'Dairy Product')).toBe('A');
      expect(calculateEcoRating(1.0, 'Skimmed Milk')).toBe('B');
      expect(calculateEcoRating(1.8, 'Mozzarella')).toBe('C');
      expect(calculateEcoRating(3.0, 'Fresh Paneer')).toBe('D');
      expect(calculateEcoRating(4.2, 'Cow Butter')).toBe('E');
    });

    it('should grade Fats and Oils categories accurately', () => {
      expect(calculateEcoRating(0.3, 'Vegetable Fat')).toBe('A');
      expect(calculateEcoRating(1.2, 'Pure Sesame Oil')).toBe('C');
      expect(calculateEcoRating(2.8, 'Pure Ghee Fat')).toBe('D');
      expect(calculateEcoRating(3.5, 'Artesian Lard')).toBe('E');
    });

    it('should default grade general Produce, Grains, and Bakery items', () => {
      expect(calculateEcoRating(0.2, 'Organic Spinach')).toBe('A');
      expect(calculateEcoRating(0.6, 'Sourdough Slices')).toBe('B');
      expect(calculateEcoRating(1.2, 'Brown Rice Grains')).toBe('C');
      expect(calculateEcoRating(2.2, 'Imported Raspberries')).toBe('D');
      expect(calculateEcoRating(3.0, 'Exotic Warehoused Mangosteen')).toBe('E');
    });
  });

  describe('calculateReceiptEmissions() - Emissions Calculations', () => {
    const mockItems: ReceiptItem[] = [
      { id: '1', name: 'Fresh Paneer', co2: 2.8, quantity: '500g', category: 'Dairy', ecoRating: 'D', alternative: 'Tofu' },
      { id: '2', name: 'Organic Basmati Rice', co2: 1.6, quantity: '1kg', category: 'Grains', ecoRating: 'C', alternative: 'Millets' },
      { id: '3', name: 'Fresh Coriander', co2: 0.2, quantity: '1 bundle', category: 'Produce', ecoRating: 'A', alternative: 'None' }
    ];

    it('should sum up total carbon footprint correctly', () => {
      const metrics = calculateReceiptEmissions(mockItems);
      expect(metrics.totalCo2).toBe(4.6);
    });

    it('should properly slice and bucket emissions by category', () => {
      const metrics = calculateReceiptEmissions(mockItems);
      expect(metrics.byCategory['Dairy']).toBe(2.8);
      expect(metrics.byCategory['Grains']).toBe(1.6);
      expect(metrics.byCategory['Produce']).toBe(0.2);
    });
  });

  describe('generateSwaps() - Recommendation Engine', () => {
    it('should provide eco-friendly regional local swaps and sort them by carbon savings descending', () => {
      const items: ReceiptItem[] = [
        { id: 'item-1', name: 'Premium Basmati Grains', co2: 1.6, quantity: '1kg', category: 'Grains', ecoRating: 'C', alternative: 'Standard' },
        { id: 'item-2', name: 'Pure Cow Ghee', co2: 4.8, quantity: '500g', category: 'Fats', ecoRating: 'E', alternative: 'Standard' },
        { id: 'item-3', name: 'Greek Yogurt Cup', co2: 0.8, quantity: '200g', category: 'Dairy', ecoRating: 'B', alternative: 'Standard' }
      ];

      const recommendations = generateSwaps(items);

      // We expect recommendations to be returned sorted by saving value descending
      expect(recommendations.length).toBe(3);
      
      // Cow Ghee: original = 4.8, swap target = 0.8. Saving = 4.0 (High Impact)
      expect(recommendations[0].itemName).toBe('Pure Cow Ghee');
      expect(recommendations[0].saving).toBe(4.0);
      expect(recommendations[0].impactLevel).toBe('High');
      expect(recommendations[0].swapAlternative).toBe('Cold-Pressed Mustard Oil / Plant Ghee (0.8kg CO₂)');

      // Premium Basmati Grains: original = 1.6, swap target = 0.4. Saving = 1.2 (Medium Impact)
      expect(recommendations[1].itemName).toBe('Premium Basmati Grains');
      expect(recommendations[1].saving).toBe(1.2);
      expect(recommendations[1].impactLevel).toBe('Medium');
      expect(recommendations[1].swapAlternative).toBe('Traditional Millets (Ragi/Jowar) (0.4kg CO₂)');
    });
  });

});
