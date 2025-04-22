/* game.js - Core Loop & State Management (Phaserized) */

// --- GLOBAL KEY STATE ---
window.keys = {};

// Import necessary functions and variables
import * as effects from './effects.js'; // Import the effects module
// getLayerByY is attached to window for browser compatibility
import { playerUpgrades, mountainUpgrades, initUpgradeButton, purchaseUpgrade, updateMoneyDisplay } from './upgradeLogic.js';

// Global flag for debouncing upgrade clicks
window.upgradeClickInProgress = false;
const DEBOUNCE_DELAY = 100; // milliseconds

// Keep your globals
var downhillStartTime = null;
window.downhillStartTime = null; // Make downhillStartTime globally accessible
var lastTime = 0;
// Local currentState variable removed - we'll use window.currentState exclusively
var jumpOsc = null;
var jumpGain = null;
var loanAmount = 10000;
window.floatingTexts = [];  // Make floatingTexts accessible globally
var isFirstHouseEntry = true;
var houseReEntry = 0;
var playerStartAbsY = 0;
window.playerStartAbsY = playerStartAbsY; // Make playerStartAbsY globally accessible

// Variables for layer transition
let currentLayerId = null; // Track the current layer ID
let isLayerTransitioning = false; // Flag to prevent updates during fade

// Add a throttled logging mechanism
const logThrottleTimes = {};

// Helper for timestamped logs in game.js
function logGame(message) {
  console.log(`[Game - ${performance.now().toFixed(2)}ms] ${message}`);
}

function throttledLog(message, throttleTime = 5000) {
  const currentTime = Date.now();
  const key = message.split(' ')[0]; // Use the first word of the message as the key
  
  // Special handling for arrow key events which should always be logged
  if (message.includes('Arrow') && message.includes('trick')) {
    console.log(`[${getTimestamp()}] ${message}`);
    return;
  }
  
  if (!logThrottleTimes[key] || (currentTime - logThrottleTimes[key] >= throttleTime)) {
    console.log(message);
    logThrottleTimes[key] = currentTime;
  }
}

// We'll access the global canvas object
// var ctx is defined later after context creation

// Helper function to handle upgrade clicks with debouncing
function handleUpgradeClick(upgradeType, upgradeKey) {
  if (window.upgradeClickInProgress) {
    console.log("Debounced duplicate upgrade click for:", upgradeKey);
    return false; // Click handled (blocked)
  }
  
  window.upgradeClickInProgress = true;
  console.log("Upgrade button clicked:", upgradeKey, "Current money:", player.money);
  purchaseUpgrade(upgradeType, upgradeKey);
  
  setTimeout(() => { window.upgradeClickInProgress = false; }, DEBOUNCE_DELAY);
  return true; // Click handled (processed)
}

// --- Input Handling Functions (Moved Before MainScene) ---
// Moved handleKeyDown and handleKeyUp here to ensure they are defined before being used in MainScene.create

/**
 * Clears all held input states and resets player input flags.
 * This should be called before locking input for a fade, to prevent sticky controls.
 */
function clearAllInputStates() {
    for (const key in window.keys) {
        if (window.keys[key]) {
            // Dispatch a synthetic keyup event for all keys that are currently down
            const event = new KeyboardEvent('keyup', { key });
            window.dispatchEvent(event);
            window.keys[key] = false;
            // Release player control flags as appropriate
            if (key === 'ArrowUp') player.isAccelerating = false;
            if (key === 'ArrowDown') player.isBraking = false;
            // Add any other keys that set player state here
        }
    }
    // Defensive: also clear jump state if needed
    if (player.isJumping && !window.keys[' ']) {
        // Optionally handle jump release here if needed
    }
}

function handleKeyDown(event) {
    // Allow number keys for layer switching in dev mode
    if (window.DEV_MODE && event.key >= '0' && event.key <= '9') {
        const targetLayerIndex = parseInt(event.key, 10);
        if (targetLayerIndex >= 0 && targetLayerIndex < mountainLayers.length) {
            const targetLayer = mountainLayers[targetLayerIndex];
            // Center Y within the target layer for testing
            const targetY = targetLayer.startY + (targetLayer.endY - targetLayer.startY) / 2;
            console.log(`DEV: Teleporting to layer ${targetLayerIndex} (Y: ${targetY})`);
            player.absY = targetY;
            // Optional: Reset camera/player X if needed for consistency
            player.x = window.canvas.width / 2;
            camera.y = player.absY - window.canvas.height / 2; 
        } else {
            console.log(`DEV: Invalid layer index: ${targetLayerIndex}`);
        }
        return; // Don't process game input if it was a dev key
    }

    // Existing key handling logic
    if (window.inputLocked) return;
    
    keys[event.key] = true;

    // Trigger key specific actions
    if (event.key === 'ArrowUp' && (window.currentState === window.GameState.DOWNHILL || window.currentState === window.GameState.UPHILL)) {
        player.isAccelerating = true;
    }
    if (event.key === 'ArrowDown' && window.currentState === window.GameState.DOWNHILL) {
        player.isBraking = true;
    }
    if (event.key === ' ' && !player.isJumping && (window.currentState === window.GameState.DOWNHILL || window.currentState === window.GameState.UPHILL)) {
        startJump();
    }
}

