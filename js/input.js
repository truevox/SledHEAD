/* input.js - Keyboard Input Handling */

import { normalizeCoords } from './resolution.js';

// Global keyboard input tracking
var keysDown = {};

// Global cursor position tracking
var cursorPosition = {
  absoluteX: 0,
  absoluteY: 0,
  normalizedX: 0,
  normalizedY: 0,
  lastUpdateTime: 0
};

// Set up event listeners for keyboard input
window.addEventListener("keydown", function(e) {
  keysDown[e.key] = true;
});

window.addEventListener("keyup", function(e) {
  keysDown[e.key] = false;
});

// Set up event listener for mouse movement
window.addEventListener("mousemove", function(e) {
  const canvas = document.getElementById('gameCanvas');
  // Store absolute coordinates
  cursorPosition.absoluteX = e.pageX;
  cursorPosition.absoluteY = e.pageY;
  
  // Get normalized coordinates using resolution.js utility
  const [normX, normY] = normalizeCoords(e.clientX, e.clientY, canvas);
  cursorPosition.normalizedX = normX;
  cursorPosition.normalizedY = normY;
  cursorPosition.lastUpdateTime = Date.now();
});

// Update the cursor position display
function updateCursorPositionDisplay() {
  const cursorPositionElement = document.getElementById("cursor-position");
  if (cursorPositionElement) {
    cursorPositionElement.textContent = `Abs: (${Math.round(cursorPosition.absoluteX)}, ${Math.round(cursorPosition.absoluteY)}) | Norm: (${Math.round(cursorPosition.normalizedX)}, ${Math.round(cursorPosition.normalizedY)})`;
  }
}

// Set up interval to update cursor position display once per second
setInterval(updateCursorPositionDisplay, 1000);

// Helper function to check if a key is currently pressed
function isKeyDown(key) {
  return keysDown[key] === true;
}

// Export key tracking variables and functions
export { keysDown, isKeyDown, cursorPosition };