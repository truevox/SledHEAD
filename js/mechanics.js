/* mechanics.js - Gameplay Mechanics & Interactions */

// Update all gameplay state and physics – including jump/trick handling and collision updates.
function updateMechanics(deltaTime) {
    deltaTime *= 1;
    if (currentState === GameState.DOWNHILL) {
      // Call the refactored downhill function from downhill.js
      updateDownhill(deltaTime);
    } else if (currentState === GameState.UPHILL) {
      let upSpeed = TWEAK.baseUpSpeed + (playerUpgrades.fancierFootwear * TWEAK.fancierFootwearUpSpeedPerLevel);
      if (keysDown["w"]) { player.absY -= upSpeed; }
      if (keysDown["s"]) { player.absY += upSpeed; }
      
      // Add bounds checking for horizontal movement in UPHILL mode
      let newXUphill = player.x;
      if (keysDown["a"]) { newXUphill -= upSpeed; }
      if (keysDown["d"]) { newXUphill += upSpeed; }
      player.x = clamp(newXUphill, player.width/2, canvas.width - player.width/2);

      // Prevent going beyond mountain bounds vertically
      player.absY = clamp(player.absY, 0, mountainHeight);

      if (keysDown["ArrowLeft"]) { player.cameraAngle -= 2; }
      if (keysDown["ArrowRight"]) { player.cameraAngle += 2; }
      if (keysDown["ArrowUp"]) { player.altitudeLine = Math.max(0, player.altitudeLine - 2); }
      if (keysDown["ArrowDown"]) { player.altitudeLine = Math.min(100, player.altitudeLine + 2); }
      if (player.cameraAngle < 0) player.cameraAngle += 360;
      if (player.cameraAngle >= 360) player.cameraAngle -= 360;
      player.xVel = 0;
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
      // Call animal update from wildlifephotos.js
      updateAnimal();
      
      // Return to house if player reaches bottom of mountain
      if (player.absY >= mountainHeight) {
        player.absY = mountainHeight;
        console.log("Reached bottom. Returning to house.");
        changeState(GameState.HOUSE);
      }
    }
  }
  
  // Note: Jump-related functions moved to jumpsled.js
