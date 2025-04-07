/* downhill.js - Downhill Mechanics & Physics */

import {
  processTrick,
  checkTrickInputs,
  resetTrickState
} from './tricks.js';



// Update all downhill-specific physics and mechanics
function updateDownhill(deltaTime) {
  let rocketFactor = 1 + (window.playerUpgrades.rocketSurgery * TWEAK.rocketSurgeryFactorPerLevel);
  let gravity = TWEAK.baseGravity * rocketFactor;
  let maxXVel = TWEAK.baseMaxXVel * (rocketFactor - (window.playerUpgrades.optimalOptics * TWEAK.optimalOpticsFrictionFactorPerLevel));
  maxXVel = Math.max(0, maxXVel);
  let opticsFactor = 1 + (window.playerUpgrades.optimalOptics * TWEAK.optimalOpticsAccelFactorPerLevel);
  let horizontalAccel = TWEAK.baseHorizontalAccel * opticsFactor;
  let friction = TWEAK.baseFriction - (window.playerUpgrades.optimalOptics * TWEAK.optimalOpticsFrictionFactorPerLevel);
  if (friction < 0.8) friction = 0.8;
  
  // Get the current layer based on player's Y position
  const currentLayer = getLayerByY(player.absY);
  
  // Update player's layer index
  if (window.updatePlayerLayer) {
    window.updatePlayerLayer();
  }
  
  // Horizontal movement handling with bounds checking
  if (window.keysDown["a"]) { player.xVel -= horizontalAccel; }
  if (window.keysDown["d"]) { player.xVel += horizontalAccel; }
  player.xVel *= friction;
  player.xVel = clamp(player.xVel, -maxXVel, maxXVel);
  let newX = player.x + player.xVel;
  // Prevent going off screen horizontally - use layer width instead of canvas width
  player.x = clamp(newX, player.width/2, currentLayer.width - player.width/2);
  
  // --- Jump Input Handling ---
  // Immediate Mode:
  if (TWEAK.jumpType === "immediate") {
    if (window.keysDown[" "] && !player.isJumping && player.canJump) {
      player.isJumping = true;
      player.canJump = false;
      player.isCharging = false;
      let heightBonus = 1 + (window.playerUpgrades.rocketSurgery * TWEAK.jumpHeightPerRocketSurgery);
      let timeBonus = 1 + (window.playerUpgrades.rocketSurgery * TWEAK.jumpTimePerRocketSurgery);
      let heightIncrease = heightBonus - 1;
      let extraZoom = heightIncrease * TWEAK.jumpZoomPerHeightIncrease;
      player.jumpHeightFactor = heightBonus;
      player.jumpDuration = TWEAK.jumpBaseAscent * timeBonus;
      player.jumpZoomBonus = extraZoom;
      player.jumpTimer = 0;
      player.hasReachedJumpPeak = false;
      if (window.playerUpgrades.rocketSurgery > 0) {
        console.log(`Jump boosted by Rocket Surgery ${window.playerUpgrades.rocketSurgery}: Height x${heightBonus.toFixed(2)}, Time x${timeBonus.toFixed(2)}, Zoom +${(extraZoom*100).toFixed(0)}%`);
      }
      onPlayerJumpStart();
    }
  }
  // Charge Mode:
  else if (TWEAK.jumpType === "charge") {
    if (window.keysDown[" "] && !player.isJumping && !player.isCharging && player.canJump) {
      player.isCharging = true;
      player.canJump = false;
      player.jumpChargeTime = 0;
    }
    if (player.isCharging) {
      player.jumpChargeTime += deltaTime;
      if (!window.keysDown[" "]) {
        let chargeRatio = Math.min(1, player.jumpChargeTime / TWEAK.jumpMaxHoldTime);
        player.isCharging = false;
        player.isJumping = true;
        player.jumpHeightFactor = chargeRatio;
        player.jumpDuration = 500 + 500 * chargeRatio;
        player.jumpTimer = 0;
        player.hasReachedJumpPeak = false;
        onPlayerJumpStart();
      } else if (player.jumpChargeTime >= TWEAK.jumpMaxHoldTime) {
        player.isCharging = false;
        player.isJumping = true;
        player.jumpHeightFactor = 1;
        player.jumpDuration = 1000;
        player.jumpTimer = 0;
        player.hasReachedJumpPeak = false;
        onPlayerJumpStart();
      }
    }
  }
  
  // Trick Animation & Trick Handling:
  if (player.isJumping) {
    player.jumpTimer += deltaTime;
    let progress = player.jumpTimer / player.jumpDuration;
    // Re-hit window handling:
    if (progress >= TWEAK.reHitWindowStart && progress < 1.0) {
      if (window.keysDown[" "] && !player.reHitActivated && !player.isCharging) {
        console.log("Re-hit jump activated!");
        player.reHitActivated = true;
        player.jumpTimer = 0;
        player.jumpDuration *= TWEAK.reHitBonusDuration;
        player.jumpHeightFactor = 1;
        playTone(600, "sine", 0.1, 0.3);
        return;
      }
    }
    if (player.isJumping && jumpOsc) {
      let f_start = 300, f_peak = 800, f_end = 300, freq;
      if (progress < 0.5) {
        let t = progress / 0.5;
        freq = f_start + (f_peak - f_start) * (t * t);
      } else {
        let t = (progress - 0.5) / 0.5;
        freq = f_peak - (f_peak - f_end) * (t * t);
      }
      jumpOsc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    }
    
    // Check for trick inputs and process any active tricks
    checkTrickInputs();
    processTrick(deltaTime);
    
    if (!player.hasReachedJumpPeak && progress >= 0.5) {
      player.hasReachedJumpPeak = true;
      onPlayerJumpPeak();
    }
    if (progress >= 1) {
      // End jump: reset jump/trick state and restore scale
      player.isJumping = false;
      player.jumpTimer = 0;
      player.hasReachedJumpPeak = false;
      
      // Check if a trick is currently active (any phase) when landing
      let landingDuringTrick = (player.trickState === 'start' || player.trickState === 'mid' || player.trickState === 'end');
      
      // If landing while doing a trick, it's a crash
      if (landingDuringTrick) {
        console.log(`Crash! Landed during trick (${player.currentTrick} - ${player.trickState} phase)`);
        resetTrickState();
        player.collisions++;
        
        // Switch to UPHILL mode immediately
        playCrashSound();
        
        // If max collisions reached, mark sled as damaged
        if (player.collisions >= TWEAK.getMaxCollisions()) {
          console.log("Max collisions reached.");
          player.sledDamaged = 1; // Mark sled as damaged
          console.log("Sled marked as damaged! You'll need to repair it before going downhill again.");
        }
        
        changeState(GameState.UPHILL);
        return;
      } else {
        // Normal landing - full trick completion
        resetTrickState();
      }
      
      player.width = player.baseWidth;
      player.height = player.baseHeight;
      onPlayerLand();
      
      // Check for landing collisions after checking trick state
      for (let i = 0; i < terrain.length; i++) {
        let obstacle = terrain[i];
        if (checkCollision(
            player.x - player.width / 2, player.absY - player.height / 2,
            player.width, player.height,
            obstacle.x, obstacle.y,
            obstacle.width, obstacle.height
        )) {
          console.log("Collision on landing.");
          // terrain.splice(i, 1); // Commented out obstacle destruction
          player.collisions++;
          
          // Switch to UPHILL mode immediately
          playCrashSound();
          
          // If max collisions reached, mark sled as damaged
          if (player.collisions >= TWEAK.getMaxCollisions()) {
            console.log("Max collisions reached.");
            player.sledDamaged = 1; // Mark sled as damaged
            console.log("Sled marked as damaged! You'll need to repair it before going downhill again.");
          }
          
          changeState(GameState.UPHILL);
          return;
        }
      }
    } else {
      // Scale player sprite for jump arc effect
      let baseScale = TWEAK.jumpPeakScale + player.jumpZoomBonus;
      let scale = 1 + (baseScale - 1) * Math.sin(Math.PI * progress) * player.jumpHeightFactor;
      player.width = player.baseWidth * scale;
      player.height = player.baseHeight * scale;
    }
  }
  
  // Allow jump restart when space is released
  if (!window.keysDown[" "]) {
    player.canJump = true;
  }
  
  // Normal downhill physics & collision handling (skip during jump)
  let prevAbsY = player.absY;
  if (!player.isJumping) {
    for (let i = 0; i < terrain.length; i++) {
      let obstacle = terrain[i];
      if (checkCollision(
          player.x - player.width / 2, player.absY - player.height / 2,
          player.width, player.height,
          obstacle.x, obstacle.y,
          obstacle.width, obstacle.height
      )) {
        console.log("Collision on downhill.");
        // terrain.splice(i, 1); // Commented out obstacle destruction
        player.collisions++;
        
        // Switch to UPHILL mode immediately
        playCrashSound();
        
        // If max collisions reached, mark sled as damaged
        if (player.collisions >= TWEAK.getMaxCollisions()) {
          console.log("Max collisions reached. Ending run.");
          player.sledDamaged = 1; // Mark sled as damaged
          console.log("Sled marked as damaged! You'll need to repair it before going downhill again.");
        }
        
        // Award money even if not at the bottom
        awardMoney();
        changeState(GameState.UPHILL);
        return;
      }
    }
  }
  
  player.velocityY += player.isJumping ? TWEAK.baseGravity : gravity;
  player.absY += player.velocityY;
  updateLiveMoney();

  // Check for transition to UPHILL mode near bottom
  if (player.absY >= mountainHeight - (player.height * 4)) {
    player.absY = mountainHeight - (player.height * 4);
    player.velocityY = 0;
    console.log("Reached transition point. Switching to uphill mode.");
    
    // Fix for jumping transition - handle jump state before changing modes
    if (player.isJumping) {
      // Smoothly reset jump zoom and finalize landing
      lerpJumpZoomToZero(() => {
        onPlayerJumpLand(); // handles trick cleanup, sound, etc.
      });
    }
    
    changeState(GameState.UPHILL);
    return;
  }

  // Check for actual bottom
  if (player.absY >= mountainHeight) {
    player.absY = mountainHeight;
    console.log("Reached bottom. Returning to house.");
    awardMoney();
    changeState(GameState.HOUSE);
  }
}

// Helper function for smooth jump transition
function lerpJumpZoomToZero(callback) {
  const startZoom = player.jumpZoomBonus;
  const duration = 250; // ms
  const startTime = performance.now();

  function animate(time) {
    const elapsed = time - startTime;
    const t = Math.min(1, elapsed / duration);
    player.jumpZoomBonus = startZoom * (1 - t);

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      player.jumpZoomBonus = 0;
      player.isJumping = false;
      player.jumpTimer = 0;
      player.hasReachedJumpPeak = false;
      resetTrickState();
      player.width = player.baseWidth;
      player.height = player.baseHeight;
      if (callback) callback();
    }
  }

  requestAnimationFrame(animate);
}

// Make functions available globally
window.updateDownhill = updateDownhill;
window.lerpJumpZoomToZero = lerpJumpZoomToZero;

// Export necessary functions for module imports
export { updateDownhill, lerpJumpZoomToZero };
