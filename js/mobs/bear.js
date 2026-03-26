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
        customUpdate: function(animal) {
            // --- Post-race scatter: dash off screen, then snap home ---
            if (animal.raceScattering) {
                const layer = (typeof getLayerByY === 'function') ? getLayerByY(animal.y) : null;
                const layerWidth = (layer && layer.width) ? layer.width : (window.canvas ? window.canvas.width : 800);
                const rad = animal.scatterAngle * Math.PI / 180;
                animal.x += Math.cos(rad) * animal.scatterSpeed;
                animal.y += Math.sin(rad) * animal.scatterSpeed;
                animal.x = (typeof calculateWrappedX === 'function')
                    ? calculateWrappedX(animal.x, layerWidth)
                    : ((animal.x % layerWidth) + layerWidth) % layerWidth;
                animal.state = 'scattering'; // keep set so flee/sit logic won't fire

                // Once off screen, snap to home layer
                const screenHalfH = (window.canvas ? window.canvas.height : 600) * 0.6;
                if (Math.abs(animal.y - player.absY) > screenHalfH) {
                    animal.raceScattering = false;
                    animal.state = 'sitting';
                    const homeLayer = window.mountainLayers && (
                        window.mountainLayers[animal.layer] ||
                        window.mountainLayers[Math.floor(Math.random() * window.mountainLayers.length)]
                    );
                    if (homeLayer) {
                        animal.y = homeLayer.startY + Math.random() * (homeLayer.endY - homeLayer.startY);
                        animal.x = Math.random() * homeLayer.width;
                    }
                }
                return;
            }

            // --- Auto-join: bear above player during DOWNHILL, but only if close enough to matter ---
            if (!animal.raceMode && !animal.raceFinished) {
                if (window.currentState === window.GameState.DOWNHILL && animal.y < player.absY) {
                    const screenH = (window.canvas && window.canvas.height) || 600;
                    const screenW = (window.canvas && window.canvas.width) || 800;
                    const dy = player.absY - animal.y; // how far above player (positive)

                    // Wrap-aware horizontal distance
                    const bl = (typeof getLayerByY === 'function') ? getLayerByY(animal.y) : null;
                    const layerW = bl ? bl.width : screenW;
                    let dx = Math.abs(animal.x - player.x);
                    if (dx > layerW / 2) dx = layerW - dx;

                    // Must be within 1 screen height above and 2 screen widths laterally
                    if (dy <= screenH && dx <= screenW * 2) {
                        animal.raceMode = true;
                        animal.raceFinished = false;
                        animal.raceVelY = 0;
                        animal.raceVelX = 0;
                        animal.state = 'racing';
                        console.log(`[Race] Bear joins at y=${animal.y.toFixed(0)} dy=${dy.toFixed(0)} dx=${dx.toFixed(0)}`);
                    }
                }
                return;
            }
            if (!animal.raceMode) return;

            // --- Race bumpercars AI ---
            // Bears above the player when the race starts dive downhill and
            // steer toward the player's X to jostle/bump them.

            const BEAR_GRAVITY = 0.4;         // how fast bears accelerate downhill
            const BEAR_MAX_FALL = 6;          // terminal velocity (units/frame)
            const BEAR_STEER_FORCE = 0.12;    // lateral steering force toward player
            const BEAR_MAX_LATERAL = 3;       // max lateral speed
            const BUMP_RADIUS = 35;           // px distance for a bump to register
            const BUMP_PUSH = 2.5;            // xVel impulse applied to player on bump

            // Apply gravity (increasing Y = going downhill in this world)
            if (!animal.raceVelY) animal.raceVelY = 0;
            animal.raceVelY = Math.min(animal.raceVelY + BEAR_GRAVITY, BEAR_MAX_FALL);
            animal.y += animal.raceVelY;

            // Steer laterally toward player X (bumpercars)
            if (!animal.raceVelX) animal.raceVelX = 0;
            const layer = (typeof getLayerByY === 'function') ? getLayerByY(animal.y) : null;
            const layerWidth = (layer && layer.width) ? layer.width : (window.canvas ? window.canvas.width : 800);

            // Account for world wrapping when computing dx to player
            let dx = player.x - animal.x;
            if (Math.abs(dx) > layerWidth / 2) {
                dx = dx > 0 ? dx - layerWidth : dx + layerWidth;
            }
            const steerDir = dx > 0 ? 1 : -1;
            animal.raceVelX += steerDir * BEAR_STEER_FORCE;
            animal.raceVelX = Math.max(-BEAR_MAX_LATERAL, Math.min(BEAR_MAX_LATERAL, animal.raceVelX));
            const newX = animal.x + animal.raceVelX;
            animal.x = (typeof calculateWrappedX === 'function')
                ? calculateWrappedX(newX, layerWidth)
                : ((newX % layerWidth) + layerWidth) % layerWidth;

            // Bump detection: jostle player laterally if close
            const bx = animal.x - player.x;
            const by = animal.y - player.absY;
            if (bx * bx + by * by < BUMP_RADIUS * BUMP_RADIUS) {
                // Push player away from bear
                const pushDir = player.x < animal.x ? -1 : 1;
                if (typeof player !== 'undefined' && 'xVel' in player) {
                    player.xVel += pushDir * BUMP_PUSH;
                }
            }

            // Keep state as "racing" so the default flee/sit logic won't fire
            animal.state = "racing";

            // Finish line: bear reached the bottom
            if (typeof mountainHeight !== 'undefined' && animal.y >= mountainHeight) {
                animal.raceMode = false;
                animal.raceFinished = true;
                animal.state = "sitting";
                animal.raceVelY = 0;
                animal.raceVelX = 0;
                console.log("[Race] A bear reached the bottom!");
            }
        },
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

    // Spawns a race bear just above the visible screen, already in race mode.
    // Called by downhill.js when the player has been racing for 3s with no nearby bears.
    window.spawnRaceBear = function() {
        if (!window.animals) return;
        const screenH = (window.canvas && window.canvas.height) || 600;
        const playerLayer = (typeof getLayerByY === 'function') ? getLayerByY(player.absY) : null;
        const layerW = (playerLayer && playerLayer.width) || (window.canvas && window.canvas.width) || 800;
        const layerId = playerLayer ? playerLayer.id : 0;

        // Spawn just off the top of the screen at a random X
        const spawnY = Math.max(0, player.absY - screenH * 0.65);
        const spawnX = Math.random() * layerW;

        const bear = {
            type: 'bear',
            x: spawnX,
            y: spawnY,
            width: bearData.width,
            height: bearData.height,
            state: 'racing',
            speed: bearData.speed,
            altitude: 50,
            hasBeenPhotographed: false,
            detectionRadius: bearData.detectionRadius,
            fleeAngleActual: 0,
            fleeingLogOnce: false,
            lastStateChange: Date.now(),
            stateChangeCount: 0,
            basePhotoBonus: bearData.basePhotoBonus,
            customUpdate: bearData.customUpdate,
            customDraw: bearData.customDraw,
            layer: layerId,
            sitTimer: null,
            raceMode: true,
            raceFinished: false,
            raceVelY: 0,
            raceVelX: 0
        };

        window.animals.push(bear);
        console.log(`[Race] Force-spawned race bear at y=${spawnY.toFixed(0)} x=${spawnX.toFixed(0)}`);
    };
})();
