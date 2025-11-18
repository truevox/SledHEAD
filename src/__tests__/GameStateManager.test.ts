import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager } from '../utils/GameStateManager';

describe('GameStateManager', () => {
  let gsm: GameStateManager;

  beforeEach(() => {
    gsm = GameStateManager.getInstance();
    gsm.resetState();
  });

  describe('Money Management', () => {
    it('should start with default money', () => {
      expect(gsm.getMoney()).toBe(200);
    });

    it('should add money correctly', () => {
      gsm.addMoney(100);
      expect(gsm.getMoney()).toBe(300);
    });

    it('should spend money if player has enough', () => {
      const result = gsm.spendMoney(100);
      expect(result).toBe(true);
      expect(gsm.getMoney()).toBe(100);
    });

    it('should not spend money if player does not have enough', () => {
      const result = gsm.spendMoney(300);
      expect(result).toBe(false);
      expect(gsm.getMoney()).toBe(200);
    });
  });

  describe('Loan Management', () => {
    it('should start with default loan', () => {
      expect(gsm.getLoan()).toBe(100000);
    });

    it('should pay off loan correctly', () => {
      gsm.payLoan(1000);
      expect(gsm.getLoan()).toBe(99000);
    });

    it('should not go below zero', () => {
      gsm.payLoan(150000);
      expect(gsm.getLoan()).toBe(0);
    });
  });

  describe('Stamina Management', () => {
    it('should start with max stamina', () => {
      expect(gsm.getStamina()).toBe(100);
    });

    it('should drain stamina', () => {
      gsm.drainStamina(30);
      expect(gsm.getStamina()).toBe(70);
    });

    it('should restore stamina', () => {
      gsm.drainStamina(50);
      gsm.restoreStamina(20);
      expect(gsm.getStamina()).toBe(70);
    });

    it('should not exceed max stamina', () => {
      gsm.restoreStamina(200);
      expect(gsm.getStamina()).toBe(100);
    });

    it('should not go below zero', () => {
      gsm.drainStamina(150);
      expect(gsm.getStamina()).toBe(0);
    });
  });

  describe('Upgrades', () => {
    it('should start with zero upgrades', () => {
      expect(gsm.getUpgrade('personal', 'rocketSurgery')).toBe(0);
    });

    it('should upgrade correctly', () => {
      gsm.upgradeItem('personal', 'rocketSurgery');
      expect(gsm.getUpgrade('personal', 'rocketSurgery')).toBe(1);
    });

    it('should not exceed max level', () => {
      for (let i = 0; i < 10; i++) {
        gsm.upgradeItem('personal', 'rocketSurgery');
      }
      expect(gsm.getUpgrade('personal', 'rocketSurgery')).toBe(5);
    });
  });

  describe('Stats', () => {
    it('should increment stats correctly', () => {
      gsm.incrementStat('totalRuns', 1);
      gsm.incrementStat('totalTricks', 5);
      const stats = gsm.getStats();
      expect(stats.totalRuns).toBe(1);
      expect(stats.totalTricks).toBe(5);
    });
  });
});
