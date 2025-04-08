/* fix-animal-rendering.js - Add rendering for all animals in the animals array */

// Save reference to the original drawAnimal function
const originalDrawAnimal = window.drawAnimal;

// Override the drawAnimal function to draw all animals
window.drawAnimal = function() {
  // First draw all the persistent animals in the animals array
  try {
    drawAllAnimals();
  } catch (error) {
    console.warn("Error in drawAllAnimals:", error);
  }
  
  // Then call the original function to handle activeAnimal
  if (originalDrawAnimal) {
    originalDrawAnimal();
  }
};

// Log once at initialization, not on every page load
console.log('🔍 ANIMAL SYSTEM STATUS:');
console.log('- fix-animal-rendering.js loaded');
console.log('- Current animals array:', window.animals);
console.log('- GameState available:', !!window.GameState);
console.log('- Current game state:', window.currentState);

// Track the last status check time to avoid spamming
let lastStatusCheckTime = 0;

// Add a less frequent timer to check animals
setInterval(() => {
  // Only log every 30 seconds
  const now = Date.now();
  if (now - lastStatusCheckTime < 30000) return;
  lastStatusCheckTime = now;
  
  console.log('🐾 ANIMAL CHECK: ', {
    total: window.animals ? window.animals.length : 0,
    state: window.currentState,
    player: player ? `at (${player.x}, ${player.absY})` : 'not available'
  });
}, 10000);

/**
 * Draws all animals in the animals array
 */
function drawAllAnimals() {
  // Safety checks to make sure all required objects exist
  if (!window.animals || 
      !window.animals.length || 
      !window.currentState || 
      ![window.GameState.UPHILL, window.GameState.DOWNHILL].includes(window.currentState) ||
      !player ||
      typeof player.absY !== 'number' ||
      !window.canvas ||
      !window.canvas.height ||
      !window.mountainHeight ||
      !window.getCameraOffset ||
      !window.getLayerByY ||
      !window.calculateWrappedPosRelativeToCamera) {
    return;
  }
  
  const cameraOffset = window.getCameraOffset(player.absY, window.canvas.height, window.mountainHeight);
  
  // Limit to only drawing animals within the visible area
  const visibleYStart = player.absY - window.canvas.height;
  const visibleYEnd = player.absY + window.canvas.height;
  
  // Log the number of animals less frequently (only 1% chance per frame)
  if (Math.random() < 0.01) {
    console.log(`🦊 Total animals: ${window.animals.length} | Player at: (${player.x}, ${player.absY}) | Game state: ${window.currentState}`);
  }
  
  // Count how many animals were actually drawn
  let drawnCount = 0;
  
  window.animals.forEach((animal, index) => {
    // Skip animals that are far outside the visible area
    if (animal.y < visibleYStart || animal.y > visibleYEnd) return;
    
    const animalScreenY = animal.y - cameraOffset;
    
    // Get the layer for the animal's current position
    const animalLayer = window.getLayerByY(animal.y);
    if (!animalLayer) return;  // Skip if layer not found
    
    const layerWidth = animalLayer.width;
    
    // Calculate the animal's position relative to the camera
    const wrappedAnimalX = window.calculateWrappedPosRelativeToCamera(animal.x, window.cameraX || 0, layerWidth);
    
    // Draw animal at the calculated position
    drawIndividualAnimalAt(animal, wrappedAnimalX, animalScreenY);
    drawnCount++;
    
    // Draw wrapped versions if near screen edges
    // Expanded threshold for smoother transitions - use half the screen width
    const viewThreshold = window.canvas.width / 2;
    
    if (wrappedAnimalX < viewThreshold) {
      // Draw duplicate on right side of screen
      drawIndividualAnimalAt(animal, wrappedAnimalX + layerWidth, animalScreenY);
    } else if (wrappedAnimalX > window.canvas.width - viewThreshold) {
      // Draw duplicate on left side of screen
      drawIndividualAnimalAt(animal, wrappedAnimalX - layerWidth, animalScreenY);
    }
  });
  
  // Log how many animals were actually drawn in this frame (only 2% chance per frame and only when animals are drawn)
  if (drawnCount > 0 && Math.random() < 0.02) {
    console.log(`🎨 Drew ${drawnCount} animals out of ${window.animals.length} total`);
  }
}

/**
 * Draws a single animal from the animals array at the specified position
 * @param {Object} animal - The animal object to draw
 * @param {number} x - The X position to draw at
 * @param {number} y - The Y position to draw at
 */
function drawIndividualAnimalAt(animal, x, y) {
  if (!window.ctx) return;
  
  // Make animals more visible by increasing size by 50%
  const displayWidth = animal.width * 1.5;
  const displayHeight = animal.height * 1.5;
  
  if (animal.customDraw && typeof animal.customDraw === 'function') {
    try {
      animal.customDraw(animal, y, window.ctx, x);
    } catch (error) {
      // Fallback to simple rectangle if custom draw fails
      window.ctx.fillStyle = animal.color || "#FF0000"; // Bright red default
      window.ctx.fillRect(
        x - displayWidth / 2,
        y - displayHeight / 2,
        displayWidth,
        displayHeight
      );
      
      // Add an outline
      window.ctx.strokeStyle = "#000000";
      window.ctx.lineWidth = 2;
      window.ctx.strokeRect(
        x - displayWidth / 2,
        y - displayHeight / 2,
        displayWidth,
        displayHeight
      );
    }
  } else {
    // Use a bright color to make animals more visible
    window.ctx.fillStyle = animal.color || "#FF0000"; // Bright red default
    window.ctx.fillRect(
      x - displayWidth / 2,
      y - displayHeight / 2,
      displayWidth,
      displayHeight
    );
    
    // Add an outline to improve visibility
    window.ctx.strokeStyle = "#000000";
    window.ctx.lineWidth = 2;
    window.ctx.strokeRect(
      x - displayWidth / 2,
      y - displayHeight / 2,
      displayWidth,
      displayHeight
    );
  }
}

// Export the function to the window object so it can be called from anywhere
window.drawAllAnimals = drawAllAnimals;

console.log("🎮 Animal rendering fix loaded - now showing all animals in the global animals array with enhanced visibility!");
