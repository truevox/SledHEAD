/* animal-loader.js - Ensures animal modules are properly loaded and registered */

(function() {
  console.log("🐾 Animal loader starting...");
  
  // Check if animal registry exists
  if (!window.animalRegistry || window.animalRegistry.length === 0) {
    console.log("⚠️ No animals registered yet. Ensuring all modules load correctly...");
    
    // List of expected animal modules
    const animalModules = [
      { type: "bear", path: "js/mobs/bear.js" },
      { type: "bird", path: "js/mobs/bird.js" },
      { type: "mountainlion", path: "js/mobs/mountainlion.js" }
    ];
    
    // Force load the animal modules if needed
    animalModules.forEach(animal => {
      // Check if this animal type is registered
      if (!window.animalRegistry || !window.animalRegistry.some(a => a.type === animal.type)) {
        console.log(`🔄 Loading animal module: ${animal.type}`);
        
        // Create and load the script
        const script = document.createElement('script');
        script.src = animal.path;
        script.async = false; // Important to maintain order
        document.head.appendChild(script);
      }
    });
    
    // If after checking all modules we still don't have animals, create a fallback
    setTimeout(() => {
      if (!window.animalRegistry || window.animalRegistry.length === 0) {
        console.warn("❗ Animal modules failed to load. Creating fallback animals...");
        
        // Initialize registry if needed
        if (!window.animalRegistry) {
          window.animalRegistry = [];
        }
        
        // Create a fallback bear
        const fallbackBear = {
          type: "bear",
          spawnProbability: 0.5,
          width: 40,
          height: 60,
          detectionRadius: 100,
          speed: 8,
          basePhotoBonus: 10,
          color: "#8B4513",
          validBiomes: ['forest', 'alpine', 'starterMountain'],
          customDraw: function(animal, screenY, ctx, drawX) {
            // Draw a very visible bear
            ctx.fillStyle = "#8B4513";
            ctx.fillRect(drawX - 20, screenY - 30, 40, 60);
            
            // Draw bear ears
            ctx.fillStyle = "#000000";
            ctx.fillRect(drawX - 15, screenY - 35, 10, 10);
            ctx.fillRect(drawX + 5, screenY - 35, 10, 10);
          }
        };
        
        // Register fallback animals
        window.animalRegistry.push(fallbackBear);
        
        console.log("✅ Created fallback animals:", window.animalRegistry);
      }
    }, 1000);
  }
  
  // Set up a function to manually force animal spawning
  window.forceSpawnAnimals = function() {
    console.log("🌟 Force spawning animals...");
    if (typeof window.spawnInitialAnimals === 'function') {
      // Reset animal spawning flag
      if (typeof window.resetAnimalsSpawnFlag === 'function') {
        window.resetAnimalsSpawnFlag();
      }
      
      return window.spawnInitialAnimals();
    } else {
      console.error("❌ spawnInitialAnimals function not available");
      return null;
    }
  };
  
  // Set up debug key listener
  document.addEventListener('keydown', function(e) {
    // Pressing 'a' key to force spawn animals for debugging
    if (e.key === 'a') {
      console.log("🔑 'a' key pressed - force spawning animals");
      window.forceSpawnAnimals();
    }
  });
  
  console.log("🐾 Animal loader finished initialization");
})(); 