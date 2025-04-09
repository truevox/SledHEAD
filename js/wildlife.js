/* wildlife.js - Wildlife Simulation (Refactored with Spawning Biomes and Fallback)
// This file handles the overall wildlife simulation logic using a registration system.
// Each animal module (e.g., bear.js, bird.js, mountainlion.js) registers itself by calling registerAnimalType().
// Animals have a "spawningBiomes" property that defines in which biomes and mountain layers they spawn.
// If currentBiome is not defined or unrecognized, the system assumes every mountain is valid.
*/

// Global registry for animal types
var animalRegistry = [];

// Global array to store all animals in the world
// Use global.animals if it exists (test environment), otherwise create a new array
if (typeof global !== 'undefined') {
  if (!global.animals) {
    global.animals = [];
  }
  var animals = global.animals;
} else {
  var animals = [];
}

// Function for animal modules to register themselves
function registerAnimalType(animalData) {
    animalRegistry.push(animalData);
    console.log("Registered animal type: " + animalData.type);
}

// Global variables for the animal system
var activeAnimal = null;
var animalStateCheckInterval = null;

// Add a timestamped logging helper function at the top of the file
/**
 * Helper function to create timestamped log messages for animal-related events
 * @param {string} prefix - The log category/prefix
 * @param {string} message - The log message
 */
function animalLog(prefix, message) {
  const timestamp = new Date().toISOString().substr(11, 12); // HH:MM:SS.mmm format
  console.log(`[${timestamp}] [${prefix}] ${message}`);
}

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
      animalLog("FLEE", `ActiveAnimal ${activeAnimal.type} fleeing - Angle: ${activeAnimal.fleeAngleActual.toFixed(2)}°, Speed: ${activeAnimal.speed}`);
      activeAnimal.fleeingLogOnce = true;
    }
    
    // Log position before movement for debugging
    const oldX = activeAnimal.x;
    const oldY = activeAnimal.y;
    const oldLayerId = getLayerByY(activeAnimal.y).id;
    
    let rad = activeAnimal.fleeAngleActual * Math.PI / 180;
    let newX = activeAnimal.x + Math.cos(rad) * activeAnimal.speed * 0.5;
    activeAnimal.y += Math.sin(rad) * activeAnimal.speed * 0.5;
    
    // Get the layer for the animal's current Y position
    const animalLayer = getLayerByY(activeAnimal.y);
    
    // Apply wrapping for horizontal movement
    activeAnimal.x = calculateWrappedX(newX, animalLayer.width);
    
    // Log significant position changes with layer information
    if (Math.abs(activeAnimal.x - oldX) > 5 || Math.abs(activeAnimal.y - oldY) > 5 || oldLayerId !== animalLayer.id) {
      animalLog("MOVE", `ActiveAnimal ${activeAnimal.type} moved from (${oldX.toFixed(1)}, ${oldY.toFixed(1)}) [Layer ${oldLayerId}] to (${activeAnimal.x.toFixed(1)}, ${activeAnimal.y.toFixed(1)}) [Layer ${animalLayer.id}]`);
    }
    
    let dx = activeAnimal.x - player.x;
    let dy = activeAnimal.y - player.absY;
    
    // Adjust distance calculation for wrapped world
    // If dx is more than half the layer width, it's shorter to go around the other way
    if (Math.abs(dx) > animalLayer.width / 2) {
      if (dx > 0) {
        dx = dx - animalLayer.width;
      } else {
        dx = dx + animalLayer.width;
      }
    }
    
    let distance = Math.sqrt(dx * dx + dy * dy);
    // Log distance periodically
    if (Math.random() < 0.05) {
      animalLog("DIST", `ActiveAnimal ${activeAnimal.type} distance to player: ${distance.toFixed(1)} units`);
    }
  } else if (activeAnimal.state === "sitting") {
    if (Math.random() < 0.0001) {
      animalLog("STATE", `ActiveAnimal ${activeAnimal.type} spontaneously changing state from sitting to fleeing`);
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
    animalLog("PROX", `Player too close to activeAnimal (${Math.sqrt(distanceSquared).toFixed(1)} < ${activeAnimal.detectionRadius}) - animal fleeing from position (${activeAnimal.x.toFixed(1)}, ${activeAnimal.y.toFixed(1)})`);
    activeAnimal.state = "fleeing";
    activeAnimal.fleeingLogOnce = false;
    
    activeAnimal.fleeAngleActual = Math.atan2(dy, dx) * (180 / Math.PI);
    activeAnimal.fleeAngleActual += (Math.random() - 0.5) * 30;
    animalLog("FLEE", `ActiveAnimal ${activeAnimal.type} calculated flee angle: ${activeAnimal.fleeAngleActual.toFixed(2)}°`);
  }
}

