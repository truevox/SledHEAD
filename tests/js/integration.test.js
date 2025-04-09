/* integration.test.js - Tests for verifying multiple game systems work together properly */

describe('Game Integration', () => {
  beforeEach(() => {
    // Mock DOM environment
    document.body.innerHTML = `
      <div id="upgrade-menu" style="display: none;"></div>
      <div id="game-screen" style="display: block;"></div>
      <div id="moneyDisplay">$0</div>
      <div id="bestTimeText">Best Time: N/A</div>
      <div id="loanAmount">$0</div>
    `;
    
    // Setup game variables and state
    global.canvas = { width: 800, height: 450 };
    global.ctx = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      closePath: jest.fn(),
      save: jest.fn(),
      restore: jest.fn()
    };
    
    // Game state
    global.GameState = { UPHILL: 'UPHILL', DOWNHILL: 'DOWNHILL', HOUSE: 'HOUSE' };
    global.currentState = GameState.HOUSE;
    
    // Mock time functions
    global.performance = { now: jest.fn(() => Date.now()) };
    global.Date.now = jest.fn(() => 1000);
    
    // Player and mountain setup
    global.player = {
      x: 400,
      absY: 9000, // Near the top of the mountain
      width: 20,
      height: 20,
      velocityY: 0,
      xVel: 0,
      collisions: 0,
      money: 500,
      sledDamaged: 0,
      bestTime: Infinity,
      isJumping: false,
      jumpTimer: 0,
      jumpDuration: 500,
      isCharging: false,
      canJump: true,
      reHitActivated: false,
      trickState: 'none',
      currentTrick: null,
      trickTimer: 0,
      trickChainCount: 0,
      trickTotalTime: 0,
      lastTrick: null
    };
    
    // Mountain settings
    global.mountainHeight = 10000;
    global.terrain = [];
    global.activeAnimal = null;
    
    // Controls
    global.keysDown = {};
    
    // Mock TWEAK settings
    global.TWEAK = {
      baseGravity: 0.05,
      jumpForce: 1.5,
      jumpChargeFactor: 0.15,
      maxJumpCharge: 4.0,
      reHitWindowStart: 0.7,
      getMaxCollisions: jest.fn(() => 3),
      playerBaseSpeed: 1.2,
      defaultLayerWidth: 1000
    };
    
    // Game functions
    global.throttledLog = jest.fn();
    global.getLayerByY = jest.fn(y => {
      return { 
        id: Math.floor(y / 2000), 
        width: TWEAK.defaultLayerWidth, 
        startY: Math.floor(y / 2000) * 2000, 
        endY: (Math.floor(y / 2000) + 1) * 2000 
      };
    });
    
    global.updateMoneyDisplay = jest.fn(() => {
      document.getElementById('moneyDisplay').textContent = `$${player.money}`;
    });
    
    global.calculateWrappedX = jest.fn((x, width) => {
      return ((x % width) + width) % width;
    });
    
    global.calculateWrappedDistanceX = jest.fn((x1, x2, width) => {
      const direct = Math.abs(x1 - x2);
      const wrapped = width - direct;
      return Math.min(direct, wrapped);
    });
    
    global.checkCollision = jest.fn((ax, ay, aw, ah, bx, by, bw, bh, width) => {
      const yCollision = ay < by + bh && ay + ah > by;
      if (!yCollision) return false;
      
      if (!width) {
        return ax < bx + bw && ax + aw > bx;
      }
      
      // For cylinder collision
      const dX = calculateWrappedDistanceX(ax + aw/2, bx + bw/2, width);
      return dX < (aw + bw) / 2;
    });
    
    global.resolveCollision = jest.fn((player, obstacle) => {
      // Simplified for test - just move player away
      player.x += 10;
      player.absY -= 10;
      return player;
    });
    
    global.clamp = jest.fn((value, min, max) => {
      return Math.min(Math.max(value, min), max);
    });
    
    global.playCrashSound = jest.fn();
    global.playMoneyGainSound = jest.fn();
    global.drawBackground = jest.fn();
    global.drawEntities = jest.fn();
    global.render = jest.fn();
    
    // State management
    global.changeState = jest.fn((newState) => {
      const prevState = currentState;
      currentState = newState;
      completeStateChange(newState, prevState);
    });
    
    global.completeStateChange = jest.fn((newState, prevState) => {
      if (newState === GameState.HOUSE) {
        document.getElementById("upgrade-menu").style.display = "block";
        document.getElementById("game-screen").style.display = "none";
        
        if (player.sledDamaged > 0) {
          player.sledDamaged = 0;
        }
        
        updateMoneyDisplay();
      } 
      else if (newState === GameState.DOWNHILL) {
        document.getElementById("upgrade-menu").style.display = "none";
        document.getElementById("game-screen").style.display = "block";
        
        if (prevState === GameState.HOUSE) {
          player.collisions = 0;
          player.velocityY = 0;
          player.xVel = 0;
          global.downhillStartTime = performance.now();
          global.playerStartAbsY = player.absY;
        }
      }
      else if (newState === GameState.UPHILL) {
        document.getElementById("upgrade-menu").style.display = "none";
        document.getElementById("game-screen").style.display = "block";
        
        if (prevState === GameState.DOWNHILL) {
          awardMoney();
        }
        player.xVel = 0;
      }
    });
    
    global.awardMoney = jest.fn(() => {
      // Calculate money earned based on distance traveled
      const distanceTraveled = player.absY - global.playerStartAbsY;
      const moneyEarned = Math.floor(distanceTraveled * 0.1);
      player.money += moneyEarned;
      updateMoneyDisplay();
      playMoneyGainSound();
      return moneyEarned;
    });
    
    global.completeTrick = jest.fn((trickName) => {
      const trickValue = 100;
      const chainMultiplier = Math.min(player.trickChainCount, 5) * 0.2 + 1;
      const moneyEarned = Math.floor(trickValue * chainMultiplier);
      
      player.money += moneyEarned;
      player.lastTrick = trickName;
      player.trickChainCount++;
      
      updateMoneyDisplay();
      playMoneyGainSound();
      return moneyEarned;
    });
    
    global.resetTrickState = jest.fn(() => {
      player.trickState = 'none';
      player.currentTrick = null;
      player.trickTimer = 0;
      player.trickTotalTime = 0;
    });
    
    // Update functions
    global.updateDownhill = jest.fn((deltaTime) => {
      // Apply gravity
      player.velocityY += TWEAK.baseGravity;
      player.absY += player.velocityY * deltaTime;
      
      // Handle left-right movement
      if (keysDown['a'] || keysDown['ArrowLeft']) {
        player.x -= TWEAK.playerBaseSpeed * deltaTime;
      }
      if (keysDown['d'] || keysDown['ArrowRight']) {
        player.x += TWEAK.playerBaseSpeed * deltaTime;
      }
      
      // Handle jump
      if (keysDown[' '] && player.canJump && !player.isJumping) {
        if (!player.isCharging) {
          player.isCharging = true;
          player.jumpChargeTime = 0;
        } else {
          player.jumpChargeTime += deltaTime;
          if (player.jumpChargeTime >= TWEAK.maxJumpCharge) {
            startJump();
          }
        }
      } else if (player.isCharging && !keysDown[' ']) {
        startJump();
      }
      
      // Update jump
      if (player.isJumping) {
        player.jumpTimer += deltaTime;
        
        // Re-hit mechanic
        if (player.jumpTimer > player.jumpDuration * TWEAK.reHitWindowStart && 
            player.jumpTimer < player.jumpDuration && 
            keysDown[' '] && !player.reHitActivated) {
          player.reHitActivated = true;
          player.jumpTimer = player.jumpDuration * 0.5; // Reset to mid-point
        }
        
        // End jump
        if (player.jumpTimer >= player.jumpDuration) {
          player.isJumping = false;
          player.jumpTimer = 0;
          player.canJump = true;
          player.reHitActivated = false;
          resetTrickState();
        }
      }
      
      // Check trick keys
      checkTricks(deltaTime);
      
      // Check if player reached the bottom of the mountain
      if (player.absY >= mountainHeight) {
        player.absY = mountainHeight;
        awardMoney();
        changeState(GameState.HOUSE);
      }
      
      // Check collisions with terrain
      for (let i = 0; i < terrain.length; i++) {
        const obstacle = terrain[i];
        const obstacleLayer = getLayerByY(obstacle.y);
        
        if (checkCollision(
            player.x - player.width / 2, player.absY - player.height / 2,
            player.width, player.height,
            obstacle.x, obstacle.y,
            obstacle.width, obstacle.height,
            obstacleLayer.width
        )) {
          player.collisions++;
          playCrashSound();
          
          if (player.collisions >= TWEAK.getMaxCollisions()) {
            player.sledDamaged = 1;
          }
          
          changeState(GameState.UPHILL);
          return player;
        }
      }
      
      // Wrap x position within layer
      const currentLayer = getLayerByY(player.absY);
      player.x = calculateWrappedX(player.x, currentLayer.width);
      
      return player;
    });
    
    global.updateUphill = jest.fn((deltaTime) => {
      // Handle movement
      if (keysDown['w'] || keysDown['ArrowUp']) {
        player.absY -= TWEAK.playerBaseSpeed * deltaTime * 0.5;
      }
      if (keysDown['s'] || keysDown['ArrowDown']) {
        player.absY += TWEAK.playerBaseSpeed * deltaTime * 0.5;
      }
      if (keysDown['a'] || keysDown['ArrowLeft']) {
        player.x -= TWEAK.playerBaseSpeed * deltaTime * 0.5;
      }
      if (keysDown['d'] || keysDown['ArrowRight']) {
        player.x += TWEAK.playerBaseSpeed * deltaTime * 0.5;
      }
      
      // Constrain player Y to not move above the top of the mountain
      player.absY = Math.max(player.absY, 0);
      
      // Wrap x position within layer
      const currentLayer = getLayerByY(player.absY);
      player.x = calculateWrappedX(player.x, currentLayer.width);
      
      return player;
    });
    
    // Helper functions
    global.startJump = jest.fn(() => {
      const chargeBonus = Math.min(player.jumpChargeTime * TWEAK.jumpChargeFactor, TWEAK.maxJumpCharge);
      player.velocityY = -TWEAK.jumpForce - chargeBonus;
      player.isJumping = true;
      player.isCharging = false;
      player.canJump = false;
      player.jumpTimer = 0;
      player.jumpDuration = 500 + chargeBonus * 100;
      return player.velocityY;
    });
    
    global.checkTricks = jest.fn((deltaTime) => {
      if (!player.isJumping) return;
      
      // Only allow tricks during the middle of the jump
      const jumpProgress = player.jumpTimer / player.jumpDuration;
      if (jumpProgress < 0.2 || jumpProgress > 0.8) return;
      
      // Check trick inputs
      if (keysDown['1'] || keysDown['q']) {
        if (player.trickState === 'none') {
          player.trickState = 'start';
          player.currentTrick = 'leftHelicopter';
          player.trickTimer = 0;
        }
      }
      else if (keysDown['2'] || keysDown['z']) {
        if (player.trickState === 'none') {
          player.trickState = 'start';
          player.currentTrick = 'rightHelicopter'; 
          player.trickTimer = 0;
        }
      }
      else if (keysDown['3'] || keysDown['x']) {
        if (player.trickState === 'none') {
          player.trickState = 'start';
          player.currentTrick = 'airBrake';
          player.trickTimer = 0;
        }
      }
      else if (keysDown['4'] || keysDown['c']) {
        if (player.trickState === 'none') {
          player.trickState = 'start';
          player.currentTrick = 'parachute';
          player.trickTimer = 0;
        }
      }
      
      // Update trick state
      if (player.trickState !== 'none') {
        player.trickTimer += deltaTime;
        player.trickTotalTime += deltaTime;
        
        // Transition through trick phases
        if (player.trickState === 'start' && player.trickTimer > 200) {
          player.trickState = 'mid';
          player.trickTimer = 0;
        }
        else if (player.trickState === 'mid' && player.trickTimer > 300) {
          player.trickState = 'end';
          player.trickTimer = 0;
        }
        else if (player.trickState === 'end' && player.trickTimer > 200) {
          // Complete the trick
          completeTrick(player.currentTrick);
          resetTrickState();
        }
      }
    });
    
    // Initialize game variables
    global.downhillStartTime = 0;
    global.playerStartAbsY = player.absY;
    
    // Add some terrain obstacles for testing
    terrain.push(
      { x: 400, y: 9500, width: 50, height: 20 },
      { x: 200, y: 9600, width: 40, height: 30 },
      { x: 600, y: 9700, width: 60, height: 25 }
    );
  });
  
  test('game loop correctly updates based on current state', () => {
    // Start in HOUSE state
    currentState = GameState.HOUSE;
    
    // Change to DOWNHILL state
    changeState(GameState.DOWNHILL);
    expect(currentState).toBe(GameState.DOWNHILL);
    expect(document.getElementById('upgrade-menu').style.display).toBe('none');
    expect(document.getElementById('game-screen').style.display).toBe('block');
    
    // Simulate a few downhill update frames
    updateDownhill(16);
    updateDownhill(16);
    expect(player.absY).toBeGreaterThan(9000); // Should have moved down
    
    // Simulate collision with obstacle
    checkCollision.mockReturnValueOnce(true);
    updateDownhill(16);
    expect(currentState).toBe(GameState.UPHILL);
    expect(player.collisions).toBe(1);
    expect(playCrashSound).toHaveBeenCalled();
    expect(awardMoney).toHaveBeenCalled();
    
    // Reset spy calls
    playCrashSound.mockClear();
    awardMoney.mockClear();
    
    // Simulate uphill movement back up
    keysDown['w'] = true;
    updateUphill(16);
    updateUphill(16);
    expect(player.absY).toBeLessThan(9000); // Should have moved up
    
    // Switch back to downhill
    changeState(GameState.DOWNHILL);
    expect(currentState).toBe(GameState.DOWNHILL);
    
    // Reach the bottom of the mountain
    player.absY = mountainHeight;
    updateDownhill(16);
    expect(currentState).toBe(GameState.HOUSE);
    expect(awardMoney).toHaveBeenCalled();
    expect(document.getElementById('upgrade-menu').style.display).toBe('block');
    expect(document.getElementById('game-screen').style.display).toBe('none');
  });
  
  test('jump and trick system work together correctly', () => {
    // Switch to DOWNHILL state
    changeState(GameState.DOWNHILL);
    
    // Initiate jump
    keysDown[' '] = true;
    updateDownhill(16); // Start charging
    expect(player.isCharging).toBe(true);
    
    keysDown[' '] = false;
    updateDownhill(16); // Release to jump
    expect(player.isJumping).toBe(true);
    expect(player.isCharging).toBe(false);
    expect(player.velocityY).toBeLessThan(0); // Negative velocity (upward)
    
    // Advance to middle of jump where tricks are allowed
    player.jumpTimer = player.jumpDuration * 0.4;
    
    // Perform a trick
    keysDown['1'] = true;
    updateDownhill(16);
    expect(player.currentTrick).toBe('leftHelicopter');
    expect(player.trickState).toBe('start');
    
    // Advance trick through phases
    player.trickTimer = 201; // Move to mid phase
    checkTricks(16);
    expect(player.trickState).toBe('mid');
    
    player.trickTimer = 301; // Move to end phase
    checkTricks(16);
    expect(player.trickState).toBe('end');
    
    player.trickTimer = 201; // Complete trick
    checkTricks(16);
    expect(player.trickState).toBe('none');
    expect(player.trickChainCount).toBe(1);
    expect(player.lastTrick).toBe('leftHelicopter');
    expect(playMoneyGainSound).toHaveBeenCalled();
    
    // Land the jump
    player.jumpTimer = player.jumpDuration;
    updateDownhill(16);
    expect(player.isJumping).toBe(false);
    expect(player.canJump).toBe(true);
  });
  
  test('collision system correctly transitions from downhill to uphill', () => {
    // Switch to DOWNHILL state
    changeState(GameState.DOWNHILL);
    
    // Create a direct collision scenario
    player.x = 400;
    player.absY = 9500;
    
    // Turn on collision detection
    checkCollision.mockReturnValueOnce(true);
    
    // Update should detect collision
    updateDownhill(16);
    
    // Should transition to uphill mode
    expect(currentState).toBe(GameState.UPHILL);
    expect(playCrashSound).toHaveBeenCalled();
    expect(player.collisions).toBe(1);
    
    // With multiple collisions, sled should be damaged
    player.collisions = TWEAK.getMaxCollisions() - 1;
    currentState = GameState.DOWNHILL;
    
    checkCollision.mockReturnValueOnce(true);
    updateDownhill(16);
    
    expect(player.sledDamaged).toBe(1);
    
    // When entering the house, the sled should be repaired
    changeState(GameState.HOUSE);
    expect(player.sledDamaged).toBe(0);
  });
  
  test('money system functions throughout game cycle', () => {
    // Track initial money
    const initialMoney = player.money;
    
    // Start downhill run
    changeState(GameState.DOWNHILL);
    player.absY = 9500;
    
    // After collision, award money based on distance traveled
    playerStartAbsY = 9000;
    checkCollision.mockReturnValueOnce(true);
    updateDownhill(16);
    
    // Should be in UPHILL mode with money awarded
    expect(currentState).toBe(GameState.UPHILL);
    expect(player.money).toBeGreaterThan(initialMoney);
    expect(awardMoney).toHaveBeenCalled();
    
    // Reset and perform a trick for more money
    const moneyAfterRun = player.money;
    
    // Go back to downhill mode
    changeState(GameState.DOWNHILL);
    
    // Perform a trick
    player.isJumping = true;
    player.jumpTimer = player.jumpDuration * 0.4;
    keysDown['1'] = true;
    updateDownhill(16);
    
    // Complete the trick
    player.trickState = 'end';
    player.trickTimer = 201;
    checkTricks(16);
    
    // Money should increase
    expect(player.money).toBeGreaterThan(moneyAfterRun);
    
    // Reach the bottom of the mountain
    player.absY = mountainHeight;
    updateDownhill(16);
    
    // Should be in HOUSE mode with even more money
    expect(currentState).toBe(GameState.HOUSE);
    expect(player.money).toBeGreaterThan(moneyAfterRun);
  });
  
  test('wrapping system correctly handles player movement at layer edges', () => {
    // Switch to DOWNHILL state
    changeState(GameState.DOWNHILL);
    
    // Move player to the edge of the layer
    const layerWidth = TWEAK.defaultLayerWidth;
    player.x = layerWidth - 10;
    
    // Move right to wrap around
    keysDown['d'] = true;
    updateDownhill(16);
    
    // Position should wrap to the left side
    expect(player.x).toBeLessThan(20);
    
    // Move left to wrap back around
    player.x = 10;
    keysDown['d'] = false;
    keysDown['a'] = true;
    updateDownhill(16);
    
    // Position should wrap to the right side
    expect(player.x).toBeGreaterThan(layerWidth - 20);
  });
}); 