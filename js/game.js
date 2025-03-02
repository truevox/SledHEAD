/* game.js */
/**************************************************/
/* SledHEAD - Game Code with Economy & Upgrades   */
/* and Tweakable Variables                        */
/**************************************************/

/* ======================== TWEAKABLE VARIABLES ========================= */
const TWEAK = {
  sledMass: 1.0,
  baseGravity: 0.1,
  baseHorizontalAccel: 0.15,
  baseFriction: 0.95,
  baseMaxXVel: 3,
  rocketSurgeryFactorPerLevel: 0.05,
  optimalOpticsAccelFactorPerLevel: 0.02,
  optimalOpticsFrictionFactorPerLevel: 0.005,
  fancierFootwearUpSpeedPerLevel: 0.1,
  baseUpSpeed: 2,
  baseCollisionsAllowed: 3,
  starterCash: 200
};
/* =================== END TWEAKABLE VARIABLES SECTION ================== */

let downhillStartTime = null;
let lastTime = 0;
let currentState = GameState.HOUSE;

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
    if (player.absY >= mountainHeight || player.absY <= 0) {
      player.absY = 0;
    }
    player.velocityY = 0;
    player.xVel = 0;
    maxCollisions = TWEAK.baseCollisionsAllowed + playerUpgrades.sledDurability;
    downhillStartTime = performance.now();
  } else if (currentState === GameState.UPHILL) {
    player.xVel = 0;
  }
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
    if (keysDown["ArrowLeft"]) { player.xVel -= horizontalAccel; }
    if (keysDown["ArrowRight"]) { player.xVel += horizontalAccel; }
    player.xVel *= friction;
    player.xVel = clamp(player.xVel, -maxXVel, maxXVel);
    player.x += player.xVel;
    let prevAbsY = player.absY;
    terrain.forEach(obstacle => {
      if (checkCollision(
          player.x - player.width / 2, player.absY - player.height / 2,
          player.width, player.height,
          obstacle.x, obstacle.y,
          obstacle.width, obstacle.height
        )) {
        console.log("Collision detected on downhill.");
        player.velocityY = 0;
        player.absY = prevAbsY - 15;
        player.collisions++;
        if (player.collisions >= maxCollisions) {
          console.log("Max collisions reached. Ending run.");
          awardMoney();
          changeState(GameState.UPHILL);
          return;
        }
      }
    });
    if (player.absY >= mountainHeight) {
      player.absY = mountainHeight;
      console.log("Reached bottom of mountain.");
      awardMoney();
      changeState(GameState.UPHILL);
    }
    
  } else if (currentState === GameState.UPHILL) {
    let upSpeed = TWEAK.baseUpSpeed + (playerUpgrades.fancierFootwear * TWEAK.fancierFootwearUpSpeedPerLevel);
    if (keysDown["ArrowUp"]) { player.absY -= upSpeed; }
    if (keysDown["ArrowDown"]) { player.absY += upSpeed; }
    if (keysDown["ArrowLeft"]) { player.x -= upSpeed; }
    if (keysDown["ArrowRight"]) { player.x += upSpeed; }
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
