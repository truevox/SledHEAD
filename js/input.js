/* input.js - Keyboard Input Handling */

// Global keyboard input tracking
var keysDown = {};

// Set up event listeners for keyboard input
window.addEventListener("keydown", function(e) {
  keysDown[e.key] = true;
});

window.addEventListener("keyup", function(e) {
  keysDown[e.key] = false;
});

// Helper function to check if a key is currently pressed
function isKeyDown(key) {
  return keysDown[key] === true;
}