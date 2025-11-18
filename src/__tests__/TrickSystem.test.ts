import { describe, it, expect, beforeEach } from 'vitest';
import { TrickSystem } from '../systems/TrickSystem';
import Phaser from 'phaser';

// Mock scene
class MockScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MockScene' });
  }
}

describe('TrickSystem', () => {
  let trickSystem: TrickSystem;
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    // Create minimal Phaser game instance for testing
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.HEADLESS,
      scene: MockScene,
    };
    const game = new Phaser.Game(config);
    mockScene = game.scene.scenes[0];
    trickSystem = new TrickSystem(mockScene);
  });

  it('should detect Parachute trick (UP, DOWN)', () => {
    trickSystem.handleInput('UP');
    const result = trickSystem.handleInput('DOWN');

    expect(result.trickDetected).toBe(true);
    expect(result.trickName).toBe('Parachute');
  });

  it('should detect Helicopter Spin Left (LEFT, LEFT)', () => {
    trickSystem.handleInput('LEFT');
    const result = trickSystem.handleInput('LEFT');

    expect(result.trickDetected).toBe(true);
    expect(result.trickName).toBe('Helicopter Spin Left');
  });

  it('should not detect trick with invalid sequence', () => {
    trickSystem.handleInput('UP');
    const result = trickSystem.handleInput('LEFT');

    expect(result.trickDetected).toBe(false);
  });

  it('should build combo on consecutive tricks', () => {
    trickSystem.handleInput('UP');
    trickSystem.handleInput('DOWN');
    trickSystem.completeTrick(true);

    trickSystem.handleInput('LEFT');
    const result = trickSystem.handleInput('LEFT');

    expect(result.comboMultiplier).toBeGreaterThan(1);
  });

  it('should reset combo on failed landing', () => {
    trickSystem.handleInput('UP');
    trickSystem.handleInput('DOWN');
    trickSystem.completeTrick(true);

    trickSystem.completeTrick(false);

    trickSystem.handleInput('LEFT');
    const result = trickSystem.handleInput('LEFT');

    expect(result.comboMultiplier).toBe(1);
  });

  it('should calculate trick value with combo', () => {
    // First trick
    trickSystem.handleInput('UP');
    trickSystem.handleInput('DOWN');
    trickSystem.completeTrick(true);

    // Second trick with combo
    trickSystem.handleInput('LEFT');
    const result = trickSystem.handleInput('LEFT');

    const baseValue = 60; // Helicopter Spin value
    const expectedValue = baseValue * result.comboMultiplier;

    expect(result.value).toBeGreaterThanOrEqual(baseValue);
    expect(result.value).toBe(Math.floor(expectedValue));
  });

  it('should reset input queue after timeout', (done) => {
    trickSystem.handleInput('UP');

    setTimeout(() => {
      const result = trickSystem.handleInput('DOWN');
      // Input should have been cleared, so no trick detected
      expect(result.trickDetected).toBe(false);
      done();
    }, 1500); // After the timeout
  }, 2000);
});
