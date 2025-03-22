/* input.js - Keyboard Input Handling */

// Global keyboard input tracking
var keysDown = {};

// Global cursor position tracking
var cursorPosition = {
  absoluteX: 0,
  absoluteY: 0,
  viewportX: 0,
  viewportY: 0,
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
  // Store both absolute and viewport coordinates
  cursorPosition.absoluteX = e.pageX;
  cursorPosition.absoluteY = e.pageY;
  cursorPosition.viewportX = e.clientX;
  cursorPosition.viewportY = e.clientY;
});

// Update the cursor position display
function updateCursorPositionDisplay() {
  const cursorPositionElement = document.getElementById("cursor-position");
  if (cursorPositionElement && player) {
    cursorPositionElement.textContent = `Mouse: (${cursorPosition.viewportX}, ${cursorPosition.viewportY}) | Player: (${Math.round(player.x)}, ${Math.round(player.absY)})`;
  }
}

// Set up interval to update cursor position display once per second
setInterval(updateCursorPositionDisplay, 1000);

// Helper function to check if a key is currently pressed
function isKeyDown(key) {
  return keysDown[key] === true;
}