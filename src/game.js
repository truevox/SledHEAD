// Import all scenes
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { HouseScene } from './scenes/HouseScene.js';
import { DownhillScene } from './scenes/DownhillScene.js';
import { UphillScene } from './scenes/UphillScene.js';
import { UIScene } from './scenes/UIScene.js';

// Global configuration for tweaking game values
export const TWEAK = {
    tweakNob: 1,
    // Animal spawning and movement
    minSpawnTime: 5000,
    maxSpawnTime: 10000,
    minIdleTime: 1000,
    maxIdleTime: 20000,
    minMoveSpeed: 0.3,
    maxMoveSpeed: 11.2,
    fleeAngle: 40,
    photoCooldown: 1000,
    repeatPhotoPenalty: 0.5,
    // Base physics values
    _sledMass: 1.0,
    _baseGravity: 0.2,
    _baseHorizontalAccel: 0.15,
    _baseFriction: 0.95,
    _baseMaxXVel: 3,
    // Upgrade effects
    _rocketSurgeryFactorPerLevel: 0.1,
    _opticalOpticsAccelFactorPerLevel: 0.02,
    _opticalOpticsFrictionFactorPerLevel: 0.005,
    starterCash: 200
};

// Main Phaser Game Configuration
export const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-screen',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [
        BootScene,
        MainMenuScene,
        HouseScene,
        DownhillScene,
        UphillScene,
        UIScene
    ]
};

// Global game state
export const GameState = {
    HOUSE: 'HouseScene',
    DOWNHILL: 'DownhillScene',
    UPHILL: 'UphillScene'
};

// Global events
export const Events = {
    MONEY_CHANGED: 'moneyChanged',
    STATE_CHANGED: 'stateChanged',
    TRICK_COMPLETED: 'trickCompleted',
    COLLISION: 'collision'
};