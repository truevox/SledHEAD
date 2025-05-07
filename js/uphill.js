/* uphill.js - Uphill Movement & Camera Control */

// Use window.getUpgradeEffect for upgrade scaling (see upgradeLogic.js)
// Handle all uphill movement, camera controls, and related mechanics
function updateUphill(deltaTime) {
  // Use soft cap/infinite scaling for fancierFootwear
  let upSpeed = TWEAK.baseUpSpeed * window.getUpgradeEffect('fancierFootwear', playerUpgrades.fancierFootwear);
  
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
  // --- UPHILL HORIZONTAL MOVEMENT: NO GLIDE, NO INERTIA ---
  // Only move left/right if A or D is actively held. No velocity is ever applied in UPHILL.
  // This ensures instant stop on key release and zero inertia, per SledHEAD rules.
  let newXUphill = player.x;
  if (keysDown["a"]) { newXUphill -= upSpeed; }
  if (keysDown["d"]) { newXUphill += upSpeed; }
  else if (!keysDown["a"]) { /* No key held: do not move */ }
  // No else: player.x remains unchanged if neither key is held

  // Use wrapping instead of clamping for cylindrical world
  player.x = calculateWrappedX(newXUphill, currentLayer.width);

  // Only clamp if player actually exceeds the mountain bounds
  if (player.absY < 0) player.absY = 0;
  // At the bottom, only clamp if we're transitioning to the house
  if (player.absY > mountainHeight) player.absY = mountainHeight;

  // Camera and altitude control
  if (keysDown["ArrowLeft"]) { player.cameraAngle -= 2; }
  if (keysDown["ArrowRight"]) { player.cameraAngle += 2; }
  if (keysDown["ArrowUp"]) { player.altitudeLine = Math.max(0, player.altitudeLine - 2); }
  if (keysDown["ArrowDown"]) { player.altitudeLine = Math.min(100, player.altitudeLine + 2); }
  
  // Normalize camera angle
  if (player.cameraAngle < 0) player.cameraAngle += 360;
  if (player.cameraAngle >= 360) player.cameraAngle -= 360;
  
  // Kill ALL velocity during UPHILL: velocity is ONLY for DOWNHILL
  // This prevents inertia, sliding, or any leftover motion from affecting uphill movement
  if ('velocityX' in player) player.velocityX = 0;
  if ('velocityY' in player) player.velocityY = 0;
  if ('xVel' in player) player.xVel = 0;
  if ('yVel' in player) player.yVel = 0;
  
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
      // After any collision adjustment, forcibly zero all velocity in UPHILL
      if ('velocityX' in player) player.velocityX = 0;
      if ('velocityY' in player) player.velocityY = 0;
      if ('xVel' in player) player.xVel = 0;
      if ('yVel' in player) player.yVel = 0;
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
    logGame(`[DEBUG] player.absY clamped to ${player.absY} at absolute bottom in updateUphill`);
    console.log("Reached bottom. Returning to house.");
    changeState(GameState.HOUSE);
  }

  // WHY: Extra safety—force xVel to zero every frame in UPHILL to guarantee no glide/inertia
  if ('xVel' in player) player.xVel = 0;
}