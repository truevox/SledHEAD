// src/game.js
import BootScene from './scenes/BootScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import HouseScene from './scenes/HouseScene.js';
import DownhillScene from './scenes/DownhillScene.js';
import UphillScene from './scenes/UphillScene.js';
import UIScene from './scenes/UIScene.js';
import { initUpgradeButtons } from './mechanics/UpgradeSystem.js';
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
  switch(newState) {
    case GameStates.HOUSE:
      currentScene = scenes.house;
      document.getElementById("upgrade-menu").style.display = "block";
      document.getElementById("game-screen").style.display = "none";
      break;
    case GameStates.DOWNHILL:
      currentScene = scenes.downhill;
      document.getElementById("upgrade-menu").style.display = "none";
      document.getElementById("game-screen").style.display = "block";
      break;
    case GameStates.UPHILL:
      currentScene = scenes.uphill;
      break;
    default:
      console.warn("Unknown state:", newState);
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

function gameLoop(timestamp) {
  if (currentScene && currentScene.update) {
    currentScene.update(timestamp);
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
  generateTerrain();
  changeState(GameStates.HOUSE);

  document.getElementById("startGame").addEventListener("click", () => {
    unlockAudioContext();
    changeState(GameStates.DOWNHILL);
  });

  requestAnimationFrame(gameLoop);
}

window.addEventListener("load", initGame);
export { GameStates };
