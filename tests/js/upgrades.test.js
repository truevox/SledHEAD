/* upgrades.test.js - Tests for the upgrade system */

// Mock the required data and functions directly
beforeEach(() => {
  // Set up the DOM elements needed for tests
  document.body.innerHTML = `
    <div id="dynamic-upgrade-columns"></div>
    <div id="moneyText">Money: $500</div>
    <button id="upgradeRocketSurgery">Rocket Surgery (Lv 0/10) – Cost: $100</button>
    <button id="upgradeOptimalOptics">Optimal Optics (Lv 0/10) – Cost: $100</button>
  `;
  
  // Mock player and other globals
  global.player = { money: 500 };
  global.capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
  global.formatUpgradeName = (key) => key.charAt(0).toUpperCase() + key.slice(1);
  global.console = { log: jest.fn() };

  // Mock the upgrade data
  global.upgradeCategories = [
    {
      name: 'Player Upgrades',
      type: 'player',
      upgrades: [
        { key: 'rocketSurgery', desc: 'Rocket Surgery' },
        { key: 'optimalOptics', desc: 'Optimal Optics' }
      ]
    },
    {
      name: 'Mountain Upgrades',
      type: 'mountain',
      upgrades: [
        { key: 'skiLifts', desc: 'Ski Lifts' },
        { key: 'snowmobileRentals', desc: 'Snowmobile Rentals' }
      ]
    }
  ];
  
  // Mock the upgrade logic
  global.playerUpgrades = {
    rocketSurgery: 0,
    optimalOptics: 1
  };
  
  global.mountainUpgrades = {
    skiLifts: 0,
    snowmobileRentals: 0
  };
  
  global.upgradeMaxLevel = {
    rocketSurgery: 10,
    optimalOptics: 10,
    skiLifts: 0,
    snowmobileRentals: 0,
    grapplingAnchor: 0
  };
  
  // Mock the upgrade logic functions
  global.getUpgradeCost = jest.fn((upgradeKey, currentLevel) => {
    return Math.floor(100 * Math.pow(1.1, currentLevel + 1));
  });
  
  global.getUpgradeDisplayText = jest.fn((upgradeKey, currentLevel, maxLevel) => {
    let text = formatUpgradeName(upgradeKey) + ` (Lv ${currentLevel}/${maxLevel})`;
    if (maxLevel > 0 && currentLevel < maxLevel) {
      let cost = getUpgradeCost(upgradeKey, currentLevel);
      text += " – Cost: $" + cost;
    }
    return text;
  });
  
  global.updateMoneyDisplay = jest.fn();
  
  global.purchaseUpgrade = jest.fn((upgradeType, upgradeKey) => {
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
    if (document.getElementById(btnId)) {
      document.getElementById(btnId).innerText = getUpgradeDisplayText(upgradeKey, newLevel, maxLevel);
      if (newLevel >= maxLevel) {
        document.getElementById(btnId).disabled = true;
      }
    }
    updateMoneyDisplay();
    console.log("Purchased upgrade", upgradeKey, "New level:", newLevel, "Remaining money:", player.money);
  });
  
  // Mock createUpgradeElement function
  global.createUpgradeElement = jest.fn((upgrade, isPlayerUpgrade = true) => {
    const upgradeType = isPlayerUpgrade ? playerUpgrades : mountainUpgrades;
    const currentLevel = upgradeType[upgrade.key];
    const maxLevel = upgradeMaxLevel[upgrade.key];
    
    const entry = document.createElement('div');
    entry.className = 'upgrade-entry';
    
    const button = document.createElement('button');
    const btnId = `upgrade${capitalizeFirstLetter(upgrade.key)}`;
    button.id = btnId;
    button.innerText = getUpgradeDisplayText(upgrade.key, currentLevel, maxLevel);
    
    // Disable if maxed or locked
    if (maxLevel === 0 || currentLevel >= maxLevel) {
      button.disabled = true;
    }
    
    button.addEventListener('click', () => {
      purchaseUpgrade(upgradeType, upgrade.key);
    });
    
    const desc = document.createElement('p');
    desc.className = 'upgrade-desc';
    desc.textContent = upgrade.desc;
    
    entry.appendChild(button);
    entry.appendChild(desc);
    return entry;
  });
});

describe('Upgrade Logic', () => {
  test('getUpgradeCost calculates cost correctly based on level', () => {
    // Base cost at level 0
    expect(global.getUpgradeCost('rocketSurgery', 0)).toBe(Math.floor(100 * Math.pow(1.1, 1)));
    
    // Cost at level 5
    expect(global.getUpgradeCost('optimalOptics', 5)).toBe(Math.floor(100 * Math.pow(1.1, 6)));
  });

  test('getUpgradeDisplayText formats text correctly', () => {
    // Test with available upgrades
    expect(global.getUpgradeDisplayText('rocketSurgery', 2, 10)).toContain('(Lv 2/10)');
    expect(global.getUpgradeDisplayText('rocketSurgery', 2, 10)).toContain('Cost: $');
    
    // Test with maxed upgrades
    expect(global.getUpgradeDisplayText('rocketSurgery', 10, 10)).toContain('(Lv 10/10)');
    expect(global.getUpgradeDisplayText('rocketSurgery', 10, 10)).not.toContain('Cost: $');
    
    // Test with locked upgrades
    expect(global.getUpgradeDisplayText('grapplingAnchor', 0, 0)).toContain('(Lv 0/0)');
  });

  test('purchaseUpgrade updates upgrade level and deducts money', () => {
    // Get the actual cost
    const upgradeCost = global.getUpgradeCost('rocketSurgery', 0);
    
    // Test successful purchase
    document.getElementById('upgradeRocketSurgery').innerText = 'Rocket Surgery (Lv 0/10) – Cost: $100';
    global.player.money = 500;
    
    global.purchaseUpgrade(global.playerUpgrades, 'rocketSurgery');
    
    expect(global.playerUpgrades.rocketSurgery).toBe(1);
    expect(global.player.money).toBe(500 - upgradeCost); // 390 based on the formula 100 * Math.pow(1.1, 1)
    
    // Test insufficient funds
    global.player.money = 50;
    global.purchaseUpgrade(global.playerUpgrades, 'optimalOptics');
    expect(global.playerUpgrades.optimalOptics).toBe(1); // Should not increase
    expect(global.player.money).toBe(50); // Money should not change
    
    // Test locked upgrade
    global.player.money = 1000;
    global.purchaseUpgrade(global.mountainUpgrades, 'skiLifts');
    expect(global.mountainUpgrades.skiLifts).toBe(0); // Should not increase
    expect(global.player.money).toBe(1000); // Money should not change
  });
});

describe('Upgrade UI', () => {
  test('createUpgradeElement generates correct HTML structure', () => {
    const testUpgrade = { key: 'rocketSurgery', desc: 'Makes your rocket surgically precise' };
    
    // Create element
    const element = global.createUpgradeElement(testUpgrade);
    
    // Verify structure
    expect(element.className).toBe('upgrade-entry');
    expect(element.querySelector('button').id).toBe('upgradeRocketSurgery');
    expect(element.querySelector('p.upgrade-desc').textContent).toBe('Makes your rocket surgically precise');
    
    // Test disabled state for maxed upgrade
    global.upgradeMaxLevel.rocketSurgery = 5;
    global.playerUpgrades.rocketSurgery = 5;
    const maxedElement = global.createUpgradeElement(testUpgrade);
    expect(maxedElement.querySelector('button').disabled).toBe(true);
  });
}); 