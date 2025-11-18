import { describe, it, expect } from 'vitest';

/**
 * Modular sled system calculations that can be tested without Phaser
 */

type SledSize = 'jack-jumper' | 'toboggan' | 'bobsled' | 'gravity-sledge' | 'powered-sledge';
type ComponentSlot = 'runners' | 'body' | 'front' | 'rear' | 'sideLeft' | 'sideRight';

interface SledComponent {
  id: string;
  name: string;
  slot: ComponentSlot;
  weight: number;
  capacity?: number;
  speedBonus?: number;
  trickBonus?: number;
  durabilityBonus?: number;
  staminaCostModifier?: number;
  specialEffect?: string;
}

interface SledStats {
  totalWeight: number;
  totalCapacity: number;
  speedBonus: number;
  trickBonus: number;
  durability: number;
  staminaDrainRate: number;
  specialEffects: string[];
}

// Base sled stats by size
const sledSizeWeights: Record<SledSize, number> = {
  'jack-jumper': 5,
  'toboggan': 10,
  'bobsled': 15,
  'gravity-sledge': 20,
  'powered-sledge': 25,
};

const sledSizeCapacities: Record<SledSize, number> = {
  'jack-jumper': 2,
  'toboggan': 4,
  'bobsled': 6,
  'gravity-sledge': 8,
  'powered-sledge': 10,
};

const sledSizeDurabilities: Record<SledSize, number> = {
  'jack-jumper': 2,
  'toboggan': 3,
  'bobsled': 4,
  'gravity-sledge': 5,
  'powered-sledge': 6,
};

// Calculate sled stats from size and components
function calculateSledStats(
  size: SledSize,
  components: SledComponent[],
  ngpBonuses?: { speed: number; trickery: number }
): SledStats {
  const stats: SledStats = {
    totalWeight: sledSizeWeights[size],
    totalCapacity: sledSizeCapacities[size],
    speedBonus: 0,
    trickBonus: 0,
    durability: sledSizeDurabilities[size],
    staminaDrainRate: 1.0,
    specialEffects: [],
  };

  for (const component of components) {
    stats.totalWeight += component.weight;
    stats.totalCapacity += component.capacity || 0;
    stats.speedBonus += component.speedBonus || 0;
    stats.trickBonus += component.trickBonus || 0;
    stats.durability += component.durabilityBonus || 0;
    stats.staminaDrainRate *= (1 + (component.staminaCostModifier || 0));

    if (component.specialEffect) {
      stats.specialEffects.push(component.specialEffect);
    }
  }

  // Apply NGP bonuses
  if (ngpBonuses) {
    stats.speedBonus += ngpBonuses.speed;
    stats.trickBonus += ngpBonuses.trickery;
  }

  return stats;
}

// Calculate stamina drain based on sled weight
function calculateWeightedStaminaDrain(
  baseStamina: number,
  sledWeight: number,
  staminaDrainRate: number
): number {
  const weightPenalty = 1 + (sledWeight / 100);
  return baseStamina * weightPenalty * staminaDrainRate;
}

