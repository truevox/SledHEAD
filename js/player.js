/* player.js */
let player = {
  x: window.canvas.width / 2,  // Use global canvas reference
  absY: 0,
  width: 20,
  height: 20,
  velocityY: 0,
  xVel: 0,
  collisions: 0,
  bestTime: Infinity,
  money: 0, // Default initial value instead of directly accessing TWEAK.starterCash
  sledDamaged: 0,  // Track if sled is damaged: 0 = not damaged, >0 = damaged
  // Camera aim properties
  cameraAngle: 270,  // Camera rotation in degrees
  altitudeLine: 50,  // Starts at 50% of the view range
  
  // Layer tracking for mountain segmentation
  currentLayerIndex: 0, // Start in the top layer (index 0)

  // Trick system properties
  currentTrick: null,        // Currently active trick
  trickTimer: 0,            // Time elapsed in current trick
  trickRotation: 0,         // Current rotation angle for helicopter tricks
  trickOffset: 0,           // Current offset for air brake/parachute
  lastTrick: null,          // Last completed trick for chain tracking
  trickChainCount: 0,       // Number of different tricks chained
  trickCooldowns: {         // Individual cooldown timers for each trick
    leftHelicopter: 0,
    rightHelicopter: 0,
    airBrake: 0,
    parachute: 0
  },
  // New trick phase system
  trickState: 'none',       // Current trick animation phase: 'none', 'start', 'mid', 'end'
  trickButtonHeld: false,   // Whether the corresponding trick button is currently held
  trickPhaseTimer: 0,       // Time elapsed in the current trick phase
  trickTotalTime: 0,        // Total time spent on the entire trick (all phases)

  // *** NEW: Jump State Properties ***
  isJumping: false,          // Are we in a jump?
  isCharging: false,         // For "charge" mode to accumulate jump time
  canJump: true,             // Ensures jump is triggered only once per key press
  reHitActivated: false,     // Prevents multiple re-hits during one key press
  jumpTimer: 0,              // Elapsed time since jump started (ms)
  jumpDuration: 0,           // Total duration of the jump (ascent + descent)
  jumpChargeTime: 0,         // Accumulated hold time for charge mode
  hasReachedJumpPeak: false, // Flag to trigger the peak hook only once per jump
  jumpHeightFactor: 0,       // Height multiplier from Rocket Surgery (1.0 = normal)
  jumpZoomBonus: 0,         // Extra zoom from increased jump height
  baseWidth: 20,             // Original sprite width (for scaling)
  baseHeight: 20             // Original sprite height (for scaling)
};

// Initialize player money from TWEAK settings once they're available
function initializePlayerMoney() {
  if (window.TWEAK && typeof window.TWEAK.starterCash !== 'undefined') {
    player.money = window.TWEAK.starterCash;
    console.log("Player money initialized to:", player.money);
  }
}

// Initialize player position based on layer width
function initializePlayerPosition() {
  // Set fixed starting position at the bottom of the mountain
  player.x = 10; // Start at x = 10
  player.absY = 19930; // Start at y = 19930 (bottom)
  
  // Get the layer for this position
  const layer = getLayerByY(player.absY);
  if (layer) {
    // Initialize the player's layer index
    player.currentLayerIndex = layer.id;
    console.log("Player positioned at x:", player.x, "y:", player.absY, "in layer:", player.currentLayerIndex);
  }
}

/**
 * Updates the player's current layer index based on their vertical position
 * Handles seamless transition between layers when crossing layer boundaries
 * Called every frame during game update
 */
function updatePlayerLayer() {
  const layer = getLayerByY(player.absY);
  
  if (layer && layer.id !== player.currentLayerIndex) {
    const previousLayerIndex = player.currentLayerIndex;
    const previousLayer = mountainLayers[previousLayerIndex];
    
    // Store the previous layer's width before updating the current layer index
    const previousLayerWidth = previousLayer.width;
    const oldX = player.x;
    
    // Layer crossing detected: defer all layer index and Y changes to handleLayerTransition
    // (No update of player.currentLayerIndex here)
    
    // Get the new layer's width for horizontal scaling
    const newLayerWidth = layer.width;
    
    // Calculate the scaling factor (prevent division by zero)
    const scaleFactor = previousLayerWidth > 0 ? newLayerWidth / previousLayerWidth : 1;
    
    // Handle horizontal position scaling and wrapping
    if (player.x === previousLayerWidth) {
      // Handle special case: if player is exactly at the right edge, keep them at the right edge
      player.x = newLayerWidth;
    } else {
      // Scale the player's horizontal position proportionally
      player.x = player.x * scaleFactor;
      
      // Apply wrapping if the scaled position is out of the new layer's bounds
      if (player.x >= newLayerWidth || player.x < 0) {
        player.x = calculateWrappedX(player.x, newLayerWidth);
      }
    }
    
    // Log the scaling information
    console.log(`Horizontal scaling: oldX=${oldX.toFixed(1)}, oldWidth=${previousLayerWidth}, newWidth=${newLayerWidth}, scaleFactor=${scaleFactor.toFixed(3)}, newX=${player.x.toFixed(1)}`);
  }
}

// Call this function after TWEAK is initialized (e.g., from game.js)
window.initializePlayerMoney = initializePlayerMoney;
window.initializePlayerPosition = initializePlayerPosition;
window.updatePlayerLayer = updatePlayerLayer;
