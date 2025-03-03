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
    let maxXVel = TWEAK.baseMaxXVel * rocketFactor;
    let opticsFactor = 1 + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsAccelFactorPerLevel);
    let horizontalAccel = TWEAK.baseHorizontalAccel * opticsFactor;
    let friction = TWEAK.baseFriction + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsFrictionFactorPerLevel);
    if (friction > 1.0) friction = 1.0;

    player.velocityY += gravity;
    player.absY += player.velocityY;

    // Support for WASD keys (no arrow keys for movement)
    if (keysDown["a"]) { player.xVel -= horizontalAccel; }
    if (keysDown["d"]) { player.xVel += horizontalAccel; }

    player.xVel *= friction;
    player.xVel = clamp(player.xVel, -maxXVel, maxXVel);
    player.x += player.xVel;

    updateLiveMoney();

    let prevAbsY = player.absY;
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
          playCrashSound(); // 🔊 Play crash sound when losing
          changeState(GameState.UPHILL);
          return;
        } else {
          playRockHitSound(); // 🔊 Play hit sound for non-crash collisions
        }
      }
    }

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

    // 🎯 Camera Aiming (Arrow Keys)
    if (keysDown["ArrowLeft"]) { player.cameraAngle -= 2; }
    if (keysDown["ArrowRight"]) { player.cameraAngle += 2; }
    if (keysDown["ArrowUp"]) { player.altitudeLine = Math.max(0, player.altitudeLine - 2); }
    if (keysDown["ArrowDown"]) { player.altitudeLine = Math.min(100, player.altitudeLine + 2); }

    // Wrap camera angle within 360 degrees
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

    // Call updateAnimal() in the uphill phase so that animals update every frame
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
  let altitudeMatchBonus = Math.abs(player.altitudeLine - activeAnimal.altitude) < 10 ? TWEAK.altitudeMatchMultiplier : 1;
  let centerBonus = Math.abs(player.cameraAngle - (activeAnimal.x > player.x ? 0 : 180)) < 10 ? TWEAK.centerPOVMultiplier : 1;
  let movementBonus = activeAnimal.state === "moving" ? TWEAK.movingAnimalMultiplier : 1;
  let animalTypeMultiplier = activeAnimal.type === "bear" ? TWEAK.bearMultiplier : TWEAK.birdMultiplier;
  let repeatPenalty = activeAnimal.hasBeenPhotographed ? TWEAK.repeatPhotoPenalty : 1;

  let totalMoney = Math.floor(baseValue * altitudeMatchBonus * centerBonus * movementBonus * animalTypeMultiplier * repeatPenalty);

  player.money += totalMoney;
  updateMoneyDisplay();
  console.log(`📸 Captured ${activeAnimal.type}! Earned $${totalMoney}.`);

  activeAnimal.hasBeenPhotographed = true;
}
