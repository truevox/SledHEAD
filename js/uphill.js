/* uphill.js - Uphill Movement & Camera Control */

// Handle all uphill movement, camera controls, and related mechanics
function updateUphill(deltaTime) {
  let upSpeed = TWEAK.baseUpSpeed + (playerUpgrades.fancierFootwear * TWEAK.fancierFootwearUpSpeedPerLevel);
  
  // Vertical movement
  if (keysDown["w"]) { player.absY -= upSpeed; }
  if (keysDown["s"]) { player.absY += upSpeed; }
  
  // Get the current layer based on player's Y position
  const currentLayer = getLayerByY(player.absY);
  
  // Update player's layer index
  if (window.updatePlayerLayer) {
    window.updatePlayerLayer();
  }
  
  // Horizontal movement with wrapping around cylinder
  let newXUphill = player.x;
  if (keysDown["a"]) { newXUphill -= upSpeed; }
  if (keysDown["d"]) { newXUphill += upSpeed; }
  
  // Use wrapping instead of clamping for cylindrical world
  player.x = calculateWrappedX(newXUphill, currentLayer.width);

  // Prevent going beyond mountain bounds vertically
  player.absY = clamp(player.absY, 0, mountainHeight);

  // Camera and altitude control
  if (keysDown["ArrowLeft"]) { player.cameraAngle -= 2; }
  if (keysDown["ArrowRight"]) { player.cameraAngle += 2; }
  if (keysDown["ArrowUp"]) { player.altitudeLine = Math.max(0, player.altitudeLine - 2); }
  if (keysDown["ArrowDown"]) { player.altitudeLine = Math.min(100, player.altitudeLine + 2); }
  
  // Normalize camera angle
  if (player.cameraAngle < 0) player.cameraAngle += 360;
  if (player.cameraAngle >= 360) player.cameraAngle -= 360;
  
  // Reset horizontal velocity in uphill mode
  player.xVel = 0;
  
  // Check for collisions with terrain
  terrain.forEach(obstacle => {
    // Get the layer for the obstacle
    const obstacleLayer = getLayerByY(obstacle.y);
    
    if (checkCollision(
        player.x - player.width / 2, player.absY - player.height / 2,
        player.width, player.height,
        obstacle.x, obstacle.y,
        obstacle.width, obstacle.height,
        obstacleLayer.width // Pass layer width for wrapped collision detection
    )) {
      console.log("Collision on uphill.");
      resolveCollision(player, obstacle);
    }
  });
  
  // Call animal update from wildlife.js
  updateAnimal();
  
  // Call update for all animals in the global array
  if (typeof window.updateAllAnimals === 'function') {
    window.updateAllAnimals();
  }
  
  // Return to house if player reaches bottom of mountain
  if (player.absY >= mountainHeight) {
    player.absY = mountainHeight;
    console.log("Reached bottom. Returning to house.");
    changeState(GameState.HOUSE);
  }
}