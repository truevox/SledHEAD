// src/rendering/Renderer.js
import { getCameraOffset, mapRange, lerpColor } from '../utils/MathUtils.js';
import { player } from '../gameplay/Player.js';
import { terrain } from '../gameplay/Terrain.js';
import { drawAnimal } from '../gameplay/Wildlife.js';
import { drawCameraOverlay } from './Effects.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let floatingTexts = [];

export function addCanvasFloatingText(text, x, y) {
  floatingTexts.push(new FloatingText(text, x, y));
}

class FloatingText {
  constructor(text, x, y) {
    this.text = text;
    this.x = x;
    this.initialY = y;
    this.age = 0;
    this.lifetime = 1000; // milliseconds
    this.visualOffsetY = -30;
  }
  update(deltaTime) {
    this.age += deltaTime;
    this.visualOffsetY -= deltaTime * 0.025;
    return this.age < this.lifetime;
  }
  draw(ctx, cameraOffset) {
    const alpha = 1 - (this.age / this.lifetime);
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    const screenY = this.initialY - cameraOffset + this.visualOffsetY;
    ctx.fillText(this.text, this.x, screenY);
  }
}

export function drawEntities() {
  let cameraOffset = getCameraOffset(player.absY, canvas.height, 1000);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = (window.currentState === 'DOWNHILL') ? "#ADD8E6" : "#98FB98";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  terrain.forEach(obstacle => {
    if (obstacle.y >= cameraOffset - 50 && obstacle.y <= cameraOffset + canvas.height + 50) {
      ctx.fillStyle = "#808080";
      ctx.fillRect(obstacle.x, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
    }
  });

  ctx.save();
  let playerDrawY = player.absY - cameraOffset;
  if (player.currentTrick) {
    if (player.currentTrick === "leftHelicopter" || player.currentTrick === "rightHelicopter") {
      ctx.translate(player.x, playerDrawY);
      ctx.rotate(player.trickRotation * Math.PI / 180);
      ctx.translate(-player.x, -playerDrawY);
    } else if (player.currentTrick === "airBrake" || player.currentTrick === "parachute") {
      if (player.currentTrick === "airBrake") {
        playerDrawY += player.trickOffset;
      } else {
        playerDrawY -= player.trickOffset;
      }
    }
  }
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(player.x - player.width / 2, playerDrawY - player.height / 2, player.width, player.height);
  if (player.currentTrick === "airBrake" || player.currentTrick === "parachute") {
    ctx.fillStyle = "#FFFF00";
    ctx.beginPath();
    ctx.arc(player.x, playerDrawY - player.trickOffset, player.width / 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  drawCameraOverlay(ctx, player, canvas, 1000);
  drawAnimal(ctx);

  // Draw floating texts on canvas
  floatingTexts = floatingTexts.filter(ft => {
    ft.update(16); // Using a fixed delta time (16ms); ideally, pass actual delta
    ft.draw(ctx, cameraOffset);
    return ft.age < ft.lifetime;
  });
}

export function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
