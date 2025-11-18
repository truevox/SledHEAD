import { describe, it, expect } from 'vitest';
import { TRICKS } from '../types';

/**
 * Pure game logic calculations that can be tested without Phaser
 */

// Trick value calculation (from TrickSystem)
function calculateTrickEarnings(trickValue: number, comboMultiplier: number): number {
  return Math.floor(trickValue * comboMultiplier);
}

// Combo multiplier calculation (from TrickSystem)
function calculateComboMultiplier(comboCount: number, maxMultiplier: number = 5): number {
  if (comboCount <= 1) return 1;
  return Math.min(maxMultiplier, 1 + (comboCount * 0.5));
}

// Photo scoring formulas
function calculatePhotoScore(params: {
  baseValue: number;
  altitudeMatch: number; // 0-1
  centering: number; // 0-1
  movementBonus: number; // 0-1
  repeatPenalty: number; // 0-1
  rarity: number; // 1-5
}): number {
  const { baseValue, altitudeMatch, centering, movementBonus, repeatPenalty, rarity } = params;

  const altitudeMultiplier = 0.5 + (altitudeMatch * 0.5); // 0.5-1.0
  const centeringMultiplier = 0.5 + (centering * 0.5); // 0.5-1.0
  const movementMult = 1 + (movementBonus * 0.3); // 1.0-1.3
  const rarityMultiplier = rarity; // 1-5
  const penaltyMult = 1 - repeatPenalty; // 0-1

  return Math.floor(
    baseValue *
    altitudeMultiplier *
    centeringMultiplier *
    movementMult *
    rarityMultiplier *
    penaltyMult
  );
}

// Stamina drain calculation
function calculateStaminaDrain(
  baseAmount: number,
  sledWeight: number,
  weatherModifier: number,
  upgradeLevel: number
): number {
  const weightMultiplier = 1 + (sledWeight / 100); // heavier = more drain
  const weatherMult = weatherModifier;
  const upgradeReduction = 1 - (upgradeLevel * 0.1); // 10% reduction per level

  return baseAmount * weightMultiplier * weatherMult * upgradeReduction;
}

// Loan interest calculation
function calculateLoanInterest(
  principal: number,
  dailyRate: number = 0.001, // 0.1% daily
  days: number = 1
): number {
  return Math.floor(principal * dailyRate * days);
}

// NewGame+ bonus calculation
function calculateNGPBonus(
  baseValue: number,
  bonusPercentage: number
): number {
  return baseValue * (1 + bonusPercentage);
}

// NGP Level calculation
function calculateNGPLevel(bonuses: {
  speed: number;
  trickery: number;
  resilience: number;
  climb: number;
  charisma: number;
  rhythm: number;
}): number {
  const sum = bonuses.speed + bonuses.trickery + bonuses.resilience +
              bonuses.climb + bonuses.charisma + bonuses.rhythm;
  return Math.round(sum * 10);
}

