// src/rendering/Camera.js
export default class Camera {
    constructor(canvasHeight, mountainHeight) {
      this.canvasHeight = canvasHeight;
      this.mountainHeight = mountainHeight;
      this.offset = 0;
      this.zoom = 1;
    }
  
    update(playerAbsY) {
      // Simple camera offset: center the player vertically
      this.offset = playerAbsY - this.canvasHeight / 2;
      // Future zoom logic can be added here if needed
    }
  
    getOffset() {
      return this.offset;
    }
  }
  