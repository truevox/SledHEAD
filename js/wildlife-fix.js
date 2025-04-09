/* wildlife-fix.js - Improved animal spawning to ensure animals appear */

console.log("🐾 Wildlife Fixes Loaded");

// Make sure we have some animal types to spawn
function ensureAnimalTypes() {
  if (!window.animalRegistry || window.animalRegistry.length === 0) {
    console.warn("⚠️ No animal types registered! Creating fallback animal type...");
    
    // Create a basic fallback animal type
    const fallbackAnimal = {
      type: "fallback",
      spawnProbability: 1,
      width: 40,
      height: 40,
      detectionRadius: 100,
      speed: 5,
      basePhotoBonus: 5,
      color: "#FF0000",
      validBiomes: ['forest', 'alpine', 'starterMountain'],
      customDraw: function(animal, screenY, ctx, drawX) {
        // Draw a very visible animal
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(drawX - 20, screenY - 20, 40, 40);
        
        // Add cross to make it more visible
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(drawX - 15, screenY);
        ctx.lineTo(drawX + 15, screenY);
        ctx.moveTo(drawX, screenY - 15);
        ctx.lineTo(drawX, screenY + 15);
        ctx.stroke();
      }
    };
    
    // If animalRegistry doesn't exist, create it
    if (!window.animalRegistry) {
      window.animalRegistry = [];
    }
    
    // Register our fallback animal
    window.animalRegistry.push(fallbackAnimal);
    console.log("✅ Created fallback animal type:", fallbackAnimal);
  }
}

// Enhanced version of spawnInitialAnimals that ensures animals are spawned
function enhancedSpawnInitialAnimals() {
  console.log("🚀 Enhanced animal spawning initiated...");
  
  // Make sure we have animal types
  ensureAnimalTypes();
  
  // Create animals array if it doesn't exist
  if (!window.animals) {
    window.animals = [];
  }
  
  // Clear any existing animals first (but keep any debug animals added before)
  const debugAnimals = window.animals.filter(a => a.type === "DEBUG_ANIMAL");
  window.animals.length = 0;
  // Add back any debug animals
  if (debugAnimals.length > 0) {
    window.animals.push(...debugAnimals);
    console.log(`🐛 Preserved ${debugAnimals.length} debug animals`);
  }
  
  // Get mountain layers
  const layers = window.mountainLayers || [];
  if (!layers.length) {
    console.error("❌ No mountain layers found! Cannot spawn animals.");
    return;
  }
  
  console.log("📊 Spawning animals for layers:", layers);
  
  // For each layer, spawn the configured number of animals
  layers.forEach(layer => {
    const layerId = layer.id;
    
    // GREATLY increase animals per layer to make them more visible
    // If totalAnimalsPerLayer is defined, use a minimum of 5, otherwise use 10 animals
    const minAnimalsPerLayer = 5;
    const defaultAnimalsPerLayer = 10;
    const configuredAmount = layer.totalAnimalsPerLayer || 0;
    const animalsForLayer = Math.max(minAnimalsPerLayer, configuredAmount > 0 ? configuredAmount : defaultAnimalsPerLayer);
    
    console.log(`🏔️ Layer ${layerId}: Spawning ${animalsForLayer} animals...`);
    
    // Get all registered animal types
    const animalTypes = window.animalRegistry;
    
    // Spawn animals for this layer
    for (let i = 0; i < animalsForLayer; i++) {
      // Choose a random animal type
      const randomIndex = Math.floor(Math.random() * animalTypes.length);
      const animalType = animalTypes[randomIndex];
      
      // Generate random position within layer bounds
      const x = Math.random() * layer.width;
      // Distribute animals evenly within the layer height
      const y = layer.startY + (i / animalsForLayer) * (layer.endY - layer.startY);
      
      // Create the animal with enhanced visibility
      const animal = {
        type: animalType.type,
        x: x,
        y: y,
        width: animalType.width || 40,       // Use larger sizes by default
        height: animalType.height || 40,      // Use larger sizes by default
        color: getColorForLayer(layerId),     // Use different colors per layer
        state: "sitting",
        speed: animalType.speed || 5,
        altitude: Math.floor(Math.random() * 100),
        hasBeenPhotographed: false,
        detectionRadius: animalType.detectionRadius || 100,
        fleeAngleActual: Math.random() * 360,
        fleeingLogOnce: false,
        lastStateChange: Date.now(),
        stateChangeCount: 0,
        basePhotoBonus: animalType.basePhotoBonus || 5,
        customDraw: animalType.customDraw || createCustomDrawForLayer(layerId, animalType.type),
        layer: layerId,
        sitTimer: null
      };
      
      // Add the animal to the global array
      window.animals.push(animal);
      
      console.log(`🦊 Spawned ${animal.type} at (${x.toFixed(1)}, ${y.toFixed(1)}) in layer ${layerId}`);
    }
  });
  
  console.log(`✅ Enhanced animal spawning complete. Total ${window.animals.length} animals ready!`);
  return window.animals.length;
}

