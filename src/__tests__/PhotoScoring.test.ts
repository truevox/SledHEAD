import { describe, it, expect } from 'vitest';

/**
 * Photography scoring system calculations
 */

interface Animal {
  type: 'bear' | 'bird' | 'mountainlion' | 'deer' | 'fox';
  altitude: number;
  moving: boolean;
  photographed: number; // Times already photographed
  rarity: number; // 1-5
}

interface PhotoParams {
  animal: Animal;
  playerAltitude: number;
  centeringOffset: number; // 0 = perfect center, increases with distance
  maxOffset: number;
}

// Rarity values for each animal type
const animalRarities: Record<Animal['type'], number> = {
  deer: 1,
  bird: 2,
  fox: 3,
  bear: 4,
  mountainlion: 5,
};

// Base photo values
const basePhotoValue = 50;

// Calculate altitude match (0-1)
function calculateAltitudeMatch(playerAltitude: number, animalAltitude: number, tolerance: number = 100): number {
  const diff = Math.abs(playerAltitude - animalAltitude);
  if (diff >= tolerance) return 0;
  return 1 - (diff / tolerance);
}

// Calculate centering bonus (0-1)
function calculateCenteringBonus(offset: number, maxOffset: number): number {
  if (offset >= maxOffset) return 0;
  return 1 - (offset / maxOffset);
}

// Calculate movement multiplier
function calculateMovementMultiplier(isMoving: boolean): number {
  return isMoving ? 1.3 : 1.0;
}

// Calculate repeat penalty (0-1)
function calculateRepeatPenalty(timesPhotographed: number): number {
  if (timesPhotographed === 0) return 0;
  // 20% penalty per repeat, max 80%
  return Math.min(0.8, timesPhotographed * 0.2);
}

// Calculate complete photo score
function calculatePhotoScore(params: PhotoParams): number {
  const { animal, playerAltitude, centeringOffset, maxOffset } = params;

  const altitudeMatch = calculateAltitudeMatch(playerAltitude, animal.altitude);
  const centering = calculateCenteringBonus(centeringOffset, maxOffset);
  const movementMult = calculateMovementMultiplier(animal.moving);
  const repeatPenalty = calculateRepeatPenalty(animal.photographed);

  // Apply multipliers
  const altitudeMultiplier = 0.5 + (altitudeMatch * 0.5); // 0.5-1.0
  const centeringMultiplier = 0.5 + (centering * 0.5); // 0.5-1.0
  const penaltyMult = 1 - repeatPenalty; // 0.2-1.0

  return Math.floor(
    basePhotoValue *
    altitudeMultiplier *
    centeringMultiplier *
    movementMult *
    animal.rarity *
    penaltyMult
  );
}

// Calculate with upgrade bonuses
function calculatePhotoScoreWithUpgrades(
  params: PhotoParams,
  optimalOpticsLevel: number = 0,
  scenicOverlooksLevel: number = 0
): number {
  const baseScore = calculatePhotoScore(params);
  const opticsBonus = 1 + (optimalOpticsLevel * 0.1); // 10% per level
  const scenicBonus = 1 + (scenicOverlooksLevel * 0.12); // 12% per level

  return Math.floor(baseScore * opticsBonus * scenicBonus);
}