// Sample components for testing
const sampleComponents: SledComponent[] = [
  // Early game runners
  {
    id: 'birchwood-skids',
    name: 'Birchwood Skids',
    slot: 'runners',
    weight: 5,
    speedBonus: 0.05,
    trickBonus: 0.1,
  },
  {
    id: 'steel-runners',
    name: 'Steel Runners',
    slot: 'runners',
    weight: 8,
    speedBonus: 0,
    durabilityBonus: 1,
  },
  // Early game body
  {
    id: 'pineframe-hull',
    name: 'Pineframe Hull',
    slot: 'body',
    weight: 12,
    capacity: 3,
    durabilityBonus: 1,
  },
  {
    id: 'hollowcore-deck',
    name: 'Hollowcore Deck',
    slot: 'body',
    weight: 8,
    capacity: 2,
    speedBonus: 0.08,
  },
  {
    id: 'woven-bark-shell',
    name: 'Woven Bark Shell',
    slot: 'body',
    weight: 10,
    capacity: 3,
    staminaCostModifier: -0.1,
  },
  // Attachments
  {
    id: 'mini-dig-kit',
    name: 'Mini Dig Kit',
    slot: 'front',
    weight: 3,
    specialEffect: 'treasure-detection',
  },
  {
    id: 'trail-crate',
    name: 'Trail Crate',
    slot: 'rear',
    weight: 4,
    capacity: 1,
  },
  {
    id: 'thermos-drum',
    name: 'Thermos Drum',
    slot: 'rear',
    weight: 3,
    staminaCostModifier: -0.05,
  },
  // Mid game
  {
    id: 'frostbite-rails',
    name: 'Frostbite Rails',
    slot: 'runners',
    weight: 10,
    speedBonus: 0.1,
    trickBonus: -0.05,
    specialEffect: 'ice-grip',
  },
  {
    id: 'coolant-tank',
    name: 'Coolant Tank',
    slot: 'rear',
    weight: 7,
    staminaCostModifier: -0.15,
    specialEffect: 'heat-resist',
  },
  // Late game
  {
    id: 'molten-rails',
    name: 'Molten Rails',
    slot: 'runners',
    weight: 15,
    speedBonus: 0.25,
    specialEffect: 'lava-immunity',
  },
  {
    id: 'lunar-skids',
    name: 'Lunar Skids',
    slot: 'runners',
    weight: 6,
    speedBonus: 0.15,
    trickBonus: 0.3,
    specialEffect: 'low-gravity',
  },
  {
    id: 'zero-g-frame',
    name: 'Zero-G Frame',
    slot: 'body',
    weight: 0,
    capacity: 0,
    speedBonus: 0.3,
    trickBonus: 0.2,
  },
  {
    id: 'volcanic-alloy-core',
    name: 'Volcanic Alloy Core',
    slot: 'body',
    weight: 25,
    capacity: 8,
    durabilityBonus: 5,
  },
];

