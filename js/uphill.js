/* uphill.js - Uphill Movement & Camera Control */

// Handle all uphill movement, camera controls, and related mechanics
function updateUphill(deltaTime) {
  let upSpeed = TWEAK.baseUpSpeed + (playerUpgrades.fancierFootwear * TWEAK.fancierFootwearUpSpeedPerLevel);
  
  // Uphill movement with strict bounds checking
  const horizontalPadding = player.width;
  let moveX = 0;
  let moveY = 0;
  
  if (keysDown["w"]) moveY -= upSpeed;
  if (keysDown["s"]) moveY += upSpeed;
  if (keysDown["a"]) moveX -= upSpeed;
  if (keysDown["d"]) moveX += upSpeed;
  
  // Apply diagonal movement normalization
  if (moveX !== 0 && moveY !== 0) {
    moveX *= 0.707; // 1/√2 to normalize diagonal movement
    moveY *= 0.707;
  }
  
  // Update position with bounds checking
  player.x = clamp(player.x + moveX, horizontalPadding, canvas.width - horizontalPadding);
  player.absY = clamp(player.absY + moveY, 0, mountainHeight);
  
  // Camera controls
  if (keysDown["ArrowLeft"]) player.cameraAngle = (player.cameraAngle - 2 + 360) % 360;
  if (keysDown["ArrowRight"]) player.cameraAngle = (player.cameraAngle + 2) % 360;
  if (keysDown["ArrowUp"]) player.altitudeLine = Math.max(0, player.altitudeLine - 2);
  if (keysDown["ArrowDown"]) player.altitudeLine = Math.min(100, player.altitudeLine + 2);
  
  // Reset horizontal velocity in uphill mode
  player.xVel = 0;
  
  // Check for collisions with terrain
  terrain.forEach(obstacle => {
    if (checkCollision(
        player.x - player.width / 2, player.absY - player.height / 2,
        player.width, player.height,
        obstacle.x, obstacle.y,
        obstacle.width, obstacle.height
    )) {
      console.log("Collision on uphill.");
      resolveCollision(player, obstacle);
    }
  });
  
  // Call animal update from wildlife.js
  updateAnimal();
  
  // Return to house if player reaches bottom of mountain
  if (player.absY >= mountainHeight) {
    player.absY = mountainHeight;
    console.log("Reached bottom. Returning to house.");
    changeState(GameState.HOUSE);
  }
}