describe('Game Logic Calculations', () => {
  describe('Trick Value Calculations', () => {
    it('should calculate basic trick earnings without multiplier', () => {
      const earnings = calculateTrickEarnings(50, 1);
      expect(earnings).toBe(50);
    });

    it('should apply combo multiplier correctly', () => {
      const earnings = calculateTrickEarnings(100, 2);
      expect(earnings).toBe(200);
    });

    it('should floor decimal results', () => {
      const earnings = calculateTrickEarnings(50, 1.5);
      expect(earnings).toBe(75);
    });

    it('should handle zero trick value', () => {
      const earnings = calculateTrickEarnings(0, 5);
      expect(earnings).toBe(0);
    });

    it('should handle max multiplier with high value trick', () => {
      // Orbit Spin (120) with max multiplier (5)
      const earnings = calculateTrickEarnings(120, 5);
      expect(earnings).toBe(600);
    });

    it('should calculate correctly for all tricks', () => {
      TRICKS.forEach(trick => {
        const earnings = calculateTrickEarnings(trick.value, 1);
        expect(earnings).toBe(trick.value);
      });
    });

    it('should handle decimal multipliers', () => {
      const earnings = calculateTrickEarnings(100, 2.5);
      expect(earnings).toBe(250);
    });
  });

  describe('Combo Multiplier Calculations', () => {
    it('should return 1 for first trick', () => {
      expect(calculateComboMultiplier(1)).toBe(1);
    });

    it('should return 1 for zero combo', () => {
      expect(calculateComboMultiplier(0)).toBe(1);
    });

    it('should increase by 0.5 per combo', () => {
      expect(calculateComboMultiplier(2)).toBe(2);
      expect(calculateComboMultiplier(3)).toBe(2.5);
      expect(calculateComboMultiplier(4)).toBe(3);
    });

    it('should cap at max multiplier', () => {
      expect(calculateComboMultiplier(10)).toBe(5);
      expect(calculateComboMultiplier(100)).toBe(5);
    });

    it('should use custom max multiplier', () => {
      expect(calculateComboMultiplier(10, 3)).toBe(3);
    });

    it('should calculate exact break point for max', () => {
      // At combo 8, multiplier = 1 + (8 * 0.5) = 5
      expect(calculateComboMultiplier(8)).toBe(5);
      // At combo 9, still capped at 5
      expect(calculateComboMultiplier(9)).toBe(5);
    });

    it('should handle negative combo count', () => {
      expect(calculateComboMultiplier(-1)).toBe(1);
    });
  });

  describe('Photo Scoring Formulas', () => {
    it('should calculate perfect photo score', () => {
      const score = calculatePhotoScore({
        baseValue: 100,
        altitudeMatch: 1,
        centering: 1,
        movementBonus: 1,
        repeatPenalty: 0,
        rarity: 1,
      });
      // 100 * 1.0 * 1.0 * 1.3 * 1 * 1 = 130
      expect(score).toBe(130);
    });

    it('should apply altitude match penalty for poor aim', () => {
      const score = calculatePhotoScore({
        baseValue: 100,
        altitudeMatch: 0,
        centering: 1,
        movementBonus: 0,
        repeatPenalty: 0,
        rarity: 1,
      });
      // 100 * 0.5 * 1.0 * 1.0 * 1 * 1 = 50
      expect(score).toBe(50);
    });

    it('should apply centering bonus', () => {
      const perfect = calculatePhotoScore({
        baseValue: 100,
        altitudeMatch: 1,
        centering: 1,
        movementBonus: 0,
        repeatPenalty: 0,
        rarity: 1,
      });

      const poor = calculatePhotoScore({
        baseValue: 100,
        altitudeMatch: 1,
        centering: 0,
        movementBonus: 0,
        repeatPenalty: 0,
        rarity: 1,
      });

      expect(perfect).toBeGreaterThan(poor);
    });

    it('should apply movement bonus', () => {
      const moving = calculatePhotoScore({
        baseValue: 100,
        altitudeMatch: 1,
        centering: 1,
        movementBonus: 1,
        repeatPenalty: 0,
        rarity: 1,
      });

      const still = calculatePhotoScore({
        baseValue: 100,
        altitudeMatch: 1,
        centering: 1,
        movementBonus: 0,
        repeatPenalty: 0,
        rarity: 1,
      });

      expect(moving).toBeGreaterThan(still);
      expect(moving / still).toBeCloseTo(1.3);
    });

    it('should apply repeat penalty', () => {
      const first = calculatePhotoScore({
        baseValue: 100,
        altitudeMatch: 1,
        centering: 1,
        movementBonus: 0,
        repeatPenalty: 0,
        rarity: 1,
      });

      const repeat = calculatePhotoScore({
        baseValue: 100,
        altitudeMatch: 1,
        centering: 1,
        movementBonus: 0,
        repeatPenalty: 0.5, // 50% penalty
        rarity: 1,
      });

      expect(repeat).toBe(Math.floor(first / 2));
    });

    it('should apply rarity multiplier', () => {
      const common = calculatePhotoScore({
        baseValue: 100,
        altitudeMatch: 1,
        centering: 1,
        movementBonus: 0,
        repeatPenalty: 0,
        rarity: 1,
      });

      const rare = calculatePhotoScore({
        baseValue: 100,
        altitudeMatch: 1,
        centering: 1,
        movementBonus: 0,
        repeatPenalty: 0,
        rarity: 5,
      });

      expect(rare).toBe(common * 5);
    });

    it('should return zero for 100% repeat penalty', () => {
      const score = calculatePhotoScore({
        baseValue: 100,
        altitudeMatch: 1,
        centering: 1,
        movementBonus: 1,
        repeatPenalty: 1, // 100% penalty
        rarity: 5,
      });
      expect(score).toBe(0);
    });

    it('should handle zero base value', () => {
      const score = calculatePhotoScore({
        baseValue: 0,
        altitudeMatch: 1,
        centering: 1,
        movementBonus: 1,
        repeatPenalty: 0,
        rarity: 5,
      });
      expect(score).toBe(0);
    });

    it('should calculate combined bonuses correctly', () => {
      const score = calculatePhotoScore({
        baseValue: 100,
        altitudeMatch: 0.8, // 0.5 + 0.4 = 0.9
        centering: 0.6, // 0.5 + 0.3 = 0.8
        movementBonus: 0.5, // 1 + 0.15 = 1.15
        repeatPenalty: 0.2, // 0.8
        rarity: 3,
      });

      // 100 * 0.9 * 0.8 * 1.15 * 3 * 0.8 = 198.72 -> 198
      expect(score).toBe(198);
    });
  });

  describe('Stamina Drain Calculations', () => {
    it('should calculate base stamina drain', () => {
      const drain = calculateStaminaDrain(10, 0, 1, 0);
      expect(drain).toBe(10);
    });

    it('should increase drain with sled weight', () => {
      const lightDrain = calculateStaminaDrain(10, 10, 1, 0);
      const heavyDrain = calculateStaminaDrain(10, 50, 1, 0);

      expect(heavyDrain).toBeGreaterThan(lightDrain);
    });

    it('should apply weather modifier', () => {
      const normalDrain = calculateStaminaDrain(10, 0, 1, 0);
      const stormDrain = calculateStaminaDrain(10, 0, 1.5, 0);

      expect(stormDrain).toBe(normalDrain * 1.5);
    });

    it('should reduce drain with upgrades', () => {
      const noUpgrade = calculateStaminaDrain(10, 0, 1, 0);
      const maxUpgrade = calculateStaminaDrain(10, 0, 1, 5);

      expect(maxUpgrade).toBe(noUpgrade * 0.5);
    });

    it('should handle combined modifiers', () => {
      const drain = calculateStaminaDrain(10, 50, 1.5, 3);
      // 10 * 1.5 * 1.5 * 0.7 = 15.75
      expect(drain).toBeCloseTo(15.75);
    });

    it('should return zero for zero base amount', () => {
      const drain = calculateStaminaDrain(0, 100, 2, 0);
      expect(drain).toBe(0);
    });

    it('should handle very heavy sleds', () => {
      const drain = calculateStaminaDrain(10, 200, 1, 0);
      // 10 * 3 * 1 * 1 = 30
      expect(drain).toBe(30);
    });
  });

  describe('Loan Interest Calculations', () => {
    it('should calculate daily interest', () => {
      const interest = calculateLoanInterest(100000);
      expect(interest).toBe(100); // 0.1% of 100000
    });

    it('should calculate interest over multiple days', () => {
      const interest = calculateLoanInterest(100000, 0.001, 7);
      expect(interest).toBe(700);
    });

    it('should return zero for zero principal', () => {
      const interest = calculateLoanInterest(0);
      expect(interest).toBe(0);
    });

    it('should handle custom interest rates', () => {
      const interest = calculateLoanInterest(100000, 0.01);
      expect(interest).toBe(1000);
    });

    it('should floor decimal results', () => {
      const interest = calculateLoanInterest(10001, 0.001);
      expect(interest).toBe(10);
    });

    it('should handle zero days', () => {
      const interest = calculateLoanInterest(100000, 0.001, 0);
      expect(interest).toBe(0);
    });

    it('should handle very high principals', () => {
      const interest = calculateLoanInterest(10000000, 0.001);
      expect(interest).toBe(10000);
    });

    it('should calculate monthly interest (30 days)', () => {
      const interest = calculateLoanInterest(100000, 0.001, 30);
      expect(interest).toBe(3000);
    });
  });

  describe('NewGame+ Bonus Calculations', () => {
    it('should apply speed bonus', () => {
      const baseSpeed = 100;
      const bonusedSpeed = calculateNGPBonus(baseSpeed, 0.1);
      expect(bonusedSpeed).toBeCloseTo(110);
    });

    it('should stack multiple bonuses', () => {
      const baseValue = 100;
      const fiveStacks = calculateNGPBonus(baseValue, 0.5);
      expect(fiveStacks).toBe(150);
    });

    it('should handle zero bonus', () => {
      const baseValue = 100;
      const noBonus = calculateNGPBonus(baseValue, 0);
      expect(noBonus).toBe(100);
    });

    it('should handle very high bonus percentages', () => {
      const baseValue = 100;
      const highBonus = calculateNGPBonus(baseValue, 1.0);
      expect(highBonus).toBe(200);
    });

    it('should handle zero base value', () => {
      const bonusedValue = calculateNGPBonus(0, 0.5);
      expect(bonusedValue).toBe(0);
    });

    it('should calculate charisma discount (negative bonus)', () => {
      const baseCost = 1000;
      const charismaMod = -0.1; // 10% discount
      const discountedCost = calculateNGPBonus(baseCost, charismaMod);
      expect(discountedCost).toBe(900);
    });
  });

  describe('NGP Level Calculations', () => {
    it('should return 0 for no bonuses', () => {
      const level = calculateNGPLevel({
        speed: 0, trickery: 0, resilience: 0,
        climb: 0, charisma: 0, rhythm: 0,
      });
      expect(level).toBe(0);
    });

    it('should return 1 for single 0.1 bonus', () => {
      const level = calculateNGPLevel({
        speed: 0.1, trickery: 0, resilience: 0,
        climb: 0, charisma: 0, rhythm: 0,
      });
      expect(level).toBe(1);
    });

    it('should sum all bonuses', () => {
      const level = calculateNGPLevel({
        speed: 0.1, trickery: 0.1, resilience: 0.1,
        climb: 0.1, charisma: 0.1, rhythm: 0.1,
      });
      expect(level).toBe(6);
    });

    it('should handle mixed bonus levels', () => {
      const level = calculateNGPLevel({
        speed: 0.3, trickery: 0.2, resilience: 0.1,
        climb: 0, charisma: 0.5, rhythm: 0,
      });
      expect(level).toBe(11);
    });

    it('should round to nearest integer', () => {
      const level = calculateNGPLevel({
        speed: 0.05, trickery: 0, resilience: 0,
        climb: 0, charisma: 0, rhythm: 0,
      });
      expect(level).toBe(1); // 0.5 rounds to 1
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative values gracefully', () => {
      expect(calculateTrickEarnings(-100, 2)).toBe(-200);
      expect(calculateComboMultiplier(-5)).toBe(1);
      expect(calculateStaminaDrain(-10, 0, 1, 0)).toBe(-10);
    });

    it('should handle very large numbers', () => {
      const earnings = calculateTrickEarnings(1000000, 5);
      expect(earnings).toBe(5000000);
    });

    it('should handle floating point precision', () => {
      const drain = calculateStaminaDrain(10.1, 10.1, 1.1, 3);
      expect(typeof drain).toBe('number');
      expect(isNaN(drain)).toBe(false);
    });

    it('should handle zero multipliers', () => {
      const earnings = calculateTrickEarnings(100, 0);
      expect(earnings).toBe(0);
    });
  });
});
