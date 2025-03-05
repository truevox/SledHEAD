/* utils.js */
/* Global Configuration & Shared Globals */
var TWEAK = {
    tweakNob: 1,

    // Animal spawning and movement
    minSpawnTime: 5000, // Minimum delay between spawns (5 sec)
    maxSpawnTime: 10000, // Maximum delay between spawns (10 sec)
    minIdleTime: 1000, // Minimum time an animal sits still (1 sec)
    maxIdleTime: 20000, // Maximum time an animal sits still (20 sec)
    minMoveSpeed: 5, // Slowest movement speed for animals
    maxMoveSpeed: 11.2, // Fastest movement speed for animals
    fleeAngle: 45, // This may be obsolete - confirm before removing
    photoCooldown: 1000, // Must wait 1 second between photos
    repeatPhotoPenalty: 0.5, // 50% less money if the same animal is photographed again

    // Camera and aiming
    basePOVAngle: 30,
    optimalOpticsPOVIncrease: 5,
    altitudeFlashMinSpeed: 200,
    altitudeFlashMaxSpeed: 10,
    altitudeGradientStart: "blue",
    altitudeGradientEnd: "red",

    // Photo scoring
    basePhotoValue: 50, // Base money earned from a photo
    altitudeMatchMultiplier: 2,
    centerPOVMultiplier: 1.5,
    movingAnimalMultiplier: 3,

    // Animal multipliers
    bearMultiplier: 1.5,
    birdMultiplier: 1,
    
    // Underlying base values
    _sledMass: 1.0,
    _baseGravity: 0.2,
    _baseHorizontalAccel: 0.15,
    _baseFriction: 0.95,
    _baseMaxXVel: 3,
    _rocketSurgeryFactorPerLevel: 0.1,
    _optimalOpticsAccelFactorPerLevel: 0.02,
    _optimalOpticsFrictionFactorPerLevel: 0.005,
    _fancierFootwearUpSpeedPerLevel: 0.3,
    _baseUpSpeed: 2,
    _baseCollisionsAllowed: 3,
    _starterCash: 3300, // Jacked up for testing
    
    _bounceImpulse: 3,  // New bounce impulse value
    
    // Getters to apply tweakNob multiplier
    get sledMass() { return this._sledMass * this.tweakNob; },
    set sledMass(val) { this._sledMass = val; },
    
    get baseGravity() { return this._baseGravity * this.tweakNob; },
    set baseGravity(val) { this._baseGravity = val; },
    
    get baseHorizontalAccel() { return this._baseHorizontalAccel; },
    set baseHorizontalAccel(val) { this._baseHorizontalAccel = val; },
    
    get baseFriction() { return this._baseFriction; }, // * this.tweakNob
    set baseFriction(val) { this._baseFriction = val; },
    
    get baseMaxXVel() { return this._baseMaxXVel * this.tweakNob; },
    set baseMaxXVel(val) { this._baseMaxXVel = val; },
    
    get rocketSurgeryFactorPerLevel() { return this._rocketSurgeryFactorPerLevel * this.tweakNob; },
    set rocketSurgeryFactorPerLevel(val) { this._rocketSurgeryFactorPerLevel = val; },
    
    get optimalOpticsAccelFactorPerLevel() { return this._optimalOpticsAccelFactorPerLevel * this.tweakNob; },
    set optimalOpticsAccelFactorPerLevel(val) { this._optimalOpticsAccelFactorPerLevel = val; },
    
    get optimalOpticsFrictionFactorPerLevel() { return this._optimalOpticsFrictionFactorPerLevel * this.tweakNob; },
    set optimalOpticsFrictionFactorPerLevel(val) { this._optimalOpticsFrictionFactorPerLevel = val; },
    
    get fancierFootwearUpSpeedPerLevel() { return this._fancierFootwearUpSpeedPerLevel * this.tweakNob; },
    set fancierFootwearUpSpeedPerLevel(val) { this._fancierFootwearUpSpeedPerLevel = val; },
    
    get baseUpSpeed() { return this._baseUpSpeed * this.tweakNob; },
    set baseUpSpeed(val) { this._baseUpSpeed = val; },
    
    get baseCollisionsAllowed() { return this._baseCollisionsAllowed * this.tweakNob; },
    set baseCollisionsAllowed(val) { this._baseCollisionsAllowed = val; },
    
    get starterCash() { return this._starterCash * this.tweakNob; },
    set starterCash(val) { this._starterCash = val; },
    
    // New dynamic bounceImpulse getter/setter
    get bounceImpulse() { return this._bounceImpulse * this.tweakNob; },
    set bounceImpulse(val) { this._bounceImpulse = val; }
};
  
