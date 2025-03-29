/* wildlife.js - Wildlife Simulation (Refactored)
// This file handles the overall wildlife simulation logic,
// using a registration system for animal types.
// Each animal module (e.g., bear.js, bird.js, etc.) registers
// itself by calling registerAnimalType(), so you don't have to update
// this file when adding new animals.
*/

// Global registry for animal types
var animalRegistry = [];

// Function for animal modules to register themselves
function registerAnimalType(animalData) {
    animalRegistry.push(animalData);
    console.log("Registered animal type: " + animalData.type);
}

// Global variables for the animal system
var activeAnimal = null;
var animalStateCheckInterval = null;

// ------------------- Animal (Critter) Update Logic -------------------
function updateAnimal() {
  if (!activeAnimal) return;
  
  // Call custom update if provided
  if (activeAnimal.customUpdate && typeof activeAnimal.customUpdate === 'function') {
      activeAnimal.customUpdate(activeAnimal);
  }
  
  // Check if player is too close, forcing the animal to flee
  checkPlayerProximity();
  
  if (activeAnimal.state === "fleeing") {
    if (!activeAnimal.fleeingLogOnce) {
      console.log(`Animal fleeing - Type: ${activeAnimal.type}, Angle: ${activeAnimal.fleeAngleActual.toFixed(2)}°, Speed: ${activeAnimal.speed}`);
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
    // Small chance to spontaneously start fleeing
    if (Math.random() < 0.0001) {
      console.log(`Animal (${activeAnimal.type}) spontaneously changing state from sitting to fleeing`);
      activeAnimal.state = "fleeing";
      activeAnimal.fleeingLogOnce = false;
    }
  }
}

// Check if the player is too close to the animal
function checkPlayerProximity() {
  if (!activeAnimal || activeAnimal.state === "fleeing") return;
  
  let dx = activeAnimal.x - player.x;
  let dy = activeAnimal.y - player.absY;
  let distanceSquared = dx * dx + dy * dy;
  
  if (distanceSquared < activeAnimal.detectionRadius * activeAnimal.detectionRadius) {
    console.log(`Player too close to animal (${Math.sqrt(distanceSquared).toFixed(1)} < ${activeAnimal.detectionRadius}) - animal fleeing`);
    activeAnimal.state = "fleeing";
    activeAnimal.fleeingLogOnce = false;
    
    // Calculate flee angle directly away from player with some randomness
    activeAnimal.fleeAngleActual = Math.atan2(dy, dx) * (180 / Math.PI);
    activeAnimal.fleeAngleActual += (Math.random() - 0.5) * 30;
  }
}

// Spawn a new animal using the registered types
function spawnAnimal() {
  if (currentState !== GameState.UPHILL || activeAnimal !== null) return;
  
  if (animalRegistry.length === 0) {
    console.error("No animal types registered!");
    return;
  }
  
  // Determine spawn position and altitude
  let spawnX = (window.innerWidth * 0.1) + (Math.random() * window.innerWidth * 0.9);
  let spawnY = player.absY - (window.innerHeight / 2);
  let altitude = Math.floor(Math.random() * 100);
  let initialState = "sitting";
  
  // Calculate flee angle based on spawn position
  let baseAngle = spawnX > window.innerWidth / 2 ?
                  Math.random() * (170 - 135) + 135 :
                  Math.random() * (55 - 20) + 20;
  let angleOffset = Math.random() * 15;
  let fleeAngleActual = baseAngle + (Math.random() < 0.5 ? -angleOffset : angleOffset);
  
  // Select an animal type based on weighted spawnProbability
  let totalWeight = animalRegistry.reduce((sum, animal) => sum + animal.spawnProbability, 0);
  let r = Math.random() * totalWeight;
  let chosenAnimalType = null;
  for (let animal of animalRegistry) {
    r -= animal.spawnProbability;
    if (r <= 0) {
      chosenAnimalType = animal;
      break;
    }
  }
  if (!chosenAnimalType) chosenAnimalType = animalRegistry[0];
  
  // Create the active animal object with properties from the chosen type
  activeAnimal = {
    type: chosenAnimalType.type,
    x: spawnX,
    y: spawnY,
    width: chosenAnimalType.width,
    height: chosenAnimalType.height,
    state: initialState,
    speed: chosenAnimalType.speed,
    altitude: altitude,
    hasBeenPhotographed: false,
    detectionRadius: chosenAnimalType.detectionRadius,
    fleeAngleActual: fleeAngleActual,
    fleeingLogOnce: false,
    lastStateChange: Date.now(),
    stateChangeCount: 0,
    basePhotoBonus: chosenAnimalType.basePhotoBonus || 0,
    customUpdate: chosenAnimalType.customUpdate || null,
    customDraw: chosenAnimalType.customDraw || null,
    // Other properties can be added here as needed.
  };
  
  console.log(`Spawned ${activeAnimal.type} at (${spawnX.toFixed(1)}, ${spawnY.toFixed(1)}), altitude: ${altitude}, state: ${initialState}, speed: ${activeAnimal.speed}, detectionRadius: ${activeAnimal.detectionRadius}`);
  
  if (!animalStateCheckInterval) {
    animalStateCheckInterval = setInterval(logAnimalState, 3000);
  }
}

// Despawn all animals
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
  
  // If the animal has a custom draw function, use it!
  if (activeAnimal.customDraw && typeof activeAnimal.customDraw === 'function') {
      activeAnimal.customDraw(activeAnimal, animalScreenY, ctx);
  } else {
      // Default drawing: a generic rectangle
      ctx.fillStyle = activeAnimal.color || "#888888";
      ctx.fillRect(
        activeAnimal.x - activeAnimal.width / 2,
        animalScreenY - activeAnimal.height / 2,
        activeAnimal.width,
        activeAnimal.height
      );
  }
}

// Expose functions globally
window.registerAnimalType = registerAnimalType;
window.updateAnimal = updateAnimal;
window.spawnAnimal = spawnAnimal;
window.despawnAllAnimals = despawnAllAnimals;
window.drawAnimal = drawAnimal;