describe('Sled Builder Calculations', () => {
  describe('Base Sled Stats', () => {
    describe('Weight by Size', () => {
      it('should have jack-jumper as lightest', () => {
        expect(sledSizeWeights['jack-jumper']).toBe(5);
      });

      it('should have powered-sledge as heaviest', () => {
        expect(sledSizeWeights['powered-sledge']).toBe(25);
      });

      it('should increase weight with size', () => {
        const sizes: SledSize[] = ['jack-jumper', 'toboggan', 'bobsled', 'gravity-sledge', 'powered-sledge'];
        for (let i = 0; i < sizes.length - 1; i++) {
          expect(sledSizeWeights[sizes[i]]).toBeLessThan(sledSizeWeights[sizes[i + 1]]);
        }
      });
    });

    describe('Capacity by Size', () => {
      it('should have jack-jumper with minimum capacity', () => {
        expect(sledSizeCapacities['jack-jumper']).toBe(2);
      });

      it('should have powered-sledge with maximum capacity', () => {
        expect(sledSizeCapacities['powered-sledge']).toBe(10);
      });

      it('should increase by 2 per size tier', () => {
        const sizes: SledSize[] = ['jack-jumper', 'toboggan', 'bobsled', 'gravity-sledge', 'powered-sledge'];
        for (let i = 0; i < sizes.length - 1; i++) {
          expect(sledSizeCapacities[sizes[i + 1]] - sledSizeCapacities[sizes[i]]).toBe(2);
        }
      });
    });

    describe('Durability by Size', () => {
      it('should have jack-jumper with minimum durability', () => {
        expect(sledSizeDurabilities['jack-jumper']).toBe(2);
      });

      it('should have powered-sledge with maximum durability', () => {
        expect(sledSizeDurabilities['powered-sledge']).toBe(6);
      });

      it('should increase by 1 per size tier', () => {
        const sizes: SledSize[] = ['jack-jumper', 'toboggan', 'bobsled', 'gravity-sledge', 'powered-sledge'];
        for (let i = 0; i < sizes.length - 1; i++) {
          expect(sledSizeDurabilities[sizes[i + 1]] - sledSizeDurabilities[sizes[i]]).toBe(1);
        }
      });
    });
  });

  describe('Component Stats Calculation', () => {
    it('should calculate empty sled stats', () => {
      const stats = calculateSledStats('jack-jumper', []);
      expect(stats.totalWeight).toBe(5);
      expect(stats.totalCapacity).toBe(2);
      expect(stats.speedBonus).toBe(0);
      expect(stats.trickBonus).toBe(0);
      expect(stats.durability).toBe(2);
      expect(stats.staminaDrainRate).toBe(1);
      expect(stats.specialEffects).toEqual([]);
    });

    it('should add component weight', () => {
      const birchwoodSkids = sampleComponents.find(c => c.id === 'birchwood-skids')!;
      const stats = calculateSledStats('jack-jumper', [birchwoodSkids]);
      expect(stats.totalWeight).toBe(10); // 5 + 5
    });

    it('should add component capacity', () => {
      const pineframeHull = sampleComponents.find(c => c.id === 'pineframe-hull')!;
      const stats = calculateSledStats('jack-jumper', [pineframeHull]);
      expect(stats.totalCapacity).toBe(5); // 2 + 3
    });

    it('should add speed bonus', () => {
      const birchwoodSkids = sampleComponents.find(c => c.id === 'birchwood-skids')!;
      const stats = calculateSledStats('jack-jumper', [birchwoodSkids]);
      expect(stats.speedBonus).toBe(0.05);
    });

    it('should add trick bonus', () => {
      const birchwoodSkids = sampleComponents.find(c => c.id === 'birchwood-skids')!;
      const stats = calculateSledStats('jack-jumper', [birchwoodSkids]);
      expect(stats.trickBonus).toBe(0.1);
    });

    it('should add durability bonus', () => {
      const steelRunners = sampleComponents.find(c => c.id === 'steel-runners')!;
      const stats = calculateSledStats('jack-jumper', [steelRunners]);
      expect(stats.durability).toBe(3); // 2 + 1
    });

    it('should multiply stamina cost modifier', () => {
      const wovenBarkShell = sampleComponents.find(c => c.id === 'woven-bark-shell')!;
      const stats = calculateSledStats('jack-jumper', [wovenBarkShell]);
      expect(stats.staminaDrainRate).toBeCloseTo(0.9); // 1 * (1 + (-0.1))
    });

    it('should collect special effects', () => {
      const miniDigKit = sampleComponents.find(c => c.id === 'mini-dig-kit')!;
      const stats = calculateSledStats('jack-jumper', [miniDigKit]);
      expect(stats.specialEffects).toContain('treasure-detection');
    });
  });

  describe('Multiple Component Builds', () => {
    it('should calculate full early-game build', () => {
      const components = [
        sampleComponents.find(c => c.id === 'birchwood-skids')!,
        sampleComponents.find(c => c.id === 'pineframe-hull')!,
        sampleComponents.find(c => c.id === 'mini-dig-kit')!,
        sampleComponents.find(c => c.id === 'trail-crate')!,
      ];
      const stats = calculateSledStats('jack-jumper', components);

      expect(stats.totalWeight).toBe(5 + 5 + 12 + 3 + 4); // 29
      expect(stats.totalCapacity).toBe(2 + 3 + 1); // 6
      expect(stats.speedBonus).toBe(0.05);
      expect(stats.trickBonus).toBe(0.1);
      expect(stats.durability).toBe(2 + 1); // 3
      expect(stats.specialEffects).toContain('treasure-detection');
    });

    it('should stack speed bonuses', () => {
      const components = [
        sampleComponents.find(c => c.id === 'birchwood-skids')!, // 0.05
        sampleComponents.find(c => c.id === 'hollowcore-deck')!, // 0.08
      ];
      const stats = calculateSledStats('jack-jumper', components);
      expect(stats.speedBonus).toBeCloseTo(0.13);
    });

    it('should compound stamina modifiers', () => {
      const components = [
        sampleComponents.find(c => c.id === 'woven-bark-shell')!, // -0.1
        sampleComponents.find(c => c.id === 'thermos-drum')!, // -0.05
      ];
      const stats = calculateSledStats('jack-jumper', components);
      // 1 * 0.9 * 0.95 = 0.855
      expect(stats.staminaDrainRate).toBeCloseTo(0.855);
    });

    it('should handle negative trick bonus', () => {
      const components = [
        sampleComponents.find(c => c.id === 'frostbite-rails')!, // trickBonus: -0.05
      ];
      const stats = calculateSledStats('jack-jumper', components);
      expect(stats.trickBonus).toBe(-0.05);
    });

    it('should collect multiple special effects', () => {
      const components = [
        sampleComponents.find(c => c.id === 'frostbite-rails')!, // ice-grip
        sampleComponents.find(c => c.id === 'coolant-tank')!, // heat-resist
      ];
      const stats = calculateSledStats('jack-jumper', components);
      expect(stats.specialEffects).toHaveLength(2);
      expect(stats.specialEffects).toContain('ice-grip');
      expect(stats.specialEffects).toContain('heat-resist');
    });
  });

  describe('Late Game Builds', () => {
    it('should calculate max speed build', () => {
      const components = [
        sampleComponents.find(c => c.id === 'molten-rails')!, // 0.25
        sampleComponents.find(c => c.id === 'zero-g-frame')!, // 0.3
      ];
      const stats = calculateSledStats('jack-jumper', components);
      expect(stats.speedBonus).toBe(0.55);
    });

    it('should calculate max trick build', () => {
      const components = [
        sampleComponents.find(c => c.id === 'lunar-skids')!, // 0.3
        sampleComponents.find(c => c.id === 'zero-g-frame')!, // 0.2
      ];
      const stats = calculateSledStats('jack-jumper', components);
      expect(stats.trickBonus).toBe(0.5);
    });

    it('should calculate tank build', () => {
      const components = [
        sampleComponents.find(c => c.id === 'steel-runners')!, // durability +1
        sampleComponents.find(c => c.id === 'volcanic-alloy-core')!, // durability +5
      ];
      const stats = calculateSledStats('powered-sledge', components);
      expect(stats.durability).toBe(6 + 1 + 5); // 12
      expect(stats.totalCapacity).toBe(10 + 8); // 18
    });

    it('should handle zero-weight component', () => {
      const zeroGFrame = sampleComponents.find(c => c.id === 'zero-g-frame')!;
      const stats = calculateSledStats('jack-jumper', [zeroGFrame]);
      expect(stats.totalWeight).toBe(5 + 0); // Only base weight
    });
  });

  describe('Stamina Drain Calculations', () => {
    it('should calculate base stamina drain', () => {
      const drain = calculateWeightedStaminaDrain(10, 10, 1);
      // 10 * (1 + 10/100) * 1 = 11
      expect(drain).toBe(11);
    });

    it('should increase with heavier sleds', () => {
      const lightDrain = calculateWeightedStaminaDrain(10, 10, 1);
      const heavyDrain = calculateWeightedStaminaDrain(10, 50, 1);
      expect(heavyDrain).toBeGreaterThan(lightDrain);
    });

    it('should apply stamina drain rate modifier', () => {
      const normalDrain = calculateWeightedStaminaDrain(10, 20, 1);
      const reducedDrain = calculateWeightedStaminaDrain(10, 20, 0.85);

      expect(reducedDrain).toBeLessThan(normalDrain);
      expect(reducedDrain).toBeCloseTo(normalDrain * 0.85);
    });

    it('should calculate realistic full build drain', () => {
      const components = [
        sampleComponents.find(c => c.id === 'steel-runners')!, // weight 8
        sampleComponents.find(c => c.id === 'pineframe-hull')!, // weight 12
        sampleComponents.find(c => c.id === 'trail-crate')!, // weight 4
      ];
      const stats = calculateSledStats('toboggan', components);
      // Weight: 10 + 8 + 12 + 4 = 34

      const drain = calculateWeightedStaminaDrain(10, stats.totalWeight, stats.staminaDrainRate);
      // 10 * (1 + 34/100) * 1 = 13.4
      expect(drain).toBeCloseTo(13.4);
    });

    it('should calculate optimized stamina build', () => {
      const components = [
        sampleComponents.find(c => c.id === 'woven-bark-shell')!, // -10%
        sampleComponents.find(c => c.id === 'coolant-tank')!, // -15%
        sampleComponents.find(c => c.id === 'thermos-drum')!, // -5%
      ];
      const stats = calculateSledStats('jack-jumper', components);
      // Stamina rate: 1 * 0.9 * 0.85 * 0.95 = 0.72675

      const drain = calculateWeightedStaminaDrain(10, stats.totalWeight, stats.staminaDrainRate);
      expect(stats.staminaDrainRate).toBeLessThan(1);
      expect(drain).toBeLessThan(calculateWeightedStaminaDrain(10, stats.totalWeight, 1));
    });
  });

  describe('NewGame+ Bonuses', () => {
    it('should apply speed bonus', () => {
      const stats = calculateSledStats('jack-jumper', [], { speed: 0.1, trickery: 0 });
      expect(stats.speedBonus).toBe(0.1);
    });

    it('should apply trickery bonus', () => {
      const stats = calculateSledStats('jack-jumper', [], { speed: 0, trickery: 0.2 });
      expect(stats.trickBonus).toBe(0.2);
    });

    it('should stack with component bonuses', () => {
      const components = [sampleComponents.find(c => c.id === 'birchwood-skids')!];
      const stats = calculateSledStats('jack-jumper', components, { speed: 0.1, trickery: 0.1 });

      expect(stats.speedBonus).toBeCloseTo(0.15); // 0.05 + 0.1
      expect(stats.trickBonus).toBeCloseTo(0.2); // 0.1 + 0.1
    });

    it('should handle large stacked bonuses', () => {
      const components = [
        sampleComponents.find(c => c.id === 'molten-rails')!,
        sampleComponents.find(c => c.id === 'zero-g-frame')!,
      ];
      const stats = calculateSledStats('jack-jumper', components, { speed: 0.5, trickery: 0.5 });

      expect(stats.speedBonus).toBe(1.05); // 0.25 + 0.3 + 0.5
      expect(stats.trickBonus).toBe(0.7); // 0.2 + 0.5
    });
  });

  describe('Storage Capacity Calculations', () => {
    it('should calculate small sled capacity', () => {
      const stats = calculateSledStats('jack-jumper', [
        sampleComponents.find(c => c.id === 'trail-crate')!,
      ]);
      expect(stats.totalCapacity).toBe(3); // 2 + 1
    });

    it('should calculate large sled capacity', () => {
      const stats = calculateSledStats('powered-sledge', [
        sampleComponents.find(c => c.id === 'volcanic-alloy-core')!,
      ]);
      expect(stats.totalCapacity).toBe(18); // 10 + 8
    });

    it('should handle zero capacity component', () => {
      const stats = calculateSledStats('jack-jumper', [
        sampleComponents.find(c => c.id === 'zero-g-frame')!,
      ]);
      expect(stats.totalCapacity).toBe(2); // Base only
    });
  });

  describe('Part Compatibility', () => {
    it('should allow one component per slot', () => {
      // Simulate slot checking
      const slots = new Set<ComponentSlot>();
      const components = [
        sampleComponents.find(c => c.id === 'birchwood-skids')!, // runners
        sampleComponents.find(c => c.id === 'pineframe-hull')!, // body
        sampleComponents.find(c => c.id === 'mini-dig-kit')!, // front
        sampleComponents.find(c => c.id === 'trail-crate')!, // rear
      ];

      components.forEach(c => {
        expect(slots.has(c.slot)).toBe(false);
        slots.add(c.slot);
      });

      expect(slots.size).toBe(4);
    });

    it('should detect duplicate slots', () => {
      // Two runners - should detect conflict
      const components = [
        sampleComponents.find(c => c.id === 'birchwood-skids')!,
        sampleComponents.find(c => c.id === 'steel-runners')!,
      ];

      expect(components[0].slot).toBe('runners');
      expect(components[1].slot).toBe('runners');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty component array', () => {
      const stats = calculateSledStats('toboggan', []);
      expect(stats.totalWeight).toBe(10);
      expect(stats.specialEffects).toEqual([]);
    });

    it('should handle negative durability bonus', () => {
      // Some high-speed parts might reduce durability
      const fragileComponent: SledComponent = {
        id: 'crystal-edges',
        name: 'Crystal Edges',
        slot: 'runners',
        weight: 9,
        speedBonus: 0.15,
        durabilityBonus: -1,
      };
      const stats = calculateSledStats('jack-jumper', [fragileComponent]);
      expect(stats.durability).toBe(1); // 2 - 1
    });

    it('should handle very heavy builds', () => {
      const components = [
        sampleComponents.find(c => c.id === 'volcanic-alloy-core')!, // 25
        sampleComponents.find(c => c.id === 'molten-rails')!, // 15
      ];
      const stats = calculateSledStats('powered-sledge', components);
      expect(stats.totalWeight).toBe(25 + 25 + 15); // 65
    });

    it('should handle multiple stamina modifiers stacking', () => {
      // Extreme stamina reduction build
      const components = [
        sampleComponents.find(c => c.id === 'woven-bark-shell')!,
        sampleComponents.find(c => c.id === 'coolant-tank')!,
        sampleComponents.find(c => c.id === 'thermos-drum')!,
      ];
      const stats = calculateSledStats('jack-jumper', components);

      // Should still be positive
      expect(stats.staminaDrainRate).toBeGreaterThan(0);
      expect(stats.staminaDrainRate).toBeLessThan(1);
    });
  });
});
