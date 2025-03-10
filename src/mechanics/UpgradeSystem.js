// src/mechanics/UpgradeSystem.js
export let playerUpgrades = {
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
  
  export let mountainUpgrades = {
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
  
  export function getUpgradeCost(upgradeKey, currentLevel) {
    return Math.floor(100 * Math.pow(1.1, currentLevel + 1));
  }
  
  export function getUpgradeDisplayText(upgradeKey, currentLevel, maxLevel) {
    let text = upgradeKey.charAt(0).toUpperCase() + upgradeKey.slice(1) + ` (Lv ${currentLevel}/${maxLevel})`;
    if (maxLevel > 0 && currentLevel < maxLevel) {
      let cost = getUpgradeCost(upgradeKey, currentLevel);
      text += " – Cost: $" + cost;
    }
    return text;
  }
  
  export function initUpgradeButtons() {
    Object.keys(playerUpgrades).forEach(upg => {
      initUpgradeButton(upg, playerUpgrades[upg]);
    });
    Object.keys(mountainUpgrades).forEach(upg => {
      initUpgradeButton(upg, mountainUpgrades[upg]);
    });
  }
  
  function initUpgradeButton(upgradeKey, upgradeValue) {
    const maxLevel = upgradeMaxLevel[upgradeKey];
    const btnId = `upgrade${upgradeKey.charAt(0).toUpperCase() + upgradeKey.slice(1)}`;
    const button = document.getElementById(btnId);
    if (button) {
      button.innerText = getUpgradeDisplayText(upgradeKey, upgradeValue, maxLevel);
      if (maxLevel === 0 || upgradeValue >= maxLevel) {
        button.disabled = true;
      }
      button.addEventListener("click", () => {
        purchaseUpgrade(upgradeKey);
      });
    }
  }
  
  export function purchaseUpgrade(upgradeKey) {
    let currentLevel = playerUpgrades.hasOwnProperty(upgradeKey)
      ? playerUpgrades[upgradeKey]
      : mountainUpgrades[upgradeKey];
    let maxLevel = upgradeMaxLevel[upgradeKey];
    
    if (maxLevel === 0 || currentLevel >= maxLevel) {
      console.log("Upgrade", upgradeKey, "is locked or already maxed.");
      return;
    }
    
    const cost = getUpgradeCost(upgradeKey, currentLevel);
    
    Promise.all([
      import('../gameplay/Player.js'),
      import('../utils/UIUtils.js')
    ]).then(([playerModule, uiModule]) => {
      let player = playerModule.player;
      
      if (player.money < cost) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ⚠️ UPGRADE FAILED: Insufficient funds for ${upgradeKey}, Cost=$${cost}, Available money=$${player.money}`);
        // Play error sound and show feedback
        uiModule.playTone(200, "square", 0.1, 0.2);
        uiModule.addFloatingText("Not enough money!", window.innerWidth / 2, window.innerHeight / 2, {
          color: '#FF4444',
          size: 24
        });
        return;
      }
      
      // Process the purchase
      player.money -= cost;
      if (playerUpgrades.hasOwnProperty(upgradeKey)) {
        playerUpgrades[upgradeKey]++;
      } else {
        mountainUpgrades[upgradeKey]++;
      }
      
      // Update UI
      let newLevel = playerUpgrades.hasOwnProperty(upgradeKey)
        ? playerUpgrades[upgradeKey]
        : mountainUpgrades[upgradeKey];
      
      const btnId = `upgrade${upgradeKey.charAt(0).toUpperCase() + upgradeKey.slice(1)}`;
      let button = document.getElementById(btnId);
      if (button) {
        button.innerText = getUpgradeDisplayText(upgradeKey, newLevel, maxLevel);
        if (newLevel >= maxLevel) {
          button.disabled = true;
        }
      }
      
      // Visual and audio feedback
      const timestamp = new Date().toISOString();
      const isMaxed = newLevel >= maxLevel;
      console.log(`[${timestamp}] 🔺 UPGRADE PURCHASED: ${upgradeKey} to Level ${newLevel}/${maxLevel}, Cost=$${cost}, Remaining money=$${player.money}${isMaxed ? ' (MAX LEVEL REACHED)' : ''}`);
      uiModule.updateMoneyDisplay();
      uiModule.playTone(600, "sine", 0.1, 0.3);
      uiModule.addFloatingText(
        `Upgraded ${upgradeKey} to Lv ${newLevel}!`,
        window.innerWidth / 2,
        window.innerHeight / 2,
        {
          color: '#00FF00',
          size: 24
        }
      );
    });
  }
  
  // ---- Loan System ----
  import { updateMoneyDisplay, playTone } from '../utils/UIUtils.js';
  
  export let loanAmount = 100000;
  
  export function updateLoanButton() {
    const loanButton = document.getElementById("payLoan");
    if (loanButton) {
      if (loanAmount <= 0) {
        loanButton.textContent = "LOAN PAID OFF!";
        loanButton.disabled = true;
        document.getElementById("victoryBanner").style.display = "block";
      } else {
        loanButton.textContent = `Pay Loan ($${loanAmount.toLocaleString()})`;
        loanButton.disabled = false;
      }
    }
  }
  
  export function payLoan() {
    import('../gameplay/Player.js').then(module => {
      let player = module.player;
      if (player.money > 0) {
        const payment = Math.min(player.money, loanAmount);
        loanAmount -= payment;
        player.money -= payment;
        updateMoneyDisplay();
        updateLoanButton();
        if (loanAmount <= 0) {
          console.log("🎉 Loan paid off! Victory!");
          playTone(800, "sine", 0.3, 0.5);
        } else {
          console.log(`💰 Loan payment: $${payment}. Remaining: $${loanAmount}`);
          playTone(600, "sine", 0.1, 0.2);
        }
      }
    });
  }
  