// New: function to compute max collisions
TWEAK.getMaxCollisions = function() {
    // Ensure playerUpgrades exists before accessing it
    return TWEAK.baseCollisionsAllowed + (typeof playerUpgrades !== "undefined" && playerUpgrades.sledDurability ? playerUpgrades.sledDurability : 0);
};

var GameState = {
    HOUSE: 'house',
    DOWNHILL: 'downhill',
    UPHILL: 'uphill'
};

// Get the canvas element and its context.
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

/* NEW: Global keysDown object and event listeners */
var keysDown = {};
var spacePressed = false;

window.addEventListener("keydown", function (e) {
    // Prevent default behavior for arrow keys and space to ensure they are captured correctly
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
    }
    keysDown[e.key] = true;

    // Track when space is pressed in the house state
    if (e.key === " " && currentState === GameState.HOUSE) {
        spacePressed = true;
    }
    // Take a photo when space is pressed (only uphill)
    if (e.key === " " && currentState === GameState.UPHILL) {
    takePhoto();
    }
    // Press "E" to manually spawn an animal (only while in UPHILL mode) // DEBUG
    if (e.key.toLowerCase() === 'e' && currentState === GameState.UPHILL) {
        spawnAnimal();
    }


});

window.addEventListener("keyup", function (e) {
    delete keysDown[e.key];

    // Start the game when space is released
    if (e.key === " " && spacePressed && currentState === GameState.HOUSE) {
        spacePressed = false;
        console.log("Space released, starting sled run.");
        unlockAudioContext();
        playStartGameSound();
        changeState(GameState.DOWNHILL);
    }
});


/* Utility functions */
function formatUpgradeName(name) {
    let formattedName = name.replace(/([A-Z])/g, ' $1').trim();
    return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function checkCollision(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}
function getCameraOffset(playerAbsY, canvasHeight, mountainHeight) {
    let offset = playerAbsY - canvasHeight / 2;
    return clamp(offset, 0, mountainHeight - canvasHeight);
}

/* Ensure Web Audio API is unlocked */
let audioCtx;
function unlockAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

/* Audio Utility Functions */
function playTone(frequency = 440, type = "sine", duration = 0.5, volume = 0.3) {
    unlockAudioContext(); // Ensure audio context is unlocked
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

/* Sound Effects */
function playStartGameSound() {
    playTone(440, "triangle", 0.5); // Classic smooth start sound
}

function playCrashSound() {
    unlockAudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

function playRockHitSound() {
    playTone(200, "square", 0.2); // Quick low-pitched bang
}

function playMoneyGainSound() {
    playTone(1000, "sine", 0.15, 0.2); // Small beep
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

// Helper function: Convert hex color string to an RGB object.
function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return { r, g, b };
  }
  
  // Helper function: Convert an RGB object to a hex color string.
  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase();
  }
  
  // Helper function: Linearly interpolate between two hex colors.
  function lerpColor(color1, color2, t) {
    let c1 = hexToRgb(color1);
    let c2 = hexToRgb(color2);
    let r = Math.round(c1.r + (c2.r - c1.r) * t);
    let g = Math.round(c1.g + (c2.g - c1.g) * t);
    let b = Math.round(c1.b + (c2.b - c1.b) * t);
    return rgbToHex(r, g, b);
  }
  