// Function to get different colors for animals in different layers
function getColorForLayer(layerId) {
  // Use distinct bright colors for each layer
  const layerColors = {
    0: "#FF2222", // Bright red for peak
    1: "#22FF22", // Bright green for mid-peak
    2: "#2222FF", // Bright blue for mid-base
    3: "#FFFF22"  // Yellow for base/start
  };
  
  return layerColors[layerId] || "#FF00FF"; // Magenta fallback
}

// Create custom draw functions that are distinct for each layer
function createCustomDrawForLayer(layerId, animalType) {
  return function(animal, screenY, ctx, drawX) {
    // Base color from the layer
    const baseColor = getColorForLayer(layerId);
    ctx.fillStyle = baseColor;
    
    // Draw main body - larger size for better visibility
    const size = 30; // Base size
    ctx.fillRect(drawX - size, screenY - size, size*2, size*2);
    
    // Add a distinct marker based on the layer
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    
    // Different patterns for each layer
    switch(layerId) {
      case 0: // Peak - X shape
        ctx.beginPath();
        ctx.moveTo(drawX - size/2, screenY - size/2);
        ctx.lineTo(drawX + size/2, screenY + size/2);
        ctx.moveTo(drawX + size/2, screenY - size/2);
        ctx.lineTo(drawX - size/2, screenY + size/2);
        ctx.stroke();
        break;
      case 1: // Mid-peak - Circle
        ctx.beginPath();
        ctx.arc(drawX, screenY, size/2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 2: // Mid-base - Triangle
        ctx.beginPath();
        ctx.moveTo(drawX, screenY - size/2);
        ctx.lineTo(drawX + size/2, screenY + size/2);
        ctx.lineTo(drawX - size/2, screenY + size/2);
        ctx.closePath();
        ctx.stroke();
        break;
      case 3: // Base - Square
        ctx.strokeRect(drawX - size/2, screenY - size/2, size, size);
        break;
      default:
        // Diamond
        ctx.beginPath();
        ctx.moveTo(drawX, screenY - size/2);
        ctx.lineTo(drawX + size/2, screenY);
        ctx.lineTo(drawX, screenY + size/2);
        ctx.lineTo(drawX - size/2, screenY);
        ctx.closePath();
        ctx.stroke();
    }
    
    // Add animal type text for extra clarity
    ctx.font = '12px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(animalType, drawX, screenY + size + 15);
  };
}

// Replace the original spawnInitialAnimals with our enhanced version
window.originalSpawnInitialAnimals = window.spawnInitialAnimals;
window.spawnInitialAnimals = enhancedSpawnInitialAnimals;

// Function to force spawn or respawn animals
window.forceRespawnAllAnimals = function() {
  console.log("🔄 Forcing respawn of all animals...");
  return enhancedSpawnInitialAnimals();
};

// Force spawn animals when this script loads if we're outside the house
setTimeout(() => {
  if (window.currentState && window.currentState !== window.GameState.HOUSE) {
    console.log("🚀 Auto-spawning animals outside house...");
    enhancedSpawnInitialAnimals();
  } else {
    console.log("🏠 In house - animals will spawn when leaving");
  }
}, 1000);

console.log("🐾 Wildlife fixes initialized!"); 