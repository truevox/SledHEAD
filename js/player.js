/* player.js */
import { TWEAK } from './settings.js';

// Player state and properties
export let player = {
  x: 0,  // Will be initialized properly
  absY: 0,
  width: 20,
  height: 20,
  velocityY: 0,
  xVel: 0,
  collisions: 0,
  bestTime: Infinity,
  money: TWEAK.starterCash,
  sledDamaged: 0,  // Track if sled is damaged: 0 = not damaged, >0 = damaged
  
  // Camera aim properties
  cameraAngle: 270,  // Camera rotation in degrees
  altitudeLine: 50,  // Starts at 50% of the view range

  // Trick system properties
  currentTrick: null,        // Currently active trick
  trickTimer: 0,            // Time elapsed in current trick
  trickRotation: 0,         // Current rotation angle for helicopter tricks
  trickOffset: 0,           // Current offset for air brake/parachute
  lastTrick: null,          // Last completed trick for chain tracking
  chainMultiplier: 1,       // Multiplier for trick chains
  chainTimer: 0,            // Time window for chaining tricks
  chainCount: 0,            // Number of tricks in current chain
  
  // Jump system properties
  isJumping: false,         // Currently in a jump
  jumpTimer: 0,             // Time elapsed in current jump
  jumpDuration: 1000,       // Total jump duration in ms
  hasReachedJumpPeak: false,// Track if jump has peaked
  reHitActivated: false,    // Re-hit jump extension
  isCharging: false,        // Charging a jump
  jumpHeightFactor: 0,      // Height multiplier from Rocket Surgery (1.0 = normal)
  jumpZoomBonus: 0,         // Extra zoom from increased jump height
  baseWidth: 20,            // Original sprite width (for scaling)
  baseHeight: 20            // Original sprite height (for scaling)
};

// Initialize player position
export function initializePlayer(canvasWidth) {
  player.x = canvasWidth / 2;
  player.absY = 0;
}

