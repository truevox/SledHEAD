import { describe, it, expect } from 'vitest';
import { UPGRADE_COSTS } from '../types';

/**
 * Upgrade effect calculations
 */

interface UpgradeEffects {
  rocketSurgery: (level: number) => number; // Speed boost %
  optimalOptics: (level: number) => number; // Photo value boost %
  sledDurability: (level: number) => number; // Collision tolerance
  fancierFootwear: (level: number) => number; // Uphill speed %
  attendLegDay: (level: number) => number; // Stamina max bonus
  crowdHypeman: (level: number) => number; // Trick value boost %
  crowdWeaver: (level: number) => number; // Crowd collision reduction %
  weatherWarrior: (level: number) => number; // Weather effect reduction %
  skiLifts: (level: number) => number; // Income per tourist
  snowmobileRentals: (level: number) => number; // Fast travel discount %
  foodStalls: (level: number) => number; // Stamina restoration %
  groomedTrails: (level: number) => number; // Speed on trails %
  firstAidStations: (level: number) => number; // Recovery time reduction %
  scenicOverlooks: (level: number) => number; // Photo opportunity bonus %
}

// Upgrade effect calculations based on level
const upgradeEffects: UpgradeEffects = {
  // Personal Upgrades
  rocketSurgery: (level) => level * 5, // 5% speed per level
  optimalOptics: (level) => level * 10, // 10% photo value per level
  sledDurability: (level) => level, // 1 collision per level
  fancierFootwear: (level) => level * 8, // 8% uphill speed per level
  attendLegDay: (level) => level * 10, // 10 stamina per level
  crowdHypeman: (level) => level * 15, // 15% trick value per level
  crowdWeaver: (level) => level * 20, // 20% crowd collision reduction per level
  weatherWarrior: (level) => level * 10, // 10% weather reduction per level

  // Mountain Upgrades
  skiLifts: (level) => level * 5, // 5 income per tourist per level
  snowmobileRentals: (level) => level * 10, // 10% discount per level
  foodStalls: (level) => level * 15, // 15% stamina restore per level
  groomedTrails: (level) => level * 5, // 5% trail speed per level
  firstAidStations: (level) => level * 20, // 20% recovery reduction per level
  scenicOverlooks: (level) => level * 12, // 12% photo bonus per level
};

// Cost for specific upgrade level
function getUpgradeCost(
  category: 'personal' | 'mountain',
  upgrade: string,
  level: number
): number | undefined {
  const costs = (UPGRADE_COSTS[category] as Record<string, number[]>)[upgrade];
  if (!costs || level < 1 || level > costs.length) return undefined;
  return costs[level - 1];
}

// Total cost to reach a level
function getTotalCostToLevel(
  category: 'personal' | 'mountain',
  upgrade: string,
  targetLevel: number
): number {
  const costs = (UPGRADE_COSTS[category] as Record<string, number[]>)[upgrade];
  if (!costs || targetLevel < 1) return 0;

  let total = 0;
  for (let i = 0; i < Math.min(targetLevel, costs.length); i++) {
    total += costs[i];
  }
  return total;
}