function handleKeyUp(event) {
    if (window.inputLocked) return;
    
    keys[event.key] = false;

    // Trigger key specific release actions
    if (event.key === 'ArrowUp') {
        player.isAccelerating = false;
    }
    if (event.key === 'ArrowDown') {
        player.isBraking = false;
    }
    if (event.key === ' ' && player.isJumping) {
        // Optional: could add logic here if jump height depended on hold duration
    }
}

// Create a Phaser Scene to run your game logic
class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    // If you had assets, you'd load them here
  }

  create() {
    // Initialize global game state
    logGame("MainScene create() started.");
    window.currentState = window.GameState.HOUSE;
    
    // Create a Canvas Texture of the same size as your old canvas
    this.rt = this.textures.createCanvas("myCanvas", window.canvas.width, window.canvas.height);
    
    // Get the canvas context with willReadFrequently attribute set to true
    const contextSettings = { willReadFrequently: true };
    ctx = this.rt.canvas.getContext('2d', contextSettings);
    this.rt.context = ctx; // Update the texture's context reference
    
    // Set willReadFrequently attribute for all canvas contexts in the game
    this.game.context.willReadFrequently = true;
    
    // Set attribute on the original canvas element explicitly
    const canvasElement = this.game.canvas;
    canvasElement.setAttribute('willReadFrequently', 'true');
    
    // Also apply to the window.canvas if it's a different element
    if (window.canvas && window.canvas instanceof HTMLCanvasElement) {
      window.canvas.setAttribute('willReadFrequently', 'true');
      const windowCtx = window.canvas.getContext('2d', { willReadFrequently: true });
      if (windowCtx) {
        windowCtx.willReadFrequently = true;
      }
    }
    
    // Make the canvas and context accessible globally
    window.gameCanvas = canvasElement;
    window.gameCtx = ctx;
    
    // Add the canvas texture to the scene as an Image so Phaser will display it
    this.image = this.add.image(0, 0, "myCanvas").setOrigin(0, 0);
    
    // Make sure the image is visible and covers the full game area
    this.image.displayWidth = window.canvas.width;
    this.image.displayHeight = window.canvas.height;
    this.image.setDepth(1); // Ensure it's on top of other elements

    // Initialize player money now that TWEAK is available
    if (typeof window.initializePlayerMoney === 'function') {
      window.initializePlayerMoney();
    }
    
    // Initialize player position based on mountain layers
    if (typeof window.initializePlayerPosition === 'function') {
      window.initializePlayerPosition();
    }

    // Hook up your DOM event listeners for buttons
    const startGameBtn = document.getElementById("startGame");
    if (startGameBtn) {
      // Remove any existing listeners first
      const newStartGameBtn = startGameBtn.cloneNode(true);
      startGameBtn.parentNode.replaceChild(newStartGameBtn, startGameBtn);
      
      newStartGameBtn.addEventListener("click", () => {
        console.log("Start run clicked.");
        unlockAudioContext();
        playStartGameSound();
        changeState(window.GameState.DOWNHILL);
      });
    }

    const payLoanBtn = document.getElementById("payLoan");
    if (payLoanBtn) {
      // Remove any existing listeners first
      const newPayLoanBtn = payLoanBtn.cloneNode(true);
      payLoanBtn.parentNode.replaceChild(newPayLoanBtn, payLoanBtn);
      
      newPayLoanBtn.addEventListener("click", () => {
        console.log("Paying loan...");
        payLoan();
      });
    }

    // Initialize upgrade buttons
    Object.keys(playerUpgrades).forEach(upg => {
      initUpgradeButton(upg, playerUpgrades[upg]);
      const btnId = `upgrade${window.capitalizeFirstLetter(upg)}`;
      const btn = document.getElementById(btnId);
      
      if (btn) {
        // Remove any existing listeners by replacing the button with a clone
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener("click", () => {
          handleUpgradeClick(playerUpgrades, upg);
        });
      }
    });
    
    Object.keys(mountainUpgrades).forEach(upg => {
      initUpgradeButton(upg, mountainUpgrades[upg]);
      const btnId = `upgrade${window.capitalizeFirstLetter(upg)}`;
      const btn = document.getElementById(btnId);
      
      if (btn) {
        // Remove any existing listeners by replacing the button with a clone
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener("click", () => {
          handleUpgradeClick(mountainUpgrades, upg);
        });
      }
    });

    // Set up the world
    generateTerrain();
    
    updateLoanButton();
    
    changeState(window.GameState.HOUSE);

    // Launch the initial state setup (will set initial layer if starting outside house)
    completeStateChange(window.currentState, null); // Indicate no previous state initially

    // Add input listeners (using Phaser's input system)
    this.input.keyboard.on('keydown', handleKeyDown);
    this.input.keyboard.on('keyup', handleKeyUp);

    logGame("MainScene create() finished.");
  }

  update(time, delta) {
    // If a layer transition is happening, pause game updates
    if (isLayerTransitioning) {
        // Optional: could add a very subtle visual cue here if needed
        return;
    }

    // Standard game update logic
    const now = performance.now();
    throttledLog("MainScene update START", 5000);
    // Update game mechanics (delta in ms)
    updateMechanics(delta);

    // Update floating texts
    window.floatingTexts = window.floatingTexts.filter(text => text.update(delta));

    // --- Check for Layer Change ---
    if (window.currentState === window.GameState.DOWNHILL || window.currentState === window.GameState.UPHILL) {
        const playerLayer = window.getLayerByY(player.absY);
        const newLayerId = playerLayer ? playerLayer.id : null;

        // Check if the layer has changed and we are not already transitioning
        if (newLayerId !== null && newLayerId !== currentLayerId) {
            logGame(`Layer change detected: ${currentLayerId} -> ${newLayerId}. Starting transition.`);
            handleLayerTransition(newLayerId); // Don't await here, let it run async
        }
    }

    // Call the render function (draws onto ctx)
    render();

    // Refresh the Canvas Texture so Phaser displays the new drawing
    this.rt.refresh();
    
    // Make sure the image is visible after state changes
    this.image.visible = true;
    
    throttledLog("MainScene update END", 5000);
  }
}

