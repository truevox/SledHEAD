/**************************************************/
/* SledHEAD - Game Code with Economy & Upgrades   */
/* and Tweakable Variables!                       */
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

/* ---------------------- Game States ---------------------- */
const GameState = {
  HOUSE: 'house',
  DOWNHILL: 'downhill',
  UPHILL: 'uphill'
};
let currentState = GameState.HOUSE;

/* ---------------------- Canvas & Context ---------------------- */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

/* ---------------------- Mountain & Terrain ---------------------- */
const mountainHeight = 2000;
let terrain = [];
const obstacleCount = 40;
let earlyFinish = false;

/* ---------------------- Upgrade Definitions ---------------------- */
let playerUpgrades = {
  rocketSurgery: 0,
  optimalOptics: 0,
  sledDurability: 0,
  fancierFootwear: 0,
  grapplingAnchor: 0,
  attendLegDay: 0,
  shortcutAwareness: 0,
  crowdHypeman: 0,
  crowdWeaver: 0,
  weatherWarrior: 0
};
let mountainUpgrades = {
  skiLifts: 0,
  snowmobileRentals: 0,
  eateries: 0,
  groomedTrails: 0,
  firstAidStations: 0,
  scenicOverlooks: 0,
  advertisingRamps: 0,
  resortLodges: 0,
  nightLighting: 0,
  weatherControl: 0
};
/* ---------------------- Define Each Upgrade's Max ---------------------- */
const upgradeMaxLevel = {
  rocketSurgery: 10,
  optimalOptics: 10,
  sledDurability: 10,
  fancierFootwear: 10,
  grapplingAnchor: 0,
  attendLegDay: 0,
  shortcutAwareness: 0,
  crowdHypeman: 0,
  crowdWeaver: 0,
  weatherWarrior: 0,
  skiLifts: 0,
  snowmobileRentals: 0,
  eateries: 0,
  groomedTrails: 0,
  firstAidStations: 0,
  scenicOverlooks: 0,
  advertisingRamps: 0,
  resortLodges: 0,
  nightLighting: 0,
  weatherControl: 0
};

/* ---------------------- Player Object ---------------------- */
let player = {
  x: canvas.width / 2,
  absY: 0,
  width: 20,
  height: 20,
  velocityY: 0,
  xVel: 0,
  collisions: 0,
  bestTime: Infinity,
  money: TWEAK.starterCash
};
let maxCollisions = TWEAK.baseCollisionsAllowed + playerUpgrades.sledDurability;
let downhillStartTime = null;
let lastTime = 0;

/* ---------------------- Key Input ---------------------- */
let keysDown = {};

/* ---------------------- Upgrade Cost & Money Display Functions ---------------------- */
function getUpgradeCost(upgradeKey, currentLevel) {
  return Math.floor(100 * Math.pow(1.1, currentLevel + 1));
}

function updateMoneyDisplay() {
  const moneyText = document.getElementById("moneyText");
  if (moneyText) {
    moneyText.textContent = "Money: $" + player.money;
  }
}

function getUpgradeDisplayText(upgradeKey, currentLevel, maxLevel) {
  let text = formatUpgradeName(upgradeKey) + ` (Lv ${currentLevel}/${maxLevel})`;
  if (maxLevel > 0 && currentLevel < maxLevel) {
    let cost = getUpgradeCost(upgradeKey, currentLevel);
    text += " – Cost: $" + cost;
  }
  return text;
}

function initUpgradeButton(upgradeKey, upgradeValue) {
  const maxLevel = upgradeMaxLevel[upgradeKey];
  const btnId = `upgrade${capitalizeFirstLetter(upgradeKey)}`;
  const button = document.getElementById(btnId);
  button.innerText = getUpgradeDisplayText(upgradeKey, upgradeValue, maxLevel);
  if (maxLevel === 0 || upgradeValue >= maxLevel) {
    button.disabled = true;
  }
}

/* ---------------------- Helper: Format & Capitalize ---------------------- */
function formatUpgradeName(name) {
  let formattedName = name.replace(/([A-Z])/g, ' $1').trim();
  return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
}
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/* ---------------------- MISSING FUNCTION: Purchase Upgrade ---------------------- */
function purchaseUpgrade(upgradeType, upgradeKey) {
  const currentLevel = upgradeType[upgradeKey];
  const maxLevel = upgradeMaxLevel[upgradeKey];
  if (maxLevel === 0 || currentLevel >= maxLevel) {
    console.log("Upgrade", upgradeKey, "is locked or already maxed.");
    return;
  }
  const cost = getUpgradeCost(upgradeKey, currentLevel);
  if (player.money < cost) {
    console.log("Not enough money to purchase", upgradeKey, ". Cost:", cost, "Money:", player.money);
    return;
  }
  player.money -= cost;
  upgradeType[upgradeKey]++;
  const newLevel = upgradeType[upgradeKey];
  const btnId = `upgrade${capitalizeFirstLetter(upgradeKey)}`;
  document.getElementById(btnId).innerText = getUpgradeDisplayText(upgradeKey, newLevel, maxLevel);
  if (newLevel >= maxLevel) {
    document.getElementById(btnId).disabled = true;
  }
  updateMoneyDisplay();
  console.log("Purchased upgrade", upgradeKey, "New level:", newLevel, "Remaining money:", player.money);
}

