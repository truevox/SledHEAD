// js/upgradeLogic.js
// Using global utility functions instead of imports

// Track upgrade levels
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

// Make upgrade objects globally accessible
window.playerUpgrades = playerUpgrades;
window.mountainUpgrades = mountainUpgrades;

// Only the first four upgrades are enabled. All others are disabled with -1.
// -1 disables the upgrade button and makes it unavailable.
const upgradeMaxLevel = {
  rocketSurgery: 0, // 0 means infinite
  optimalOptics: 0,
  sledDurability: 0,
  fancierFootwear: 0,
  grapplingAnchor: -1,
  attendLegDay: 0,
  shortcutAwareness: -1,
  crowdHypeman: -1,
  crowdWeaver: -1,
  weatherWarrior: -1,
  skiLifts: -1,
  snowmobileRentals: -1,
  eateries: -1,
  groomedTrails: -1,
  firstAidStations: -1,
  scenicOverlooks: -1,
  advertisingRamps: -1,
  resortLodges: -1,
  nightLighting: -1,
  weatherControl: -1
};

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
  let maxDisplay = maxLevel === 0 ? '∞' : maxLevel;
  let text = formatUpgradeName(upgradeKey) + ` (Lv ${currentLevel}/${maxDisplay})`;
  // Show cost if not locked (maxLevel===0 means infinite)
  let showCost = (maxLevel === 0 || currentLevel < maxLevel);
  if (showCost) {
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
  // Only disable if upgrade is locked (should not for infinite)
  if (maxLevel > 0 && upgradeValue >= maxLevel) {
    button.disabled = true;
  } else {
    button.disabled = false;
  }
}

function purchaseUpgrade(upgradeType, upgradeKey) {
  const currentLevel = upgradeType[upgradeKey];
  const maxLevel = upgradeMaxLevel[upgradeKey];
  // Block if disabled (-1)
  if (maxLevel === -1) {
    if (typeof showErrorNotification === 'function') {
      showErrorNotification('This upgrade is unavailable.');
    } else {
      console.log("Upgrade", upgradeKey, "is disabled and cannot be purchased.");
    }
    return;
  }
  // Only block if locked (maxLevel > 0 and reached)
  if (maxLevel > 0 && currentLevel >= maxLevel) {
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
  if (maxLevel > 0 && newLevel >= maxLevel) {
    document.getElementById(btnId).disabled = true;
  }
  updateMoneyDisplay();
  console.log("Purchased upgrade", upgradeKey, "New level:", newLevel, "Remaining money:", player.money);
}

// Utility: Compute upgrade effect value with soft cap/diminishing returns
// Reads upgradeData.js for scaling info
import { upgradeCategories } from './upgradeData.js';
function getUpgradeEffect(upgradeKey, level) {
  // Find upgrade definition
  let upgradeDef = null;
  for (const cat of upgradeCategories) {
    const found = cat.upgrades.find(u => u.key === upgradeKey);
    if (found) { upgradeDef = found; break; }
  }
  if (!upgradeDef) return 1.0;
  const { softCap, scalingType, scalingFactor, baseValue } = upgradeDef;
  if (!scalingType || !scalingFactor || !baseValue) return 1.0;
  let effectiveLevel = level;
  if (softCap && level > softCap) {
    // Diminish scaling factor after soft cap
    effectiveLevel = softCap + (level - softCap) * 0.5;
  }
  if (scalingType === "sqrt") {
    return baseValue + scalingFactor * Math.sqrt(effectiveLevel);
  } else if (scalingType === "log") {
    return baseValue * (1 + scalingFactor * Math.log(effectiveLevel + 1));
  }
  return baseValue;
}

// Expose getUpgradeEffect globally for classic scripts
window.getUpgradeEffect = getUpgradeEffect;
// Export all necessary variables and functions
export {
  playerUpgrades,
  mountainUpgrades,
  upgradeMaxLevel,
  getUpgradeCost,
  getUpgradeDisplayText,
  initUpgradeButton,
  updateMoneyDisplay,
  purchaseUpgrade
};
