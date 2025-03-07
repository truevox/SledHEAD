/* game.js */
/**************************************************/
/* SledHEAD - Core Game Loop & State Management */
/**************************************************/

var downhillStartTime = null;
var lastTime = 0;
var currentState = GameState.HOUSE;
var jumpOsc = null;
var jumpGain = null;

// Floating text system
var floatingTexts = [];
class FloatingText {
  constructor(text, x, y) {
    this.text = text;
    this.x = x;
    this.initialY = y; // Store initial Y position relative to player
    this.age = 0;
    this.lifetime = 1000; // 1 second
    this.visualOffsetY = -30; // Start above player
  }

  update(deltaTime) {
    this.age += deltaTime;
    this.visualOffsetY -= deltaTime * 0.25; // Slow upward float
    return this.age < this.lifetime;
  }

  draw(ctx, cameraY) {
    const alpha = 1 - (this.age / this.lifetime);
    // Black text with alpha
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    // Follow player's Y position plus visual offset
    const screenY = player.absY - cameraY + this.visualOffsetY;
    ctx.fillText(this.text, this.x, screenY);
  }
}

function addFloatingText(text, x, y) {
  floatingTexts.push(new FloatingText(text, x, y - 30)); // Offset up by 30 pixels
}


function changeState(newState) {
  currentState = newState;
  if (currentState === GameState.HOUSE) {
    document.getElementById("upgrade-menu").style.display = "block";
    document.getElementById("game-screen").style.display = "none";
    const bestTimeText = document.getElementById("bestTimeText");
    bestTimeText.textContent = player.bestTime === Infinity ? "Best Time: N/A" : `Best Time: ${player.bestTime.toFixed(2)}s`;
    updateMoneyDisplay();
  } else if (currentState === GameState.DOWNHILL) {
    document.getElementById("upgrade-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    generateTerrain();
    earlyFinish = false;
    player.collisions = 0;
    player.x = canvas.width / 2;
    player.absY = 0;
    player.velocityY = 0;
    player.xVel = 0;
    downhillStartTime = performance.now();
  } else if (currentState === GameState.UPHILL) {
    player.xVel = 0;
  }
}

/* Attach sound to button click */
document.getElementById("startGame").addEventListener("click", () => {
  console.log("Start run clicked.");
  unlockAudioContext(); // Ensure sound works
  playStartGameSound(); // 🔊 Play start sound immediately on button click
  changeState(GameState.DOWNHILL);
});


/* Live money update function */
let lastMoneyMilestone = 0; // Track last milestone reached

function updateLiveMoney() {
  let distanceTraveled = Math.max(1, player.absY);
  let moneyEarned = Math.floor(distanceTraveled / 100);
  moneyEarned = Math.max(1, moneyEarned);
  
  let moneyText = document.getElementById("moneyText");
  moneyText.textContent = `Money: $${player.money} (+$${moneyEarned})`;

  // Check if we reached the next power of ten
  if (moneyEarned > lastMoneyMilestone && moneyEarned % 10 === 0) {
    lastMoneyMilestone = moneyEarned;
    playMoneyGainSound(); // 🔊 Play money sound only at 1, 10, 100, 1000...
    showMoneyGain(moneyEarned);
  }
}

// Generic function to show money gained with bounce effect
function showMoneyGain(amount, source = "") {
  let moneyText = document.getElementById("moneyText");
  if (source) {
    moneyText.textContent = `Money: $${player.money} (+$${amount} ${source})`;
  } else {
    moneyText.textContent = `Money: $${player.money} (+$${amount})`;
  }
  
  moneyText.classList.add("money-increase");
  setTimeout(() => {
    moneyText.classList.remove("money-increase");
  }, 100);
}

function update(deltaTime) {
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
    // Immediate Mode: start jump on space key press
    if (TWEAK.jumpType === "immediate") {
      if (keysDown[" "] && !player.isJumping && player.canJump) {
        player.isJumping = true;
        player.canJump = false;
        player.isCharging = false;
        
        // Calculate Rocket Surgery bonuses
        let heightBonus = 1 + (playerUpgrades.rocketSurgery * TWEAK.jumpHeightPerRocketSurgery);
        let timeBonus = 1 + (playerUpgrades.rocketSurgery * TWEAK.jumpTimePerRocketSurgery);
        
        // Calculate zoom scale based on height increase
        let heightIncrease = heightBonus - 1;  // Convert 1.5x to 50% increase
        let extraZoom = heightIncrease * TWEAK.jumpZoomPerHeightIncrease;
        
        player.jumpHeightFactor = heightBonus;     // Apply height boost
        player.jumpDuration = TWEAK.jumpBaseAscent * timeBonus;  // Apply duration boost
        player.jumpZoomBonus = extraZoom;          // Store zoom bonus for visuals
        player.jumpTimer = 0;
        player.hasReachedJumpPeak = false;
        
        if (playerUpgrades.rocketSurgery > 0) {
          console.log(`Jump boosted by Rocket Surgery ${playerUpgrades.rocketSurgery}: Height x${heightBonus.toFixed(2)}, Time x${timeBonus.toFixed(2)}, Zoom +${(extraZoom*100).toFixed(0)}%`);
        }
        onPlayerJumpStart();
      }
    }
    // Charge Mode: accumulate charge on key hold; launch jump on key release
    else if (TWEAK.jumpType === "charge") {
      if (keysDown[" "] && !player.isJumping && !player.isCharging && player.canJump) {
        player.isCharging = true;
        player.canJump = false;
        player.jumpChargeTime = 0;
      }
      if (player.isCharging) {
        player.jumpChargeTime += deltaTime;
        if (!keysDown[" "]) {
          // Launch jump using charge ratio (capped by TWEAK.jumpMaxHoldTime)
          let chargeRatio = Math.min(1, player.jumpChargeTime / TWEAK.jumpMaxHoldTime);
          player.isCharging = false;
          player.isJumping = true;
          player.jumpHeightFactor = chargeRatio;
          player.jumpDuration = 500 + 500 * chargeRatio;  // Longer jump for higher charge
          player.jumpTimer = 0;
          player.hasReachedJumpPeak = false;
          onPlayerJumpStart();
        } else if (player.jumpChargeTime >= TWEAK.jumpMaxHoldTime) {
          // Auto-launch at max charge
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

    // Update jump animation if a jump is in progress
    if (player.isJumping) {
      player.jumpTimer += deltaTime;
      let progress = player.jumpTimer / player.jumpDuration;

      if (player.isJumping && jumpOsc) {
        // Define frequency values in Hz:
        let f_start = 300;
        let f_peak = 800;
        let f_end = 300;
        let freq;
        
        // 'progress' is the fraction (0 to 1) of the jump completed
        if (progress < 0.5) {
          // During ascent: non-linearly increase pitch (quadratic curve)
          let t = progress / 0.5; // Normalize to [0,1]
          freq = f_start + (f_peak - f_start) * (t * t);
        } else {
          // During descent: non-linearly decrease pitch (quadratic curve)
          let t = (progress - 0.5) / 0.5; // Normalize to [0,1]
          freq = f_peak - (f_peak - f_end) * (t * t);
        }
        jumpOsc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      }
      

      // Check for trick inputs during jump
      if (!player.currentTrick && player.isJumping) {
        if (keysDown["ArrowLeft"]) {
          startTrick("leftHelicopter");
        } else if (keysDown["ArrowRight"]) {
          startTrick("rightHelicopter");
        } else if (keysDown["ArrowUp"]) {
          startTrick("airBrake");
        } else if (keysDown["ArrowDown"]) {
          startTrick("parachute");
        }
      }

      // Update active trick if one is running
      if (player.currentTrick) {
        player.trickTimer += deltaTime;
        let trickProgress = player.trickTimer / (TWEAK._trickBaseDuration * TWEAK._trickTimeMultiplier + TWEAK._trickTimeAdder);

        // Update trick-specific animations
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

        // Check for trick completion
        if (trickProgress >= 1) {
          // Award money based on chain multiplier and cooldown value
          let trickMoney = TWEAK._trickMoneyBase;
          let chainBonus = 1;
          if (player.lastTrick && player.lastTrick !== player.currentTrick) {
            player.trickChainCount++;
            chainBonus = Math.pow(TWEAK._trickChainMultiplier, player.trickChainCount);
            trickMoney *= chainBonus;
          } else {
            player.trickChainCount = 0;
          }
          
          // Apply cooldown penalty
          trickMoney *= player.currentTrickValueMultiplier;
          let finalMoney = Math.floor(trickMoney);
          player.money += finalMoney;
          showMoneyGain(finalMoney, `(${player.currentTrick})`);
          addFloatingText(`+$${finalMoney} ${player.currentTrick}`, player.x, player.absY);
          
          // Log trick completion with detailed money breakdown
          console.log(`🎯 ${player.currentTrick} completed! +$${finalMoney} (Chain: x${chainBonus.toFixed(2)}, Value: ${(player.currentTrickValueMultiplier * 100).toFixed(0)}%)`);

          // Reset trick state
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
        // End jump: reset jump state, trick state, and restore sprite scale
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

        // Check for collision on landing and apply penalty if needed
        for (let i = 0; i < terrain.length; i++) {
          let obstacle = terrain[i];
          if (checkCollision(
              player.x - player.width / 2, player.absY - player.height / 2,
              player.width, player.height,
              obstacle.x, obstacle.y,
              obstacle.width, obstacle.height
          )) {
            console.log("Collision detected on landing.");
            player.velocityY = -TWEAK.bounceImpulse * TWEAK.jumpCollisionMultiplier;
            player.absY -= TWEAK.bounceImpulse * TWEAK.jumpCollisionMultiplier;
            player.collisions++;
            if (player.collisions >= TWEAK.getMaxCollisions()) {
              console.log("Max collisions reached on landing. Ending run.");
              awardMoney();
              playCrashSound();
              changeState(GameState.UPHILL);
              return;
            } else {
              playRockHitSound();
            }
            break;  // Only handle one collision penalty per landing
          }
        }
      } else {
        // Calculate sprite scale using a sine curve for a smooth jump arc
        // Base scale from jumpPeakScale (2x at peak) plus any Rocket Surgery zoom bonus
        let baseScale = TWEAK.jumpPeakScale + player.jumpZoomBonus;
        let scale = 1 + (baseScale - 1) * Math.sin(Math.PI * progress) * player.jumpHeightFactor;
        
        player.width = player.baseWidth * scale;
        player.height = player.baseHeight * scale;
      }
    }

    // Allow new jump initiation when the space key is released
    if (!keysDown[" "]) {
      player.canJump = true;
    }

    // --- Normal Downhill Physics & Collision Handling (skip collisions during jump) ---
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
          console.log("Collision detected on downhill.");
          player.velocityY = -TWEAK.bounceImpulse;
          player.absY = prevAbsY - TWEAK.bounceImpulse;
          player.collisions++;
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

    // Continue with normal physics updates
    player.velocityY += gravity;
    player.absY += player.velocityY;

    if (keysDown["a"]) { player.xVel -= horizontalAccel; }
    if (keysDown["d"]) { player.xVel += horizontalAccel; }
    player.xVel *= friction;
    player.xVel = clamp(player.xVel, -maxXVel, maxXVel);
    player.x += player.xVel;

    updateLiveMoney();

    if (player.absY >= mountainHeight) {
      player.absY = mountainHeight;
      console.log("Reached bottom of mountain.");
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
        console.log("Collision detected on uphill.");
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

function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  // Update game state
  update(deltaTime);
  
  // Update and clean up floating texts
  floatingTexts = floatingTexts.filter(text => text.update(deltaTime));
  
  // Draw everything
  drawEntities();
  
  // Draw floating texts last so they're on top
  ctx.save();
  floatingTexts.forEach(text => text.draw(ctx, player.absY - canvas.height / 2));
  ctx.restore();
  
  requestAnimationFrame(gameLoop);
}

/* ---------------------- Initialization ---------------------- */
Object.keys(playerUpgrades).forEach(upg => {
  initUpgradeButton(upg, playerUpgrades[upg]);
  const btnId = `upgrade${capitalizeFirstLetter(upg)}`;
  document.getElementById(btnId).addEventListener("click", () => {
    console.log("Upgrade button clicked:", upg, "Current money:", player.money);
    purchaseUpgrade(playerUpgrades, upg);
  });
});
Object.keys(mountainUpgrades).forEach(upg => {
  initUpgradeButton(upg, mountainUpgrades[upg]);
  const btnId = `upgrade${capitalizeFirstLetter(upg)}`;
  document.getElementById(btnId).addEventListener("click", () => {
    console.log("Upgrade button clicked:", upg, "Current money:", player.money);
    purchaseUpgrade(mountainUpgrades, upg);
  });
});
document.getElementById("startGame").addEventListener("click", () => {
  console.log("Start run clicked.");
  changeState(GameState.DOWNHILL);
});
changeState(GameState.HOUSE);
requestAnimationFrame(gameLoop);

function takePhoto() {
  let now = Date.now();
  if (now - lastPhotoTime < TWEAK.photoCooldown) return; // Enforce cooldown

  if (!activeAnimal || !isAnimalInsideCone(activeAnimal)) return;

  lastPhotoTime = now;
  let baseValue = TWEAK.basePhotoValue;

  // Altitude Bonus: Exponential falloff within 50 units.
  let diffAlt = Math.abs(player.altitudeLine - activeAnimal.altitude);
  let altitudeMatchBonus;
  if (diffAlt > 50) {
    altitudeMatchBonus = 1;
  } else {
    altitudeMatchBonus = 1 + (TWEAK.altitudeMatchMultiplier - 1) * Math.exp(-diffAlt / 15);
  }
  /* Linear taper alternative (DO NOT REMOVE):
  let altitudeMatchBonus = diffAlt <= 50 ? TWEAK.altitudeMatchMultiplier - (TWEAK.altitudeMatchMultiplier - 1) * (diffAlt / 50) : 1;
  */

  // Center Bonus: Exponential taper based on angle difference.
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
  /* Linear taper alternative (DO NOT REMOVE):
  if (diffAngle <= sweetSpotAngle) {
    centerBonus = TWEAK.centerPOVMultiplier;
  } else if (diffAngle < coneAngle / 2) {
    centerBonus = TWEAK.centerPOVMultiplier - (TWEAK.centerPOVMultiplier - 1) * ((diffAngle - sweetSpotAngle) / (coneAngle / 2 - sweetSpotAngle));
  } else {
    centerBonus = 1;
  }
  */

  // Movement Bonus: Applies when the animal is not sitting.
  let movementBonus = activeAnimal.state !== "sitting" ? TWEAK.movingAnimalMultiplier : 1;
  let animalTypeMultiplier = activeAnimal.type === "bear" ? TWEAK.bearMultiplier : TWEAK.birdMultiplier;
  let repeatPenalty = activeAnimal.hasBeenPhotographed ? TWEAK.repeatPhotoPenalty : 1;

  let totalMoney = Math.floor(baseValue * altitudeMatchBonus * centerBonus * movementBonus * animalTypeMultiplier * repeatPenalty);

  player.money += totalMoney;
  showMoneyGain(totalMoney, `(📸 ${activeAnimal.type})`);
  addFloatingText(`+$${totalMoney} 📸`, player.x, player.absY);
  console.log(`📸 Captured ${activeAnimal.type}! Calculation details: Base=$${baseValue}, AltitudeBonus=${altitudeMatchBonus.toFixed(2)}, CenterBonus=${centerBonus.toFixed(2)}, MovementBonus=${movementBonus.toFixed(2)}, AnimalTypeMultiplier=${animalTypeMultiplier}, RepeatPenalty=${repeatPenalty}, Total=$${totalMoney}.`);

  activeAnimal.hasBeenPhotographed = true;
}

function onPlayerJumpStart() {
  console.log("Jump initiated!");
  // Create a new oscillator and gain node for the jump sound
  unlockAudioContext();
  jumpOsc = audioCtx.createOscillator();
  jumpGain = audioCtx.createGain();
  jumpOsc.type = "sine";
  // Set an initial volume
  jumpGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  jumpOsc.connect(jumpGain);
  jumpGain.connect(audioCtx.destination);
  jumpOsc.start();
}

function onPlayerJumpPeak() {
  console.log("Reached peak of jump.");
  // You can optionally add a distinct sound here if desired.
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
  console.log("Landed from jump.");
  cleanupJumpSound();
}

function startTrick(trickName) {
  // Don't start a new trick if one is already running
  if (player.currentTrick) return;

  // Start the trick
  player.currentTrick = trickName;
  player.trickTimer = 0;
  player.trickRotation = 0;
  player.trickOffset = 0;

  // Calculate cooldown penalty (0 to 1, where 1 means full value)
  let now = Date.now();
  let cooldownEnd = player.trickCooldowns[trickName] || 0;
  let timeLeft = Math.max(0, cooldownEnd - now);
  player.currentTrickValueMultiplier = timeLeft > 0 ?
    Math.max(0.1, 1 - (timeLeft / TWEAK._trickCooldown)) : 1;

  // Update cooldown timestamp
  player.trickCooldowns[trickName] = now + TWEAK._trickCooldown;
  
  // Debug logging
  console.log(`Starting ${trickName} (Value: ${(player.currentTrickValueMultiplier * 100).toFixed(0)}%)`);
}

function playTrickCompleteSound() {
  playTone(600, "sine", 0.1, 0.2); // Short, high-pitched success sound
}