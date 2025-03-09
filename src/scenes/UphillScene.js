// src/scenes/UphillScene.js
import { player } from '../gameplay/Player.js';
import { updateAnimal } from '../gameplay/Wildlife.js';
import { drawEntities } from '../rendering/Renderer.js';
import { changeState, GameStates } from '../game.js';

export default class UphillScene {
  constructor() {
    console.log("UphillScene: Starting uphill climb.");
    player.xVel = 0;
  }

  update(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    let deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.updateUphillLogic(deltaTime);
  }

  updateUphillLogic(deltaTime) {
    if (window.keysDown) {
      if (window.keysDown["w"]) { player.absY -= 2; }
      if (window.keysDown["s"]) { player.absY += 2; }
      if (window.keysDown["a"]) { player.x -= 2; }
      if (window.keysDown["d"]) { player.x += 2; }
      if (window.keysDown["ArrowLeft"]) { player.cameraAngle -= 2; }
      if (window.keysDown["ArrowRight"]) { player.cameraAngle += 2; }
      if (window.keysDown["ArrowUp"]) { player.altitudeLine = Math.max(0, player.altitudeLine - 2); }
      if (window.keysDown["ArrowDown"]) { player.altitudeLine = Math.min(100, player.altitudeLine + 2); }
    }
    if (player.cameraAngle < 0) player.cameraAngle += 360;
    if (player.cameraAngle >= 360) player.cameraAngle -= 360;

    // Collision checks and wildlife updates would be performed here.
    updateAnimal();

    if (player.absY <= 0) {
      player.absY = 0;
      changeState(GameStates.HOUSE);
    }
  }

  draw() {
    drawEntities();
  }
}