// Function to handle the fade sequence for layer transitions
async function handleLayerTransition(newLayerId) {
    if (isLayerTransitioning) {
        logGame("handleLayerTransition called while already transitioning. Ignoring.");
        return; // Prevent overlapping transitions
    }

    isLayerTransitioning = true;
    const oldLayerId = currentLayerId;
    logGame(`Starting layer transition fade: ${oldLayerId} -> ${newLayerId}`);

    try {
        // --- Fix sticky input: clear all input states before fade ---
        if (typeof clearAllInputStates === 'function') clearAllInputStates();

        await effects.sceneFadeWithBlack();
        logGame("Layer transition: Screen faded black.");

        // --- Hold at black for 300ms for polish ---
        await new Promise(res => setTimeout(res, 300));

        // --- Update Layer State (while screen is black) ---
        currentLayerId = newLayerId;
        logGame(`Layer updated: Current layer is now ${currentLayerId}.`);
        // Add any other layer-specific logic here if needed in the future
        // e.g., clear old layer animals, spawn new layer animals?

        await effects.sceneFadeFromBlack();
        logGame("Layer transition: Fade back in complete.");

    } catch (error) {
        logGame(`Error during layer transition: ${error}`);
        console.error(error);
        // Attempt recovery: ensure input is unlocked and transition flag is reset
        effects.unlockInput(); 
    } finally {
        isLayerTransitioning = false;
        logGame(`Layer transition finished: ${oldLayerId} -> ${currentLayerId}. Resuming game updates.`);
    }
}

// Original changeState function (modified)
function changeState(newState) {
  const prevState = window.currentState;
  logGame(`Attempting state change: ${prevState} -> ${newState}`); // Add log

  if (newState === prevState) {
    logGame(`State change aborted: Already in state ${newState}.`); // Add log
    return; // No change needed
  }

  // Directly call completeStateChange, removing the old fade logic and timeout
  completeStateChange(newState, prevState); // Pass prevState here
}

// Add a flag to track if animals have been spawned
let animalsAlreadySpawned = false;

