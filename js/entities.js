/* entities.js - Pruned version to avoid overlap with wildlifephotos.js */

// Resolves collisions between the player and obstacles.
function resolveCollision(player, obstacle) {
  // Get the correct layer width for this obstacle
  const layer = getLayerByY(obstacle.y);
  const layerWidth = layer.width;
  
  let playerCenterX = player.x;
  let playerCenterY = player.absY;
  let obstacleCenterX = obstacle.x + obstacle.width / 2;
  let obstacleCenterY = obstacle.y + obstacle.height / 2;
  
  // Calculate the minimum x-distance considering wrapping
  let dx = calculateWrappedDistanceX(playerCenterX, obstacleCenterX, layerWidth);
  let dy = playerCenterY - obstacleCenterY;
  
  let halfWidthPlayer = player.width / 2;
  let halfWidthObstacle = obstacle.width / 2;
  let halfHeightPlayer = player.height / 2;
  let halfHeightObstacle = obstacle.height / 2;
  
  // For wrapped collision detection, if dx is the wrapped distance, we need
  // to determine if the player is to the left or right of the obstacle
  // Positive dx means player is to the right of obstacle's center
  let isToRight = true;
  
  // Determine actual position relationship (for collision response)
  // If wrapped distance < direct distance, we're wrapping
  let directDx = playerCenterX - obstacleCenterX;
  if (Math.abs(directDx) > Math.abs(dx)) {
    // We're wrapping around
    // If player is to the right edge and obstacle to left edge, dx should be negative
    if (playerCenterX > obstacleCenterX) {
      isToRight = !(playerCenterX - obstacleCenterX > layerWidth / 2);
    } else {
      isToRight = (obstacleCenterX - playerCenterX > layerWidth / 2);
    }
  } else {
    isToRight = directDx > 0;
  }
  
  let overlapX = halfWidthPlayer + halfWidthObstacle - Math.abs(dx);
  let overlapY = halfHeightPlayer + halfHeightObstacle - Math.abs(dy);
  
  if (overlapX < 0 || overlapY < 0) return;
  
  if (overlapX < overlapY) {
    if (isToRight) {
      player.x += overlapX * 0.3;
      // Wrap if needed
      player.x = calculateWrappedX(player.x, layerWidth);
    } else {
      player.x -= overlapX * 0.3;
      // Wrap if needed
      player.x = calculateWrappedX(player.x, layerWidth);
    }
  } else {
    if (dy > 0) {
      player.absY += overlapY * 0.3;
    } else {
      player.absY -= overlapY * 0.3;
    }
  }
}

// Draws the camera overlay with the POV cone and a steady altitude line.
function drawCameraOverlay() {
  // Only display the overlay when in UPHILL mode.
  if (window.currentState !== window.GameState.UPHILL) return;

  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
  let centerX = player.x;
  let centerY = player.absY - cameraOffset;
  let coneLength = 300; // Length of the camera cone

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

  // Draw the altitude line.
  // Map altitudeLine [0,100] to an offset along the camera's central axis:
  // 0 aligns with the player sprite's bottom, 100 with its top.
  let offsetTop = ((coneLength / 2) + player.height);
  let offsetBottom = player.height / 2;
  let offset = mapRange(player.altitudeLine, 0, 100, offsetTop, offsetBottom);

  let rad = player.cameraAngle * Math.PI / 180;
  let lineCenterX = centerX + offset * Math.cos(rad);
  let lineCenterY = centerY + offset * Math.sin(rad);

  // Draw altitude line perpendicular to camera direction.
  let lineLength = 100;
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
  ctx.lineWidth = 3;

  // Draw the altitude line without any flashing.
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Draws the game entities such as the background, terrain, player, and sled.
function drawEntities() {
  // Get player's current layer
  const playerLayer = getLayerByY(player.absY);
  const layerWidth = playerLayer.width;
  
  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background.
  ctx.fillStyle = window.currentState === window.GameState.DOWNHILL ? "#ADD8E6" : "#98FB98";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw terrain obstacles, handling wrapping when needed
  terrain.forEach(obstacle => {
    // Check if obstacle is visible (vertically)
    if (obstacle.y >= cameraOffset - 50 && obstacle.y <= cameraOffset + canvas.height + 50) {
      // If obstacle and player are on the same layer, handle wrapping
      if (obstacle.layer === playerLayer.id) {
        // Get distance from player to obstacle (consider wrapping)
        const obstacleCenter = obstacle.x + obstacle.width / 2;
        const distanceX = calculateWrappedDistanceX(player.x, obstacleCenter, layerWidth);
        
        // Find the wrapped position of the obstacle relative to player
        let renderX = obstacle.x;
        
        // If obstacle is closer when wrapped, adjust its render position
        if (Math.abs(player.x - obstacleCenter) > Math.abs(distanceX)) {
          // If player is to the right and obstacle is to the left edge
          if (player.x > obstacleCenter && distanceX > 0) {
            renderX = obstacle.x + layerWidth;
          }
          // If player is to the left and obstacle is to the right edge
          else if (player.x < obstacleCenter && distanceX < 0) {
            renderX = obstacle.x - layerWidth;
          }
        }
        
        // Draw the obstacle
        if (obstacle.type === 'tree') {
          // Draw special tree shape if drawTree function exists
          if (typeof drawTree === 'function') {
            const treeObj = { ...obstacle, x: renderX };
            drawTree(ctx, { ...treeObj, y: treeObj.y - cameraOffset });
          } else {
            ctx.fillStyle = "#228B22"; // Green for trees
            ctx.fillRect(renderX, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
          }
        } else {
          // Default rock obstacle
          ctx.fillStyle = "#808080"; // Obstacles are drawn in grey.
          ctx.fillRect(renderX, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
        }
        
        // If the obstacle is near the edge, draw it again on the other side
        const canvasWidth = canvas.width;
        if (renderX + obstacle.width > layerWidth - canvasWidth/2) {
          // Draw duplicate on the left side
          if (obstacle.type === 'tree' && typeof drawTree === 'function') {
            const treeObj = { ...obstacle, x: renderX - layerWidth };
            drawTree(ctx, { ...treeObj, y: treeObj.y - cameraOffset });
          } else {
            ctx.fillStyle = obstacle.type === 'tree' ? "#228B22" : "#808080";
            ctx.fillRect(renderX - layerWidth, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
          }
        } else if (renderX < canvasWidth/2) {
          // Draw duplicate on the right side
          if (obstacle.type === 'tree' && typeof drawTree === 'function') {
            const treeObj = { ...obstacle, x: renderX + layerWidth };
            drawTree(ctx, { ...treeObj, y: treeObj.y - cameraOffset });
          } else {
            ctx.fillStyle = obstacle.type === 'tree' ? "#228B22" : "#808080";
            ctx.fillRect(renderX + layerWidth, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
          }
        }
      } else {
        // For obstacles on other layers, just draw them normally
        if (obstacle.type === 'tree' && typeof drawTree === 'function') {
          drawTree(ctx, { ...obstacle, y: obstacle.y - cameraOffset });
        } else {
          ctx.fillStyle = obstacle.type === 'tree' ? "#228B22" : "#808080";
          ctx.fillRect(obstacle.x, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
        }
      }
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