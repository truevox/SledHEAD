/* bear.js - Bear Animal Module
// This module defines the bear characteristics for the wildlife simulation.
// It registers itself with wildlife.js by calling registerAnimalType().
// All bear-specific settings (appearance, movement, photo bonus, etc.) are defined here.
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
        // Optional color property for fallback drawing
        color: "#8B4513",
        customUpdate: null,
        customDraw: function(animal, screenY, ctx) {
            // Draw the bear's body
            ctx.fillStyle = "#8B4513";
            ctx.fillRect(
                animal.x - animal.width / 2,
                screenY - animal.height / 2,
                animal.width,
                animal.height
            );
            // Draw bear ears
            ctx.fillStyle = "#000000";
            ctx.fillRect(
                animal.x - animal.width / 3,
                screenY - animal.height / 2 - 10,
                10,
                10
            );
            ctx.fillRect(
                animal.x + animal.width / 3 - 10,
                screenY - animal.height / 2 - 10,
                10,
                10
            );
            // Altitude indicator
            let t = 1 - (animal.altitude / 100);
            let altitudeColor = lerpColor("#FF0000", "#0000FF", t);
            ctx.fillStyle = altitudeColor;
            ctx.fillRect(
                animal.x + animal.width / 2 + 5,
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
