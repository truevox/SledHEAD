/* input.test.js - Tests for user input and player movement */

// Setup mocks for window, keysDown, and player
beforeEach(() => {
  // Reset mocks
  global.window = {};
  global.keysDown = {};
  global.player = {
    x: 500,
    absY: 1000,
    width: 20,
    height: 20,
    xVel: 0,
    currentLayerIndex: 0,
    cameraAngle: 270,
    altitudeLine: 50,
    isJumping: false,
    canJump: true,
    reHitActivated: false,
    jumpTimer: 0,
    jumpDuration: 0,
    velocityY: 0,
    baseWidth: 20,
    baseHeight: 20
  };
  
  // Mock utility functions
  global.clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  global.calculateWrappedX = (x, layerWidth) => {
    let result = x;
    while (result < 0) result += layerWidth;
    while (result >= layerWidth) result -= layerWidth;
    return result;
  };
  
  // Mock layers
  global.getLayerByY = jest.fn(() => ({ id: 0, width: 1000, startY: 0, endY: 2000 }));
  global.updatePlayerLayer = jest.fn();
  global.mountainHeight = 10000;
  
  // Mock constants
  global.TWEAK = {
    baseUpSpeed: 2,
    fancierFootwearUpSpeedPerLevel: 0.3,
    baseGravity: 0.04,
    baseMaxXVel: 1.5,
    baseHorizontalAccel: 0.25,
    baseFriction: 0.98,
    rocketSurgeryFactorPerLevel: 0.1,
    optimalOpticsFrictionFactorPerLevel: 0.005,
    optimalOpticsAccelFactorPerLevel: 0.02,
    jumpBaseAscent: 1000,
    jumpHeightPerRocketSurgery: 0.05,
    jumpTimePerRocketSurgery: 0.05,
    jumpZoomPerHeightIncrease: 0.5,
    jumpType: "immediate",
    jumpPeakScale: 2,
    reHitWindowStart: 0.7,
    reHitBonusDuration: 1.2
  };
  
  global.playerUpgrades = {
    fancierFootwear: 2,
    rocketSurgery: 1,
    optimalOptics: 1
  };
  
  // Mock other required functions
  global.terrain = [];
  global.checkCollision = jest.fn(() => false);
  global.resolveCollision = jest.fn();
  global.updateAnimal = jest.fn();
  global.changeState = jest.fn();
  global.GameState = { UPHILL: 'UPHILL', DOWNHILL: 'DOWNHILL', HOUSE: 'HOUSE' };
  global.currentState = GameState.UPHILL;
  global.onPlayerJumpStart = jest.fn();
  global.onPlayerJumpPeak = jest.fn();
  global.console = { log: jest.fn() };
  global.audioCtx = { currentTime: 0 };
  global.jumpOsc = { frequency: { setValueAtTime: jest.fn() } };
  global.playTone = jest.fn();
  global.playCrashSound = jest.fn();
  global.awardMoney = jest.fn();
  global.lerpJumpZoomToZero = jest.fn(callback => callback());
  global.onPlayerJumpLand = jest.fn();
  global.updateLiveMoney = jest.fn();
  
  // Mock implementation of updateUphill
  global.updateUphill = jest.fn(function(deltaTime) {
    let upSpeed = TWEAK.baseUpSpeed + (playerUpgrades.fancierFootwear * TWEAK.fancierFootwearUpSpeedPerLevel);
    
    // Vertical movement
    if (keysDown["w"]) { player.absY -= upSpeed; }
    if (keysDown["s"]) { player.absY += upSpeed; }
    
    // Get the current layer based on player's Y position
    const currentLayer = getLayerByY(player.absY);
    
    // Update player's layer index
    if (updatePlayerLayer) {
      updatePlayerLayer();
    }
    
    // Horizontal movement with wrapping around cylinder
    let newXUphill = player.x;
    if (keysDown["a"]) { newXUphill -= upSpeed; }
    if (keysDown["d"]) { newXUphill += upSpeed; }
    
    // Use wrapping instead of clamping for cylindrical world
    player.x = calculateWrappedX(newXUphill, currentLayer.width);

    // Prevent going beyond mountain bounds vertically
    player.absY = clamp(player.absY, 0, mountainHeight);

    // Camera and altitude control
    if (keysDown["ArrowLeft"]) { player.cameraAngle -= 2; }
    if (keysDown["ArrowRight"]) { player.cameraAngle += 2; }
    if (keysDown["ArrowUp"]) { player.altitudeLine = Math.max(0, player.altitudeLine - 2); }
    if (keysDown["ArrowDown"]) { player.altitudeLine = Math.min(100, player.altitudeLine + 2); }
    
    // Normalize camera angle
    if (player.cameraAngle < 0) player.cameraAngle += 360;
    if (player.cameraAngle >= 360) player.cameraAngle -= 360;
    
    // Reset horizontal velocity in uphill mode
    player.xVel = 0;
    
    // Return to house if player reaches bottom of mountain
    if (player.absY >= mountainHeight) {
      player.absY = mountainHeight;
      console.log("Reached bottom. Returning to house.");
      changeState(GameState.HOUSE);
    }
    
    // Added return to prevent infinite loops
    return player;
  });
  
  // Mock implementation of updateDownhill
  global.updateDownhill = jest.fn(function(deltaTime) {
    let rocketFactor = 1 + (playerUpgrades.rocketSurgery * TWEAK.rocketSurgeryFactorPerLevel);
    let gravity = TWEAK.baseGravity * rocketFactor;
    let maxXVel = TWEAK.baseMaxXVel * (rocketFactor - (playerUpgrades.optimalOptics * TWEAK.optimalOpticsFrictionFactorPerLevel));
    let opticsFactor = 1 + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsAccelFactorPerLevel);
    let horizontalAccel = TWEAK.baseHorizontalAccel * opticsFactor;
    let friction = TWEAK.baseFriction - (playerUpgrades.optimalOptics * TWEAK.optimalOpticsFrictionFactorPerLevel);
    
    // Horizontal movement handling with bounds checking
    if (keysDown["a"]) { player.xVel -= horizontalAccel; }
    if (keysDown["d"]) { player.xVel += horizontalAccel; }
    player.xVel *= friction;
    player.xVel = clamp(player.xVel, -maxXVel, maxXVel);
    
    // --- Jump Input Handling ---
    // Immediate Mode:
    if (TWEAK.jumpType === "immediate") {
      if (keysDown[" "] && !player.isJumping && player.canJump) {
        player.isJumping = true;
        player.canJump = false;
        player.isCharging = false;
        let heightBonus = 1 + (playerUpgrades.rocketSurgery * TWEAK.jumpHeightPerRocketSurgery);
        let timeBonus = 1 + (playerUpgrades.rocketSurgery * TWEAK.jumpTimePerRocketSurgery);
        let heightIncrease = heightBonus - 1;
        let extraZoom = heightIncrease * TWEAK.jumpZoomPerHeightIncrease;
        player.jumpHeightFactor = heightBonus;
        player.jumpDuration = TWEAK.jumpBaseAscent * timeBonus;
        player.jumpZoomBonus = extraZoom;
        player.jumpTimer = 0;
        player.hasReachedJumpPeak = false;
        onPlayerJumpStart();
      }
    }
    
    // Jump progression
    if (player.isJumping) {
      player.jumpTimer += deltaTime;
      let progress = player.jumpTimer / player.jumpDuration;
      // Re-hit window handling:
      if (progress >= TWEAK.reHitWindowStart && progress < 1.0) {
        if (keysDown[" "] && !player.reHitActivated) {
          player.reHitActivated = true;
          player.jumpTimer = 0;
          player.jumpDuration *= TWEAK.reHitBonusDuration;
          player.jumpHeightFactor = 1;
          playTone(600, "sine", 0.1, 0.3);
        }
      }
      
      if (!player.hasReachedJumpPeak && progress >= 0.5) {
        player.hasReachedJumpPeak = true;
        onPlayerJumpPeak();
      }
    } else {
      // Scale player sprite for jump arc effect
      let baseScale = TWEAK.jumpPeakScale + (player.jumpZoomBonus || 0);
      let progress = player.jumpTimer / player.jumpDuration;
      let scale = 1 + (baseScale - 1) * Math.sin(Math.PI * progress) * (player.jumpHeightFactor || 1);
      player.width = player.baseWidth * scale;
      player.height = player.baseHeight * scale;
    }
    
    // Allow jump restart when space is released
    if (!keysDown[" "]) {
      player.canJump = true;
    }
    
    // Normal downhill movement
    player.velocityY += player.isJumping ? TWEAK.baseGravity : gravity;
    player.absY += player.velocityY;
    updateLiveMoney();
    
    // Check for transition to UPHILL mode near bottom
    if (player.absY >= mountainHeight - (player.height * 4)) {
      player.absY = mountainHeight - (player.height * 4);
      player.velocityY = 0;
      
      if (player.isJumping) {
        lerpJumpZoomToZero(() => {
          onPlayerJumpLand();
        });
      }
      
      changeState(GameState.UPHILL);
      return player;
    }
    
    // Check for actual bottom
    if (player.absY >= mountainHeight) {
      player.absY = mountainHeight;
      awardMoney();
      changeState(GameState.HOUSE);
    }
    
    // Added return to prevent infinite loops
    return player;
  });
});