// Spawn a new animal using the registered types, with biome filtering.
// This is kept for compatibility with existing code.
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
    layer: playerLayer.id, // Store which layer this animal belongs to
    sitTimer: null // Timer for sitting state duration
  };
  
  animalLog("SPAWN", `ActiveAnimal ${activeAnimal.type} spawned at (${spawnX.toFixed(1)}, ${spawnY.toFixed(1)}), altitude: ${altitude}, state: ${initialState}, speed: ${activeAnimal.speed}, detectionRadius: ${activeAnimal.detectionRadius}, layer: ${playerLayer.id}`);
  
  if (!animalStateCheckInterval) {
    animalStateCheckInterval = setInterval(logAnimalState, 3000);
    animalLog("TIMER", "Starting animal state check interval");
  }
}

/**
 * Spawns all animals once at world initialization, distributed across layers
 * based on the totalAnimalsPerLayer configuration.
 */
function spawnInitialAnimals() {
  animalLog("INIT", "Spawning initial animals for all mountain layers...");
  
  // Initialize animals array if it doesn't exist yet, but DON'T clear it if it does
  if (!animals) {
    animals = [];
    if (typeof global !== 'undefined') {
      global.animals = animals;
    }
  }
  
  // Only proceed with spawning if the animals array is empty
  if (animals.length > 0) {
    animalLog("INIT", `Animals already exist, skipping spawn. Current count: ${animals.length}`);
    return animals.length;
  }
  
  console.log("Initial animalRegistry:", animalRegistry);
  console.log("Initial mountainLayers:", mountainLayers);
  
  // If there are no registered animal types, log an error and return
  if (animalRegistry.length === 0) {
    console.error("No animal types registered! Cannot spawn animals.");
    return 0;
  }
  
  // Always spawn the special forced bear first (PRESERVED FEATURE)
  const bearType = animalRegistry.find(animal => animal.type === 'bear');
  if (bearType) {
    // Create a bear at the specific location with all required properties
    const bear = {
      type: "bear",
      x: 10, // Specific X position requested
      y: 19850, // Specific Y position requested (just above player)
      width: bearType.width || 40,
      height: bearType.height || 60,
      state: "sitting",
      speed: bearType.speed || 8,
      altitude: 50,
      hasBeenPhotographed: false,
      detectionRadius: bearType.detectionRadius || 50,
      fleeAngleActual: 45, // Default flee angle
      fleeingLogOnce: false,
      lastStateChange: Date.now(),
      stateChangeCount: 0,
      basePhotoBonus: bearType.basePhotoBonus || 10,
      customUpdate: bearType.customUpdate || null,
      customDraw: bearType.customDraw || null,
      layer: 3, // Bottom layer
      sitTimer: null
    };
    
    // Add the bear as the first animal
    animals.push(bear);
    animalLog("BEAR", `Forced spawn of bear at (10, 19850) in layer 3, speed: ${bear.speed}, detectionRadius: ${bear.detectionRadius}`);
  }
  
  // Iterate through each mountain layer (PRESERVED FEATURE - hardcoded counts per biome/layer)
  mountainLayers.forEach((layer, index) => {
    const layerId = layer.id;
    const totalAnimalsForThisLayer = layer.totalAnimalsPerLayer || 0;
    
    console.log(`Processing layer ${layerId} with totalAnimalsPerLayer: ${totalAnimalsForThisLayer}`);
    
    if (totalAnimalsForThisLayer <= 0) {
      console.warn(`Layer ${layerId} has no animals configured (totalAnimalsPerLayer is ${totalAnimalsForThisLayer}).`);
      return;
    }
    
    let biome = "unknown";
    if (typeof currentBiome !== 'undefined') {
      biome = currentBiome;
    }
    
    console.log(`Populating layer ${layerId} (${biome}) with ${totalAnimalsForThisLayer} animals...`);
    
    // Filter animal types based on biome compatibility (PRESERVED FEATURE)
    let validAnimalTypesForLayer;
    if (layerId === 3) {
      // Layer ID 3 is the Base Layer/starting zone - include all animal types
      validAnimalTypesForLayer = animalRegistry.slice();
      console.log("This is the starting zone (Base Layer) - including all animal types:", validAnimalTypesForLayer);
    } else {
      // For non-starting zones, filter by valid biomes
      validAnimalTypesForLayer = animalRegistry.filter(animal => {
        const isValid = animal.validBiomes && animal.validBiomes.includes(biome);
        console.log(`Checking animal ${animal.type} for biome ${biome}: ${isValid}`);
        return isValid;
      });
    }
    
    console.log(`Valid animal types for layer ${layerId}:`, validAnimalTypesForLayer);
    
    if (validAnimalTypesForLayer.length === 0) {
      console.warn(`No valid animal types found for layer ID ${layerId} and biome ${biome}.`);
      return;
    }
    
    // Calculate total weight for weighted random selection
    const totalWeight = validAnimalTypesForLayer.reduce(
      (sum, animal) => sum + (animal.spawnProbability || 1), 0
    );
    
    console.log(`Total weight for layer ${layerId}: ${totalWeight}`);
    
    if (totalWeight <= 0) {
      console.warn(`Total weight for valid animals in layer ${layerId} is ${totalWeight}. Cannot spawn animals.`);
      return;
    }
    
    // Spawn the configured number of animals for this layer (PRESERVED FEATURE - granular positioning)
    for (let i = 0; i < totalAnimalsForThisLayer; i++) {
      // Randomly select an animal type using spawn probabilities as weights
      let r = Math.random() * totalWeight;
      let chosenAnimalType = null;
      
      for (let animal of validAnimalTypesForLayer) {
        r -= (animal.spawnProbability || 1);
        if (r <= 0) {
          chosenAnimalType = animal;
          break;
        }
      }
      
      // Fallback to the first animal if none selected (shouldn't happen with proper weights)
      if (!chosenAnimalType) {
        chosenAnimalType = validAnimalTypesForLayer[0];
      }
      
      // Generate random coordinates within this layer (PRESERVED FEATURE - granular positioning)
      const spawnX = Math.random() * layer.width;
      const spawnY = layer.startY + Math.random() * (layer.endY - layer.startY);
      const altitude = Math.floor(Math.random() * 100);
      
      // Calculate flee angle similar to original code (PRESERVED FEATURE)
      const layerWidth = layer.width;
      let baseAngle = spawnX > layerWidth / 2 ?
                     Math.random() * (170 - 135) + 135 :
                     Math.random() * (55 - 20) + 20;
      let angleOffset = Math.random() * 15;
      let fleeAngleActual = baseAngle + (Math.random() < 0.5 ? -angleOffset : angleOffset);
      
      // Create the animal object (PRESERVED FEATURE - all necessary properties)
      const animal = {
        type: chosenAnimalType.type,
        x: spawnX,
        y: spawnY,
        width: chosenAnimalType.width,
        height: chosenAnimalType.height,
        state: "sitting",
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
        layer: layerId,
        sitTimer: null // Timer for sitting state duration
      };
      
      // Add the animal to the global array
      animals.push(animal);
      if (typeof global !== 'undefined') {
        // Ensure the global array is updated in the test environment
        global.animals = animals;
      }
      
      console.log(`Spawned ${animal.type} at (${spawnX.toFixed(1)}, ${spawnY.toFixed(1)}) in layer ${layerId}`);
    }
  });
  
  animalLog("INIT", `Initial animal spawning complete. Total animals: ${animals.length}`);
  return animals.length;
}

