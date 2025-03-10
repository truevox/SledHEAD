// src/game.js
import BootScene from './scenes/BootScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import HouseScene from './scenes/HouseScene.js';
import DownhillScene from './scenes/DownhillScene.js';
import UphillScene from './scenes/UphillScene.js';
import UIScene from './scenes/UIScene.js';
import { initUpgradeButtons } from './mechanics/UpgradeSystem.js';
import { initLoanSystem } from './mechanics/LoanSystem.js';
import { initPhotoSystem } from './mechanics/PhotoSystem.js';
import { generateTerrain } from './gameplay/Terrain.js';
import { unlockAudioContext } from './utils/UIUtils.js';

// Global game state management
const GameStates = {
  BOOT: 'BOOT',
  MAIN_MENU: 'MAIN_MENU',
  HOUSE: 'HOUSE',
  DOWNHILL: 'DOWNHILL',
  UPHILL: 'UPHILL'
};

let currentScene = null;
let scenes = {};

export function changeState(newState) {
  const logTime = new Date().toISOString();
  
  switch(newState) {
    case GameStates.HOUSE:
      currentScene = scenes.house;
      document.getElementById("upgrade-menu").style.display = "block";
      document.getElementById("game-screen").style.display = "none";
      console.log(`[${logTime}] 🏠 Scene transition: Entering HOUSE scene`);
      break;
    case GameStates.DOWNHILL:
      currentScene = scenes.downhill;
      document.getElementById("upgrade-menu").style.display = "none";
      document.getElementById("game-screen").style.display = "block";
      console.log(`[${logTime}] 🏂 Scene transition: Entering DOWNHILL scene`);
      break;
    case GameStates.UPHILL:
      currentScene = scenes.uphill;
      console.log(`[${logTime}] 🏔️ Scene transition: Entering UPHILL scene`);
      break;
    case GameStates.MAIN_MENU:
      currentScene = scenes.mainMenu;
      console.log(`[${logTime}] 📋 Scene transition: Entering MAIN_MENU scene`);
      break;
    case GameStates.BOOT:
      currentScene = scenes.boot;
      console.log(`[${logTime}] 🔄 Scene transition: Entering BOOT scene`);
      break;
    default:
      console.warn(`[${logTime}] ⚠️ Unknown state: ${newState}`);
  }
}

function initScenes() {
  scenes.boot = new BootScene();
  scenes.mainMenu = new MainMenuScene();
  scenes.house = new HouseScene();
  scenes.downhill = new DownhillScene();
  scenes.uphill = new UphillScene();
  scenes.ui = new UIScene();
}

// Track frame times for performance monitoring
let lastFrameTime = 0;
let frameCount = 0;
let lastPerformanceLog = 0;
const PERFORMANCE_LOG_INTERVAL = 10000; // Log every 10 seconds
const FRAME_TIME_THRESHOLD = 33; // ~30fps threshold (33ms per frame)

function gameLoop(timestamp) {
  // Calculate frame time and detect performance issues
  const frameTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  frameCount++;
  
  // Log performance issues if frame time exceeds threshold
  if (frameTime > FRAME_TIME_THRESHOLD) {
    const logTime = new Date().toISOString();
    console.log(`[${logTime}] ⚠️ PERFORMANCE: Slow frame detected, ${frameTime.toFixed(2)}ms (${(1000/frameTime).toFixed(1)} FPS), Scene=${currentScene ? currentScene.constructor.name : 'unknown'}`);
  }
  
  // Periodically log average performance
  if (timestamp - lastPerformanceLog > PERFORMANCE_LOG_INTERVAL) {
    const avgFPS = frameCount / ((timestamp - lastPerformanceLog) / 1000);
    const logTime = new Date().toISOString();
    console.log(`[${logTime}] 📊 PERFORMANCE: Average FPS=${avgFPS.toFixed(1)} over last ${(timestamp - lastPerformanceLog)/1000}s`);
    
    // Reset counters
    frameCount = 0;
    lastPerformanceLog = timestamp;
  }
  
  // Main game update and render
  if (currentScene && currentScene.update) {
    const updateStart = performance.now();
    currentScene.update(timestamp);
    const updateTime = performance.now() - updateStart;
    
    // Log unusually long updates
    if (updateTime > 16) { // 16ms = target for 60fps
      const logTime = new Date().toISOString();
      console.log(`[${logTime}] 🔄 PERFORMANCE: Slow update in ${currentScene.constructor.name}, took ${updateTime.toFixed(2)}ms`);
    }
  }
  
  if (currentScene && currentScene.draw) {
    currentScene.draw();
  }
  
  if (scenes.ui && scenes.ui.draw) {
    scenes.ui.draw(); // draw overlay UI
  }
  
  requestAnimationFrame(gameLoop);
}

function initGame() {
  initScenes();
  initUpgradeButtons();
  initLoanSystem();
  generateTerrain();
  
  // Initialize keyboard input handling
  window.keysDown = {};
  document.addEventListener('keydown', (e) => {
    window.keysDown[e.key] = true;
  });
  document.addEventListener('keyup', (e) => {
    window.keysDown[e.key] = false;
  });
  
  changeState(GameStates.HOUSE);

  document.getElementById("startGame").addEventListener("click", () => {
    unlockAudioContext();
    changeState(GameStates.DOWNHILL);
  });

  requestAnimationFrame(gameLoop);
}

window.addEventListener("load", initGame);
export { GameStates };