// Import resolution utilities
import { getResolution } from './resolution.js';

/* entities.js - Pruned version to avoid overlap with wildlifephotos.js */

// Resolves collisions between the player and obstacles.
function resolveCollision(player, obstacle, scale = 1) {
  // If obstacle has collision zones, handle each zone separately
  if (obstacle.collisionZones) {
    const resolution = getResolution();
    const zoneScale = scale || resolution.scale;
    
    for (const zone of obstacle.collisionZones) {
      if (zone.type === 'rect') {
        // Handle rectangular collision zone
        const zoneX = obstacle.x + zone.offsetX;
        const zoneY = obstacle.y + zone.offsetY;
        const zoneWidth = zone.width * zoneScale;
        const zoneHeight = zone.height * zoneScale;
        
        resolveRectCollision(player, {
          x: zoneX - zoneWidth / 2,
          y: zoneY - zoneHeight / 2,
          width: zoneWidth,
          height: zoneHeight
        }, zoneScale);
      } else if (zone.type === 'circle') {
        // Handle circular collision zone
        const zoneX = obstacle.x + zone.offsetX;
        const zoneY = obstacle.y + zone.offsetY;
        const zoneRadius = zone.radius * zoneScale;
        
        resolveCircularCollision(player, {
          x: zoneX,
          y: zoneY,
          radius: zoneRadius
        }, zoneScale);
      }
    }
    return;
  }
  
  // Legacy collision resolution for obstacles without collision zones
  let playerCenterX = player.x;
  let playerCenterY = player.absY;
  let obstacleCenterX = obstacle.x + obstacle.width / 2;
  let obstacleCenterY = obstacle.y + obstacle.height / 2;
  let halfWidthPlayer = (player.width * scale) / 2;
  let halfWidthObstacle = obstacle.width / 2;
  let halfHeightPlayer = (player.height * scale) / 2;
  let halfHeightObstacle = obstacle.height / 2;
  let dx = playerCenterX - obstacleCenterX;
  let dy = playerCenterY - obstacleCenterY;
  let overlapX = halfWidthPlayer + halfWidthObstacle - Math.abs(dx);
  let overlapY = halfHeightPlayer + halfHeightObstacle - Math.abs(dy);
  
  if (overlapX < 0 || overlapY < 0) return;
  
  if (overlapX < overlapY) {
    if (dx > 0) {
      player.x += overlapX * 0.3;
    } else {
      player.x -= overlapX * 0.3;
    }
  } else {
    if (dy > 0) {
      player.absY += overlapY * 0.3;
    } else {
      player.absY -= overlapY * 0.3;
    }
  }
}

// Helper function to resolve collision with rectangular obstacles
function resolveRectCollision(player, obstacle, scale = 1) {
  let playerCenterX = player.x;
  let playerCenterY = player.absY;
  let obstacleCenterX = obstacle.x + obstacle.width / 2;
  let obstacleCenterY = obstacle.y + obstacle.height / 2;
  let halfWidthPlayer = (player.width * scale) / 2;
  let halfWidthObstacle = obstacle.width / 2;
  let halfHeightPlayer = (player.height * scale) / 2;
  let halfHeightObstacle = obstacle.height / 2;
  let dx = playerCenterX - obstacleCenterX;
  let dy = playerCenterY - obstacleCenterY;
  let overlapX = halfWidthPlayer + halfWidthObstacle - Math.abs(dx);
  let overlapY = halfHeightPlayer + halfHeightObstacle - Math.abs(dy);
  
  if (overlapX < 0 || overlapY < 0) return;
  
  if (overlapX < overlapY) {
    if (dx > 0) {
      player.x += overlapX * 0.3;
    } else {
      player.x -= overlapX * 0.3;
    }
  } else {
    if (dy > 0) {
      player.absY += overlapY * 0.3;
    } else {
      player.absY -= overlapY * 0.3;
    }
  }
}

// Function to resolve collision with circular obstacles
function resolveCircularCollision(player, circle, scale = 1) {
  const dx = player.x - circle.x;
  const dy = player.absY - circle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const combinedRadius = (Math.max(player.width, player.height) * scale) / 2 + circle.radius;

  if (distance < combinedRadius) {
    // Collision detected, push the player away from the circle
    const overlap = combinedRadius - distance;
    
    // Avoid division by zero
    if (distance === 0) {
      // If centers are exactly the same, push in a random direction
      const angle = Math.random() * Math.PI * 2;
      player.x += Math.cos(angle) * overlap * 0.3;
      player.absY += Math.sin(angle) * overlap * 0.3;
    } else {
      // Normal case: push along collision normal
      const pushX = (dx / distance) * overlap * 0.3;
      const pushY = (dy / distance) * overlap * 0.3;
      player.x += pushX;
      player.absY += pushY;
    }
  }
}

