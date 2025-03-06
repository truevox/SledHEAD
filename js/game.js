/* game.js */
/**************************************************/
/* SledHEAD - Core Game Loop & State Management */
/**************************************************/

var downhillStartTime = null;
var lastTime = 0;
var currentState = GameState.HOUSE;

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
  }

  // Add a visual bounce effect
  moneyText.classList.add("money-increase");
  setTimeout(() => {
    moneyText.classList.remove("money-increase");
  }, 100);
}

function update(deltaTime) {
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
        player.jumpHeightFactor = 1;      // Full height jump
        player.jumpDuration = 500;         // Base jump duration (ms)
        player.jumpTimer = 0;
        player.hasReachedJumpPeak = false;
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
      if (!player.hasReachedJumpPeak && progress >= 0.5) {
        player.hasReachedJumpPeak = true;
        onPlayerJumpPeak();
      }
      if (progress >= 1) {
        // End jump: reset jump state and restore sprite scale
        player.isJumping = false;
        player.jumpTimer = 0;
        player.hasReachedJumpPeak = false;
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
        // Calculate sprite scale using a sine curve for a smooth jump arc.
        // At progress = 0 => scale = 1; at progress = 0.5 => scale = TWEAK.jumpPeakScale; at progress = 1 => scale = 1.
        let scale = 1 + (TWEAK.jumpPeakScale - 1) * Math.sin(Math.PI * progress) * player.jumpHeightFactor;
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
  update(deltaTime);
  drawEntities();
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
  updateMoneyDisplay();
  console.log(`📸 Captured ${activeAnimal.type}! Calculation details: Base=$${baseValue}, AltitudeBonus=${altitudeMatchBonus.toFixed(2)}, CenterBonus=${centerBonus.toFixed(2)}, MovementBonus=${movementBonus.toFixed(2)}, AnimalTypeMultiplier=${animalTypeMultiplier}, RepeatPenalty=${repeatPenalty}, Total=$${totalMoney}.`);

  activeAnimal.hasBeenPhotographed = true;
}

function onPlayerJumpStart() {
  // Hook: Called when a jump starts.
  console.log("Jump started.");
}

function onPlayerJumpPeak() {
  // Hook: Called when the jump reaches its peak.
  console.log("Jump peak reached.");
}

function onPlayerLand() {
  // Hook: Called when the player lands.
  console.log("Player landed.");
}