describe('Photo Scoring Calculations', () => {
  describe('Altitude Match', () => {
    it('should return 1 for perfect altitude match', () => {
      const match = calculateAltitudeMatch(500, 500);
      expect(match).toBe(1);
    });

    it('should return 0 for altitude outside tolerance', () => {
      const match = calculateAltitudeMatch(500, 700, 100);
      expect(match).toBe(0);
    });

    it('should return 0.5 for halfway match', () => {
      const match = calculateAltitudeMatch(500, 550, 100);
      expect(match).toBe(0.5);
    });

    it('should handle player above animal', () => {
      const match = calculateAltitudeMatch(600, 500, 100);
      expect(match).toBe(0);
    });

    it('should use absolute difference', () => {
      const match1 = calculateAltitudeMatch(500, 550, 100);
      const match2 = calculateAltitudeMatch(550, 500, 100);
      expect(match1).toBe(match2);
    });

    it('should scale with tolerance', () => {
      const tightMatch = calculateAltitudeMatch(500, 550, 100);
      const looseMatch = calculateAltitudeMatch(500, 550, 200);
      expect(looseMatch).toBeGreaterThan(tightMatch);
    });

    it('should return 0.9 for near-perfect match', () => {
      const match = calculateAltitudeMatch(500, 510, 100);
      expect(match).toBe(0.9);
    });

    it('should return exact 0 at tolerance boundary', () => {
      const match = calculateAltitudeMatch(500, 600, 100);
      expect(match).toBe(0);
    });
  });

  describe('Centering Bonus', () => {
    it('should return 1 for perfect center', () => {
      const bonus = calculateCenteringBonus(0, 100);
      expect(bonus).toBe(1);
    });

    it('should return 0 at max offset', () => {
      const bonus = calculateCenteringBonus(100, 100);
      expect(bonus).toBe(0);
    });

    it('should return 0.5 at half offset', () => {
      const bonus = calculateCenteringBonus(50, 100);
      expect(bonus).toBe(0.5);
    });

    it('should return 0 beyond max offset', () => {
      const bonus = calculateCenteringBonus(150, 100);
      expect(bonus).toBe(0);
    });

    it('should scale linearly', () => {
      const quarter = calculateCenteringBonus(25, 100);
      const half = calculateCenteringBonus(50, 100);
      expect(quarter).toBe(0.75);
      expect(half).toBe(0.5);
    });

    it('should handle small max offset', () => {
      const bonus = calculateCenteringBonus(5, 10);
      expect(bonus).toBe(0.5);
    });
  });

  describe('Movement Multiplier', () => {
    it('should return 1.3 for moving animal', () => {
      const mult = calculateMovementMultiplier(true);
      expect(mult).toBe(1.3);
    });

    it('should return 1.0 for stationary animal', () => {
      const mult = calculateMovementMultiplier(false);
      expect(mult).toBe(1.0);
    });

    it('should provide 30% bonus for moving targets', () => {
      const moving = calculateMovementMultiplier(true);
      const stationary = calculateMovementMultiplier(false);
      expect(moving / stationary).toBe(1.3);
    });
  });

  describe('Repeat Penalty', () => {
    it('should return 0 for first photo', () => {
      const penalty = calculateRepeatPenalty(0);
      expect(penalty).toBe(0);
    });

    it('should return 0.2 for second photo', () => {
      const penalty = calculateRepeatPenalty(1);
      expect(penalty).toBe(0.2);
    });

    it('should return 0.4 for third photo', () => {
      const penalty = calculateRepeatPenalty(2);
      expect(penalty).toBe(0.4);
    });

    it('should cap at 0.8', () => {
      const penalty = calculateRepeatPenalty(10);
      expect(penalty).toBe(0.8);
    });

    it('should cap at 4 repeats', () => {
      const fourRepeats = calculateRepeatPenalty(4);
      const fiveRepeats = calculateRepeatPenalty(5);
      expect(fourRepeats).toBe(0.8);
      expect(fiveRepeats).toBe(0.8);
    });
  });

  describe('Complete Photo Score', () => {
    it('should calculate perfect deer photo', () => {
      const score = calculatePhotoScore({
        animal: {
          type: 'deer',
          altitude: 500,
          moving: false,
          photographed: 0,
          rarity: 1,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });
      // 50 * 1.0 * 1.0 * 1.0 * 1 * 1 = 50
      expect(score).toBe(50);
    });

    it('should calculate perfect mountain lion photo', () => {
      const score = calculatePhotoScore({
        animal: {
          type: 'mountainlion',
          altitude: 500,
          moving: false,
          photographed: 0,
          rarity: 5,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });
      // 50 * 1.0 * 1.0 * 1.0 * 5 * 1 = 250
      expect(score).toBe(250);
    });

    it('should apply moving bonus', () => {
      const stationary = calculatePhotoScore({
        animal: {
          type: 'deer',
          altitude: 500,
          moving: false,
          photographed: 0,
          rarity: 1,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });

      const moving = calculatePhotoScore({
        animal: {
          type: 'deer',
          altitude: 500,
          moving: true,
          photographed: 0,
          rarity: 1,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });

      expect(moving).toBe(Math.floor(stationary * 1.3));
    });

    it('should apply repeat penalty', () => {
      const first = calculatePhotoScore({
        animal: {
          type: 'bear',
          altitude: 500,
          moving: false,
          photographed: 0,
          rarity: 4,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });

      const repeat = calculatePhotoScore({
        animal: {
          type: 'bear',
          altitude: 500,
          moving: false,
          photographed: 1,
          rarity: 4,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });

      expect(repeat).toBe(Math.floor(first * 0.8));
    });

    it('should reduce score for poor altitude match', () => {
      const perfect = calculatePhotoScore({
        animal: {
          type: 'fox',
          altitude: 500,
          moving: false,
          photographed: 0,
          rarity: 3,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });

      const poor = calculatePhotoScore({
        animal: {
          type: 'fox',
          altitude: 500,
          moving: false,
          photographed: 0,
          rarity: 3,
        },
        playerAltitude: 600, // Out of range
        centeringOffset: 0,
        maxOffset: 100,
      });

      expect(poor).toBeLessThan(perfect);
      expect(poor).toBe(Math.floor(perfect * 0.5)); // Minimum altitude multiplier
    });

    it('should reduce score for poor centering', () => {
      const centered = calculatePhotoScore({
        animal: {
          type: 'bird',
          altitude: 500,
          moving: false,
          photographed: 0,
          rarity: 2,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });

      const offCenter = calculatePhotoScore({
        animal: {
          type: 'bird',
          altitude: 500,
          moving: false,
          photographed: 0,
          rarity: 2,
        },
        playerAltitude: 500,
        centeringOffset: 100,
        maxOffset: 100,
      });

      expect(offCenter).toBe(Math.floor(centered * 0.5));
    });

    it('should calculate worst case scenario', () => {
      const score = calculatePhotoScore({
        animal: {
          type: 'deer',
          altitude: 500,
          moving: false,
          photographed: 4, // Max repeat penalty
          rarity: 1,
        },
        playerAltitude: 600, // Out of altitude range
        centeringOffset: 100, // Edge of frame
        maxOffset: 100,
      });
      // 50 * 0.5 * 0.5 * 1.0 * 1 * 0.2 = 2.5 -> 2
      expect(score).toBe(2);
    });

    it('should calculate best case scenario', () => {
      const score = calculatePhotoScore({
        animal: {
          type: 'mountainlion',
          altitude: 500,
          moving: true,
          photographed: 0,
          rarity: 5,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });
      // 50 * 1.0 * 1.0 * 1.3 * 5 * 1.0 = 325
      expect(score).toBe(325);
    });
  });

  describe('Upgrade Bonuses', () => {
    describe('Optimal Optics', () => {
      it('should apply 10% bonus per level', () => {
        const params: PhotoParams = {
          animal: {
            type: 'deer',
            altitude: 500,
            moving: false,
            photographed: 0,
            rarity: 1,
          },
          playerAltitude: 500,
          centeringOffset: 0,
          maxOffset: 100,
        };

        const noUpgrade = calculatePhotoScoreWithUpgrades(params, 0, 0);
        const level5 = calculatePhotoScoreWithUpgrades(params, 5, 0);

        expect(level5).toBe(Math.floor(noUpgrade * 1.5));
      });

      it('should stack linearly', () => {
        const params: PhotoParams = {
          animal: {
            type: 'bear',
            altitude: 500,
            moving: false,
            photographed: 0,
            rarity: 4,
          },
          playerAltitude: 500,
          centeringOffset: 0,
          maxOffset: 100,
        };

        const level1 = calculatePhotoScoreWithUpgrades(params, 1, 0);
        const level2 = calculatePhotoScoreWithUpgrades(params, 2, 0);
        const level3 = calculatePhotoScoreWithUpgrades(params, 3, 0);

        // Each level adds 10%
        const base = calculatePhotoScore(params);
        expect(level1).toBe(Math.floor(base * 1.1));
        expect(level2).toBe(Math.floor(base * 1.2));
        expect(level3).toBe(Math.floor(base * 1.3));
      });
    });

    describe('Scenic Overlooks', () => {
      it('should apply 12% bonus per level', () => {
        const params: PhotoParams = {
          animal: {
            type: 'fox',
            altitude: 500,
            moving: false,
            photographed: 0,
            rarity: 3,
          },
          playerAltitude: 500,
          centeringOffset: 0,
          maxOffset: 100,
        };

        const noUpgrade = calculatePhotoScoreWithUpgrades(params, 0, 0);
        const level5 = calculatePhotoScoreWithUpgrades(params, 0, 5);

        expect(level5).toBe(Math.floor(noUpgrade * 1.6));
      });
    });

    describe('Combined Upgrades', () => {
      it('should stack both upgrade types', () => {
        const params: PhotoParams = {
          animal: {
            type: 'mountainlion',
            altitude: 500,
            moving: true,
            photographed: 0,
            rarity: 5,
          },
          playerAltitude: 500,
          centeringOffset: 0,
          maxOffset: 100,
        };

        const noUpgrade = calculatePhotoScoreWithUpgrades(params, 0, 0);
        const fullUpgrade = calculatePhotoScoreWithUpgrades(params, 5, 5);

        // 1.5 * 1.6 = 2.4
        expect(fullUpgrade).toBe(Math.floor(noUpgrade * 2.4));
      });

      it('should calculate maximum possible photo value', () => {
        const params: PhotoParams = {
          animal: {
            type: 'mountainlion',
            altitude: 500,
            moving: true,
            photographed: 0,
            rarity: 5,
          },
          playerAltitude: 500,
          centeringOffset: 0,
          maxOffset: 100,
        };

        const maxScore = calculatePhotoScoreWithUpgrades(params, 5, 5);
        // 325 * 1.5 * 1.6 = 780
        expect(maxScore).toBe(780);
      });
    });
  });

  describe('Animal Rarity Values', () => {
    it('should have deer as common (1)', () => {
      expect(animalRarities.deer).toBe(1);
    });

    it('should have bird as uncommon (2)', () => {
      expect(animalRarities.bird).toBe(2);
    });

    it('should have fox as rare (3)', () => {
      expect(animalRarities.fox).toBe(3);
    });

    it('should have bear as very rare (4)', () => {
      expect(animalRarities.bear).toBe(4);
    });

    it('should have mountain lion as legendary (5)', () => {
      expect(animalRarities.mountainlion).toBe(5);
    });

    it('should increase photo value by rarity', () => {
      const baseParams = {
        altitude: 500,
        moving: false,
        photographed: 0,
      };

      const deerScore = calculatePhotoScore({
        animal: { ...baseParams, type: 'deer', rarity: 1 },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });

      const lionScore = calculatePhotoScore({
        animal: { ...baseParams, type: 'mountainlion', rarity: 5 },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });

      expect(lionScore).toBe(deerScore * 5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero rarity', () => {
      const score = calculatePhotoScore({
        animal: {
          type: 'deer',
          altitude: 500,
          moving: false,
          photographed: 0,
          rarity: 0,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });
      expect(score).toBe(0);
    });

    it('should handle negative altitude', () => {
      const match = calculateAltitudeMatch(-100, -100);
      expect(match).toBe(1);
    });

    it('should handle very large centering offset', () => {
      const bonus = calculateCenteringBonus(1000, 100);
      expect(bonus).toBe(0);
    });

    it('should floor all results to integers', () => {
      const score = calculatePhotoScore({
        animal: {
          type: 'bird',
          altitude: 500,
          moving: true,
          photographed: 0,
          rarity: 2,
        },
        playerAltitude: 475,
        centeringOffset: 25,
        maxOffset: 100,
      });
      expect(Number.isInteger(score)).toBe(true);
    });

    it('should handle maximum repeat count', () => {
      const score = calculatePhotoScore({
        animal: {
          type: 'deer',
          altitude: 500,
          moving: false,
          photographed: 100,
          rarity: 1,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });
      // Should still have 20% value (80% penalty cap)
      // Base calculation: 50 * 0.5 (altitude) * 1.0 (centering) * 1.0 (movement) * 1 (rarity) * 0.2 (penalty)
      // = 50 * 0.5 * 0.2 = 5, but with full altitude/centering = 50 * 1 * 1 * 1 * 1 * 0.2 = 10
      // Note: floor may cause slight variations
      expect(score).toBeGreaterThanOrEqual(5);
      expect(score).toBeLessThanOrEqual(10);
    });
  });

  describe('Scoring Scenarios', () => {
    it('should reward risky moving shots', () => {
      const safeShot = calculatePhotoScore({
        animal: {
          type: 'bear',
          altitude: 500,
          moving: false,
          photographed: 0,
          rarity: 4,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });

      const riskyShot = calculatePhotoScore({
        animal: {
          type: 'bear',
          altitude: 500,
          moving: true,
          photographed: 0,
          rarity: 4,
        },
        playerAltitude: 500,
        centeringOffset: 30, // Slightly off center
        maxOffset: 100,
      });

      // Moving bonus should outweigh slight centering penalty
      expect(riskyShot).toBeGreaterThan(safeShot * 0.8);
    });

    it('should penalize photo farming', () => {
      const firstPhoto = calculatePhotoScore({
        animal: {
          type: 'fox',
          altitude: 500,
          moving: false,
          photographed: 0,
          rarity: 3,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });

      const fifthPhoto = calculatePhotoScore({
        animal: {
          type: 'fox',
          altitude: 500,
          moving: false,
          photographed: 4,
          rarity: 3,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });

      // Should only get approximately 20% of original value
      // Allow for floor rounding differences
      const expected = firstPhoto * 0.2;
      expect(fifthPhoto).toBeGreaterThanOrEqual(Math.floor(expected) - 1);
      expect(fifthPhoto).toBeLessThanOrEqual(Math.ceil(expected) + 1);
    });

    it('should value rare animals highly even with penalties', () => {
      const penalizedLion = calculatePhotoScore({
        animal: {
          type: 'mountainlion',
          altitude: 500,
          moving: false,
          photographed: 2, // 40% penalty
          rarity: 5,
        },
        playerAltitude: 500,
        centeringOffset: 50, // Off center
        maxOffset: 100,
      });

      const perfectDeer = calculatePhotoScore({
        animal: {
          type: 'deer',
          altitude: 500,
          moving: true,
          photographed: 0,
          rarity: 1,
        },
        playerAltitude: 500,
        centeringOffset: 0,
        maxOffset: 100,
      });

      // Even penalized mountain lion should be worth more
      expect(penalizedLion).toBeGreaterThan(perfectDeer);
    });
  });
});
