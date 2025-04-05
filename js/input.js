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

// Update the cursor position display
function updateCursorPositionDisplay() {
  const cursorPositionElement = document.getElementById("cursor-position");
  if (cursorPositionElement) {
    cursorPositionElement.textContent = `Abs-xy: (${cursorPosition.absoluteX}, ${cursorPosition.absoluteY}) | View: (${cursorPosition.viewportX}, ${cursorPosition.viewportY})`;
  }
}

// Set up interval to update cursor position display once per second
setInterval(updateCursorPositionDisplay, 1000);

// Helper function to check if a key is currently pressed
function isKeyDown(key) {
  return window.keysDown && window.keysDown[key] === true;
}