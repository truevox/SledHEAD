/* uphill.js - Uphill Mechanics & Photo Hunting */
import { player } from './player.js';
import { keysDown } from './input.js';
import { TWEAK } from './settings.js';
import { spawnAnimal, updateAnimal } from './wildlife.js';
import { playerUpgrades } from './upgrades.js';
import { canvas } from './render.js';

// Update function for uphill mode
function updateUphill(deltaTime) {
  // Update movement based on keyboard input
  let speed = TWEAK.baseUpSpeed + (playerUpgrades.fancierFootwear * TWEAK.fancierFootwearUpSpeedPerLevel);
  
  if (keysDown["w"]) {
    player.absY -= speed;
  }
  if (keysDown["s"]) {
    player.absY += speed;
  }
  if (keysDown["a"]) {
    player.x -= speed;
  }
  if (keysDown["d"]) {
    player.x += speed;
  }
  
  // Constrain player to canvas boundaries
  player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
  
  // Handle camera angle rotation
  if (keysDown["ArrowLeft"]) {
    player.cameraAngle = (player.cameraAngle - 2 + 360) % 360;
  }
  if (keysDown["ArrowRight"]) {
    player.cameraAngle = (player.cameraAngle + 2) % 360;
  }
  
  // Handle altitude line adjustment
  if (keysDown["ArrowUp"]) {
    player.altitudeLine = Math.max(0, player.altitudeLine - 1);
  }
  if (keysDown["ArrowDown"]) {
    player.altitudeLine = Math.min(100, player.altitudeLine + 1);
  }
  
  // Handle animal spawning and updates
  const shouldSpawnAnimal = Math.random() < 0.001; // 0.1% chance per frame
  if (shouldSpawnAnimal) {
    spawnAnimal();
  }
  
  // Update existing animal (if any)
  updateAnimal();
}

export { updateUphill };