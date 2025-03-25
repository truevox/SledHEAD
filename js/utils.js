/* utils.js */
// Global Configuration & Shared Globals moved to settings.js

export const GameState = {
    HOUSE: 'house',
    DOWNHILL: 'downhill',
    UPHILL: 'uphill'
};

/*
// Get the canvas element and its context.
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
*/

/* NEW: Global keysDown object and event listeners */
var keysDown = {};
var spacePressed = false;

window.addEventListener("keydown", function (e) {
    // Prevent default behavior for arrow keys and space to ensure they are captured correctly
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Tab"].includes(e.key)) {
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
    // Handle Tab key to toggle between UPHILL and DOWNHILL
    if (e.key === "Tab" && currentState !== GameState.HOUSE) {
        // If we're in UPHILL mode and trying to go DOWNHILL, check if sled is damaged
        if (currentState === GameState.UPHILL && player.sledDamaged === 1) {
            console.log("Cannot switch to DOWNHILL mode - Sled is damaged and needs repair");
            // Display notification on screen
            showSledDamageNotice();
            return;
        }
        const newState = currentState === GameState.UPHILL ? GameState.DOWNHILL : GameState.UPHILL;
        changeState(newState);
    }
});

window.addEventListener("keyup", function (e) {
    delete keysDown[e.key];

    if (e.key === " " && currentState === GameState.HOUSE) {
        spacePressed = false;
        console.log("Space released, starting sled run.");
        unlockAudioContext();
        playStartGameSound();
        changeState(GameState.DOWNHILL);
    }
});



/* Utility functions */
export function formatUpgradeName(name) {
    let formattedName = name.replace(/([A-Z])/g, ' $1').trim();
    return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function checkCollision(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

export function getCameraOffset(playerAbsY, canvasHeight, mountainHeight) {
    let offset = playerAbsY - canvasHeight / 2;
    return clamp(offset, 0, mountainHeight - canvasHeight);
}

/* Audio Utility Functions */
let audioCtx;

export function unlockAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

export function playTone(frequency = 440, type = "sine", duration = 0.5, volume = 0.3) {
    unlockAudioContext();
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
export function playStartGameSound() {
    playTone(440, "triangle", 0.5);
}

export function playCrashSound() {
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

export function playRockHitSound() {
    playTone(200, "square", 0.2);
}

export function playMoneyGainSound() {
    playTone(1000, "sine", 0.15, 0.2);
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

// Helper function: Convert hex color string to an RGB object
export function hexToRgb(hex) {
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
  
// Helper function: Convert an RGB object to a hex color string
export function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)
        .toUpperCase();
}
  
// Helper function: Linearly interpolate between two hex colors
export function lerpColor(color1, color2, t) {
    let c1 = hexToRgb(color1);
    let c2 = hexToRgb(color2);
    let r = Math.round(c1.r + (c2.r - c1.r) * t);
    let g = Math.round(c1.g + (c2.g - c1.g) * t);
    let b = Math.round(c1.b + (c2.b - c1.b) * t);
    return rgbToHex(r, g, b);
}

// Function to show sled damage notice
export function showSledDamageNotice() {
    showErrorNotification('Sled Damaged! Please Repair');
}

// Function to show sled repaired notice
export function showSledRepairedNotice() {
    showSuccessNotification('Sled Repaired!');
}
