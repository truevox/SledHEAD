/* animal-debug.js - Forcibly spawn test animals and debug rendering */

console.log("🔧 Animal Debug Script Loaded");

// Force spawn some very visible test animals after a delay
setTimeout(() => {
  console.log("🔍 Debugging animal system...");

  // Check current animals array
  console.log("Current animals array:", window.animals);
  console.log("Animal registry:", window.animalRegistry);
  
  // Create test animals if none exist
  if (!window.animals || window.animals.length === 0) {
    console.log("📢 No animals found! Creating test animals...");
    
    // If animals array doesn't exist, create it
    if (!window.animals) {
      window.animals = [];
    }
    
    // Create 5 highly visible test animals
    for (let i = 0; i < 5; i++) {
      // Ensure player exists before using its position
      if (!player || typeof player.absY !== 'number') {
        console.error("❌ Player not available for animal placement");
        return;
      }
      
      // Place animals near the player's current position
      const testAnimal = {
        type: "DEBUG_ANIMAL",
        x: (window.canvas.width / 2) - 100 + (i * 50), // Spread animals horizontally
        y: player.absY - 100, // Place above the player
        width: 40,
        height: 40,
        state: "sitting",
        speed: 2,
        altitude: 50,
        hasBeenPhotographed: false,
        detectionRadius: 200,
        fleeAngleActual: 45,
        fleeingLogOnce: false,
        lastStateChange: Date.now(),
        stateChangeCount: 0,
        color: "#FF00FF", // Bright magenta
        layer: player.currentLayerIndex || 3
      };
      
      window.animals.push(testAnimal);
      console.log(`👾 Created test animal #${i+1} at (${testAnimal.x}, ${testAnimal.y})`);
    }
    
    console.log("✅ Test animals created:", window.animals);
  }
  
  // Force visible state
  window.currentState = window.GameState.UPHILL;
  
  // Monkeypatch drawIndividualAnimalAt for super visibility if needed
  if (typeof drawIndividualAnimalAt === 'function') {
    const originalDrawIndividualAnimalAt = drawIndividualAnimalAt;
    
    drawIndividualAnimalAt = function(animal, x, y) {
      if (!window.ctx) return;
      
      // Call original implementation
      originalDrawIndividualAnimalAt(animal, x, y);
      
      // Add extra highlight circle
      window.ctx.beginPath();
      window.ctx.arc(x, y, 30, 0, Math.PI * 2);
      window.ctx.strokeStyle = '#00FFFF';
      window.ctx.lineWidth = 3;
      window.ctx.stroke();
      
      // Add label
      window.ctx.font = '14px Arial';
      window.ctx.fillStyle = '#FFFFFF';
      window.ctx.fillText(`Animal at (${Math.round(animal.x)}, ${Math.round(animal.y)})`, x - 70, y - 30);
    };
    
    console.log("🎨 Enhanced animal rendering with debug visuals");
  }
}, 2000);

// Track the last visibility check time to avoid spamming
let lastVisibilityCheckTime = 0;

// Check periodically if animals are visible, but not too frequently
setInterval(() => {
  // Only log every 10 seconds max
  const now = Date.now();
  if (now - lastVisibilityCheckTime < 10000) return;
  lastVisibilityCheckTime = now;
  
  if (window.animals && window.animals.length > 0) {
    const visibleCount = window.animals.filter(animal => {
      if (!player || typeof player.absY !== 'number') return false;
      
      // Check if animal is within visible range
      const visibleYStart = player.absY - window.canvas.height;
      const visibleYEnd = player.absY + window.canvas.height;
      
      return animal.y >= visibleYStart && animal.y <= visibleYEnd;
    }).length;
    
    console.log(`🔍 VISIBILITY CHECK: ${visibleCount} of ${window.animals.length} animals should be visible`);
  }
}, 3000);

console.log("🔧 Animal debug tools initialized");

// Add click handler for respawn animals button
document.addEventListener('DOMContentLoaded', () => {
  const respawnBtn = document.getElementById('respawn-animals');
  if (respawnBtn) {
    respawnBtn.addEventListener('click', () => {
      console.log("🔄 Manual respawn of animals triggered");
      
      // Force respawn all animals
      if (typeof window.forceSpawnAnimals === 'function') {
        window.forceSpawnAnimals();
        console.log("✅ Animals respawned using forceSpawnAnimals");
      } else if (typeof window.forceRespawnAllAnimals === 'function') {
        const count = window.forceRespawnAllAnimals();
        console.log(`✅ Respawned ${count} animals`);
      } else if (typeof window.spawnInitialAnimals === 'function') {
        window.spawnInitialAnimals();
        console.log(`✅ Animals respawned using spawnInitialAnimals`);
      } else {
        console.error("❌ No animal spawning function found!");
      }
    });
    
    console.log("🔄 Animal respawn button initialized");
  }
}); 