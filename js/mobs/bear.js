/* bear.js - Bear Animal Module
// This module defines the bear characteristics for the wildlife simulation.
// It registers itself with wildlife.js by calling registerAnimalType().
// Spawning Biomes: Spawns on all layers of the Starter Mountain.
*/

(function() {
    var bearData = {
        type: "bear",
        spawnProbability: (typeof TWEAK !== 'undefined' && TWEAK.bearSpawnProbability) || 0.5,
        width: 40,
        height: 60,
        detectionRadius: (typeof TWEAK !== 'undefined' && TWEAK.bearDetectionRadius) || 50,
        speed: (typeof TWEAK !== 'undefined' && TWEAK.bearSpeed) || 8,
        basePhotoBonus: 10, // Bears yield a higher photo bonus
        color: "#8B4513",
        validBiomes: ['forest', 'alpine', 'starterMountain'], // Added starterMountain to valid biomes
        spawningBiomes: [
            { biome: "starterMountain" }  // Spawns on all layers of the Starter Mountain
        ],
        customUpdate: null,
        customDraw: function(animal, screenY, ctx, drawX) {
            // Draw the bear's body
            ctx.fillStyle = "#8B4513";
            ctx.fillRect(
                drawX - animal.width / 2,
                screenY - animal.height / 2,
                animal.width,
                animal.height
            );
            // Draw bear ears as simple rectangles
            ctx.fillStyle = "#000000";
            ctx.fillRect(
                drawX - animal.width / 3,
                screenY - animal.height / 2 - 10,
                10,
                10
            );
            ctx.fillRect(
                drawX + animal.width / 3 - 10,
                screenY - animal.height / 2 - 10,
                10,
                10
            );
            // Altitude indicator
            let t = 1 - (animal.altitude / 100);
            let altitudeColor = lerpColor("#FF0000", "#0000FF", t);
            ctx.fillStyle = altitudeColor;
            ctx.fillRect(
                drawX + animal.width / 2 + 5,
                screenY - 5,
                10,
                10
            );
        }
    };
    
    if (typeof registerAnimalType === 'function') {
        registerAnimalType(bearData);
    } else {
        console.error("registerAnimalType is not defined. Make sure wildlife.js is loaded first.");
    }
})();
