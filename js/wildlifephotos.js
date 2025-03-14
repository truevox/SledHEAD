/* wildlifephotos.js - Wildlife Photo Minigame */

// Global variables for photo/animal system
var activeAnimal = null;
var lastPhotoTime = 0;
var animalStateCheckInterval = null; // New interval for checking animal states

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
}

// ------------------- Animal (Critter) Update Logic -------------------

// Updates the state of the active animal (critter)
function updateAnimal() {
  if (!activeAnimal) return;
  
  // Check proximity to player - may cause animal to flee
  checkPlayerProximity();
  
  if (activeAnimal.state === "fleeing") {
    if (activeAnimal.fleeingLogOnce !== true) {
      console.log(`🦁 Animal fleeing - Type: ${activeAnimal.type}, Angle: ${activeAnimal.fleeAngleActual.toFixed(2)}°, Speed: ${activeAnimal.speed}`);
      activeAnimal.fleeingLogOnce = true;
    }
    
    let rad = activeAnimal.fleeAngleActual * Math.PI / 180;
    activeAnimal.x += Math.cos(rad) * activeAnimal.speed * 0.5;
    activeAnimal.y += Math.sin(rad) * activeAnimal.speed * 0.5;
    
    // Removed logging block that referenced xMove and yMove
    
    // Check if animal is more than 1000 units away from the player.
    let dx = activeAnimal.x - player.x;
    let dy = activeAnimal.y - player.absY;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1000 && !activeAnimal.despawnScheduled) {
      activeAnimal.despawnScheduled = true;
      console.log(`Animal is more than 1000 away. Scheduling despawn in 500ms.`);
      
      setTimeout(() => {
        if (activeAnimal) {
          console.log(`Animal despawned after 500ms out of range`);
          activeAnimal = null;
          spawnAnimal();
        }
      }, 5000);
    }

  } else if (activeAnimal.state === "sitting") {
    // Animals have a small chance to start fleeing randomly
    if (Math.random() < 0.0001) { // 0.01% chance per frame to spontaneously flee
      console.log(`Animal (${activeAnimal.type}) spontaneously changing state from sitting to fleeing`);
      activeAnimal.state = "fleeing";
      activeAnimal.fleeingLogOnce = false;
    }
  }
}

// Check if the player is too close to the animal, causing it to flee
function checkPlayerProximity() {
  if (!activeAnimal || activeAnimal.state === "fleeing") return;
  
  let dx = activeAnimal.x - player.x;
  let dy = activeAnimal.y - player.absY;
  let distanceSquared = dx * dx + dy * dy;
  
  if (distanceSquared < activeAnimal.detectionRadius * activeAnimal.detectionRadius) {
    console.log(`Player too close to animal (${Math.sqrt(distanceSquared).toFixed(1)} < ${activeAnimal.detectionRadius}) - animal fleeing`);
    activeAnimal.state = "fleeing";
    activeAnimal.fleeingLogOnce = false;
    
    // Recalculate flee angle directly away from player
    activeAnimal.fleeAngleActual = Math.atan2(dy, dx) * (180 / Math.PI);
    // Add slight randomness to the flee direction
    activeAnimal.fleeAngleActual += (Math.random() - 0.5) * 30; // ±15 degrees of randomness
  }
}

// Spawn a new animal at a random position
function spawnAnimal() {
  if (currentState !== GameState.UPHILL || activeAnimal !== null) return;
  
  const isBear = Math.random() < TWEAK.bearSpawnProbability;
  const type = isBear ? "bear" : "bird";
  
  // Determine spawn position
  let spawnDistance = TWEAK.minAnimalSpawnDistance + Math.random() * (TWEAK.maxAnimalSpawnDistance - TWEAK.minAnimalSpawnDistance);
  let spawnAngle = 270;
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
  
  // Initial state - sitting or fleeing
  let initialState = Math.random() < 0.8 ? "sitting" : "fleeing";
  
  // Flee angle calculation
  let idealFleeAngle = Math.atan2(spawnY - player.absY, spawnX - player.x) * (180 / Math.PI);
  // Add some randomness to the flee angle
  let fleeAngleVariation = (Math.random() - 0.5) * 90; // ±45 degrees
  let fleeAngleActual = idealFleeAngle + fleeAngleVariation;
  
  // Calculate detection radius and speed based on animal type
  let detectionRadius = type === "bear" ? 
    (TWEAK.bearDetectionRadius || 250) : 
    (TWEAK.birdDetectionRadius || 150);
    
  let speed = type === "bear" ? 
    (TWEAK.bearSpeed || 8) : 
    (TWEAK.birdSpeed || 12);
  
  activeAnimal = {
    type,
    x: spawnX,
    y: spawnY,
    width: type === "bear" ? 40 : 20,
    height: type === "bear" ? 60 : 20,
    state: initialState,
    pattern: flightPattern,
    speed: speed,
    altitude: altitude,
    hasBeenPhotographed: false,
    detectionRadius: detectionRadius,
    fleeAngleActual,
    fleeingLogOnce: false,
    lastStateChange: Date.now(),
    stateChangeCount: 0
  };
  
  console.log(`Spawned ${type} at (${spawnX.toFixed(1)}, ${spawnY.toFixed(1)}), altitude: ${altitude}, state: ${initialState}, pattern: ${flightPattern || "N/A"}, speed: ${speed}, detectionRadius: ${detectionRadius}`);
  
  // Start state check interval if not already started
  if (!animalStateCheckInterval) {
    animalStateCheckInterval = setInterval(logAnimalState, 3000); // Log every 3 seconds
  }
}

// Log the current animal state for debugging
function logAnimalState() {
  if (!activeAnimal) {
    console.log("No active animal right now");
    clearInterval(animalStateCheckInterval);
    animalStateCheckInterval = null;
    return;
  }
  
  let playerDist = Math.sqrt(
    Math.pow(activeAnimal.x - player.x, 2) + 
    Math.pow(activeAnimal.y - player.absY, 2)
  );
  
  console.log(`Animal status: ${activeAnimal.type}, state: ${activeAnimal.state}, position: (${activeAnimal.x.toFixed(1)}, ${activeAnimal.y.toFixed(1)}), distance to player: ${playerDist.toFixed(1)}`);
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
    
    // Draw a small arrow showing the flee direction
    let arrowLength = activeAnimal.width * 1.5;
    let fleeRadians = activeAnimal.fleeAngleActual * Math.PI / 180;
    let arrowEndX = activeAnimal.x + Math.cos(fleeRadians) * arrowLength;
    let arrowEndY = animalScreenY + Math.sin(fleeRadians) * arrowLength;
    
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(activeAnimal.x, animalScreenY);
    ctx.lineTo(arrowEndX, arrowEndY);
    ctx.stroke();
  }
}