describe('Upgrade Calculations', () => {
  describe('Personal Upgrade Effects', () => {
    describe('Rocket Surgery (Speed)', () => {
      it('should give 0% at level 0', () => {
        expect(upgradeEffects.rocketSurgery(0)).toBe(0);
      });

      it('should give 5% per level', () => {
        expect(upgradeEffects.rocketSurgery(1)).toBe(5);
        expect(upgradeEffects.rocketSurgery(2)).toBe(10);
        expect(upgradeEffects.rocketSurgery(3)).toBe(15);
      });

      it('should give 25% at max level', () => {
        expect(upgradeEffects.rocketSurgery(5)).toBe(25);
      });
    });

    describe('Optimal Optics (Photo Value)', () => {
      it('should give 10% per level', () => {
        expect(upgradeEffects.optimalOptics(1)).toBe(10);
        expect(upgradeEffects.optimalOptics(5)).toBe(50);
      });
    });

    describe('Sled Durability (Collisions)', () => {
      it('should give 1 collision tolerance per level', () => {
        expect(upgradeEffects.sledDurability(1)).toBe(1);
        expect(upgradeEffects.sledDurability(5)).toBe(5);
      });
    });

    describe('Fancier Footwear (Uphill Speed)', () => {
      it('should give 8% uphill speed per level', () => {
        expect(upgradeEffects.fancierFootwear(1)).toBe(8);
        expect(upgradeEffects.fancierFootwear(5)).toBe(40);
      });
    });

    describe('Attend Leg Day (Stamina)', () => {
      it('should give 10 max stamina per level', () => {
        expect(upgradeEffects.attendLegDay(1)).toBe(10);
        expect(upgradeEffects.attendLegDay(5)).toBe(50);
      });
    });

    describe('Crowd Hypeman (Trick Value)', () => {
      it('should give 15% trick value per level', () => {
        expect(upgradeEffects.crowdHypeman(1)).toBe(15);
        expect(upgradeEffects.crowdHypeman(5)).toBe(75);
      });
    });

    describe('Crowd Weaver (Collision Reduction)', () => {
      it('should give 20% collision reduction per level', () => {
        expect(upgradeEffects.crowdWeaver(1)).toBe(20);
        expect(upgradeEffects.crowdWeaver(5)).toBe(100);
      });
    });

    describe('Weather Warrior (Weather Reduction)', () => {
      it('should give 10% weather effect reduction per level', () => {
        expect(upgradeEffects.weatherWarrior(1)).toBe(10);
        expect(upgradeEffects.weatherWarrior(5)).toBe(50);
      });
    });
  });

  describe('Mountain Upgrade Effects', () => {
    describe('Ski Lifts (Tourist Income)', () => {
      it('should give 5 income per tourist per level', () => {
        expect(upgradeEffects.skiLifts(1)).toBe(5);
        expect(upgradeEffects.skiLifts(5)).toBe(25);
      });
    });

    describe('Snowmobile Rentals (Fast Travel)', () => {
      it('should give 10% discount per level', () => {
        expect(upgradeEffects.snowmobileRentals(1)).toBe(10);
        expect(upgradeEffects.snowmobileRentals(5)).toBe(50);
      });
    });

    describe('Food Stalls (Stamina Restore)', () => {
      it('should give 15% stamina restore per level', () => {
        expect(upgradeEffects.foodStalls(1)).toBe(15);
        expect(upgradeEffects.foodStalls(5)).toBe(75);
      });
    });

    describe('Groomed Trails (Trail Speed)', () => {
      it('should give 5% trail speed per level', () => {
        expect(upgradeEffects.groomedTrails(1)).toBe(5);
        expect(upgradeEffects.groomedTrails(5)).toBe(25);
      });
    });

    describe('First Aid Stations (Recovery)', () => {
      it('should give 20% recovery reduction per level', () => {
        expect(upgradeEffects.firstAidStations(1)).toBe(20);
        expect(upgradeEffects.firstAidStations(5)).toBe(100);
      });
    });

    describe('Scenic Overlooks (Photo Opportunities)', () => {
      it('should give 12% photo bonus per level', () => {
        expect(upgradeEffects.scenicOverlooks(1)).toBe(12);
        expect(upgradeEffects.scenicOverlooks(5)).toBe(60);
      });
    });
  });

  describe('Cost Progression', () => {
    describe('Getting Individual Upgrade Costs', () => {
      it('should get first level cost', () => {
        expect(getUpgradeCost('personal', 'rocketSurgery', 1)).toBe(100);
      });

      it('should get max level cost', () => {
        expect(getUpgradeCost('personal', 'rocketSurgery', 5)).toBe(2000);
      });

      it('should return undefined for level 0', () => {
        expect(getUpgradeCost('personal', 'rocketSurgery', 0)).toBeUndefined();
      });

      it('should return undefined for level > 5', () => {
        expect(getUpgradeCost('personal', 'rocketSurgery', 6)).toBeUndefined();
      });

      it('should return undefined for invalid upgrade', () => {
        expect(getUpgradeCost('personal', 'invalid', 1)).toBeUndefined();
      });
    });

    describe('Total Cost Calculations', () => {
      it('should calculate total to level 1', () => {
        expect(getTotalCostToLevel('personal', 'rocketSurgery', 1)).toBe(100);
      });

      it('should calculate total to max level', () => {
        // 100 + 250 + 500 + 1000 + 2000 = 3850
        expect(getTotalCostToLevel('personal', 'rocketSurgery', 5)).toBe(3850);
      });

      it('should return 0 for level 0', () => {
        expect(getTotalCostToLevel('personal', 'rocketSurgery', 0)).toBe(0);
      });

      it('should cap at max level', () => {
        const maxCost = getTotalCostToLevel('personal', 'rocketSurgery', 5);
        const overCost = getTotalCostToLevel('personal', 'rocketSurgery', 10);
        expect(overCost).toBe(maxCost);
      });
    });

    describe('Cost Doubling Pattern', () => {
      it('should double costs for ski lifts', () => {
        const costs = UPGRADE_COSTS.mountain.skiLifts;
        for (let i = 0; i < costs.length - 1; i++) {
          expect(costs[i + 1] / costs[i]).toBeCloseTo(2);
        }
      });

      it('should have approximately doubling costs for most upgrades', () => {
        const personalUpgrades = Object.keys(UPGRADE_COSTS.personal);
        personalUpgrades.forEach(upgrade => {
          const costs = (UPGRADE_COSTS.personal as Record<string, number[]>)[upgrade];
          // Check that later costs are at least 1.5x previous
          for (let i = 0; i < costs.length - 1; i++) {
            expect(costs[i + 1] / costs[i]).toBeGreaterThanOrEqual(1.5);
          }
        });
      });
    });
  });

  describe('Max Level Caps', () => {
    it('should have 5 levels for all personal upgrades', () => {
      Object.keys(UPGRADE_COSTS.personal).forEach(upgrade => {
        const costs = (UPGRADE_COSTS.personal as Record<string, number[]>)[upgrade];
        expect(costs.length).toBe(5);
      });
    });

    it('should have 5 levels for all mountain upgrades', () => {
      Object.keys(UPGRADE_COSTS.mountain).forEach(upgrade => {
        const costs = (UPGRADE_COSTS.mountain as Record<string, number[]>)[upgrade];
        expect(costs.length).toBe(5);
      });
    });

    it('should not be able to upgrade past level 5', () => {
      // Test simulation of upgrade cap
      let level = 0;
      for (let i = 0; i < 10; i++) {
        level = Math.min(5, level + 1);
      }
      expect(level).toBe(5);
    });
  });

  describe('Value Comparisons', () => {
    it('should have cheapest personal upgrade as rocketSurgery or fancierFootwear', () => {
      const rocketCost = UPGRADE_COSTS.personal.rocketSurgery[0];
      const footwearCost = UPGRADE_COSTS.personal.fancierFootwear[0];

      Object.values(UPGRADE_COSTS.personal).forEach(costs => {
        expect(costs[0]).toBeGreaterThanOrEqual(Math.min(rocketCost, footwearCost));
      });
    });

    it('should have most expensive mountain upgrade as snowmobileRentals', () => {
      const snowmobileTotal = UPGRADE_COSTS.mountain.snowmobileRentals.reduce((a, b) => a + b, 0);

      Object.values(UPGRADE_COSTS.mountain).forEach(costs => {
        const total = costs.reduce((a, b) => a + b, 0);
        expect(total).toBeLessThanOrEqual(snowmobileTotal);
      });
    });

    it('should provide good value for first tier upgrades', () => {
      // First tier should cost less than 50% of total
      Object.values(UPGRADE_COSTS.personal).forEach(costs => {
        const total = costs.reduce((a, b) => a + b, 0);
        expect(costs[0]).toBeLessThan(total * 0.5);
      });
    });
  });

  describe('ROI Calculations', () => {
    it('should calculate cost per effect point for rocketSurgery', () => {
      const costs = UPGRADE_COSTS.personal.rocketSurgery;
      const totalCost = costs.reduce((a, b) => a + b, 0);
      const totalEffect = upgradeEffects.rocketSurgery(5);
      const costPerPoint = totalCost / totalEffect;

      // 3850 / 25 = 154 per 1% speed
      expect(costPerPoint).toBe(154);
    });

    it('should calculate cost per collision for sledDurability', () => {
      const costs = UPGRADE_COSTS.personal.sledDurability;
      const totalCost = costs.reduce((a, b) => a + b, 0);
      const totalEffect = upgradeEffects.sledDurability(5);
      const costPerCollision = totalCost / totalEffect;

      // 6200 / 5 = 1240 per collision tolerance
      expect(costPerCollision).toBe(1240);
    });

    it('should calculate early vs late tier efficiency', () => {
      // Level 1 gives same effect as level 5 but at much lower cost
      const level1Cost = UPGRADE_COSTS.personal.rocketSurgery[0];
      const level5Cost = UPGRADE_COSTS.personal.rocketSurgery[4];

      // Level 5 costs 20x more than level 1 for same +5% effect
      expect(level5Cost / level1Cost).toBe(20);
    });
  });

  describe('Combined Upgrade Calculations', () => {
    it('should calculate total cost to max all personal', () => {
      let total = 0;
      Object.values(UPGRADE_COSTS.personal).forEach(costs => {
        total += costs.reduce((a, b) => a + b, 0);
      });
      expect(total).toBeGreaterThan(20000);
    });

    it('should calculate total cost to max all mountain', () => {
      let total = 0;
      Object.values(UPGRADE_COSTS.mountain).forEach(costs => {
        total += costs.reduce((a, b) => a + b, 0);
      });
      expect(total).toBeGreaterThan(30000);
    });

    it('should calculate total cost to max everything', () => {
      let personal = 0;
      let mountain = 0;

      Object.values(UPGRADE_COSTS.personal).forEach(costs => {
        personal += costs.reduce((a, b) => a + b, 0);
      });

      Object.values(UPGRADE_COSTS.mountain).forEach(costs => {
        mountain += costs.reduce((a, b) => a + b, 0);
      });

      const total = personal + mountain;
      expect(total).toBeGreaterThan(50000);
      expect(total).toBeLessThan(200000); // Less than starting loan
    });
  });

  describe('Edge Cases', () => {
    it('should handle level 0 effects', () => {
      Object.values(upgradeEffects).forEach(effect => {
        expect(effect(0)).toBe(0);
      });
    });

    it('should handle negative levels', () => {
      expect(upgradeEffects.rocketSurgery(-1)).toBe(-5);
    });

    it('should handle very high levels (beyond cap)', () => {
      expect(upgradeEffects.rocketSurgery(100)).toBe(500);
    });

    it('should maintain integer results where appropriate', () => {
      for (let i = 0; i <= 5; i++) {
        expect(Number.isInteger(upgradeEffects.sledDurability(i))).toBe(true);
        expect(Number.isInteger(upgradeEffects.attendLegDay(i))).toBe(true);
      }
    });
  });
});
