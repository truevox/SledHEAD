/* uphill.js - Uphill Mechanics & Photo Hunting */
import { getResolution } from './resolution.js';
import { checkCollision } from './collision.js';
import { resolveCollision } from './entities.js';
import { showErrorNotification } from './notifications.js';
import { updateStamina, playerStamina } from './stamina.js';  // Add this import
import { spawnAnimal, updateAnimal } from './wildlifephotos.js';
import { GameState, player, canvas, keysDown, TWEAK, playerUpgrades, terrain, mountainHeight, changeGameState } from './game.js';

// Function that updates the game state during the uphill phase.
function updateUphill(deltaTime) {
  const resolution = getResolution();
  const scale = resolution.scale;
  
  // Update player stamina
  updateStamina(deltaTime);
  
  // Apply stamina constraints to player movement
  if (!playerStamina.isActive) {
    // Rest or show notification to player
    if (Math.random() < 0.01) { // Occasional reminder
      showErrorNotification("Need to rest! Stamina depleted.", 1000);
    }
    return;
  }
  
  // Move player based on keyboard input with proper application of upgrades
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
  
  // Check for collisions with terrain
  terrain.forEach(obstacle => {
    if (obstacle.collisionZones) {
      // For trees with collision zones, we handle this differently
      const playerRect = {
        x: player.x - (player.width * scale) / 2,
        y: player.absY - (player.height * scale) / 2,
        width: player.width * scale,
        height: player.height * scale
      };
      
      // Check collision with each zone
      let collision = false;
      for (const zone of obstacle.collisionZones) {
        const zoneX = obstacle.x + zone.offsetX * scale;
        const zoneY = obstacle.y + zone.offsetY * scale;
        
        if (zone.type === 'rect') {
          // Rectangular zone collision
          const zoneWidth = zone.width * scale;
          const zoneHeight = zone.height * scale;
          
          if (checkCollision(
              playerRect.x, playerRect.y, playerRect.width, playerRect.height,
              zoneX - zoneWidth / 2, zoneY - zoneHeight / 2, zoneWidth, zoneHeight
          )) {
            collision = true;
            break;
          }
        } else if (zone.type === 'circle') {
          // Circular zone collision
          const radius = zone.radius * scale;
          const dx = player.x - zoneX;
          const dy = player.absY - zoneY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const playerRadius = Math.max(player.width, player.height) * scale / 2;
          
          if (distance < (radius + playerRadius)) {
            collision = true;
            break;
          }
        }
      }
      
      if (collision) {
        console.log(`Collision on uphill with ${obstacle.type}`);
        resolveCollision(player, obstacle, scale);
      }
    } else {
      // Standard collision check for other obstacles
      if (checkCollision(
          player.x - (player.width * scale) / 2, 
          player.absY - (player.height * scale) / 2,
          player.width * scale, 
          player.height * scale,
          obstacle.x, 
          obstacle.y,
          obstacle.width, 
          obstacle.height
      )) {
        console.log(`Collision on uphill with ${obstacle.type || 'obstacle'}`);
        resolveCollision(player, obstacle, scale);
      }
    }
  });
  
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
  
  // Check if player has reached the house/bottom of the mountain
  checkHouseTransition();
}

export { updateUphill };