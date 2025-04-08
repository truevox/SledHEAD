/* input.js - Keyboard Input Handling */

// Global keyboard input tracking
// var keysDown = {}; // Now using the one from utils.js

// Global cursor position tracking
var cursorPosition = {
  absoluteX: 0,
  absoluteY: 0,
  viewportX: 0,
  viewportY: 0,
  lastUpdateTime: 0
};

// Map of trick keys and their corresponding tricks
const trickKeyMap = {
  "ArrowLeft": "leftHelicopter",
  "ArrowRight": "rightHelicopter",
  "ArrowUp": "airBrake",
  "ArrowDown": "parachute"
};

// Track the active trick buttons
let activeTrickKeys = {};

// We're no longer setting up duplicate key event listeners here
// The main event listeners are now in utils.js with logging

// Set up event listener for mouse movement
window.addEventListener("mousemove", function(e) {
  // Store both absolute and viewport coordinates
  cursorPosition.absoluteX = e.pageX;
  cursorPosition.absoluteY = e.pageY;
  cursorPosition.viewportX = e.clientX;
  cursorPosition.viewportY = e.clientY;
});

// Add logging for mouse clicks when they're used for game interactions
window.addEventListener("mousedown", function(e) {
  // Log only left and right clicks for game interactions
  if (e.button === 0 || e.button === 2) {
    const buttonName = e.button === 0 ? "LEFT CLICK" : "RIGHT CLICK";
    console.log(`[${getTimestamp()}] MOUSE ${buttonName}: (${e.clientX}, ${e.clientY}) (Game State: ${window.currentState})`);
  }
});

// Additional event listeners for trick key handling
window.addEventListener("keydown", function(e) {
  // Check if this is a trick key
  if (trickKeyMap[e.key]) {
    const trickName = trickKeyMap[e.key];
    activeTrickKeys[e.key] = true;
    
    // Only try to start a trick if we're not already doing one
    if (player.trickState === 'none' && player.isJumping) {
      startTrickPhase(trickName, 'start');
    }
  }
});

window.addEventListener("keyup", function(e) {
  // Check if this is a trick key being released
  if (trickKeyMap[e.key] && activeTrickKeys[e.key]) {
    const trickName = trickKeyMap[e.key];
    activeTrickKeys[e.key] = false;
    
    // Only trigger the end phase if we're in the mid phase or have completed the start phase
    if (player.currentTrick === trickName && 
        (player.trickState === 'mid' || 
         (player.trickState === 'start' && player.trickPhaseTimer >= TWEAK._trickStartPhaseDuration))) {
      startTrickPhase(trickName, 'end');
    }
  }
});

// Update the cursor position display to show player position instead
function updateCursorPositionDisplay() {
  const cursorPositionElement = document.getElementById("cursor-position");
  if (cursorPositionElement && typeof player !== 'undefined') {
    // Format to 1 decimal place for readability
    const playerX = player.x.toFixed(1);
    const playerY = player.absY.toFixed(1);
    const layerIndex = player.currentLayerIndex !== undefined ? player.currentLayerIndex : 'N/A';
    
    cursorPositionElement.textContent = `Position: (${playerX}, ${playerY}) | Layer: ${layerIndex}`;
  }
}

// Update the position display more frequently for smoother feedback
setInterval(updateCursorPositionDisplay, 100);

// Helper function to check if a key is currently pressed
function isKeyDown(key) {
  return window.keysDown && window.keysDown[key] === true;
}

// Helper function to check if a trick button is currently held
function isTrickButtonHeld(trickName) {
  for (const key in trickKeyMap) {
    if (trickKeyMap[key] === trickName && activeTrickKeys[key]) {
      return true;
    }
  }
  return false;
}

// Export functions
window.isTrickButtonHeld = isTrickButtonHeld;