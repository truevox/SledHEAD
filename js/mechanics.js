/* mechanics.js - Gameplay Mechanics & Interactions */

// Update all gameplay state and physics – including jump/trick handling and collision updates.
function updateMechanics(deltaTime) {
    deltaTime *= 1;
    if (currentState === GameState.DOWNHILL) {
      let rocketFactor = 1 + (playerUpgrades.rocketSurgery * TWEAK.rocketSurgeryFactorPerLevel);
      let gravity = TWEAK.baseGravity * rocketFactor;
      let maxXVel = TWEAK.baseMaxXVel * (rocketFactor - (playerUpgrades.optimalOptics * TWEAK.optimalOpticsFrictionFactorPerLevel));
      maxXVel = Math.max(0, maxXVel);
      let opticsFactor = 1 + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsAccelFactorPerLevel);
      let horizontalAccel = TWEAK.baseHorizontalAccel * opticsFactor;
      let friction = TWEAK.baseFriction - (playerUpgrades.optimalOptics * TWEAK.optimalOpticsFrictionFactorPerLevel);
      if (friction < 0.8) friction = 0.8;
      
      // --- Jump Input Handling ---
      // Immediate Mode:
      if (TWEAK.jumpType === "immediate") {
        if (keysDown[" "] && !player.isJumping && player.canJump) {
          player.isJumping = true;
          player.canJump = false;
          player.isCharging = false;
          let heightBonus = 1 + (playerUpgrades.rocketSurgery * TWEAK.jumpHeightPerRocketSurgery);
          let timeBonus = 1 + (playerUpgrades.rocketSurgery * TWEAK.jumpTimePerRocketSurgery);
          let heightIncrease = heightBonus - 1;
          let extraZoom = heightIncrease * TWEAK.jumpZoomPerHeightIncrease;
          player.jumpHeightFactor = heightBonus;
          player.jumpDuration = TWEAK.jumpBaseAscent * timeBonus;
          player.jumpZoomBonus = extraZoom;
          player.jumpTimer = 0;
          player.hasReachedJumpPeak = false;
          if (playerUpgrades.rocketSurgery > 0) {
            console.log(`Jump boosted by Rocket Surgery ${playerUpgrades.rocketSurgery}: Height x${heightBonus.toFixed(2)}, Time x${timeBonus.toFixed(2)}, Zoom +${(extraZoom*100).toFixed(0)}%`);
          }
          onPlayerJumpStart();
        }
      }
      // Charge Mode:
      else if (TWEAK.jumpType === "charge") {
        if (keysDown[" "] && !player.isJumping && !player.isCharging && player.canJump) {
          player.isCharging = true;
          player.canJump = false;
          player.jumpChargeTime = 0;
        }
        if (player.isCharging) {
          player.jumpChargeTime += deltaTime;
          if (!keysDown[" "]) {
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
      
      // Jump Animation & Trick Handling:
      if (player.isJumping) {
        player.jumpTimer += deltaTime;
        let progress = player.jumpTimer / player.jumpDuration;
        // Re-hit window handling:
        if (progress >= TWEAK.reHitWindowStart && progress < 1.0) {
          if (keysDown[" "] && !player.reHitActivated && !player.isCharging) {
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
        // Trick initiation:
        if (!player.currentTrick && player.isJumping) {
          if (keysDown["ArrowLeft"]) startTrick("leftHelicopter");
          else if (keysDown["ArrowRight"]) startTrick("rightHelicopter");
          else if (keysDown["ArrowUp"]) startTrick("airBrake");
          else if (keysDown["ArrowDown"]) startTrick("parachute");
        }
        // Trick handling:
        if (player.currentTrick) {
          player.trickTimer += deltaTime;
          let trickProgress = player.trickTimer / (TWEAK._trickBaseDuration * TWEAK._trickTimeMultiplier + TWEAK._trickTimeAdder);
          switch (player.currentTrick) {
            case "leftHelicopter":
              player.trickRotation -= TWEAK._trickRotationSpeed * (deltaTime / 1000);
              break;
            case "rightHelicopter":
              player.trickRotation += TWEAK._trickRotationSpeed * (deltaTime / 1000);
              break;
            case "airBrake":
            case "parachute":
              player.trickOffset = TWEAK._trickOffsetDistance * Math.sin(Math.PI * trickProgress);
              break;
          }
          if (trickProgress >= 1) {
            let trickMoney = TWEAK._trickMoneyBase;
            let chainBonus = 1;
            if (player.lastTrick && player.lastTrick !== player.currentTrick) {
              player.trickChainCount++;
              chainBonus = Math.pow(TWEAK._trickChainMultiplier, player.trickChainCount);
              trickMoney *= chainBonus;
            } else {
              player.trickChainCount = 0;
            }
            trickMoney *= player.currentTrickValueMultiplier;
            let finalMoney = Math.floor(trickMoney);
            player.money += finalMoney;
            showMoneyGain(finalMoney, `(${player.currentTrick})`);
            addFloatingText(`+$${finalMoney} ${player.currentTrick}`, player.x, player.absY);
            console.log(`Completed ${player.currentTrick}! +$${finalMoney}`);
            player.lastTrick = player.currentTrick;
            player.currentTrick = null;
            player.trickTimer = 0;
            player.trickRotation = 0;
            player.trickOffset = 0;
            playTrickCompleteSound();
          }
        }
        if (!player.hasReachedJumpPeak && progress >= 0.5) {
          player.hasReachedJumpPeak = true;
          onPlayerJumpPeak();
        }
        if (progress >= 1) {
          // End jump: reset jump/trick state and restore scale
          player.isJumping = false;
          player.jumpTimer = 0;
          player.hasReachedJumpPeak = false;
          player.currentTrick = null;
          player.trickTimer = 0;
          player.trickRotation = 0;
          player.trickOffset = 0;
          player.lastTrick = null;
          player.trickChainCount = 0;
          player.width = player.baseWidth;
          player.height = player.baseHeight;
          onPlayerLand();
          // Check for landing collisions
          for (let i = 0; i < terrain.length; i++) {
            let obstacle = terrain[i];
            if (checkCollision(
                player.x - player.width / 2, player.absY - player.height / 2,
                player.width, player.height,
                obstacle.x, obstacle.y,
                obstacle.width, obstacle.height
            )) {
              console.log("Collision on landing.");
              player.velocityY = -TWEAK.bounceImpulse * TWEAK.jumpCollisionMultiplier;
              player.absY -= TWEAK.bounceImpulse * TWEAK.jumpCollisionMultiplier;
              player.collisions++;
              terrain.splice(i, 1);
              if (player.collisions >= TWEAK.getMaxCollisions()) {
                console.log("Max collisions reached.");
                awardMoney();
                playCrashSound();
                changeState(GameState.UPHILL);
                return;
              } else {
                playRockHitSound();
              }
              break;
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
      if (!keysDown[" "]) {
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
            player.velocityY = -TWEAK.bounceImpulse;
            player.absY = prevAbsY - TWEAK.bounceImpulse;
            player.collisions++;
            terrain.splice(i, 1);
            if (player.collisions >= TWEAK.getMaxCollisions()) {
              console.log("Max collisions reached. Ending run.");
              awardMoney();
              playCrashSound();
              changeState(GameState.UPHILL);
              return;
            } else {
              playRockHitSound();
            }
          }
        }
      }
      player.velocityY += player.isJumping ? TWEAK.baseGravity : gravity;
      player.absY += player.velocityY;
      updateLiveMoney();
      if (player.absY >= mountainHeight) {
        player.absY = mountainHeight;
        console.log("Reached bottom.");
        awardMoney();
        changeState(GameState.UPHILL);
      }
    } else if (currentState === GameState.UPHILL) {
      let upSpeed = TWEAK.baseUpSpeed + (playerUpgrades.fancierFootwear * TWEAK.fancierFootwearUpSpeedPerLevel);
      if (keysDown["w"]) { player.absY -= upSpeed; }
      if (keysDown["s"]) { player.absY += upSpeed; }
      if (keysDown["a"]) { player.x -= upSpeed; }
      if (keysDown["d"]) { player.x += upSpeed; }
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
      updateAnimal();
      if (player.absY <= 0) {
        player.absY = 0;
        changeState(GameState.HOUSE);
      }
    }
  }
  
  // ------------------- Photo (Critter) Minigame Logic -------------------
  
  // Handles taking a photo of an animal when conditions are met.
  function takePhoto() {
    let now = Date.now();
    if (now - lastPhotoTime < TWEAK.photoCooldown) return; // Enforce cooldown
    if (!activeAnimal || !isAnimalInsideCone(activeAnimal)) return;
    lastPhotoTime = now;
    
    let baseValue = TWEAK.basePhotoValue;
    // Altitude Bonus: exponential falloff within 50 units.
    let diffAlt = Math.abs(player.altitudeLine - activeAnimal.altitude);
    let altitudeMatchBonus;
    if (diffAlt > 50) {
      altitudeMatchBonus = 1;
    } else {
      altitudeMatchBonus = 1 + (TWEAK.altitudeMatchMultiplier - 1) * Math.exp(-diffAlt / 15);
    }
    
    // Center Bonus: based on the angle difference between camera direction and animal.
    let animalAngle = Math.atan2(activeAnimal.y - player.absY, activeAnimal.x - player.x) * (180 / Math.PI);
    if (animalAngle < 0) animalAngle += 360;
    let diffAngle = Math.abs(animalAngle - player.cameraAngle);
    if (diffAngle > 180) diffAngle = 360 - diffAngle;
    let coneAngle = TWEAK.basePOVAngle + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsPOVIncrease);
    let sweetSpotPercentage = 0.10 + (playerUpgrades.optimalOptics * 0.01);
    let sweetSpotAngle = coneAngle * sweetSpotPercentage;
    let centerBonus;
    if (diffAngle <= sweetSpotAngle) {
      centerBonus = TWEAK.centerPOVMultiplier;
    } else if (diffAngle < coneAngle / 2) {
      let factor = (diffAngle - sweetSpotAngle) / (coneAngle / 2 - sweetSpotAngle);
      centerBonus = 1 + (TWEAK.centerPOVMultiplier - 1) * Math.exp(-factor * 3);
    } else {
      centerBonus = 1;
    }
    
    // Movement Bonus and Animal Type Multiplier:
    let movementBonus = activeAnimal.state !== "sitting" ? TWEAK.movingAnimalMultiplier : 1;
    let animalTypeMultiplier = activeAnimal.type === "bear" ? TWEAK.bearMultiplier : TWEAK.birdMultiplier;
    let repeatPenalty = activeAnimal.hasBeenPhotographed ? TWEAK.repeatPhotoPenalty : 1;
    
    let totalMoney = Math.floor(baseValue * altitudeMatchBonus * centerBonus * movementBonus * animalTypeMultiplier * repeatPenalty);
    player.money += totalMoney;
    showMoneyGain(totalMoney, `(📸 ${activeAnimal.type})`);
    addFloatingText(`+$${totalMoney} 📸`, player.x, player.absY);
    console.log(`Captured ${activeAnimal.type}! Calculation details: Base=$${baseValue}, AltitudeBonus=${altitudeMatchBonus.toFixed(2)}, CenterBonus=${centerBonus.toFixed(2)}, MovementBonus=${movementBonus.toFixed(2)}, AnimalTypeMultiplier=${animalTypeMultiplier}, RepeatPenalty=${repeatPenalty}, Total=$${totalMoney}.`);
    activeAnimal.hasBeenPhotographed = true;
  }
  
  // ------------------- Animal (Critter) Update Logic -------------------
  
  // Updates the state of the active animal (critter)
  function updateAnimal() {
    if (!activeAnimal) return;
    if (activeAnimal.state === "fleeing") {
      if (activeAnimal.fleeingLogOnce !== true) {
        console.log(`Animal fleeing - Type: ${activeAnimal.type}, Angle: ${activeAnimal.fleeAngleActual.toFixed(2)}°`);
        activeAnimal.fleeingLogOnce = true;
      }
      let rad = activeAnimal.fleeAngleActual * Math.PI / 180;
      activeAnimal.x += Math.cos(rad) * activeAnimal.speed * 0.5;
      activeAnimal.y += Math.sin(rad) * activeAnimal.speed * 0.5;
      if (
        activeAnimal.x < -100 ||
        activeAnimal.x > window.innerWidth + 100 ||
        activeAnimal.y > player.absY + 1000
      ) {
        console.log(`Animal moved off screen - removed`);
        activeAnimal = null;
        setTimeout(
          spawnAnimal,
          Math.random() * (TWEAK.maxSpawnTime - TWEAK.minIdleTime) + TWEAK.minIdleTime
        );
      }
    }
  }
  
  // ------------------- Helper Functions -------------------
  
  function onPlayerJumpStart() {
    player.jumpStartTime = performance.now();
    player.jumpStartY = player.absY;
    player.jumpPeakY = player.absY;
    console.log("Jump initiated at Y:", player.jumpStartY.toFixed(1));
    unlockAudioContext();
    jumpOsc = audioCtx.createOscillator();
    jumpGain = audioCtx.createGain();
    jumpOsc.type = "sine";
    jumpGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    jumpOsc.connect(jumpGain);
    jumpGain.connect(audioCtx.destination);
    jumpOsc.start();
  }
  
  function onPlayerJumpPeak() {
    console.log("Reached peak of jump.");
    // Optionally add a sound effect here.
  }
  
  function cleanupJumpSound() {
    if (jumpOsc) {
      jumpOsc.stop();
      jumpOsc.disconnect();
      jumpOsc = null;
    }
    if (jumpGain) {
      jumpGain.disconnect();
      jumpGain = null;
    }
  }
  
  function onPlayerLand() {
    const jumpTime = (performance.now() - player.jumpStartTime) / 1000;
    const jumpHeight = player.jumpPeakY - player.jumpStartY;
    const totalDistance = player.absY - player.jumpStartY;
    console.log(`Jump complete! Time: ${jumpTime.toFixed(2)}s, Peak Height: ${jumpHeight.toFixed(1)}, Distance: ${totalDistance.toFixed(1)}`);
    cleanupJumpSound();
  }
  
  function startTrick(trickName) {
    if (player.currentTrick) return;
    player.currentTrick = trickName;
    player.trickTimer = 0;
    player.trickRotation = 0;
    player.trickOffset = 0;
    let now = Date.now();
    let cooldownEnd = player.trickCooldowns[trickName] || 0;
    let timeLeft = Math.max(0, cooldownEnd - now);
    player.currentTrickValueMultiplier = timeLeft > 0 ? Math.max(0.1, 1 - (timeLeft / TWEAK._trickCooldown)) : 1;
    player.trickCooldowns[trickName] = now + TWEAK._trickCooldown;
    console.log(`Starting ${trickName} (Value: ${(player.currentTrickValueMultiplier * 100).toFixed(0)}%)`);
  }
  
  function playTrickCompleteSound() {
    playTone(600, "sine", 0.1, 0.2);
  }
  