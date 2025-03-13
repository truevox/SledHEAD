/* wildlifephotos.js - Wildlife Photo Minigame */

// Global variables for photo/animal system
var activeAnimal = null;
var lastPhotoTime = 0;

// ------------------- Photo (Critter) Minigame Logic -------------------

// Handles taking a photo of an animal when conditions are met.
function takePhoto() {
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
  let movementBonus = activeAnimal.state !== "sitting" ? TWEAK.movingAnimalMultiplier : 1;
  let animalTypeMultiplier = activeAnimal.type === "bear" ? TWEAK.bearMultiplier : TWEAK.birdMultiplier;
  let repeatPenalty = activeAnimal.hasBeenPhotographed ? TWEAK.repeatPhotoPenalty : 1;
  
  let totalMoney = Math.floor(baseValue * altitudeMatchBonus * centerBonus * movementBonus * animalTypeMultiplier * repeatPenalty);
  player.money += totalMoney;
  showMoneyGain(totalMoney, `(📸 ${activeAnimal.type})`);
  addFloatingText(`+$${totalMoney} 📸`, player.x, player.absY);
  console.log(`Captured ${activeAnimal.type}! Calculation details: Base=$${baseValue}, AltitudeBonus=${altitudeMatchBonus.toFixed(2)}, CenterBonus=${centerBonus.toFixed(2)}, MovementBonus=${movementBonus.toFixed(2)}, AnimalTypeMultiplier=${animalTypeMultiplier}, RepeatPenalty=${repeatPenalty}, Total=$${totalMoney}.`);
  activeAnimal.hasBeenPhotographed = true;
}

// ------------------- Animal (Critter) Update Logic -------------------

// Updates the state of the active animal (critter)
function updateAnimal() {
  if (!activeAnimal) return;
  if (activeAnimal.state === "fleeing") {
    if (activeAnimal.fleeingLogOnce !== true) {
      console.log(`Animal fleeing - Type: ${activeAnimal.type}, Angle: ${activeAnimal.fleeAngleActual.toFixed(2)}°`);
      activeAnimal.fleeingLogOnce = true;
    }
    let rad = activeAnimal.fleeAngleActual * Math.PI / 180;
    activeAnimal.x += Math.cos(rad) * activeAnimal.speed * 0.5;
    activeAnimal.y += Math.sin(rad) * activeAnimal.speed * 0.5;
    if (
      activeAnimal.x < -100 ||
      activeAnimal.x > window.innerWidth + 100 ||
      activeAnimal.y > player.absY + 1000
    ) {
      console.log(`Animal moved off screen - removed`);
      activeAnimal = null;
      setTimeout(
        spawnAnimal,
        Math.random() * (TWEAK.maxSpawnTime - TWEAK.minIdleTime) + TWEAK.minIdleTime
      );
    }
  }
}

// Spawn a new animal at a random position
function spawnAnimal() {
  if (currentState !== GameState.UPHILL || activeAnimal !== null) return;
  
  const isBear = Math.random() < TWEAK.bearSpawnProbability;
  const type = isBear ? "bear" : "bird";
  
  // Determine spawn position
  let spawnDistance = TWEAK.minAnimalSpawnDistance + Math.random() * (TWEAK.maxAnimalSpawnDistance - TWEAK.minAnimalSpawnDistance);
  let spawnAngle = Math.random() * 360;
  let spawnX = player.x + spawnDistance * Math.cos(spawnAngle * Math.PI / 180);
  let spawnY = player.absY + spawnDistance * Math.sin(spawnAngle * Math.PI / 180);
  
  // Altitude is a number between 0-100 representing the altitude line
  let altitude = Math.floor(Math.random() * 100);
  
  // Flight pattern for birds (not used for bears)
  let flightPattern = null;
  if (type === "bird") {
    let patterns = ["circle", "zigzag", "spiral"];
    flightPattern = patterns[Math.floor(Math.random() * patterns.length)];
  }
  
  // Initial state - sitting or moving
  let initialState = Math.random() < 0.7 ? "sitting" : "moving";
  
  // Flee angle calculation
  let idealFleeAngle = Math.atan2(spawnY - player.absY, spawnX - player.x) * (180 / Math.PI);
  // Add some randomness to the flee angle
  let fleeAngleVariation = (Math.random() - 0.5) * 90; // ±45 degrees
  let fleeAngleActual = idealFleeAngle + fleeAngleVariation;
  
  activeAnimal = {
    type,
    x: spawnX,
    y: spawnY,
    width: type === "bear" ? 40 : 20,
    height: type === "bear" ? 60 : 20,
    state: initialState,
    pattern: flightPattern,
    speed: type === "bear" ? TWEAK.bearSpeed : TWEAK.birdSpeed,
    altitude: altitude,
    hasBeenPhotographed: false,
    detectionRadius: type === "bear" ? TWEAK.bearDetectionRadius : TWEAK.birdDetectionRadius,
    fleeAngleActual
  };
  
  console.log(`Spawned ${type} at (${spawnX.toFixed(1)}, ${spawnY.toFixed(1)}), altitude: ${altitude}, state: ${initialState}, pattern: ${flightPattern || "N/A"}`);
}

// Check if the animal is inside the camera cone
function isAnimalInsideCone(animal) {
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
}

// Draw the animal on the screen
function drawAnimal() {
  if (!activeAnimal || currentState !== GameState.UPHILL) return;
  
  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
  let animalScreenY = activeAnimal.y - cameraOffset;
  
  // Animal is a simple colored rectangle for now
  ctx.fillStyle = activeAnimal.type === "bear" ? "#8B4513" : "#1E90FF";
  ctx.fillRect(
    activeAnimal.x - activeAnimal.width / 2,
    animalScreenY - activeAnimal.height / 2,
    activeAnimal.width,
    activeAnimal.height
  );
  
  // For bears, add some details
  if (activeAnimal.type === "bear") {
    ctx.fillStyle = "#000000";
    // Draw bear ears
    ctx.fillRect(
      activeAnimal.x - activeAnimal.width / 3,
      animalScreenY - activeAnimal.height / 2 - 10,
      10,
      10
    );
    ctx.fillRect(
      activeAnimal.x + activeAnimal.width / 3 - 10,
      animalScreenY - activeAnimal.height / 2 - 10,
      10,
      10
    );
  } else {
    // For birds, add wing details
    ctx.fillStyle = "#000000";
    if (Math.floor(Date.now() / 200) % 2 === 0) {
      // Wings up
      ctx.beginPath();
      ctx.moveTo(activeAnimal.x, animalScreenY);
      ctx.lineTo(activeAnimal.x - 20, animalScreenY - 10);
      ctx.lineTo(activeAnimal.x + 20, animalScreenY - 10);
      ctx.closePath();
      ctx.fill();
    } else {
      // Wings down
      ctx.beginPath();
      ctx.moveTo(activeAnimal.x, animalScreenY);
      ctx.lineTo(activeAnimal.x - 20, animalScreenY + 5);
      ctx.lineTo(activeAnimal.x + 20, animalScreenY + 5);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  // Draw altitude indicator - small colored marker
  let t = 1 - (activeAnimal.altitude / 100);
  let altitudeColor = lerpColor("#FF0000", "#0000FF", t);
  ctx.fillStyle = altitudeColor;
  ctx.fillRect(
    activeAnimal.x + activeAnimal.width / 2 + 5,
    animalScreenY - 5,
    10,
    10
  );
  
  // If the animal is fleeing, add a trail effect
  if (activeAnimal.state === "fleeing") {
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.arc(
      activeAnimal.x,
      animalScreenY,
      activeAnimal.width,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}