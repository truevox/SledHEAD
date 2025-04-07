/* wildlife.js - Wildlife Simulation (Refactored with Spawning Biomes and Fallback)
// This file handles the overall wildlife simulation logic using a registration system.
// Each animal module (e.g., bear.js, bird.js, mountainlion.js) registers itself by calling registerAnimalType().
// Animals have a "spawningBiomes" property that defines in which biomes and mountain layers they spawn.
// If currentBiome is not defined or unrecognized, the system assumes every mountain is valid.
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
  
  checkPlayerProximity();
  
  if (activeAnimal.state === "fleeing") {
    if (!activeAnimal.fleeingLogOnce) {
      console.log(`Animal fleeing - Type: ${activeAnimal.type}, Angle: ${activeAnimal.fleeAngleActual.toFixed(2)}°, Speed: ${activeAnimal.speed}`);
      activeAnimal.fleeingLogOnce = true;
    }
    
    let rad = activeAnimal.fleeAngleActual * Math.PI / 180;
    activeAnimal.x += Math.cos(rad) * activeAnimal.speed * 0.5;
    activeAnimal.y += Math.sin(rad) * activeAnimal.speed * 0.5;
    
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
    if (Math.random() < 0.0001) {
      console.log(`Animal (${activeAnimal.type}) spontaneously changing state from sitting to fleeing`);
      activeAnimal.state = "fleeing";
      activeAnimal.fleeingLogOnce = false;
    }
  }
}

function checkPlayerProximity() {
  if (!activeAnimal || activeAnimal.state === "fleeing") return;
  
  let dx = activeAnimal.x - player.x;
  let dy = activeAnimal.y - player.absY;
  let distanceSquared = dx * dx + dy * dy;
  
  if (distanceSquared < activeAnimal.detectionRadius * activeAnimal.detectionRadius) {
    console.log(`Player too close to animal (${Math.sqrt(distanceSquared).toFixed(1)} < ${activeAnimal.detectionRadius}) - animal fleeing`);
    activeAnimal.state = "fleeing";
    activeAnimal.fleeingLogOnce = false;
    
    activeAnimal.fleeAngleActual = Math.atan2(dy, dx) * (180 / Math.PI);
    activeAnimal.fleeAngleActual += (Math.random() - 0.5) * 30;
  }
}

// Spawn a new animal using the registered types, with biome filtering and fallback.
function spawnAnimal() {
  if (currentState !== GameState.UPHILL || activeAnimal !== null) return;
  
  // Define recognized mountain biomes.
  var recognizedBiomes = ["starterMountain", "spaceMountain", "volcanoMountain"];
  
  let availableAnimals;
  // If currentBiome is not defined or unrecognized, allow all animals.
  if (!currentBiome || recognizedBiomes.indexOf(currentBiome) === -1) {
      availableAnimals = animalRegistry;
  } else {
      availableAnimals = animalRegistry.filter(animal => {
          // If spawningBiomes is not specified, default to spawning only on the Starter Mountain.
          if (!animal.spawningBiomes || animal.spawningBiomes.length === 0) {
              return currentBiome === "starterMountain";
          }
          return animal.spawningBiomes.some(rule => {
              if (rule.biome !== currentBiome) return false;
              if (rule.layers && Array.isArray(rule.layers)) {
                  return rule.layers.includes(currentMountainLayer);
              }
              if (rule.layerRange && typeof rule.layerRange.min === 'number' && typeof rule.layerRange.max === 'number') {
                  return currentLayerPercent >= rule.layerRange.min && currentLayerPercent <= rule.layerRange.max;
              }
              return true;
          });
      });
  }
  
  if (availableAnimals.length === 0) {
      console.error("No animal types available for current biome and layer!");
      return;
  }
  
  // Get the appropriate layer for the player's current position
  const playerLayer = getLayerByY(player.absY);
  
  // Calculate spawn X based on the layer width instead of window width
  // This keeps animals within the current layer boundaries
  let spawnX = Math.random() * playerLayer.width;
  let spawnY = player.absY - (window.innerHeight / 2);
  let altitude = Math.floor(Math.random() * 100);
  let initialState = "sitting";
  
  // Get the layer width as a reference for calculating flee angles
  const layerWidth = playerLayer.width;
  let baseAngle = spawnX > layerWidth / 2 ?
                  Math.random() * (170 - 135) + 135 :
                  Math.random() * (55 - 20) + 20;
  let angleOffset = Math.random() * 15;
  let fleeAngleActual = baseAngle + (Math.random() < 0.5 ? -angleOffset : angleOffset);
  
  let totalWeight = availableAnimals.reduce((sum, animal) => sum + animal.spawnProbability, 0);
  let r = Math.random() * totalWeight;
  let chosenAnimalType = null;
  for (let animal of availableAnimals) {
    r -= animal.spawnProbability;
    if (r <= 0) {
      chosenAnimalType = animal;
      break;
    }
  }
  if (!chosenAnimalType) chosenAnimalType = availableAnimals[0];
  
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
    layer: playerLayer.id // Store which layer this animal belongs to
  };
  
  console.log(`Spawned ${activeAnimal.type} at (${spawnX.toFixed(1)}, ${spawnY.toFixed(1)}), altitude: ${altitude}, state: ${initialState}, speed: ${activeAnimal.speed}, detectionRadius: ${activeAnimal.detectionRadius}, layer: ${playerLayer.id}`);
  
  if (!animalStateCheckInterval) {
    animalStateCheckInterval = setInterval(logAnimalState, 3000);
  }
}

function despawnAllAnimals() {
    activeAnimal = null;
    console.log('All animals despawned');
}

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

function drawAnimal() {
  if (!activeAnimal || currentState !== GameState.UPHILL) return;
  
  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
  let animalScreenY = activeAnimal.y - cameraOffset;
  
  if (activeAnimal.customDraw && typeof activeAnimal.customDraw === 'function') {
      activeAnimal.customDraw(activeAnimal, animalScreenY, ctx);
  } else {
      ctx.fillStyle = activeAnimal.color || "#888888";
      ctx.fillRect(
        activeAnimal.x - activeAnimal.width / 2,
        animalScreenY - activeAnimal.height / 2,
        activeAnimal.width,
        activeAnimal.height
      );
  }
}

window.registerAnimalType = registerAnimalType;
window.updateAnimal = updateAnimal;
window.spawnAnimal = spawnAnimal;
window.despawnAllAnimals = despawnAllAnimals;
window.drawAnimal = drawAnimal;
