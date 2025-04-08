/* mountainlion.js - Mountain Lion Animal Module
// This module defines the mountain lion characteristics for the wildlife simulation.
// It registers itself with wildlife.js by calling registerAnimalType().
// Drawn in a style consistent with our bear and bird modules, with a pretty kitty flair.
// Spawning Biomes: Spawns on all layers of the Starter Mountain.
*/

(function() {
    // Helper function to draw a rectangle at an angle, centered at (cx, cy)
    function drawRectAtAngle(ctx, cx, cy, width, height, angleDeg, fillStyle) {
        let rad = angleDeg * Math.PI / 180;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rad);
        ctx.fillStyle = fillStyle;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.restore();
    }

    var mountainLionData = {
        type: "mountainlion",
        spawnProbability: 0.5, // 2.0 is very high spawn chance
        width: 50,
        height: 30,
        detectionRadius: 60,
        speed: 10,
        basePhotoBonus: 15, // Good bonus for a pretty kitty
        color: "#F9E79F",   // A soft golden color
        validBiomes: ['alpine', 'peak', 'starterMountain'], // Added starterMountain
        spawningBiomes: [
            { biome: "starterMountain" }  // Spawns on all layers of the Starter Mountain
        ],
        customUpdate: null,
        customDraw: function(animal, screenY, ctx, drawX) {
            // Draw the body
            ctx.fillStyle = animal.color;
            ctx.fillRect(
                drawX - animal.width / 2,
                screenY - animal.height / 2,
                animal.width,
                animal.height
            );
            // Draw left ear as a triangle
            ctx.beginPath();
            ctx.moveTo(drawX - animal.width / 4, screenY - animal.height / 2);
            ctx.lineTo(drawX - animal.width / 4 - 10, screenY - animal.height / 2 - 15);
            ctx.lineTo(drawX - animal.width / 4 + 10, screenY - animal.height / 2 - 15);
            ctx.closePath();
            ctx.fillStyle = "#000000";
            ctx.fill();
            // Draw right ear
            ctx.beginPath();
            ctx.moveTo(drawX + animal.width / 4, screenY - animal.height / 2);
            ctx.lineTo(drawX + animal.width / 4 - 10, screenY - animal.height / 2 - 15);
            ctx.lineTo(drawX + animal.width / 4 + 10, screenY - animal.height / 2 - 15);
            ctx.closePath();
            ctx.fill();
            // Draw a tail using an angled rectangle
            let tailPivotX = drawX + animal.width / 2;
            let tailPivotY = screenY + animal.height / 2;
            let tailAngle = -45;
            let tailWidth = 20;
            let tailHeight = 8;
            drawRectAtAngle(ctx, 
                tailPivotX + (tailWidth / 2) * Math.cos(tailAngle * Math.PI / 180),
                tailPivotY + (tailWidth / 2) * Math.sin(tailAngle * Math.PI / 180),
                tailWidth, 
                tailHeight, 
                tailAngle, 
                animal.color
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
        registerAnimalType(mountainLionData);
    } else {
        console.error("registerAnimalType is not defined. Make sure wildlife.js is loaded first.");
    }
})();