function despawnAllAnimals() {
  animalLog("DESPAWN", "Despawning all animals...");
  
  // Safety check - only despawn animals when explicitly requested by the game
  // This function should only be called when returning to the house
  const callerInfo = new Error().stack.split('\n')[2] || "unknown caller";
  animalLog("DESPAWN", `Called by: ${callerInfo}`);
  
  if (window.currentState !== window.GameState.HOUSE) {
    animalLog("WARNING", "Attempted to despawn animals outside of HOUSE state - ignoring request");
    return;
  }
  
  if (animals) {
    animalLog("DESPAWN", `Removing ${animals.length} animals from the world`);
    animals.length = 0;
  }
  if (activeAnimal) {
    animalLog("DESPAWN", `Clearing activeAnimal (${activeAnimal.type})`);
    activeAnimal = null;
  }
  
  // Reset the spawn flag in game.js if it exists
  if (typeof window.resetAnimalsSpawnFlag === 'function') {
    window.resetAnimalsSpawnFlag();
    animalLog("DESPAWN", "Animal spawn flag reset");
  }
}

function logAnimalState() {
  if (!activeAnimal) {
    animalLog("STATUS", "No active animal right now");
    clearInterval(animalStateCheckInterval);
    animalStateCheckInterval = null;
    animalLog("TIMER", "Clearing animal state check interval");
    return;
  }
  
  let playerDist = Math.sqrt(
    Math.pow(activeAnimal.x - player.x, 2) + 
    Math.pow(activeAnimal.y - player.absY, 2)
  );
  
  animalLog("STATUS", `ActiveAnimal ${activeAnimal.type}, state: ${activeAnimal.state}, position: (${activeAnimal.x.toFixed(1)}, ${activeAnimal.y.toFixed(1)}), distance to player: ${playerDist.toFixed(1)}`);
}

