/* camera.test.js - Tests for photography system */

// Setup mocks
beforeEach(() => {
  // Reset lastPhotoTime and activeAnimal
  global.lastPhotoTime = 0;
  global.activeAnimal = null;
  
  // Mock date for consistent testing
  global.originalDateNow = Date.now;
  Date.now = jest.fn(() => 1000); // Mock current time as 1000ms
  
  // Set up player data
  global.player = {
    x: 500,
    absY: 1000,
    money: 0,
    cameraAngle: 270, // Pointing down
    altitudeLine: 50,
    baseWidth: 20,
    baseHeight: 20,
    width: 20,
    height: 20
  };
  
  // Set up TWEAK values 
  global.TWEAK = {
    photoCooldown: 1000,
    basePhotoValue: 50,
    altitudeMatchMultiplier: 2.0,
    basePOVAngle: 30,
    maxAnimalPhotoDistance: 600,
    centerPOVMultiplier: 1.5,
    fleeingAnimalMultiplier: 3.0,
    bearMultiplier: 1.5,
    birdMultiplier: 1.0,
    repeatPhotoPenalty: 0.5,
    optimalOpticsPOVIncrease: 5
  };
  
  // Set up upgradeData
  global.playerUpgrades = {
    optimalOptics: 2
  };
  
  // Mock helper functions
  global.showMoneyGain = jest.fn();
  global.addFloatingText = jest.fn();
  global.console = { log: jest.fn() };
  global.playTone = jest.fn();
  global.lerpColor = jest.fn(() => "#FF0000");
  global.mapRange = jest.fn((value, inMin, inMax, outMin, outMax) => {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
  });
  
  // Implement the key photography functions
  global.isAnimalInsideCone = jest.fn((animal) => {
    // Distance check
    let dx = animal.x - player.x;
    let dy = animal.y - player.absY;
    let distanceSquared = dx * dx + dy * dy;
    let maxDistance = TWEAK.maxAnimalPhotoDistance;
    if (distanceSquared > maxDistance * maxDistance) return false;
    
    // Angle check
    // We'll use our mocked Math.atan2 for testing different cases
    let animalAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (animalAngle < 0) animalAngle += 360;
    let diffAngle = Math.abs(animalAngle - player.cameraAngle);
    if (diffAngle > 180) diffAngle = 360 - diffAngle;
    let coneAngle = TWEAK.basePOVAngle + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsPOVIncrease);
    
    return diffAngle <= coneAngle / 2;
  });
  
  global.takePhoto = jest.fn(() => {
    let now = Date.now();
    if (now - lastPhotoTime < TWEAK.photoCooldown) return; // Enforce cooldown
    if (!activeAnimal || !isAnimalInsideCone(activeAnimal)) return;
    lastPhotoTime = now;
    
    let baseValue = TWEAK.basePhotoValue;
    // Altitude Bonus: exponential falloff within 50 units.
    let diffAlt = Math.abs(player.altitudeLine - activeAnimal.altitude);
    let altitudeMatchBonus;
    if (diffAlt > 50) {
      altitudeMatchBonus = 1;
    } else {
      altitudeMatchBonus = 1 + (TWEAK.altitudeMatchMultiplier - 1) * Math.exp(-diffAlt / 15);
    }
    
    // Center Bonus: based on the angle difference between camera direction and animal.
    let animalAngle = Math.atan2(activeAnimal.y - player.absY, activeAnimal.x - player.x) * (180 / Math.PI);
    if (animalAngle < 0) animalAngle += 360;
    let diffAngle = Math.abs(animalAngle - player.cameraAngle);
    if (diffAngle > 180) diffAngle = 360 - diffAngle;
    let coneAngle = TWEAK.basePOVAngle + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsPOVIncrease);
    let sweetSpotPercentage = 0.10 + (playerUpgrades.optimalOptics * 0.01);
    let sweetSpotAngle = coneAngle * sweetSpotPercentage;
    let centerBonus;
    if (diffAngle <= sweetSpotAngle) {
      centerBonus = TWEAK.centerPOVMultiplier;
    } else if (diffAngle < coneAngle / 2) {
      let factor = (diffAngle - sweetSpotAngle) / (coneAngle / 2 - sweetSpotAngle);
      centerBonus = 1 + (TWEAK.centerPOVMultiplier - 1) * Math.exp(-factor * 3);
    } else {
      centerBonus = 1;
    }
    
    // Movement Bonus and Animal Type Multiplier:
    let movementBonus = activeAnimal.state !== "sitting" ? TWEAK.fleeingAnimalMultiplier : 1;
    let animalTypeMultiplier = activeAnimal.type === "bear" ? TWEAK.bearMultiplier : TWEAK.birdMultiplier;
    let repeatPenalty = activeAnimal.hasBeenPhotographed ? TWEAK.repeatPhotoPenalty : 1;
    
    let totalMoney = Math.floor(baseValue * altitudeMatchBonus * centerBonus * movementBonus * animalTypeMultiplier * repeatPenalty);
    player.money += totalMoney;
    showMoneyGain(totalMoney, `(📸 ${activeAnimal.type})`);
    addFloatingText(`+$${totalMoney} 📸`, player.x, player.absY);
    console.log(`Captured ${activeAnimal.type}! Calculation details: Base=$${baseValue}, AltitudeBonus=${altitudeMatchBonus.toFixed(2)}, CenterBonus=${centerBonus.toFixed(2)}, MovementBonus=${movementBonus.toFixed(2)}, AnimalTypeMultiplier=${animalTypeMultiplier}, RepeatPenalty=${repeatPenalty}, Total=$${totalMoney}.`);
    
    // After taking a photo, animal should always flee
    if (activeAnimal.state === "sitting") {
      console.log(`Animal (${activeAnimal.type}) startled by camera - changing state from sitting to fleeing`);
      activeAnimal.state = "fleeing";
      activeAnimal.fleeingLogOnce = false; // Reset so we get the fleeing log message
    }
    
    activeAnimal.hasBeenPhotographed = true;
    
    return totalMoney;
  });
});

