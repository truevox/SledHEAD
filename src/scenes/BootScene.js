// src/scenes/BootScene.js
export default class BootScene {
    constructor() {
      console.log("BootScene: Preloading assets...");
      this.preload();
    }
  
    preload() {
      // Preload assets (sprites, sounds, maps, etc.)
      console.log("Assets preloaded.");
    }
  
    update(timestamp) {
      // Transition logic if needed
    }
  
    draw() {
      // Optionally draw a loading screen
    }
  }
  