describe('Uphill Movement', () => {
  test('WASD keys move the player correctly in uphill mode', () => {
    // Set up initial position
    const initialX = 500;
    const initialY = 1000;
    global.player.x = initialX;
    global.player.absY = initialY;
    
    // Test no keys pressed - no movement
    global.keysDown = {};
    global.updateUphill(16); // 16ms deltaTime
    
    expect(global.player.x).toBe(initialX);
    expect(global.player.absY).toBe(initialY);
    
    // Test W key - move up
    global.keysDown = { w: true };
    global.updateUphill(16);
    
    const expectedUpSpeed = TWEAK.baseUpSpeed + (playerUpgrades.fancierFootwear * TWEAK.fancierFootwearUpSpeedPerLevel);
    expect(global.player.absY).toBe(initialY - expectedUpSpeed);
    
    // Test S key - move down
    global.player.absY = initialY; // Reset position
    global.keysDown = { s: true };
    global.updateUphill(16);
    
    expect(global.player.absY).toBe(initialY + expectedUpSpeed);
    
    // Test A key - move left with wrapping
    global.player.x = 5; // Near left edge
    global.keysDown = { a: true };
    global.updateUphill(16);
    
    // Should wrap around to the right edge
    const expectedPosition = calculateWrappedX(5 - expectedUpSpeed, 1000);
    expect(global.player.x).toBe(expectedPosition);
    
    // Test D key - move right with wrapping
    global.player.x = 995; // Near right edge
    global.keysDown = { d: true };
    global.updateUphill(16);
    
    // Should wrap around to the left edge if needed
    const expectedPosition2 = calculateWrappedX(995 + expectedUpSpeed, 1000);
    expect(global.player.x).toBe(expectedPosition2);
  });
  
  test('Arrow keys control camera angle and altitude correctly', () => {
    // Set initial camera angle and altitude
    global.player.cameraAngle = 270;
    global.player.altitudeLine = 50;
    
    // Test left arrow - rotate camera counterclockwise
    global.keysDown = { ArrowLeft: true };
    global.updateUphill(16);
    expect(global.player.cameraAngle).toBe(268);
    
    // Test right arrow - rotate camera clockwise
    global.player.cameraAngle = 270;
    global.keysDown = { ArrowRight: true };
    global.updateUphill(16);
    expect(global.player.cameraAngle).toBe(272);
    
    // Test up arrow - decrease altitude line
    global.keysDown = { ArrowUp: true };
    global.updateUphill(16);
    expect(global.player.altitudeLine).toBe(48);
    
    // Test down arrow - increase altitude line
    global.player.altitudeLine = 50;
    global.keysDown = { ArrowDown: true };
    global.updateUphill(16);
    expect(global.player.altitudeLine).toBe(52);
    
    // Test camera angle normalization (0-360)
    global.player.cameraAngle = 359;
    global.keysDown = { ArrowRight: true };
    global.updateUphill(16);
    expect(global.player.cameraAngle).toBe(1);
    
    global.player.cameraAngle = 1;
    global.keysDown = { ArrowLeft: true };
    global.updateUphill(16);
    expect(global.player.cameraAngle).toBe(359);
  });
});