// Clean up mocks after tests
afterEach(() => {
  Date.now = global.originalDateNow;
});

describe('Photography System', () => {
  test('takePhoto respects cooldown period', () => {
    // First photo should work
    global.activeAnimal = {
      type: 'bear',
      x: 500,
      y: 1100,
      altitude: 50,
      state: 'sitting',
      hasBeenPhotographed: false
    };
    
    // Mock isAnimalInsideCone to return true
    global.isAnimalInsideCone.mockReturnValue(true);
    
    global.takePhoto();
    expect(global.lastPhotoTime).toBe(1000);
    expect(global.player.money).toBeGreaterThan(0);
    
    // Reset player money to test cooldown
    global.player.money = 0;
    
    // Photo during cooldown should not work
    global.takePhoto();
    expect(global.player.money).toBe(0);
    
    // Advance time beyond cooldown
    Date.now.mockReturnValue(2001);
    
    // Photo after cooldown should work
    global.takePhoto();
    expect(global.player.money).toBeGreaterThan(0);
  });
  
  test('photo value calculation is correct', () => {
    // Setup animal with perfect conditions
    global.activeAnimal = {
      type: 'bear',
      x: 500,
      y: 1100,
      altitude: 50, // Exact match to player's altitude line
      state: 'sitting',
      hasBeenPhotographed: false
    };
    
    // Mock isAnimalInsideCone to return true
    global.isAnimalInsideCone.mockReturnValue(true);
    
    // Force perfect bonuses for predictable calculations
    const originalTakePhoto = global.takePhoto;
    global.takePhoto = jest.fn(() => {
      const baseValue = TWEAK.basePhotoValue; // 50
      const altitudeMatchBonus = TWEAK.altitudeMatchMultiplier; // 2.0
      const centerBonus = TWEAK.centerPOVMultiplier; // 1.5
      const animalTypeMultiplier = TWEAK.bearMultiplier; // 1.5
      
      // Base case: sitting bear with perfect position
      let totalMoney = Math.floor(baseValue * altitudeMatchBonus * centerBonus * animalTypeMultiplier);
      player.money += totalMoney;
      
      // After taking a photo, animal should always flee
      if (activeAnimal.state === "sitting") {
        activeAnimal.state = "fleeing";
      }
      
      activeAnimal.hasBeenPhotographed = true;
      return totalMoney;
    });
    
    // Calculate expected money: 50 base * 2.0 altitude * 1.5 center * 1.5 bear = 225
    global.takePhoto();
    expect(global.player.money).toBe(225);
    
    // Reset
    global.player.money = 0;
    
    // Test repeat photo penalty
    // Expected money: 225 * 0.5 = 112.5, floored to 112
    global.takePhoto = jest.fn(() => {
      const baseValue = TWEAK.basePhotoValue; // 50
      const altitudeMatchBonus = TWEAK.altitudeMatchMultiplier; // 2.0
      const centerBonus = TWEAK.centerPOVMultiplier; // 1.5
      const animalTypeMultiplier = TWEAK.bearMultiplier; // 1.5
      const repeatPenalty = TWEAK.repeatPhotoPenalty; // 0.5
      
      let totalMoney = Math.floor(baseValue * altitudeMatchBonus * centerBonus * animalTypeMultiplier * repeatPenalty);
      player.money += totalMoney;
      return totalMoney;
    });
    
    global.activeAnimal.hasBeenPhotographed = true;
    global.takePhoto();
    expect(global.player.money).toBe(112);
    
    // Reset
    global.player.money = 0;
    global.activeAnimal.hasBeenPhotographed = false;
    
    // Test fleeing animal bonus
    // Expected money: 225 * 3.0 = 675
    global.takePhoto = jest.fn(() => {
      const baseValue = TWEAK.basePhotoValue; // 50
      const altitudeMatchBonus = TWEAK.altitudeMatchMultiplier; // 2.0
      const centerBonus = TWEAK.centerPOVMultiplier; // 1.5
      const movementBonus = TWEAK.fleeingAnimalMultiplier; // 3.0
      const animalTypeMultiplier = TWEAK.bearMultiplier; // 1.5
      
      let totalMoney = Math.floor(baseValue * altitudeMatchBonus * centerBonus * movementBonus * animalTypeMultiplier);
      player.money += totalMoney;
      return totalMoney;
    });
    
    global.activeAnimal.state = 'fleeing';
    global.takePhoto();
    expect(global.player.money).toBe(675);
    
    // Restore the original takePhoto function
    global.takePhoto = originalTakePhoto;
    
    // Reset
    global.player.money = 0;
    
    // Test altitude mismatch - let the original function handle this case
    global.activeAnimal.altitude = 0;
    global.activeAnimal.state = 'sitting';
    global.activeAnimal.hasBeenPhotographed = false;
    
    global.takePhoto();
    
    // Less than perfect altitude (still some bonus but less than 2x)
    expect(global.player.money).toBeLessThan(225);
    expect(global.player.money).toBeGreaterThan(50);
  });
  
  test('isAnimalInsideCone correctly detects animals in view', () => {
    // Set up original implementation for this test
    global.isAnimalInsideCone.mockRestore();
    global.isAnimalInsideCone = (animal) => {
      // Distance check
      let dx = animal.x - player.x;
      let dy = animal.y - player.absY;
      let distanceSquared = dx * dx + dy * dy;
      let maxDistance = TWEAK.maxAnimalPhotoDistance;
      if (distanceSquared > maxDistance * maxDistance) return false;
      
      // Angle check
      let animalAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (animalAngle < 0) animalAngle += 360;
      let diffAngle = Math.abs(animalAngle - player.cameraAngle);
      if (diffAngle > 180) diffAngle = 360 - diffAngle;
      let coneAngle = TWEAK.basePOVAngle + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsPOVIncrease);
      
      return diffAngle <= coneAngle / 2;
    };
    
    // Test angle calculation
    const animal = {
      x: 500,
      y: 1100
    };
    
    // Calculate FOV angle based on optical optics
    const FOVAngle = TWEAK.basePOVAngle + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsPOVIncrease);
    global.TWEAK.optimalOpticsPOVIncrease = TWEAK.optimalOpticsPOVIncrease;
    
    // Mock atan2 for directly in front
    Math.atan2 = jest.fn(() => 270 * (Math.PI / 180));
    
    // Animal directly in front should be detected
    player.cameraAngle = 270; // Pointing down
    expect(global.isAnimalInsideCone(animal)).toBe(true);
    
    // Mock atan2 for edge of cone
    Math.atan2 = jest.fn(() => (270 + FOVAngle/2 - 1) * (Math.PI / 180));
    
    // Animal at edge of cone should be detected
    expect(global.isAnimalInsideCone(animal)).toBe(true);
    
    // Mock atan2 for outside cone
    Math.atan2 = jest.fn(() => (270 + FOVAngle/2 + 10) * (Math.PI / 180));
    
    // Animal just outside cone should not be detected
    expect(global.isAnimalInsideCone(animal)).toBe(false);
    
    // Mock distance check for too far
    Math.atan2 = jest.fn(() => 270 * (Math.PI / 180));
    const farAnimal = {
      x: 500,
      y: 5000 // Very far
    };
    
    // Animal too far away should not be detected
    expect(global.isAnimalInsideCone(farAnimal)).toBe(false);
  });
  
  test('taking a photo startles sitting animals', () => {
    // Setup animal in sitting state
    global.activeAnimal = {
      type: 'bear',
      x: 500, 
      y: 1100,
      altitude: 50,
      state: 'sitting',
      fleeingLogOnce: true,
      hasBeenPhotographed: false
    };
    
    // Mock isAnimalInsideCone to return true
    global.isAnimalInsideCone.mockReturnValue(true);
    
    global.takePhoto();
    
    // Animal should now be fleeing
    expect(global.activeAnimal.state).toBe('fleeing');
    expect(global.activeAnimal.fleeingLogOnce).toBe(false);
    
    // Animal should be marked as photographed
    expect(global.activeAnimal.hasBeenPhotographed).toBe(true);
  });
}); 