// src/scenes/HouseScene.js
import { updateMoneyDisplay } from '../utils/UIUtils.js';
import { updateLoanButton } from '../mechanics/LoanSystem.js';

export default class HouseScene {
  constructor() {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🏠 SCENE: HouseScene initialized, entering upgrade shop`);
    this.initUI();
  }

  initUI() {
    const timestamp = new Date().toISOString();
    document.getElementById("upgrade-menu").style.display = "block";
    document.getElementById("game-screen").style.display = "none";
    updateMoneyDisplay();
    updateLoanButton(); // Update loan button state when entering house scene
    console.log(`[${timestamp}] 💻 SCENE: HouseScene UI initialized, upgrade menu displayed`);
  }

  update(timestamp) {
    // Update shop animations or interactions if needed
  }

  draw() {
    // Shop visuals may be HTML-based; no canvas drawing required here.
  }
}
