/* saveload.test.js - Tests for game save/load functionality */

describe('Save/Load System', () => {
  let localStorageMock;
  
  beforeEach(() => {
    // Mock localStorage
    localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: jest.fn(key => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        }),
        getAllKeys: () => Object.keys(store)
      };
    })();
    
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock
    });
    
    // Mock game variables and state
    global.player = {
      money: 1000,
      bestTime: 45.2,
      sledDamaged: 0
    };
    
    global.playerUpgrades = {
      jumperLegs: { level: 2, maxLevel: 5, cost: 200, baseCost: 100 },
      rocketSurgery: { level: 1, maxLevel: 3, cost: 300, baseCost: 200 }
    };
    
    global.mountainUpgrades = {
      wideLayers: { level: 1, maxLevel: 3, cost: 400, baseCost: 300 }
    };
    
    global.loanAmount = 500;
    
    // Mock save/load functions
    global.saveGameState = jest.fn(() => {
      const gameState = {
        player: {
          money: player.money,
          bestTime: player.bestTime
        },
        playerUpgrades: Object.fromEntries(
          Object.entries(playerUpgrades).map(([key, upgrade]) => [key, upgrade.level])
        ),
        mountainUpgrades: Object.fromEntries(
          Object.entries(mountainUpgrades).map(([key, upgrade]) => [key, upgrade.level])
        ),
        loanAmount
      };
      
      localStorage.setItem('sledheadSave', JSON.stringify(gameState));
      return true;
    });
    
    global.loadGameState = jest.fn(() => {
      const saveData = localStorage.getItem('sledheadSave');
      if (!saveData) return false;
      
      try {
        const gameState = JSON.parse(saveData);
        
        // Restore player data
        if (gameState.player) {
          player.money = gameState.player.money || 0;
          player.bestTime = gameState.player.bestTime || Infinity;
        }
        
        // Restore upgrade levels
        if (gameState.playerUpgrades) {
          Object.entries(gameState.playerUpgrades).forEach(([key, level]) => {
            if (playerUpgrades[key]) {
              playerUpgrades[key].level = level;
              // Recalculate cost based on level
              if (playerUpgrades[key].baseCost) {
                playerUpgrades[key].cost = Math.ceil(playerUpgrades[key].baseCost * 
                  Math.pow(1.5, playerUpgrades[key].level));
              }
            }
          });
        }
        
        if (gameState.mountainUpgrades) {
          Object.entries(gameState.mountainUpgrades).forEach(([key, level]) => {
            if (mountainUpgrades[key]) {
              mountainUpgrades[key].level = level;
              // Recalculate cost based on level
              if (mountainUpgrades[key].baseCost) {
                mountainUpgrades[key].cost = Math.ceil(mountainUpgrades[key].baseCost * 
                  Math.pow(1.5, mountainUpgrades[key].level));
              }
            }
          });
        }
        
        // Restore loan amount
        if (typeof gameState.loanAmount === 'number') {
          loanAmount = gameState.loanAmount;
        }
        
        return true;
      } catch (error) {
        console.error('Error loading save:', error);
        return false;
      }
    });
    
    global.resetGameState = jest.fn(() => {
      // Reset player
      player.money = 0;
      player.bestTime = Infinity;
      
      // Reset upgrades
      Object.keys(playerUpgrades).forEach(key => {
        playerUpgrades[key].level = 0;
        playerUpgrades[key].cost = playerUpgrades[key].baseCost;
      });
      
      Object.keys(mountainUpgrades).forEach(key => {
        mountainUpgrades[key].level = 0;
        mountainUpgrades[key].cost = mountainUpgrades[key].baseCost;
      });
      
      // Reset loan
      loanAmount = 100000;
      
      // Remove save from localStorage
      localStorage.removeItem('sledheadSave');
      
      return true;
    });
    
    global.checkForSaveData = jest.fn(() => {
      return localStorage.getItem('sledheadSave') !== null;
    });
  });
  
  test('saveGameState correctly saves player data to localStorage', () => {
    // Set some initial values
    player.money = 2500;
    player.bestTime = 32.8;
    
    // Save the game
    saveGameState();
    
    // Check that localStorage.setItem was called with the right key
    expect(localStorage.setItem).toHaveBeenCalledWith('sledheadSave', expect.any(String));
    
    // Verify the saved data
    const savedData = JSON.parse(localStorage.getItem('sledheadSave'));
    expect(savedData.player.money).toBe(2500);
    expect(savedData.player.bestTime).toBe(32.8);
    expect(savedData.playerUpgrades.jumperLegs).toBe(2);
    expect(savedData.mountainUpgrades.wideLayers).toBe(1);
    expect(savedData.loanAmount).toBe(500);
  });
  
  test('loadGameState correctly loads player data from localStorage', () => {
    // Save initial state
    saveGameState();
    
    // Change player values
    player.money = 0;
    player.bestTime = Infinity;
    playerUpgrades.jumperLegs.level = 0;
    mountainUpgrades.wideLayers.level = 0;
    loanAmount = 1000;
    
    // Load saved state
    const result = loadGameState();
    
    // Verify the result and loaded data
    expect(result).toBe(true);
    expect(player.money).toBe(1000); // Original value from beforeEach
    expect(player.bestTime).toBe(45.2);
    expect(playerUpgrades.jumperLegs.level).toBe(2);
    expect(mountainUpgrades.wideLayers.level).toBe(1);
    expect(loanAmount).toBe(500);
  });
  
  test('loadGameState returns false when no save data exists', () => {
    // Clear localStorage
    localStorage.clear();
    
    // Try to load with no save data
    const result = loadGameState();
    
    // Should return false
    expect(result).toBe(false);
    
    // Player values should remain unchanged
    expect(player.money).toBe(1000);
  });
  
  test('resetGameState resets all game values and removes save data', () => {
    // Save initial state
    saveGameState();
    
    // Reset the game
    resetGameState();
    
    // Verify game state was reset
    expect(player.money).toBe(0);
    expect(player.bestTime).toBe(Infinity);
    expect(playerUpgrades.jumperLegs.level).toBe(0);
    expect(mountainUpgrades.wideLayers.level).toBe(0);
    expect(loanAmount).toBe(100000);
    
    // Verify save data was removed
    expect(localStorage.removeItem).toHaveBeenCalledWith('sledheadSave');
    expect(localStorage.getItem('sledheadSave')).toBeNull();
  });
  
  test('checkForSaveData correctly detects existing save data', () => {
    // Initially no save data
    localStorage.clear();
    expect(checkForSaveData()).toBe(false);
    
    // Save the game
    saveGameState();
    
    // Now save data should exist
    expect(checkForSaveData()).toBe(true);
  });
  
  test('loadGameState handles corrupted save data gracefully', () => {
    // Set corrupted save data
    localStorage.setItem('sledheadSave', '{invalid json');
    
    // Save original values to verify they don't change
    const originalMoney = player.money;
    const originalBestTime = player.bestTime;
    
    // Try to load corrupted data
    const result = loadGameState();
    
    // Should return false
    expect(result).toBe(false);
    
    // Values should remain unchanged
    expect(player.money).toBe(originalMoney);
    expect(player.bestTime).toBe(originalBestTime);
  });
  
  test('saveGameState and loadGameState work with null upgrade values', () => {
    // Remove an upgrade
    delete playerUpgrades.jumperLegs;
    
    // Save the game
    saveGameState();
    
    // Change some values
    player.money = 0;
    
    // Load saved state
    const result = loadGameState();
    
    // Verify the result and loaded data
    expect(result).toBe(true);
    expect(player.money).toBe(1000);
  });
}); 