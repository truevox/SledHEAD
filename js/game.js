/* game.js - Core Loop & State Management */
import { GameState } from './gamestate.js';
import { initializeCanvas } from './resolution.js';
import { keysDown } from './input.js';
import { player, initializePlayer } from './player.js';
import { playerUpgrades, mountainUpgrades, initUpgradeButton, purchaseUpgrade } from './upgrades.js';
import { updateMoneyDisplay, showSledRepairedNotice, render, setStartPosition } from './render.js';
import { playCrashSound, unlockAudioContext, playStartGameSound, capitalizeFirstLetter } from './utils.js';
import { payLoan, updateLoanButton } from './loan.js';
import { generateTerrain, mountainHeight } from './world.js';
import { resetTrickState, onPlayerLand, lerpPlayerToGround } from './tricks.js';
import { updateMechanics, setCurrentState, setDownhillStartTime, setPlayerStartAbsY } from './mechanics.js';
import { despawnAllAnimals, setWildlifeState } from './wildlife.js';
import { TWEAK } from './settings.js';
import { awardMoney } from './world.js';
import { initAudio } from './downhill.js';

var downhillStartTime = null;
var lastTime = 0;
var currentState = GameState.HOUSE;
var jumpOsc = null;
var jumpGain = null;
var loanAmount = 100000;
var floatingTexts = [];  // Global floating texts array
var isFirstHouseEntry = true;  // Track first house entry
var houseReEntry = 0;  // Track house re-entry count
var playerStartAbsY = 0;  // Track starting Y position for distance calculation
var earlyFinish = false;

// Declare canvas and ctx at module level
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Initialize game state
function initializeGame() {
  // Initialize canvas with proper scaling
  initializeCanvas(canvas, ctx);
  
  // Initialize player after canvas is ready
  initializePlayer(canvas.width);
  
  // Generate initial terrain
  generateTerrain();
  
  // Initialize loan button state
  updateLoanButton();
  
  // Start in house
  changeState(GameState.HOUSE);
  
  // Start game loop
  requestAnimationFrame(gameLoop);
}

// Core game loop: call mechanics update and then rendering
function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  // Update mechanics state
  setCurrentState(currentState);
  if (downhillStartTime) setDownhillStartTime(downhillStartTime);
  if (playerStartAbsY) setPlayerStartAbsY(playerStartAbsY);
  
  // Update wildlife state
  setWildlifeState(currentState);
  
  // Update gameplay mechanics
  updateMechanics(deltaTime);
  
  // Update floating texts
  floatingTexts = floatingTexts.filter(text => text.update(deltaTime));
  
  // Render everything with current parameters
  render(floatingTexts, currentState);
  
  requestAnimationFrame(gameLoop);
}

function changeState(newState) {
  const prevState = currentState;

  // Handle mid-jump state transitions
  if (player.isJumping && newState !== GameState.HOUSE) {
    if (player.currentTrick) {
      // Treat as crash if in a trick
      resetTrickState();
      playCrashSound();
      console.log("State change interrupted trick - counted as crash");
    }
    
    // Lerp to ground over 250ms before completing state change
    lerpPlayerToGround(250, () => {
      player.isJumping = false;
      onPlayerLand();
      completeStateChange(newState, prevState);
    });
    return;
  }

  completeStateChange(newState, prevState);
}