function drawAnimal() {
  // Still support the legacy activeAnimal for compatibility
  if (activeAnimal && currentState === GameState.UPHILL) {
    let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
    let animalScreenY = activeAnimal.y - cameraOffset;
    
    // Get the layer for the animal's current position
    const animalLayer = getLayerByY(activeAnimal.y);
    const layerWidth = animalLayer.width;
    
    // Calculate the animal's position relative to the camera
    const wrappedAnimalX = calculateWrappedPosRelativeToCamera(activeAnimal.x, window.cameraX || 0, layerWidth);
    
    // Draw animal at the calculated position
    drawAnimalAt(wrappedAnimalX, animalScreenY, activeAnimal);
    
    // Draw wrapped versions if near screen edges
    // Expanded threshold for smoother transitions - use half the screen width
    const viewThreshold = canvas.width / 2;
    
    if (wrappedAnimalX < viewThreshold) {
      // Draw duplicate on right side of screen
      drawAnimalAt(wrappedAnimalX + layerWidth, animalScreenY, activeAnimal);
    } else if (wrappedAnimalX > canvas.width - viewThreshold) {
      // Draw duplicate on left side of screen
      drawAnimalAt(wrappedAnimalX - layerWidth, animalScreenY, activeAnimal);
    }
  }
  
  // ALSO draw all animals in the animals array (NEW CODE)
  if (animals && animals.length > 0 && (currentState === GameState.UPHILL || currentState === GameState.DOWNHILL)) {
    let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
    
    animals.forEach(animal => {
      let animalScreenY = animal.y - cameraOffset;
      
      // Get the layer for the animal's current position
      const animalLayer = getLayerByY(animal.y);
      if (!animalLayer) return; // Skip if no layer found
      
      const layerWidth = animalLayer.width;
      
      // Calculate the animal's position relative to the camera
      const wrappedAnimalX = calculateWrappedPosRelativeToCamera(animal.x, window.cameraX || 0, layerWidth);
      
      // Draw animal at the calculated position
      drawAnimalAt(wrappedAnimalX, animalScreenY, animal);
      
      // Draw wrapped versions if near screen edges
      // Expanded threshold for smoother transitions - use half the screen width
      const viewThreshold = canvas.width / 2;
      
      if (wrappedAnimalX < viewThreshold) {
        // Draw duplicate on right side of screen
        drawAnimalAt(wrappedAnimalX + layerWidth, animalScreenY, animal);
      } else if (wrappedAnimalX > canvas.width - viewThreshold) {
        // Draw duplicate on left side of screen
        drawAnimalAt(wrappedAnimalX - layerWidth, animalScreenY, animal);
      }
    });
  }
}

