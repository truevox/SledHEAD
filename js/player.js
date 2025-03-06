/* player.js */
let player = {
  x: canvas.width / 2,
  absY: 0,
  width: 20,
  height: 20,
  velocityY: 0,
  xVel: 0,
  collisions: 0,
  bestTime: Infinity,
  money: TWEAK.starterCash,
  // Camera aim properties
  cameraAngle: 270,  // Camera rotation in degrees
  altitudeLine: 50,  // Starts at 50% of the view range

  // *** NEW: Jump State Properties ***
  isJumping: false,          // Are we in a jump?
  isCharging: false,         // For "charge" mode to accumulate jump time
  canJump: true,             // Ensures jump is triggered only once per key press
  jumpTimer: 0,              // Elapsed time since jump started (ms)
  jumpDuration: 0,           // Total duration of the jump (ascent + descent)
  jumpChargeTime: 0,         // Accumulated hold time for charge mode
  hasReachedJumpPeak: false, // Flag to trigger the peak hook only once per jump
  jumpHeightFactor: 0,       // Normalized jump height factor (0 to 1) based on charge
  baseWidth: 20,             // Original sprite width (for scaling)
  baseHeight: 20             // Original sprite height (for scaling)
};