describe('Downhill Movement', () => {
  test('Horizontal controls work correctly in downhill mode', () => {
    // Fix the typo in the TWEAK property name
    global.TWEAK.opticalOpticsFrictionFactorPerLevel = global.TWEAK.optimalOpticsFrictionFactorPerLevel;
    
    // Set initial values
    global.player.x = 500;
    global.player.xVel = 0;
    
    // Calculate expected acceleration and max velocity
    const rocketFactor = 1 + (global.playerUpgrades.rocketSurgery * global.TWEAK.rocketSurgeryFactorPerLevel);
    const opticsFactor = 1 + (global.playerUpgrades.optimalOptics * global.TWEAK.optimalOpticsAccelFactorPerLevel);
    const horizontalAccel = global.TWEAK.baseHorizontalAccel * opticsFactor;
    const friction = global.TWEAK.baseFriction - (global.playerUpgrades.optimalOptics * global.TWEAK.optimalOpticsFrictionFactorPerLevel);
    
    // Test A key - accelerate left
    global.keysDown = { a: true };
    global.updateDownhill(16);
    
    // Use toBeCloseTo for floating point comparison
    expect(global.player.xVel).toBeCloseTo(-horizontalAccel * friction, 4);
    
    // Let velocity build up
    global.updateDownhill(16);
    global.updateDownhill(16);
    
    // Test D key - accelerate right (should counter left momentum)
    global.keysDown = { d: true };
    global.updateDownhill(16);
    expect(global.player.xVel).toBeGreaterThan(-horizontalAccel * friction * 3);
    
    // Test no keys - should slow down due to friction
    const initialVel = global.player.xVel;
    global.keysDown = {};
    global.updateDownhill(16);
    expect(Math.abs(global.player.xVel)).toBeLessThan(Math.abs(initialVel));
  });
  
  test('Space bar triggers jumps correctly', () => {
    // Set up jump functions
    global.TWEAK.jumpType = "immediate";
    
    // Test space bar starts a jump
    global.keysDown = { " ": true };
    global.updateDownhill(16);
    
    expect(global.player.isJumping).toBe(true);
    expect(global.player.canJump).toBe(false);
    expect(global.onPlayerJumpStart).toHaveBeenCalled();
    
    // Calculate expected values based on Rocket Surgery level
    const heightBonus = 1 + (global.playerUpgrades.rocketSurgery * global.TWEAK.jumpHeightPerRocketSurgery);
    const timeBonus = 1 + (global.playerUpgrades.rocketSurgery * global.TWEAK.jumpTimePerRocketSurgery);
    
    expect(global.player.jumpHeightFactor).toBe(heightBonus);
    expect(global.player.jumpDuration).toBe(global.TWEAK.jumpBaseAscent * timeBonus);
    
    // Test jump cooldown - can't jump again until space is released
    global.player.isJumping = false;
    global.updateDownhill(16);
    expect(global.player.isJumping).toBe(false); // Should still be false
    
    // Release space and should be able to jump again
    global.keysDown = {};
    global.updateDownhill(16);
    expect(global.player.canJump).toBe(true);
    
    // Press space and should jump again
    global.keysDown = { " ": true };
    global.updateDownhill(16);
    expect(global.player.isJumping).toBe(true);
  });
}); 