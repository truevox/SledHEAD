// src/scenes/HouseScene.js
import { updateMoneyDisplay } from '../utils/UIUtils.js';

export default class HouseScene {
  constructor() {
    console.log("HouseScene: Entering upgrade shop.");
    this.initUI();
  }

  initUI() {
    document.getElementById("upgrade-menu").style.display = "block";
    document.getElementById("game-screen").style.display = "none";
    updateMoneyDisplay();
  }

  update(timestamp) {
    // Update shop animations or interactions if needed
  }

  draw() {
    // Shop visuals may be HTML-based; no canvas drawing required here.
  }
}