// Function to complete the state change process, now async
async function completeStateChange(newState, prevState) { // Make async
  logGame(`Entering completeStateChange: Target state = ${newState}, Previous state = ${prevState}`);

  // Determine if it's a house transition (needs fade)
  const isEnteringHouse = newState === window.GameState.HOUSE && prevState !== window.GameState.HOUSE;
  const isLeavingHouse = prevState === window.GameState.HOUSE && newState !== window.GameState.HOUSE;
  const isEnteringMountain = (newState === window.GameState.DOWNHILL || newState === window.GameState.UPHILL) && prevState === window.GameState.HOUSE;
  const isHouseTransition = isEnteringHouse || isLeavingHouse;

  logGame(`isEnteringHouse: ${isEnteringHouse}, isLeavingHouse: ${isLeavingHouse}, isHouseTransition: ${isHouseTransition}, isEnteringMountain: ${isEnteringMountain}`);

  // --- Fade to Black (if needed) ---
  if (isHouseTransition) {
    logGame("House transition detected. Fading TO black...");
    await effects.sceneFadeWithBlack(); // Await fade to black before making changes
    logGame("Fade TO black complete. Proceeding with state changes.");
  } else {
    logGame("Not a house transition, skipping fade-to-black.");
  }

  // --- Perform State Updates (while screen is black or no fade needed) ---
  logGame(`Updating DOM and player state for ${newState}...`);

  if (newState === window.GameState.HOUSE) {
    logGame("Setting up HOUSE state.");
    document.getElementById("upgrade-menu").style.display = "block";
    document.getElementById("game-screen").style.display = "none";
    const bestTimeText = document.getElementById("bestTimeText");
    bestTimeText.textContent = player.bestTime === Infinity ? "Best Time: N/A"
                                                           : `Best Time: ${player.bestTime.toFixed(2)}s`;
    if (player.sledDamaged > 0) {
      player.sledDamaged = 0;
      console.log("Sled has been repaired at the house!");
      showSledRepairedNotice();
    }
    if (!isFirstHouseEntry && (prevState === window.GameState.DOWNHILL || prevState === window.GameState.UPHILL)) {
      // Always despawn animals when returning to the house for consistent behavior
      if (typeof window.despawnAllAnimals === 'function') {
        console.log("Despawning animals on return to house");
        window.despawnAllAnimals();
      } else {
        console.warn("despawnAllAnimals function not available");
        // Fallback - just reset the flag
        animalsAlreadySpawned = false;
      }
      
      if (loanAmount > 0) {
        // First calculate house entry fee
        const deduction = Math.ceil(loanAmount * TWEAK.houseEntryLoanDeduction);
        loanAmount += deduction;
        
        // Then calculate interest on the updated loan amount
        const interestAmount = calculateLoanInterest();
        
        updateLoanButton();
        houseReEntry++;
        console.log(`House entry fee: $${deduction} (${TWEAK.houseEntryLoanDeduction * 100}% of loan)`);
        console.log(`Loan interest: $${interestAmount} (${LOAN_INTEREST_RATE * 100}% of loan)`);
        console.log("House re-entry count:", houseReEntry);
      }
    }
    if (isFirstHouseEntry) {
      isFirstHouseEntry = false;
    }
    updateMoneyDisplay();
    logGame("HOUSE state setup complete.");
    currentLayerId = null; // Reset layer when entering house
    // Clear any existing animal entities when entering the house
    logGame("Clearing animals for house entry.");
    window.animals = [];
  }
  else if (newState === window.GameState.DOWNHILL) {
    logGame(`Setting up DOWNHILL state (previous: ${prevState}).`);
    document.getElementById("upgrade-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    if (prevState === window.GameState.HOUSE) {
      logGame("Transitioning from HOUSE to DOWNHILL.");
      if (!animalsAlreadySpawned && typeof window.spawnInitialAnimals === 'function') {
        logGame("Spawning initial animals.");
        window.spawnInitialAnimals();
        animalsAlreadySpawned = true;
      } else {
        logGame(`Animals already spawned: ${animalsAlreadySpawned}, spawn function exists: ${typeof window.spawnInitialAnimals === 'function'}`);
      }
      
      earlyFinish = false;
      player.collisions = 0;
      
      // Set fixed starting position at the bottom of the mountain
      player.x = 10; // Start at x = 10
      player.absY = 19930; // Start at y = 19930 (bottom)
      logGame(`Set player start position: x=${player.x}, absY=${player.absY}`);

      // Recalculate startLayer based on the new fixed position if needed for logging/other logic
      const startLayer = window.getLayerByY(player.absY); 
      
      downhillStartTime = performance.now();
      window.downhillStartTime = downhillStartTime; // Ensure global value is updated
      playerStartAbsY = player.absY;
      window.playerStartAbsY = playerStartAbsY; // Update global value
      logGame(`DOWNHILL starting: startTime=${downhillStartTime.toFixed(2)}, startY=${playerStartAbsY}, layer: ${startLayer ? startLayer.id : 'unknown'}`);
      currentLayerId = startLayer ? startLayer.id : null; // Initialize current layer ID
      logGame(`Initialized currentLayerId: ${currentLayerId}`);
    }
    else if (prevState === window.GameState.UPHILL) {
      logGame("Transitioning from UPHILL to DOWNHILL.");
      player.velocityY = 0;
      player.xVel = 0;
      downhillStartTime = performance.now();
      window.downhillStartTime = downhillStartTime; // Ensure global value is updated
      playerStartAbsY = player.absY;
      window.playerStartAbsY = playerStartAbsY; // Update global value
      const currentLayer = window.getLayerByY(player.absY); // Get current layer when switching DOWNHILL from UPHILL
      currentLayerId = currentLayer ? currentLayer.id : null;
      logGame(`DOWNHILL restart: startTime=${downhillStartTime.toFixed(2)}, startY=${playerStartAbsY}`);
      logGame(`Set currentLayerId on DOWNHILL restart: ${currentLayerId}`);
    }
    logGame("DOWNHILL state setup complete.");
  }
  else if (newState === window.GameState.UPHILL) {
    logGame(`Setting up UPHILL state (previous: ${prevState}).`);
    document.getElementById("upgrade-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    
    if (prevState === window.GameState.HOUSE) {
      logGame("Transitioning from HOUSE to UPHILL.");
      // Spawn animals when leaving the house to uphill (only if not already spawned)
      if (!animalsAlreadySpawned && typeof window.spawnInitialAnimals === 'function') {
        logGame("Spawning initial animals.");
        window.spawnInitialAnimals();
        animalsAlreadySpawned = true;
      } else {
        logGame(`Animals already spawned: ${animalsAlreadySpawned}, spawn function exists: ${typeof window.spawnInitialAnimals === 'function'}`);
      }
      
      // Set fixed starting position at the bottom of the mountain
      player.x = 10; // Start at x = 10
      player.absY = 19930; // Start at y = 19930 (bottom)
      logGame(`Set player start position: x=${player.x}, absY=${player.absY}`);
      player.velocityY = 0; // Ensure no residual velocity
      player.xVel = 0;
      const startLayer = window.getLayerByY(player.absY);
      currentLayerId = startLayer ? startLayer.id : null; // Initialize current layer ID
      logGame(`Initialized currentLayerId: ${currentLayerId}`);
    }
    
    if (prevState === window.GameState.DOWNHILL) {
      logGame("Transitioning from DOWNHILL to UPHILL.");
      awardMoney();
      logGame("Awarded money.");
      const currentLayer = window.getLayerByY(player.absY); // Get current layer when switching UPHILL from DOWNHILL
      currentLayerId = currentLayer ? currentLayer.id : null;
      logGame(`Set currentLayerId on UPHILL restart: ${currentLayerId}`);
    }
    player.xVel = 0;
    logGame("UPHILL state setup complete.");
  }

  // --- Update Global State ---
  const oldState = window.currentState; // Capture before update
  window.currentState = newState;
  logGame(`Global state updated: ${oldState} -> ${window.currentState}`);

  // --- Fade Back In (if needed) ---
  if (isHouseTransition) {
    logGame("House transition state changes complete. Fading OUT (back to visible)...");
    await effects.sceneFadeFromBlack(); // Await fade out *after* all changes are done
    logGame("Fade OUT complete. Transition finished.");
  } else {
    logGame("Not a house transition, skipping fade-out.");
  }
  logGame(`Exiting completeStateChange for state ${newState}.`); // Final log for the function
}

// Function to reset the animal spawn flag
function resetAnimalsSpawnFlag() {
  console.log("Resetting animals spawn flag");
  animalsAlreadySpawned = false;
}

// Create and launch the Phaser game with scale options for responsiveness
var config = {
  type: Phaser.AUTO,
  parent: "game-screen",
  width: window.canvas.width,  // Reference from global window.canvas
  height: window.canvas.height, // Reference from global window.canvas
  scene: MainScene,
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  // Enhanced canvas attributes to fix the willReadFrequently warning
  canvasAttributes: {
    willReadFrequently: true,
    style: 'width: 100%; height: 100%;'
  },
  render: {
    willReadFrequently: true,
    antialias: false,
    pixelArt: true,
    roundPixels: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

var phaserGame = new Phaser.Game(config);

// Make functions available globally (ensure correct functions are exposed)
window.changeState = changeState;
window.resetAnimalsSpawnFlag = resetAnimalsSpawnFlag;