/* ---------------------- Collision Resolution for UPHILL ---------------------- */
function resolveCollision(player, obstacle) {
  let playerCenterX = player.x;
  let playerCenterY = player.absY;
  let obstacleCenterX = obstacle.x + obstacle.width / 2;
  let obstacleCenterY = obstacle.y + obstacle.height / 2;
  let halfWidthPlayer = player.width / 2;
  let halfWidthObstacle = obstacle.width / 2;
  let halfHeightPlayer = player.height / 2;
  let halfHeightObstacle = obstacle.height / 2;
  let dx = playerCenterX - obstacleCenterX;
  let dy = playerCenterY - obstacleCenterY;
  let overlapX = halfWidthPlayer + halfWidthObstacle - Math.abs(dx);
  let overlapY = halfHeightPlayer + halfHeightObstacle - Math.abs(dy);
  if (overlapX < 0 || overlapY < 0) return;
  if (overlapX < overlapY) {
    if (dx > 0) {
      player.x += overlapX * 0.3;
    } else {
      player.x -= overlapX * 0.3;
    }
  } else {
    if (dy > 0) {
      player.absY += overlapY * 0.3;
    } else {
      player.absY -= overlapY * 0.3;
    }
  }
}

/* ---------------------- Terrain Generation ---------------------- */
function generateTerrain() {
  terrain = [];
  for (let i = 0; i < obstacleCount; i++) {
    let obstacle = {
      x: Math.random() * (canvas.width - 70) + 10,
      y: Math.random() * mountainHeight,
      width: 30 + Math.random() * 40,
      height: 10 + Math.random() * 20
    };
    terrain.push(obstacle);
  }
  terrain.sort((a, b) => a.y - b.y);
}

/* ---------------------- Award Money Function ---------------------- */
function awardMoney() {
  let runTime = (performance.now() - downhillStartTime) / 1000;
  if (runTime === 0) runTime = 1;
  let distanceFactor = Math.pow(player.absY / mountainHeight, 2);
  let timeFactor = 30 / runTime;
  let moneyEarned = Math.floor(100 * distanceFactor * timeFactor);
  console.log("Awarding money: $" + moneyEarned, "(Distance factor:", distanceFactor, "Time factor:", timeFactor, ")");
  player.money += moneyEarned;
}

/* ---------------------- State Management ---------------------- */
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
    // For a new run, if it's a full run, set absY to 0; for partial runs, retain the position.
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

/* ---------------------- Input Listeners ---------------------- */
document.addEventListener("keydown", (e) => { keysDown[e.key] = true; });
document.addEventListener("keyup", (e) => { keysDown[e.key] = false; });

/* ---------------------- Collision Helpers ---------------------- */
function checkCollision(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
function getCameraOffset() {
  let offset = player.absY - canvas.height / 2;
  return clamp(offset, 0, mountainHeight - canvas.height);
}

/* ---------------------- Update & Draw Functions ---------------------- */
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
    for (let obstacle of terrain) {
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
    }
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
    
    for (let obstacle of terrain) {
      if (checkCollision(
          player.x - player.width / 2, player.absY - player.height / 2,
          player.width, player.height,
          obstacle.x, obstacle.y,
          obstacle.width, obstacle.height
        )) {
        console.log("Collision detected on uphill.");
        resolveCollision(player, obstacle);
      }
    }
    if (player.absY <= 0) {
      player.absY = 0;
      changeState(GameState.HOUSE);
    }
  }
}

function draw() {
  if (currentState === GameState.DOWNHILL || currentState === GameState.UPHILL) {
    let cameraOffset = getCameraOffset();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = currentState === GameState.DOWNHILL ? "#ADD8E6" : "#98FB98";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    terrain.forEach(obstacle => {
      if (obstacle.y >= cameraOffset - 50 && obstacle.y <= cameraOffset + canvas.height + 50) {
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(obstacle.x, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
      }
    });
    let playerDrawY = player.absY - cameraOffset;
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(player.x - player.width / 2, playerDrawY - player.height / 2, player.width, player.height);
  }
}

function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  update(deltaTime);
  draw();
  requestAnimationFrame(gameLoop);
}

/* ---------------------- Initialization (Run Immediately) ---------------------- */
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

