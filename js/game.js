/* game.js - Core Loop & State Management (Phaserized) */

// Keep your globals
var downhillStartTime = null;
var lastTime = 0;
var currentState = GameState.HOUSE;
var jumpOsc = null;
var jumpGain = null;
var loanAmount = 100000;
var floatingTexts = [];
var isFirstHouseEntry = true;
var houseReEntry = 0;
var playerStartAbsY = 0;

// We'll store a "canvas" object for width/height references
var canvas = { width: 800, height: 600 };
// We'll store a reference to the texture context
var ctx = null;

// Create a Phaser Scene to run your game logic
class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    // If you had assets, you'd load them here
  }

  create() {
    // Create a Canvas Texture of the same size as your old canvas
    // This gives us a .context we can draw on, just like normal HTML canvas
    this.rt = this.textures.createCanvas("myCanvas", canvas.width, canvas.height);
    ctx = this.rt.context;

    // Add it to the scene as an Image so Phaser will display it
    // Position at (0,0) with top-left origin
    this.image = this.add.image(0, 0, "myCanvas").setOrigin(0, 0);

    // Let Phaser parent be the #game-screen div
    // (We'll hide/show that div in changeState just like you did)
    // The config below is in the global var config at the bottom

    // Hook up your DOM event listeners for buttons
    document.getElementById("startGame").addEventListener("click", () => {
      console.log("Start run clicked.");
      unlockAudioContext();
      playStartGameSound();
      changeState(GameState.DOWNHILL);
    });

    document.getElementById("payLoan").addEventListener("click", () => {
      console.log("Paying loan...");
      payLoan();
    });

    // Initialize upgrade buttons
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

    // Set up the world
    generateTerrain();
    updateLoanButton();
    changeState(GameState.HOUSE);
  }

  update(time, delta) {
    // Convert delta to ms (Phaser already gives ms, so we can use it directly)
    updateMechanics(delta);

    // Update floating texts
    floatingTexts = floatingTexts.filter(text => text.update(delta));

    // Now do our normal "render()" call, which draws onto ctx
    // We'll do a full clear each frame, so old drawings don't linger
    render();

    // Refresh the Canvas Texture so Phaser sees the new drawing
    this.rt.refresh();
  }
}

// Original changeState function (unchanged, except we skip anything referencing old canvas directly)
function changeState(newState) {
  const prevState = currentState;

  // Handle mid-jump transitions
  if (player.isJumping && newState !== GameState.HOUSE) {
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
  currentState = newState;

  if (currentState === GameState.HOUSE) {
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

    if (!isFirstHouseEntry && (prevState === GameState.DOWNHILL || prevState === GameState.UPHILL)) {
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
  else if (currentState === GameState.DOWNHILL) {
    document.getElementById("upgrade-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";

    if (prevState === GameState.HOUSE) {
      earlyFinish = false;
      player.collisions = 0;
      player.x = canvas.width / 2;
      player.absY = mountainHeight - (player.height * 3);
      player.velocityY = 0;
      player.xVel = 0;
      downhillStartTime = performance.now();
      playerStartAbsY = player.absY;
      console.log(`DOWNHILL starting position: ${playerStartAbsY}`);
    }
    else if (prevState === GameState.UPHILL) {
      player.velocityY = 0;
      player.xVel = 0;
      downhillStartTime = performance.now();
      playerStartAbsY = player.absY;
      console.log(`DOWNHILL starting position: ${playerStartAbsY}`);
    }
  }
  else if (currentState === GameState.UPHILL) {
    document.getElementById("upgrade-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";

    if (prevState === GameState.DOWNHILL) {
      awardMoney();
    }
    player.xVel = 0;
  }

  console.log(`Game state changed: ${prevState} -> ${currentState}`);
}

// Finally, create and launch the Phaser game
var config = {
  type: Phaser.AUTO,
  parent: "game-screen",
  width: canvas.width,
  height: canvas.height,
  scene: MainScene,
  backgroundColor: "#000000"
};

var phaserGame = new Phaser.Game(config);