// Helper function to complete the state change
function completeStateChange(newState, prevState) {
  currentState = newState;
  
  if (currentState === GameState.HOUSE) {
    document.getElementById("upgrade-menu").style.display = "block";
    document.getElementById("game-screen").style.display = "none";
    const bestTimeText = document.getElementById("bestTimeText");
    bestTimeText.textContent = player.bestTime === Infinity ? "Best Time: N/A" : `Best Time: ${player.bestTime.toFixed(2)}s`;
    
    // Check and repair the sled if it's damaged
    if (player.sledDamaged > 0) {
      player.sledDamaged = 0;
      console.log("Sled has been repaired at the house!");
      // Show repair notification to the player
      showSledRepairedNotice();
    }
    
    // Handle house entry costs after first visit
    if (!isFirstHouseEntry && (prevState === GameState.DOWNHILL || prevState === GameState.UPHILL)) {
      // Despawn any animals
      if (typeof despawnAllAnimals === 'function') {
        despawnAllAnimals();
      }
      
      // Deduct loan percentage from player's money
      if (loanAmount > 0) {
        const deduction = Math.ceil(loanAmount * TWEAK.houseEntryLoanDeduction);
        loanAmount += deduction
        updateLoanButton()
        houseReEntry++;
        console.log(`House entry fee: -$${deduction} (${TWEAK.houseEntryLoanDeduction * 100}% of $${loanAmount} loan)`);
        console.log('House re-entry count:', houseReEntry);
      }
    }
    
    if (isFirstHouseEntry) {
      isFirstHouseEntry = false;
    }
    
    updateMoneyDisplay();
  } else if (currentState === GameState.DOWNHILL) {
    document.getElementById("upgrade-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    
    // Initialize audio for downhill mode
    initAudio();
    
    // Only reset these values if coming from HOUSE state
    if (prevState === GameState.HOUSE) {
      earlyFinish = false;
      player.collisions = 0;
      player.x = canvas.width / 2;
      // Spawn 3 player heights from bottom
      player.absY = mountainHeight - (player.height * 3);
      player.velocityY = 0;
      player.xVel = 0;
      downhillStartTime = performance.now();
      // Record starting Y position for distance calculation
      playerStartAbsY = player.absY;
      setStartPosition(player.absY);
      console.log(`DOWNHILL starting position: ${playerStartAbsY}`);
    } else if (prevState === GameState.UPHILL) {
      // When switching from UPHILL to DOWNHILL, maintain position but reset velocities
      player.velocityY = 0;
      player.xVel = 0;
      downhillStartTime = performance.now();
      // Record starting Y position for distance calculation
      playerStartAbsY = player.absY;
      setStartPosition(player.absY);
      console.log(`DOWNHILL starting position: ${playerStartAbsY}`);
    }
  } else if (currentState === GameState.UPHILL) {
    document.getElementById("upgrade-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    
    // Award money when changing from DOWNHILL to UPHILL
    if (prevState === GameState.DOWNHILL) {
      awardMoney();
    }
    
    // Reset specific uphill-mode properties
    player.xVel = 0;
    // Keep the current position when toggling from DOWNHILL
  }

  console.log(`Game state changed: ${prevState} -> ${currentState}`);
}

document.getElementById("startGame").addEventListener("click", () => {
  console.log("Start run clicked.");
  unlockAudioContext(); // Ensure sound works
  playStartGameSound();
  changeState(GameState.DOWNHILL);
});

document.getElementById("payLoan").addEventListener("click", () => {
  console.log("Paying loan...");
  payLoan();
});

// Upgrade button event listeners initialization
Object.keys(playerUpgrades).forEach(upg => {
  initUpgradeButton(upg, playerUpgrades[upg]);
  const btnId = `upgrade${capitalizeFirstLetter(upg)}`;
  document.getElementById(btnId).addEventListener("click", () => {
    console.log("Upgrade button clicked:", upg, "Current money:", player.money);
    purchaseUpgrade(playerUpgrades, upg);
  });
});
Object.keys(mountainUpgrades).forEach(upg => {
  initUpgradeButton(upg, mountainUpgrades[upg]);
  const btnId = `upgrade${capitalizeFirstLetter(upg)}`;
  document.getElementById(btnId).addEventListener("click", () => {
    console.log("Upgrade button clicked:", upg, "Current money:", player.money);
    purchaseUpgrade(mountainUpgrades, upg);
  });
});

// Move initialization calls into the function
document.addEventListener('DOMContentLoaded', () => {
  // Wait for canvas element to be available
  if (canvas && ctx) {
    initializeGame();
  } else {
    console.error('Canvas or context not available');
  }
});

// Export necessary variables and functions
export { 
  changeState, 
  canvas, 
  ctx, 
  currentState, 
  lastTime,
  gameLoop,
  floatingTexts
};
