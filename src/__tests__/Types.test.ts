import { describe, it, expect } from 'vitest';
import { TRICKS, UPGRADE_COSTS } from '../types';

describe('TRICKS Array', () => {
  describe('Structure Validation', () => {
    it('should contain 16 tricks', () => {
      expect(TRICKS.length).toBe(16);
    });

    it('should have required properties for each trick', () => {
      TRICKS.forEach((trick, _index) => {
        expect(trick.name).toBeDefined();
        expect(trick.name.length).toBeGreaterThan(0);
        expect(trick.input).toBeDefined();
        expect(Array.isArray(trick.input)).toBe(true);
        expect(trick.value).toBeDefined();
        expect(typeof trick.value).toBe('number');
        expect(trick.description).toBeDefined();
        expect(trick.emoji).toBeDefined();
        expect(trick.animationFrames).toBeDefined();
        expect(Array.isArray(trick.animationFrames)).toBe(true);
      });
    });

    it('should have unique trick names', () => {
      const names = TRICKS.map(t => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have exactly 2 inputs per trick', () => {
      TRICKS.forEach(trick => {
        expect(trick.input.length).toBe(2);
      });
    });

    it('should only use valid input directions', () => {
      const validDirections = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      TRICKS.forEach(trick => {
        trick.input.forEach(direction => {
          expect(validDirections).toContain(direction);
        });
      });
    });
  });

  describe('Trick Values', () => {
    it('should have positive values for all tricks', () => {
      TRICKS.forEach(trick => {
        expect(trick.value).toBeGreaterThan(0);
      });
    });

    it('should have values in expected range (40-120)', () => {
      TRICKS.forEach(trick => {
        expect(trick.value).toBeGreaterThanOrEqual(40);
        expect(trick.value).toBeLessThanOrEqual(120);
      });
    });

    it('should have lowest value of 40 (Air Brake)', () => {
      const minValue = Math.min(...TRICKS.map(t => t.value));
      expect(minValue).toBe(40);
    });

    it('should have highest value of 120 (Orbit Spins)', () => {
      const maxValue = Math.max(...TRICKS.map(t => t.value));
      expect(maxValue).toBe(120);
    });

    it('should have correct value progression', () => {
      const valueTiers = {
        40: ['Air Brake'],
        50: ['Parachute'],
        60: ['Helicopter Spin Left', 'Helicopter Spin Right'],
        70: ['Superman'],
        80: ['Sled Flip Back', 'Sled Flip Front'],
        85: ['Falling Star'],
        90: ['Sky Dive Roll Right', 'Sky Dive Roll Left'],
        100: ['Ghost Rider', 'Toboggan Toss'],
        110: ['Corkscrew Right', 'Corkscrew Left'],
        120: ['Orbit Spin Clockwise', 'Orbit Spin Counterwise'],
      };

      Object.entries(valueTiers).forEach(([value, trickNames]) => {
        trickNames.forEach(name => {
          const trick = TRICKS.find(t => t.name === name);
          expect(trick).toBeDefined();
          expect(trick!.value).toBe(Number(value));
        });
      });
    });
  });

  describe('Input Combinations', () => {
    it('should cover all 16 possible input combinations', () => {
      // 4 directions * 4 directions = 16 combinations
      const combinations = TRICKS.map(t => t.input.join('-'));
      const uniqueCombinations = new Set(combinations);
      expect(uniqueCombinations.size).toBe(16);
    });

    it('should have one trick for each unique input combination', () => {
      const combinationCount: Record<string, number> = {};
      TRICKS.forEach(trick => {
        const key = trick.input.join('-');
        combinationCount[key] = (combinationCount[key] || 0) + 1;
      });

      Object.values(combinationCount).forEach(count => {
        expect(count).toBe(1);
      });
    });

    it('should include same-direction double inputs', () => {
      const sameDirectionTricks = TRICKS.filter(t => t.input[0] === t.input[1]);
      expect(sameDirectionTricks.length).toBe(4); // UP-UP, DOWN-DOWN, LEFT-LEFT, RIGHT-RIGHT
    });

    it('should include opposite-direction inputs', () => {
      const opposites = [
        ['UP', 'DOWN'],
        ['DOWN', 'UP'],
        ['LEFT', 'RIGHT'],
        ['RIGHT', 'LEFT'],
      ];

      opposites.forEach(pair => {
        const trick = TRICKS.find(t =>
          t.input[0] === pair[0] && t.input[1] === pair[1]
        );
        expect(trick).toBeDefined();
      });
    });
  });

  describe('Animation Frames', () => {
    it('should have exactly 3 animation frames per trick', () => {
      TRICKS.forEach(trick => {
        expect(trick.animationFrames.length).toBe(3);
      });
    });

    it('should have consecutive animation frames', () => {
      TRICKS.forEach(trick => {
        const frames = trick.animationFrames;
        expect(frames[1]).toBe(frames[0] + 1);
        expect(frames[2]).toBe(frames[1] + 1);
      });
    });

    it('should have unique animation frame sets', () => {
      const frameSets = TRICKS.map(t => t.animationFrames[0]);
      const uniqueFrameSets = new Set(frameSets);
      expect(uniqueFrameSets.size).toBe(TRICKS.length);
    });

    it('should have frames starting from 0', () => {
      const allFrames = TRICKS.flatMap(t => t.animationFrames);
      expect(Math.min(...allFrames)).toBe(0);
    });

    it('should have frames ending at 47 (16 tricks * 3 frames - 1)', () => {
      const allFrames = TRICKS.flatMap(t => t.animationFrames);
      expect(Math.max(...allFrames)).toBe(47);
    });
  });

  describe('Specific Tricks', () => {
    it('should have Parachute trick with correct configuration', () => {
      const parachute = TRICKS.find(t => t.name === 'Parachute');
      expect(parachute).toBeDefined();
      expect(parachute!.input).toEqual(['UP', 'DOWN']);
      expect(parachute!.value).toBe(50);
    });

    it('should have Ghost Rider as high-value trick', () => {
      const ghostRider = TRICKS.find(t => t.name === 'Ghost Rider');
      expect(ghostRider).toBeDefined();
      expect(ghostRider!.input).toEqual(['LEFT', 'RIGHT']);
      expect(ghostRider!.value).toBe(100);
    });

    it('should have Orbit Spins as highest value tricks', () => {
      const orbitCW = TRICKS.find(t => t.name === 'Orbit Spin Clockwise');
      const orbitCCW = TRICKS.find(t => t.name === 'Orbit Spin Counterwise');

      expect(orbitCW).toBeDefined();
      expect(orbitCCW).toBeDefined();
      expect(orbitCW!.value).toBe(120);
      expect(orbitCCW!.value).toBe(120);
    });
  });
});

describe('UPGRADE_COSTS', () => {
  describe('Structure Validation', () => {
    it('should have personal and mountain categories', () => {
      expect(UPGRADE_COSTS.personal).toBeDefined();
      expect(UPGRADE_COSTS.mountain).toBeDefined();
    });

    it('should have 8 personal upgrades', () => {
      expect(Object.keys(UPGRADE_COSTS.personal).length).toBe(8);
    });

    it('should have 6 mountain upgrades', () => {
      expect(Object.keys(UPGRADE_COSTS.mountain).length).toBe(6);
    });
  });

  describe('Personal Upgrades', () => {
    const personalUpgrades = [
      'rocketSurgery',
      'optimalOptics',
      'sledDurability',
      'fancierFootwear',
      'attendLegDay',
      'crowdHypeman',
      'crowdWeaver',
      'weatherWarrior',
    ];

    it('should have all expected personal upgrades', () => {
      personalUpgrades.forEach(upgrade => {
        expect(UPGRADE_COSTS.personal[upgrade as keyof typeof UPGRADE_COSTS.personal]).toBeDefined();
      });
    });

    it('should have 5 cost tiers for each personal upgrade', () => {
      personalUpgrades.forEach(upgrade => {
        const costs = UPGRADE_COSTS.personal[upgrade as keyof typeof UPGRADE_COSTS.personal];
        expect(costs.length).toBe(5);
      });
    });

    it('should have increasing costs per tier', () => {
      personalUpgrades.forEach(upgrade => {
        const costs = UPGRADE_COSTS.personal[upgrade as keyof typeof UPGRADE_COSTS.personal];
        for (let i = 0; i < costs.length - 1; i++) {
          expect(costs[i + 1]).toBeGreaterThan(costs[i]);
        }
      });
    });

    it('should have positive costs', () => {
      personalUpgrades.forEach(upgrade => {
        const costs = UPGRADE_COSTS.personal[upgrade as keyof typeof UPGRADE_COSTS.personal];
        costs.forEach(cost => {
          expect(cost).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Mountain Upgrades', () => {
    const mountainUpgrades = [
      'skiLifts',
      'snowmobileRentals',
      'foodStalls',
      'groomedTrails',
      'firstAidStations',
      'scenicOverlooks',
    ];

    it('should have all expected mountain upgrades', () => {
      mountainUpgrades.forEach(upgrade => {
        expect(UPGRADE_COSTS.mountain[upgrade as keyof typeof UPGRADE_COSTS.mountain]).toBeDefined();
      });
    });

    it('should have 5 cost tiers for each mountain upgrade', () => {
      mountainUpgrades.forEach(upgrade => {
        const costs = UPGRADE_COSTS.mountain[upgrade as keyof typeof UPGRADE_COSTS.mountain];
        expect(costs.length).toBe(5);
      });
    });

    it('should have increasing costs per tier', () => {
      mountainUpgrades.forEach(upgrade => {
        const costs = UPGRADE_COSTS.mountain[upgrade as keyof typeof UPGRADE_COSTS.mountain];
        for (let i = 0; i < costs.length - 1; i++) {
          expect(costs[i + 1]).toBeGreaterThan(costs[i]);
        }
      });
    });

    it('should have positive costs', () => {
      mountainUpgrades.forEach(upgrade => {
        const costs = UPGRADE_COSTS.mountain[upgrade as keyof typeof UPGRADE_COSTS.mountain];
        costs.forEach(cost => {
          expect(cost).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Cost Progression', () => {
    it('should double costs between tiers for most upgrades', () => {
      // Check rocketSurgery as example: [100, 250, 500, 1000, 2000]
      const rocketCosts = UPGRADE_COSTS.personal.rocketSurgery;
      expect(rocketCosts[4] / rocketCosts[3]).toBeCloseTo(2);
      expect(rocketCosts[3] / rocketCosts[2]).toBeCloseTo(2);
    });

    it('should have consistent progression for ski lifts', () => {
      // [500, 1000, 2000, 4000, 8000]
      const skiLiftCosts = UPGRADE_COSTS.mountain.skiLifts;
      for (let i = 0; i < skiLiftCosts.length - 1; i++) {
        expect(skiLiftCosts[i + 1] / skiLiftCosts[i]).toBeCloseTo(2);
      }
    });

    it('should have first tier cost of 100-800 for personal upgrades', () => {
      Object.values(UPGRADE_COSTS.personal).forEach(costs => {
        expect(costs[0]).toBeGreaterThanOrEqual(100);
        expect(costs[0]).toBeLessThanOrEqual(800);
      });
    });

    it('should have first tier cost of 300-800 for mountain upgrades', () => {
      Object.values(UPGRADE_COSTS.mountain).forEach(costs => {
        expect(costs[0]).toBeGreaterThanOrEqual(300);
        expect(costs[0]).toBeLessThanOrEqual(800);
      });
    });
  });

  describe('Total Cost Calculations', () => {
    it('should calculate total cost to max rocketSurgery', () => {
      const total = UPGRADE_COSTS.personal.rocketSurgery.reduce((a, b) => a + b, 0);
      expect(total).toBe(3850); // 100+250+500+1000+2000
    });

    it('should calculate total cost to max all personal upgrades', () => {
      let total = 0;
      Object.values(UPGRADE_COSTS.personal).forEach(costs => {
        total += costs.reduce((a, b) => a + b, 0);
      });
      expect(total).toBeGreaterThan(0);
      // Exact value: sum of all personal upgrade costs
    });

    it('should calculate total cost to max all mountain upgrades', () => {
      let total = 0;
      Object.values(UPGRADE_COSTS.mountain).forEach(costs => {
        total += costs.reduce((a, b) => a + b, 0);
      });
      expect(total).toBeGreaterThan(0);
    });

    it('should have mountain upgrades cost more in total than personal', () => {
      let personalTotal = 0;
      let mountainTotal = 0;

      Object.values(UPGRADE_COSTS.personal).forEach(costs => {
        personalTotal += costs.reduce((a, b) => a + b, 0);
      });

      Object.values(UPGRADE_COSTS.mountain).forEach(costs => {
        mountainTotal += costs.reduce((a, b) => a + b, 0);
      });

      expect(mountainTotal).toBeGreaterThan(personalTotal);
    });
  });

  describe('Specific Upgrade Costs', () => {
    it('should have rocketSurgery costs at [100, 250, 500, 1000, 2000]', () => {
      expect(UPGRADE_COSTS.personal.rocketSurgery).toEqual([100, 250, 500, 1000, 2000]);
    });

    it('should have weatherWarrior as most expensive personal upgrade', () => {
      const weatherWarriorTotal = UPGRADE_COSTS.personal.weatherWarrior.reduce((a, b) => a + b, 0);

      Object.entries(UPGRADE_COSTS.personal).forEach(([key, costs]) => {
        if (key !== 'weatherWarrior') {
          const total = costs.reduce((a, b) => a + b, 0);
          expect(weatherWarriorTotal).toBeGreaterThanOrEqual(total);
        }
      });
    });

    it('should have snowmobileRentals as most expensive mountain upgrade', () => {
      const snowmobileTotal = UPGRADE_COSTS.mountain.snowmobileRentals.reduce((a, b) => a + b, 0);

      Object.entries(UPGRADE_COSTS.mountain).forEach(([key, costs]) => {
        if (key !== 'snowmobileRentals') {
          const total = costs.reduce((a, b) => a + b, 0);
          expect(snowmobileTotal).toBeGreaterThanOrEqual(total);
        }
      });
    });
  });
});
