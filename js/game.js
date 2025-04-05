/* game.js - Core Loop & State Management (Phaserized) */

// Import necessary functions and variables
import { playerUpgrades, mountainUpgrades, initUpgradeButton, purchaseUpgrade, updateMoneyDisplay } from './upgradeLogic.js';

// Keep your globals
var downhillStartTime = null;
window.downhillStartTime = null; // Make downhillStartTime globally accessible
var lastTime = 0;
// Local currentState variable removed - we'll use window.currentState exclusively
var jumpOsc = null;
var jumpGain = null;
var loanAmount = 100000;
window.floatingTexts = [];  // Make floatingTexts accessible globally
var isFirstHouseEntry = true;
var houseReEntry = 0;
var playerStartAbsY = 0;
window.playerStartAbsY = playerStartAbsY; // Make playerStartAbsY globally accessible

// We'll access the global canvas object
// var ctx is defined later after context creation

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
    
    // Get the canvas context
    ctx = this.rt.context;
    
    // Set the willReadFrequently attribute on the original canvas
    // We do this by creating a new canvas with the attribute and copying the context methods
    const canvasElement = this.game.canvas;
    canvasElement.willReadFrequently = true;
    
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

    // Hook up your DOM event listeners for buttons
    document.getElementById("startGame").addEventListener("click", () => {
      console.log("Start run clicked.");
      unlockAudioContext();
      playStartGameSound();
      changeState(window.GameState.DOWNHILL);
    });

    document.getElementById("payLoan").addEventListener("click", () => {
      console.log("Paying loan...");
      payLoan();
    });

    // Initialize upgrade buttons
    Object.keys(playerUpgrades).forEach(upg => {
      initUpgradeButton(upg, playerUpgrades[upg]);
      const btnId = `upgrade${window.capitalizeFirstLetter(upg)}`;
      document.getElementById(btnId).addEventListener("click", () => {
        console.log("Upgrade button clicked:", upg, "Current money:", player.money);
        purchaseUpgrade(playerUpgrades, upg);
      });
    });
    Object.keys(mountainUpgrades).forEach(upg => {
      initUpgradeButton(upg, mountainUpgrades[upg]);
      const btnId = `upgrade${window.capitalizeFirstLetter(upg)}`;
      document.getElementById(btnId).addEventListener("click", () => {
        console.log("Upgrade button clicked:", upg, "Current money:", player.money);
        purchaseUpgrade(mountainUpgrades, upg);
      });
    });

    // Set up the world
    generateTerrain();
    updateLoanButton();
    changeState(window.GameState.HOUSE);
  }

  update(time, delta) {
    console.log("MainScene update START");
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
    
    console.log("MainScene update END");
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

function completeStateChange(newState, prevState) {
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
      if (typeof despawnAllAnimals === 'function') {
        despawnAllAnimals();
      }
      if (loanAmount > 0) {
        const deduction = Math.ceil(loanAmount * TWEAK.houseEntryLoanDeduction);
        loanAmount += deduction;
        updateLoanButton();
        houseReEntry++;
        console.log(`House entry fee: -$${deduction} (${TWEAK.houseEntryLoanDeduction * 100}% of $${loanAmount} loan)`);
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
      earlyFinish = false;
      player.collisions = 0;
      player.x = window.canvas.width / 2;
      player.absY = mountainHeight - (player.height * 3);
      player.velocityY = 0;
      player.xVel = 0;
      downhillStartTime = performance.now();
      window.downhillStartTime = downhillStartTime; // Ensure global value is updated
      playerStartAbsY = player.absY;
      window.playerStartAbsY = playerStartAbsY; // Update global value
      console.log(`DOWNHILL starting position: ${playerStartAbsY}`);
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
    if (prevState === window.GameState.DOWNHILL) {
      awardMoney();
    }
    player.xVel = 0;
  }
  console.log(`Game state changed: ${prevState} -> ${window.currentState}`);
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
  // Add canvas attributes to fix the willReadFrequently warning
  canvasAttributes: {
    willReadFrequently: true
  }
};

var phaserGame = new Phaser.Game(config);

// Make functions available globally
window.changeState = changeState;
// Removed redundant global assignment - window.currentState is now managed directly