/**
 * Draws an animal at the specified position
 * @param {number} x - The X position to draw at
 * @param {number} y - The Y position to draw at
 * @param {object} animal - The animal object to draw
 */
function drawAnimalAt(x, y, animal) {
  if (!animal) return; // Safety check
  
  if (animal.customDraw && typeof animal.customDraw === 'function') {
    animal.customDraw(animal, y, ctx, x);
  } else {
    ctx.fillStyle = animal.color || "#888888";
    ctx.fillRect(
      x - animal.width / 2,
      y - animal.height / 2,
      animal.width,
      animal.height
    );
  }
}

/**
 * Updates all animals in the animals array
 * This function handles updating animal states, checking proximity, and movement
 */
function updateAllAnimals() {
  if (!animals || !animals.length) return;
  
  // Log animal count periodically (every ~10 seconds)
  if (Math.random() < 0.01) {
    animalLog("COUNT", `Updating ${animals.length} animals in ${window.currentState} state`);
  }
  
  const now = Date.now();
  
  animals.forEach((animal, index) => {
    // Skip animals too far from player for performance (outside of 3x screen height)
    if (Math.abs(animal.y - player.absY) > canvas.height * 3) return;
    
    // Record processing time for potential performance issues
    const startTime = performance.now();
    
    // Call custom update if provided
    if (animal.customUpdate && typeof animal.customUpdate === 'function') {
      animal.customUpdate(animal);
    }
    
    // Check if player is too close to animal
    if (animal.state !== "fleeing") {
      let dx = animal.x - player.x;
      let dy = animal.y - player.absY;
      
      // Get the layer for the animal's current Y position
      const animalLayer = getLayerByY(animal.y);
      if (!animalLayer) {
        animalLog("ERROR", `Animal ${animal.type} at (${animal.x.toFixed(1)}, ${animal.y.toFixed(1)}) has no valid layer - this shouldn't happen!`);
        return; // Skip if no layer found
      }
      
      // Adjust distance calculation for wrapped world
      if (Math.abs(dx) > animalLayer.width / 2) {
        if (dx > 0) {
          dx = dx - animalLayer.width;
        } else {
          dx = dx + animalLayer.width;
        }
      }
      
      let distanceSquared = dx * dx + dy * dy;
      
      if (distanceSquared < animal.detectionRadius * animal.detectionRadius) {
        // Only log when state actually changes to avoid spam
        if (animal.state !== "fleeing") {
          animalLog("PROX", `Player too close to animal[${index}] ${animal.type} at (${animal.x.toFixed(1)}, ${animal.y.toFixed(1)}) in layer ${animalLayer.id} - animal fleeing (distance: ${Math.sqrt(distanceSquared).toFixed(1)} < ${animal.detectionRadius})`);
        }
        
        animal.state = "fleeing";
        animal.fleeingLogOnce = false;
        
        animal.fleeAngleActual = Math.atan2(dy, dx) * (180 / Math.PI);
        animal.fleeAngleActual += (Math.random() - 0.5) * 30;
        animalLog("FLEE", `Animal[${index}] ${animal.type} calculated flee angle: ${animal.fleeAngleActual.toFixed(2)}°`);
      }
    }
    
    // Handle fleeing state
    if (animal.state === "fleeing") {
      if (!animal.fleeingLogOnce) {
        animalLog("FLEE", `Animal[${index}] ${animal.type} fleeing - Angle: ${animal.fleeAngleActual.toFixed(2)}°, Speed: ${animal.speed}`);
        animal.fleeingLogOnce = true;
      }
      
      // Save old position for logging significant changes
      const oldX = animal.x;
      const oldY = animal.y;
      const oldLayer = getLayerByY(animal.y);
      if (!oldLayer) {
        animalLog("ERROR", `Animal[${index}] ${animal.type} at (${animal.x.toFixed(1)}, ${animal.y.toFixed(1)}) has no valid layer before movement!`);
        return;
      }
      const oldLayerId = oldLayer.id;
      
      let rad = animal.fleeAngleActual * Math.PI / 180;
      let newX = animal.x + Math.cos(rad) * animal.speed * 0.5;
      animal.y += Math.sin(rad) * animal.speed * 0.5;
      
      // Get the layer for the animal's current Y position
      const animalLayer = getLayerByY(animal.y);
      if (!animalLayer) {
        animalLog("ERROR", `Animal[${index}] ${animal.type} moved to (${animal.x.toFixed(1)}, ${animal.y.toFixed(1)}) which has no valid layer!`);
        // Reset to old position as a failsafe
        animal.y = oldY;
        return;
      }
      
      // Apply wrapping for horizontal movement
      animal.x = calculateWrappedX(newX, animalLayer.width);
      
      // Check for layer changes or significant position changes
      const movedFar = Math.abs(animal.x - oldX) > 5 || Math.abs(animal.y - oldY) > 5;
      const changedLayer = oldLayerId !== animalLayer.id;
      
      if (changedLayer) {
        animalLog("LAYER", `Animal[${index}] ${animal.type} crossed layer boundary from ${oldLayerId} to ${animalLayer.id} at position (${animal.x.toFixed(1)}, ${animal.y.toFixed(1)})`);
      }
      
      // Log significant position changes (for debugging)
      if (movedFar || changedLayer) {
        animalLog("MOVE", `Animal[${index}] ${animal.type} moved from (${oldX.toFixed(1)}, ${oldY.toFixed(1)}) [Layer ${oldLayerId}] to (${animal.x.toFixed(1)}, ${animal.y.toFixed(1)}) [Layer ${animalLayer.id}]`);
      }
      
      // Check for suspicious warping (very large instantaneous movement)
      const distanceMoved = Math.sqrt(Math.pow(animal.x - oldX, 2) + Math.pow(animal.y - oldY, 2));
      if (distanceMoved > animal.speed * 5) {
        animalLog("WARP", `SUSPICIOUS WARP DETECTED for animal[${index}] ${animal.type} - moved ${distanceMoved.toFixed(1)} units in one frame (expected max: ${animal.speed * 0.5})!`);
        animalLog("WARP", `  From: (${oldX.toFixed(1)}, ${oldY.toFixed(1)}) [Layer ${oldLayerId}, width: ${oldLayer.width}]`);
        animalLog("WARP", `  To: (${animal.x.toFixed(1)}, ${animal.y.toFixed(1)}) [Layer ${animalLayer.id}, width: ${animalLayer.width}]`);
        animalLog("WARP", `  Calculation: newX=${newX.toFixed(1)}, rad=${rad.toFixed(2)}, cos(rad)=${Math.cos(rad).toFixed(2)}, sin(rad)=${Math.sin(rad).toFixed(2)}`);
      }
    } 
    // Handle sitting state - small chance to spontaneously flee
    else if (animal.state === "sitting") {
      if (Math.random() < 0.0001) {
        animalLog("STATE", `Animal[${index}] ${animal.type} spontaneously changing state from sitting to fleeing`);
        animal.state = "fleeing";
        animal.fleeingLogOnce = false;
      }
    }
    
    // Monitor for performance issues
    const updateTime = performance.now() - startTime;
    if (updateTime > 5) { // Log if update takes more than 5ms
      animalLog("PERF", `SLOW UPDATE: Animal[${index}] ${animal.type} update took ${updateTime.toFixed(1)}ms`);
    }
  });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    spawnInitialAnimals,
    animals,
    animalRegistry,
    registerAnimalType,
    spawnAnimal,
    updateAnimal,
    drawAnimal,
    despawnAllAnimals
  };
}

// Export to window/global scope
if (typeof window !== 'undefined') {
  window.registerAnimalType = registerAnimalType;
  window.updateAnimal = updateAnimal;
  window.updateAllAnimals = updateAllAnimals;
  window.spawnAnimal = spawnAnimal;
  window.despawnAllAnimals = despawnAllAnimals;
  window.drawAnimal = drawAnimal;
  window.spawnInitialAnimals = spawnInitialAnimals;
  window.animals = animals;
}
