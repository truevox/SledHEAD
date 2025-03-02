/* upgrades.js */
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
  