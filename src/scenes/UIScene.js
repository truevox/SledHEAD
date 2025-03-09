// src/scenes/UIScene.js
import { updateMoneyDisplay } from '../utils/UIUtils.js';

export default class UIScene {
  constructor() {
    // Setup for overlay UI if needed.
  }

  update(timestamp) {
    // Update UI elements, animations, etc.
  }

  draw() {
    // Update the money display (and any other overlay UI elements)
    updateMoneyDisplay();
  }
}
