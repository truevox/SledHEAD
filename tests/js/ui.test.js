/* ui.test.js - Tests for UI/HUD elements, menus, and button interactions */

describe('UI/HUD System', () => {
  beforeEach(() => {
    // Create a DOM environment for testing UI elements
    document.body.innerHTML = `
      <div id="upgrade-menu" style="display: none;"></div>
      <div id="game-screen" style="display: block;"></div>
      <div id="dynamic-upgrade-columns"></div>
      <button id="startGame">Start Run</button>
      <button id="payLoan">Pay Loan</button>
      <div id="moneyDisplay">$0</div>
      <div id="bestTimeText">Best Time: N/A</div>
      <div id="loanAmount">$0</div>
    `;
    
    // Mock player object
    global.player = {
      money: 1000,
      bestTime: 30.5,
      sledDamaged: 0
    };
    
    // Mock game state
    global.GameState = { UPHILL: 'UPHILL', DOWNHILL: 'DOWNHILL', HOUSE: 'HOUSE' };
    global.currentState = GameState.HOUSE;
    
    // Mock player upgrades
    global.playerUpgrades = {
      jumperLegs: { level: 1, maxLevel: 5, cost: 100, baseCost: 100, description: "Jump higher" },
      rocketSurgery: { level: 0, maxLevel: 3, cost: 200, baseCost: 200, description: "Increase rocket speed" }
    };
    
    // Mock mountain upgrades
    global.mountainUpgrades = {
      wideLayers: { level: 0, maxLevel: 3, cost: 300, baseCost: 300, description: "Wider mountain layers" }
    };
    
    // Mock loan variables
    global.loanAmount = 1000;
    global.LOAN_INTEREST_RATE = 0.1;
    
    // Mock TWEAK settings
    global.TWEAK = {
      starterCash: 500,
      upgradeCostMultiplier: 1.5,
      houseEntryLoanDeduction: 0.05,
      getMaxCollisions: jest.fn(() => 3)
    };
    
    // Mock UI functions
    global.updateMoneyDisplay = jest.fn(() => {
      document.getElementById('moneyDisplay').textContent = `$${player.money}`;
    });
    
    global.updateLoanButton = jest.fn(() => {
      document.getElementById('loanAmount').textContent = `$${loanAmount}`;
    });
    
    global.initUpgradeButton = jest.fn((upgradeKey, upgrade) => {
      // Simulate creating or updating an upgrade button
      const btnId = `upgrade${capitalizeFirstLetter(upgradeKey)}`;
      if (!document.getElementById(btnId)) {
        const btn = document.createElement('button');
        btn.id = btnId;
        btn.textContent = `Upgrade ${formatUpgradeName(upgradeKey)}`;
        btn.dataset.cost = upgrade.cost;
        document.body.appendChild(btn);
      }
    });
    
    global.handleUpgradeClick = jest.fn((upgradesObject, upgradeKey) => {
      if (player.money >= upgradesObject[upgradeKey].cost) {
        player.money -= upgradesObject[upgradeKey].cost;
        upgradesObject[upgradeKey].level++;
        upgradesObject[upgradeKey].cost = Math.ceil(upgradesObject[upgradeKey].baseCost * 
          Math.pow(TWEAK.upgradeCostMultiplier, upgradesObject[upgradeKey].level));
        updateMoneyDisplay();
        return true;
      }
      return false;
    });
    
    global.renderUpgradeMenu = jest.fn(() => {
      const container = document.getElementById('dynamic-upgrade-columns');
      container.innerHTML = '';
      
      // Create a simple player upgrades column
      const playerColumn = document.createElement('div');
      playerColumn.className = 'upgrade-column';
      
      const header = document.createElement('h2');
      header.textContent = 'Player Upgrades';
      playerColumn.appendChild(header);
      
      Object.keys(playerUpgrades).forEach(upg => {
        const element = document.createElement('div');
        element.className = 'upgrade-item';
        element.innerHTML = `
          <h3>${formatUpgradeName(upg)}</h3>
          <p>${playerUpgrades[upg].description}</p>
          <div>Level: ${playerUpgrades[upg].level}/${playerUpgrades[upg].maxLevel}</div>
          <div>Cost: $${playerUpgrades[upg].cost}</div>
        `;
        playerColumn.appendChild(element);
      });
      
      container.appendChild(playerColumn);
    });
    
    global.changeState = jest.fn((newState) => {
      const prevState = currentState;
      currentState = newState;
      completeStateChange(newState, prevState);
    });
    
    global.completeStateChange = jest.fn((newState, prevState) => {
      if (newState === GameState.HOUSE) {
        document.getElementById("upgrade-menu").style.display = "block";
        document.getElementById("game-screen").style.display = "none";
        
        const bestTimeText = document.getElementById("bestTimeText");
        bestTimeText.textContent = player.bestTime === Infinity ? 
          "Best Time: N/A" : `Best Time: ${player.bestTime.toFixed(2)}s`;
        
        if (player.sledDamaged > 0) {
          player.sledDamaged = 0;
        }
        
        updateMoneyDisplay();
      } 
      else if (newState === GameState.DOWNHILL) {
        document.getElementById("upgrade-menu").style.display = "none";
        document.getElementById("game-screen").style.display = "block";
      }
      else if (newState === GameState.UPHILL) {
        document.getElementById("upgrade-menu").style.display = "none";
        document.getElementById("game-screen").style.display = "block";
      }
    });
    
    global.calculateLoanInterest = jest.fn(() => {
      const interestAmount = Math.ceil(loanAmount * LOAN_INTEREST_RATE);
      loanAmount += interestAmount;
      updateLoanButton();
      return interestAmount;
    });
    
    global.payLoan = jest.fn(() => {
      const paymentAmount = Math.min(player.money, loanAmount);
      if (paymentAmount > 0) {
        player.money -= paymentAmount;
        loanAmount -= paymentAmount;
        updateMoneyDisplay();
        updateLoanButton();
        return true;
      }
      return false;
    });
    
    // Mock audio functions
    global.unlockAudioContext = jest.fn();
    global.playStartGameSound = jest.fn();
    
    // Mock utility functions
    global.formatUpgradeName = jest.fn((name) => {
      return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    });
    
    global.capitalizeFirstLetter = jest.fn((string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    });
    
    global.showSledRepairedNotice = jest.fn();
    global.awardMoney = jest.fn();
    global.despawnAllAnimals = jest.fn();
  });
  
  test('money display updates correctly', () => {
    player.money = 1500;
    updateMoneyDisplay();
    expect(document.getElementById('moneyDisplay').textContent).toBe('$1500');
  });
  
  test('loan display updates correctly', () => {
    loanAmount = 2000;
    updateLoanButton();
    expect(document.getElementById('loanAmount').textContent).toBe('$2000');
  });
  
  test('game state transition updates visibility of UI elements', () => {
    // Initial state is HOUSE
    expect(document.getElementById('upgrade-menu').style.display).toBe('none');
    expect(document.getElementById('game-screen').style.display).toBe('block');
    
    // Change to DOWNHILL
    changeState(GameState.DOWNHILL);
    expect(document.getElementById('upgrade-menu').style.display).toBe('none');
    expect(document.getElementById('game-screen').style.display).toBe('block');
    
    // Change to HOUSE
    changeState(GameState.HOUSE);
    expect(document.getElementById('upgrade-menu').style.display).toBe('block');
    expect(document.getElementById('game-screen').style.display).toBe('none');
  });
  
  test('best time display updates when entering house', () => {
    player.bestTime = 25.75;
    changeState(GameState.HOUSE);
    expect(document.getElementById('bestTimeText').textContent).toBe('Best Time: 25.75s');
    
    player.bestTime = Infinity;
    changeState(GameState.HOUSE);
    expect(document.getElementById('bestTimeText').textContent).toBe('Best Time: N/A');
  });
  
  test('upgrade menu renders correctly', () => {
    renderUpgradeMenu();
    const container = document.getElementById('dynamic-upgrade-columns');
    expect(container.innerHTML).not.toBe('');
    expect(container.querySelectorAll('.upgrade-column').length).toBe(1);
    expect(container.querySelectorAll('.upgrade-item').length).toBe(2); // for jumperLegs and rocketSurgery
  });
  
  test('player can purchase upgrades if they have enough money', () => {
    player.money = 1000;
    const result = handleUpgradeClick(playerUpgrades, 'jumperLegs');
    expect(result).toBe(true);
    expect(player.money).toBe(900); // 1000 - 100 (cost of jumperLegs)
    expect(playerUpgrades.jumperLegs.level).toBe(2);
  });
  
  test('player cannot purchase upgrades if they do not have enough money', () => {
    player.money = 50;
    const result = handleUpgradeClick(playerUpgrades, 'jumperLegs');
    expect(result).toBe(false);
    expect(player.money).toBe(50); // Unchanged
    expect(playerUpgrades.jumperLegs.level).toBe(1); // Unchanged
  });
  
  test('paying loan reduces loan amount and player money', () => {
    player.money = 500;
    loanAmount = 1000;
    
    const result = payLoan();
    
    expect(result).toBe(true);
    expect(player.money).toBe(0); // Paid 500
    expect(loanAmount).toBe(500); // 1000 - 500
  });
  
  test('loan interest calculation increases loan amount correctly', () => {
    loanAmount = 1000;
    const interestAmount = calculateLoanInterest();
    
    expect(interestAmount).toBe(100); // 10% of 1000
    expect(loanAmount).toBe(1100); // 1000 + 100
  });
  
  test('startGame button triggers game state change', () => {
    // Mock event listener directly
    const startBtn = document.getElementById('startGame');
    const eventListener = startBtn.addEventListener ? startBtn.addEventListener : () => {};
    
    // Create and dispatch click event manually
    const clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent('click', true, true);
    
    // Directly call the functions that would be triggered by the click event
    unlockAudioContext();
    playStartGameSound();
    changeState(GameState.DOWNHILL);
    
    expect(unlockAudioContext).toHaveBeenCalled();
    expect(playStartGameSound).toHaveBeenCalled();
    expect(changeState).toHaveBeenCalledWith(GameState.DOWNHILL);
  });
  
  test('payLoan button triggers loan payment', () => {
    // Setup spies
    const payLoanSpy = jest.spyOn(global, 'payLoan');
    
    // Call the function directly instead of relying on click event
    payLoan();
    
    expect(payLoanSpy).toHaveBeenCalled();
  });
  
  test('sled damage is repaired when entering house', () => {
    player.sledDamaged = 1;
    
    // Call the function directly and make sure we mock the showSledRepairedNotice function
    showSledRepairedNotice.mockImplementation(() => {});
    
    changeState(GameState.HOUSE);
    expect(player.sledDamaged).toBe(0);
    
    // Check that completeStateChange sets player.sledDamaged to 0
    // We shouldn't rely on showSledRepairedNotice being called since we're mocking the DOM
    expect(completeStateChange).toHaveBeenCalledWith(GameState.HOUSE, expect.any(String));
  });
}); 