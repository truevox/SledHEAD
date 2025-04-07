/* bird.js - Bird Animal Module
// This module defines the bird characteristics for the wildlife simulation.
// It registers itself with wildlife.js by calling registerAnimalType().
// Spawning Biomes: Spawns on all layers of the Starter Mountain.
*/

(function() {
    var birdData = {
        type: "bird",
        spawnProbability: (typeof TWEAK !== 'undefined' && TWEAK.birdSpawnProbability) || 0.5,
        width: 20,
        height: 20,
        detectionRadius: (typeof TWEAK !== 'undefined' && TWEAK.birdDetectionRadius) || 50,
        speed: (typeof TWEAK !== 'undefined' && TWEAK.birdSpeed) || 12,
        basePhotoBonus: 5, // Birds yield a lower photo bonus
        color: "#1E90FF",
        spawningBiomes: [
            { biome: "starterMountain" }  // Spawns on all layers of the Starter Mountain
        ],
        customUpdate: null,
        customDraw: function(animal, screenY, ctx, drawX) {
            // Draw the bird's body
            ctx.fillStyle = "#1E90FF";
            ctx.fillRect(
                drawX - animal.width / 2,
                screenY - animal.height / 2,
                animal.width,
                animal.height
            );
            // Draw bird wings with a simple flapping effect
            ctx.fillStyle = "#000000";
            if (Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.beginPath();
                ctx.moveTo(drawX, screenY);
                ctx.lineTo(drawX - 20, screenY - 10);
                ctx.lineTo(drawX + 20, screenY - 10);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.moveTo(drawX, screenY);
                ctx.lineTo(drawX - 20, screenY + 5);
                ctx.lineTo(drawX + 20, screenY + 5);
                ctx.closePath();
                ctx.fill();
            }
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
        registerAnimalType(birdData);
    } else {
        console.error("registerAnimalType is not defined. Make sure wildlife.js is loaded first.");
    }
})();
