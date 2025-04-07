/* utils.js */
// Global Configuration & Shared Globals moved to settings.js

window.GameState = {
    HOUSE: 'house',
    DOWNHILL: 'downhill',
    UPHILL: 'uphill'
};

// Instead of getting the canvas element (which no longer exists),
// we define a dummy canvas object for width/height references.
var canvas = { width: 800, height: 450 };
// We'll expose canvas globally for other scripts to access
window.canvas = canvas;
// We'll set ctx in game.js once the Phaser Canvas Texture is created.
var ctx = null;

// Game-relevant keys that should be logged
const GAME_KEYS = [
    'a', 'd', 'w', 's',  // Movement
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',  // Alt movement
    ' ',  // Jump/spacebar
    'Tab',  // Toggle state
    'e',  // Spawn animal (debug)
    'r',  // Reserved for future use
    '1', '2', '3', '4',  // Trick buttons
    'q', 'z', 'x', 'c'   // Alternative trick buttons
];

// Helper function to format timestamp for logging
function getTimestamp() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
}

// Helper function to log key presses with relevant info
function logKeyEvent(type, key, gameState) {
    // Special handling for arrow keys, which are case-sensitive
    if (GAME_KEYS.includes(key) || GAME_KEYS.includes(key.toLowerCase()) || key === 'Tab') {
        console.log(`[${getTimestamp()}] ${type}: ${key} (Game State: ${gameState})`);
    }
}

/* NEW: Global keysDown object and event listeners */
var keysDown = {};
var spacePressed = false;

window.addEventListener("keydown", function (e) {
    // Prevent default behavior for arrow keys, space, and tab to ensure correct capture
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Tab"].includes(e.key)) {
        e.preventDefault();
    }
    
    // Only log if this is a fresh key press, not a key repeat
    if (!keysDown[e.key]) {
        logKeyEvent('KEY DOWN', e.key, window.currentState);
    }
    
    keysDown[e.key] = true;

    // Track space in HOUSE state
    if (e.key === " " && window.currentState === window.GameState.HOUSE) {
        spacePressed = true;
    }
    // Take a photo in UPHILL state when space is pressed
    if (e.key === " " && window.currentState === window.GameState.UPHILL) {
        takePhoto();
    }
    // Press "E" to manually spawn an animal in UPHILL mode (DEBUG)
    if (e.key.toLowerCase() === 'e' && window.currentState === window.GameState.UPHILL) {
        spawnAnimal();
    }
    // Handle Tab key to toggle between UPHILL and DOWNHILL
    if (e.key === "Tab" && window.currentState !== window.GameState.HOUSE) {
        if (window.currentState === window.GameState.UPHILL && player.sledDamaged === 1) {
            console.log("Cannot switch to DOWNHILL mode - Sled is damaged and needs repair");
            showSledDamageNotice();
            return;
        }
        const newState = window.currentState === window.GameState.UPHILL ? window.GameState.DOWNHILL : window.GameState.UPHILL;
        changeState(newState);
    }
});

window.addEventListener("keyup", function (e) {
    // Log key up events for game-relevant keys
    logKeyEvent('KEY UP', e.key, window.currentState);
    
    delete keysDown[e.key];

    if (e.key === " " && window.currentState === window.GameState.HOUSE) {
        spacePressed = false;
        console.log("Space released, starting sled run.");
        unlockAudioContext();
        playStartGameSound();
        changeState(window.GameState.DOWNHILL);
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

// Make utility functions available globally for both normal scripts and modules
window.formatUpgradeName = formatUpgradeName;
window.capitalizeFirstLetter = capitalizeFirstLetter;
window.checkCollision = checkCollision;
window.clamp = clamp;
window.getCameraOffset = getCameraOffset;

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
    playTone(440, "triangle", 0.5);
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
    playTone(200, "square", 0.2);
}

function playMoneyGainSound() {
    playTone(1000, "sine", 0.15, 0.2);
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

// Helper functions for color conversion and interpolation
function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = (bigint & 255) & 255;
    return { r, g, b };
}
  
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase();
}
  
function lerpColor(color1, color2, t) {
    let c1 = hexToRgb(color1);
    let c2 = hexToRgb(color2);
    let r = Math.round(c1.r + (c2.r - c1.r) * t);
    let g = Math.round(c1.g + (c2.g - c1.g) * t);
    let b = Math.round(c1.b + (c2.b - c1.b) * t);
    return rgbToHex(r, g, b);
}

// Notification helpers
function showSledDamageNotice() {
  showErrorNotification('Sled Damaged! Please Repair');
}

function showSledRepairedNotice() {
  showSuccessNotification('Sled Repaired!');
}

// Add additional utility functions to window object
window.mapRange = mapRange;
window.hexToRgb = hexToRgb;
window.rgbToHex = rgbToHex;
window.lerpColor = lerpColor;
window.showSledDamageNotice = showSledDamageNotice;
window.showSledRepairedNotice = showSledRepairedNotice;
window.playTone = playTone;
window.playStartGameSound = playStartGameSound;
window.playCrashSound = playCrashSound;
window.playRockHitSound = playRockHitSound;
window.playMoneyGainSound = playMoneyGainSound;
window.unlockAudioContext = unlockAudioContext;

/**
 * Calculates a wrapped horizontal position for a cylindrical layer
 * @param {number} potentialX - The potential x position before wrapping
 * @param {number} layerWidth - The width of the current layer
 * @returns {number} The wrapped x position within the [0, layerWidth) range
 */
function calculateWrappedX(potentialX, layerWidth) {
  // This formula correctly handles both positive and negative potentialX values
  return (potentialX % layerWidth + layerWidth) % layerWidth;
}

// Make the function available globally
window.calculateWrappedX = calculateWrappedX;

// Note: export statement has been removed and all functions are now attached to window
