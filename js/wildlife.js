/* wildlife.js - Wildlife Simulation */
// This file is responsible for handling the wildlife simulation,
// including the animals' behavior, interactions with the
// environment, and spawning.

// Global variables for animal system
var activeAnimal = null;
var animalStateCheckInterval = null; // Interval for checking animal states

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
  // Spawn just outside the viewport horizontally
  let spawnX = (window.innerWidth * 0.1) + (Math.random() * window.innerWidth * 0.9);
  let spawnY = player.absY - (window.innerHeight / 2);
  // Altitude is a number between 0-100 representing the altitude line
  let altitude = Math.floor(Math.random() * 100);
  
  // Initial state - sitting or fleeing
  let initialState = "sitting";
  
  // Flee angle calculation using MAINEntities.js logic
  let baseAngle;
  if (spawnX > window.innerWidth / 2) {
    // Animal spawns on the right side, so it should flee leftwards.
    baseAngle = Math.random() * (170 - 135) + 135;
  } else {
    // Animal spawns on the left side, so it should flee rightwards.
    baseAngle = Math.random() * (55 - 20) + 20;
  }
  let angleOffset = Math.random() * TWEAK.fleeAngle;
  let fleeAngleActual = baseAngle + (Math.random() < 0.5 ? -angleOffset : angleOffset);
  
  // Calculate detection radius and speed based on animal type
  let detectionRadius = type === "bear" ? 
    (TWEAK.bearDetectionRadius || 50) : 
    (TWEAK.birdDetectionRadius || 50);
    
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
    speed: speed,
    altitude: altitude,
    hasBeenPhotographed: false,
    detectionRadius: detectionRadius,
    fleeAngleActual,
    fleeingLogOnce: false,
    lastStateChange: Date.now(),
    stateChangeCount: 0
  };
  
  console.log(`Spawned ${type} at (${spawnX.toFixed(1)}, ${spawnY.toFixed(1)}), altitude: ${altitude}, state: ${initialState}, speed: ${speed}, detectionRadius: ${detectionRadius}`);
  
  // Start state check interval if not already started
  if (!animalStateCheckInterval) {
    animalStateCheckInterval = setInterval(logAnimalState, 3000); // Log every 3 seconds
  }
}

// Function to despawn all animals when entering house
function despawnAllAnimals() {
    activeAnimal = null;
    console.log('All animals despawned');
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
