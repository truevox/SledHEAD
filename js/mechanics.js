/* mechanics.js - Gameplay Mechanics & Interactions */
import { player } from './player.js';
import { GameState } from './utils.js';
import { updateDownhill } from './downhill.js';
import { updateUphill } from './uphill.js';
import { mountainHeight } from './world.js';
import { showMoneyGain } from './render.js';

// Current state reference (to avoid circular dependencies)
let currentState = GameState.HOUSE;
let downhillStartTime = 0;
let playerStartAbsY = 0;

// Function to set the current state from outside
function setCurrentState(state) {
    currentState = state;
}

// Function to set the downhill start time
function setDownhillStartTime(time) {
    downhillStartTime = time;
}

// Function to set the player start position
function setPlayerStartAbsY(y) {
    playerStartAbsY = y;
}

// Update all gameplay state and physics – including jump/trick handling and collision updates.
function updateMechanics(deltaTime) {
    deltaTime *= 1;
    if (currentState === GameState.DOWNHILL) {
      // Call the refactored downhill function from downhill.js
      updateDownhill(deltaTime);
    } else if (currentState === GameState.UPHILL) {
      // Call the refactored uphill function from uphill.js
      updateUphill(deltaTime);
    }
}

// Award money based on downhill run performance
function calculateScore() {
    // Calculate total time for the run
    let endTime = performance.now();
    let runTime = (endTime - downhillStartTime) / 1000; // in seconds
    
    let distance = player.absY - playerStartAbsY;
    let moneyEarned = Math.ceil(distance / 100) * 10; // $10 per 100 units
    
    // Add speed bonus
    let speedBonus = Math.max(0, 30 - Math.floor(runTime)); // Up to $30 speed bonus
    moneyEarned += speedBonus;
    
    // Add trick bonus (if any)
    let trickBonus = player.trickMoney || 0;
    moneyEarned += trickBonus;
    
    // Minimum payout
    moneyEarned = Math.max(20, moneyEarned);
    
    // Award the money
    player.money += moneyEarned;
    
    // Update best time if applicable
    if (runTime < player.bestTime) {
        player.bestTime = runTime;
        console.log(`New best time: ${runTime.toFixed(2)}s!`);
    }
    
    console.log(`Run complete! Time: ${runTime.toFixed(2)}s, Distance: ${distance.toFixed(0)}, Money: $${moneyEarned}`);
    
    // Show money earned notification
    if (trickBonus > 0) {
        showMoneyGain(moneyEarned, `(run: $${moneyEarned - trickBonus}, tricks: $${trickBonus})`);
    } else {
        showMoneyGain(moneyEarned, "(run)");
    }
    
    // Reset trick money for next run
    player.trickMoney = 0;
    
    return moneyEarned;
}

// Note: Jump-related functions moved to jumpsled.js

function lerpPlayerToGround(duration, onComplete) {
  const startY = player.absY;
  const endY = mountainHeight - (player.height * 3); // Safe landing height
  const startTime = performance.now();

  function animate() {
    const now = performance.now();
    const t = Math.min(1, (now - startTime) / duration);
    // Use smooth easing
    const easedT = t * t * (3 - 2 * t);
    player.absY = startY + (endY - startY) * easedT;
    
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      player.absY = endY;
      if (onComplete) onComplete();
    }
  }

  animate();
}

// Export functions
export { 
    updateMechanics, 
    calculateScore, 
    setCurrentState, 
    setDownhillStartTime, 
    setPlayerStartAbsY 
};
