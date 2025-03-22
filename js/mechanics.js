/* mechanics.js - Gameplay Mechanics & Interactions */

// Update all gameplay state and physics – including jump/trick handling and collision updates.
function updateMechanics(deltaTime) {
    deltaTime *= 1;
    if (currentState === GameState.DOWNHILL) {
      // Call the refactored downhill function from downhill.js
      updateDownhill(deltaTime);

      // Get physics variables
      const horizontalAccel = TWEAK.baseHorizontalAccel * (1 + playerUpgrades.rocketSurgery * TWEAK.rocketSurgeryFactorPerLevel);
      const maxXVel = TWEAK.baseMaxXVel * (1 + playerUpgrades.rocketSurgery * TWEAK.rocketSurgeryFactorPerLevel);
      const friction = TWEAK.baseFriction;

      // Horizontal movement handling with strict bounds checking
      if (keysDown["ArrowLeft"]) player.xVel -= horizontalAccel;
      if (keysDown["ArrowRight"]) player.xVel += horizontalAccel;
      player.xVel *= friction;
      player.xVel = clamp(player.xVel, -maxXVel, maxXVel);
      
      // Keep player within horizontal bounds with padding for visibility
      const horizontalPadding = player.width;
      let newX = player.x + player.xVel;
      player.x = clamp(newX, horizontalPadding, canvas.width - horizontalPadding);

    } else if (currentState === GameState.UPHILL) {
      // Call the refactored uphill function from uphill.js
      updateUphill(deltaTime);

      // Apply the same horizontal bounds for uphill movement
      const horizontalPadding = player.width;
      let newXUphill = player.x;
      const upSpeed = TWEAK.baseUpSpeed + (playerUpgrades.fancierFootwear * TWEAK.fancierFootwearUpSpeedPerLevel);
      if (keysDown["a"]) newXUphill -= upSpeed;
      if (keysDown["d"]) newXUphill += upSpeed;
      player.x = clamp(newXUphill, horizontalPadding, canvas.width - horizontalPadding);
    }
  }
  
  // Note: Jump-related functions moved to jumpsled.js
