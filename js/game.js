/* game.js - Core Loop & State Management */
var downhillStartTime = null;
var lastTime = 0;
var currentState = GameState.HOUSE;
var jumpOsc = null;
var jumpGain = null;
var loanAmount = 100000;
var floatingTexts = [];  // Global floating texts array
var isFirstHouseEntry = true;  // Track first house entry
var houseReEntery = 0;  // Track house re-entry count

// Core game loop: call mechanics update and then rendering
function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  // Update gameplay mechanics (from mechanics.js)
  updateMechanics(deltaTime);
  
  // Update floating texts
  floatingTexts = floatingTexts.filter(text => text.update(deltaTime));
  
  // Render everything (from render.js)
  render();
  
  requestAnimationFrame(gameLoop);
}

function changeState(newState) {
  const prevState = currentState;
  currentState = newState;
  
  if (currentState === GameState.HOUSE) {
    document.getElementById("upgrade-menu").style.display = "block";
    document.getElementById("game-screen").style.display = "none";
    const bestTimeText = document.getElementById("bestTimeText");
    bestTimeText.textContent = player.bestTime === Infinity ? "Best Time: N/A" : `Best Time: ${player.bestTime.toFixed(2)}s`;
    
    // Handle house entry costs after first visit
    if (!isFirstHouseEntry && (prevState === GameState.DOWNHILL || prevState === GameState.UPHILL)) {
      // Despawn any animals
      if (typeof despawnAllAnimals === 'function') {
        despawnAllAnimals();
      }
      
      // Deduct loan percentage from player's money
      if (loanAmount > 0) {
        const deduction = Math.ceil(loanAmount * TWEAK.houseEntryLoanDeduction);
        player.money = Math.max(0, player.money - deduction);
        houseReEntery++;
        console.log(`House entry fee: -$${deduction} (${TWEAK.houseEntryLoanDeduction * 100}% of $${loanAmount} loan)`);
        console.log('House re-entry count:', houseReEntery);
      }
    }
    
    if (isFirstHouseEntry) {
      isFirstHouseEntry = false;
    }
    
    updateMoneyDisplay();
  } else if (currentState === GameState.DOWNHILL) {
    document.getElementById("upgrade-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";

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
    } else if (prevState === GameState.UPHILL) {
      // When switching from UPHILL to DOWNHILL, maintain position but reset velocities
      player.velocityY = 0;
      player.xVel = 0;
      downhillStartTime = performance.now();
    }
  } else if (currentState === GameState.UPHILL) {
    document.getElementById("upgrade-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    
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

generateTerrain();
// Initialize loan button state
updateLoanButton();
changeState(GameState.HOUSE);
requestAnimationFrame(gameLoop);