// Add this line to export the resolveCollision function
export { resolveCollision };

// Draws the camera overlay with the POV cone and a steady altitude line.
function drawCameraOverlay() {
  const resolution = getResolution();
  const scale = resolution.scale;
  
  // Only display the overlay when in UPHILL mode.
  if (currentState !== GameState.UPHILL) return;

  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
  let centerX = player.x;
  let centerY = player.absY - cameraOffset;
  let coneLength = 300 * scale; // Scale cone length
  
  // Draw the camera POV Cone.
  let povAngle = TWEAK.basePOVAngle + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsPOVIncrease);
  let leftAngle = (player.cameraAngle - povAngle / 2) * (Math.PI / 180);
  let rightAngle = (player.cameraAngle + povAngle / 2) * (Math.PI / 180);

  ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + coneLength * Math.cos(leftAngle), centerY + coneLength * Math.sin(leftAngle));
  ctx.lineTo(centerX + coneLength * Math.cos(rightAngle), centerY + coneLength * Math.sin(rightAngle));
  ctx.closePath();
  ctx.fill();

  // Draw the altitude line with proper scaling
  let offsetTop = ((coneLength / 2) + player.height * scale);
  let offsetBottom = player.height * scale / 2;
  let offset = mapRange(player.altitudeLine, 0, 100, offsetTop, offsetBottom);

  let rad = player.cameraAngle * Math.PI / 180;
  let lineCenterX = centerX + offset * Math.cos(rad);
  let lineCenterY = centerY + offset * Math.sin(rad);
  let lineLength = 100 * scale;
  let perpX = -Math.sin(rad);
  let perpY = Math.cos(rad);
  let x1 = lineCenterX - (lineLength / 2) * perpX;
  let y1 = lineCenterY - (lineLength / 2) * perpY;
  let x2 = lineCenterX + (lineLength / 2) * perpX;
  let y2 = lineCenterY + (lineLength / 2) * perpY;

  // Steady color gradient from red (bottom) to blue (top)
  let t = 1 - (player.altitudeLine / 100);
  let altitudeColor = lerpColor("#FF0000", "#0000FF", t);
  ctx.strokeStyle = altitudeColor;
  ctx.lineWidth = 3 * scale;

/*
  // Check here if I have problems |||
  // Draw the altitude line without any flashing if no animal is in view
  if (activeAnimal && isAnimalInsideCone(activeAnimal)) {
    let flashSpeed = mapRange(Math.abs(player.altitudeLine - activeAnimal.altitude), 0, 100, 
        TWEAK.altitudeFlashMaxSpeed, TWEAK.altitudeFlashMinSpeed);
    if (Math.floor(Date.now() / flashSpeed) % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  } */
}

// Draws the game entities such as the background, terrain, player, and sled.
function drawEntities() {
  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background.
  ctx.fillStyle = currentState === GameState.DOWNHILL ? "#ADD8E6" : "#98FB98";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw terrain obstacles.
  terrain.forEach(obstacle => {
    if (obstacle.y >= cameraOffset - 50 && obstacle.y <= cameraOffset + canvas.height + 50) {
      ctx.fillStyle = "#808080"; // Obstacles are drawn in grey.
      ctx.fillRect(obstacle.x, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
    }
  });

  let playerDrawY = player.absY - cameraOffset;

  ctx.save(); // Save the current context state

  // Apply trick-specific transformations.
  if (player.currentTrick) {
    if (player.currentTrick === "leftHelicopter" || player.currentTrick === "rightHelicopter") {
      // Rotate around the player's center for helicopter tricks.
      ctx.translate(player.x, playerDrawY);
      ctx.rotate(player.trickRotation * Math.PI / 180);
      ctx.translate(-player.x, -playerDrawY);
    } else if (player.currentTrick === "airBrake" || player.currentTrick === "parachute") {
      // Offset for air brake/parachute tricks.
      if (player.currentTrick === "airBrake") {
        playerDrawY += player.trickOffset;  // Move sled behind the player.
      } else {
        playerDrawY -= player.trickOffset;  // Move player above the sled for parachute.
      }
    }
  }

  // Draw the sled (as a red square).
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(player.x - player.width / 2, playerDrawY - player.height / 2, player.width, player.height);

  // Draw the player (as a yellow circle) when applicable.
  if (player.currentTrick === "airBrake" || player.currentTrick === "parachute") {
    ctx.fillStyle = "#FFFF00";
    ctx.beginPath();
    ctx.arc(player.x, playerDrawY - player.trickOffset, player.width / 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // Restore the context state

  // Draw the camera overlay.
  drawCameraOverlay();
}