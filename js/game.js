/* game.js - Core Loop & State Management (Phaserized) */

// Import necessary functions and variables
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

// Add a throttled logging mechanism
const logThrottleTimes = {};
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
  }

  update(time, delta) {
    throttledLog("MainScene update START", 5000);
    // Update game mechanics (delta in ms)
    updateMechanics(delta);

    // Update floating texts
    window.floatingTexts = window.floatingTexts.filter(text => text.update(delta));

    // Call the render function (draws onto ctx)
    render();

    // Refresh the Canvas Texture so Phaser displays the new drawing
    this.rt.refresh();
    
    // Make sure the image is visible after state changes
    this.image.visible = true;
    
    throttledLog("MainScene update END", 5000);
  }
}

// Original changeState function (unchanged in logic)
function changeState(newState) {
  // Guard clause to prevent redundant state changes
  if (newState === window.currentState) {
    console.log(`State change ignored: already in state ${newState}`);
    return;
  }

  const prevState = window.currentState;
  if (player.isJumping && newState !== window.GameState.HOUSE) {
    if (player.currentTrick) {
      resetTrickState();
      playCrashSound();
      console.log("State change interrupted trick - counted as crash");
    }
    lerpPlayerToGround(250, () => {
      player.isJumping = false;
      onPlayerLand();
      completeStateChange(newState, prevState);
    });
    return;
  }
  completeStateChange(newState, prevState);
}

// Add a flag to track if animals have been spawned
let animalsAlreadySpawned = false;

async function completeStateChange(newState, prevState) {
  // Only fade if entering or leaving HOUSE (WHY: hide only major scene swaps, not hill <-> uphill)
  const effects = await import('./effects.js');
  const isHouseTransition = (newState === window.GameState.HOUSE || prevState === window.GameState.HOUSE);
  if (isHouseTransition) {
    await effects.sceneFadeWithBlack();
  }

  window.currentState = newState;
  if (window.currentState === window.GameState.HOUSE) {
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
  }
  else if (window.currentState === window.GameState.DOWNHILL) {
    document.getElementById("upgrade-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    if (prevState === window.GameState.HOUSE) {
      // Spawn animals when leaving the house to downhill (only if not already spawned)
      if (!animalsAlreadySpawned && typeof window.spawnInitialAnimals === 'function') {
        console.log("Spawning animals as player leaves house for the first time...");
        window.spawnInitialAnimals();
        animalsAlreadySpawned = true;
      }
      
      earlyFinish = false;
      player.collisions = 0;
      
      // Get the layer for the starting position
      // const startY = mountainHeight - (player.height * 3); // Keep original calculation for potential future use or logging
      // const startLayer = getLayerByY(startY); // Keep original calculation for potential future use or logging
      
      // Set fixed starting position at the bottom of the mountain
      player.x = 10; // Start at x = 10
      player.absY = 19930; // Start at y = 19930 (bottom)

      // Recalculate startLayer based on the new fixed position if needed for logging/other logic
      const startLayer = getLayerByY(player.absY); 
      
      player.velocityY = 0;
      player.xVel = 0;
      downhillStartTime = performance.now();
      window.downhillStartTime = downhillStartTime; // Ensure global value is updated
      playerStartAbsY = player.absY;
      window.playerStartAbsY = playerStartAbsY; // Update global value
      console.log(`DOWNHILL starting position: ${playerStartAbsY}, layer: ${startLayer.id}, width: ${startLayer.width}`);
    }
    else if (prevState === window.GameState.UPHILL) {
      player.velocityY = 0;
      player.xVel = 0;
      downhillStartTime = performance.now();
      window.downhillStartTime = downhillStartTime; // Ensure global value is updated
      playerStartAbsY = player.absY;
      window.playerStartAbsY = playerStartAbsY; // Update global value
      console.log(`DOWNHILL starting position: ${playerStartAbsY}`);
    }
  }
  else if (window.currentState === window.GameState.UPHILL) {
    document.getElementById("upgrade-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    
    if (prevState === window.GameState.HOUSE) {
      // Spawn animals when leaving the house to uphill (only if not already spawned)
      if (!animalsAlreadySpawned && typeof window.spawnInitialAnimals === 'function') {
        console.log("Spawning animals as player leaves house for the first time...");
        window.spawnInitialAnimals();
        animalsAlreadySpawned = true;
      }
      
      // Set fixed starting position at the bottom of the mountain
      player.x = 10; // Start at x = 10
      player.absY = 19930; // Start at y = 19930 (bottom)
      console.log(`UPHILL starting position set to fixed point: x=${player.x}, y=${player.absY}`);
    }
    
    if (prevState === window.GameState.DOWNHILL) {
      awardMoney();
    }
    player.xVel = 0;
  }
  console.log(`Game state changed: ${prevState} -> ${window.currentState}`);

  // Only fade back in if we faded out
  if (isHouseTransition) {
    await effects.sceneFade(false);
  }
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

// Make functions available globally
window.changeState = changeState;
window.resetAnimalsSpawnFlag = resetAnimalsSpawnFlag;
// Removed redundant global assignment - window.currentState is now managed directly
