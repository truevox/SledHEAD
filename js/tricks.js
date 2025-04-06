/* tricks.js - Trick System & Logic */
import { register } from './registry.js';

function startTrick(trickName) {
  if (!player.isJumping || player.currentTrick || player.trickCooldowns[trickName] > 0) return;

  console.log(`[${getTimestamp()}] TRICK START: ${trickName} (Jump Height: ${player.jumpZoomBonus.toFixed(2)})`);
  
  player.currentTrick = trickName;
  player.trickTimer = 0;
  player.trickRotation = 0;
  player.trickOffset = 0;

  // Return true to indicate trick was started (useful for caller)
  return true;
}
register("startTrick", startTrick);

function checkTrickInputs() {
  if (!player.currentTrick && player.isJumping) {
    if (keysDown["ArrowLeft"]) {
      startTrick("leftHelicopter");
      console.log(`[${getTimestamp()}] ARROW INPUT: ArrowLeft triggered leftHelicopter trick`);
    }
    else if (keysDown["ArrowRight"]) {
      startTrick("rightHelicopter");
      console.log(`[${getTimestamp()}] ARROW INPUT: ArrowRight triggered rightHelicopter trick`);
    }
    else if (keysDown["ArrowUp"]) {
      startTrick("airBrake");
      console.log(`[${getTimestamp()}] ARROW INPUT: ArrowUp triggered airBrake trick`);
    }
    else if (keysDown["ArrowDown"]) {
      startTrick("parachute");
      console.log(`[${getTimestamp()}] ARROW INPUT: ArrowDown triggered parachute trick`);
    }
  }
}
register("checkTrickInputs", checkTrickInputs);

function processTrick(deltaTime) {
  if (player.currentTrick) {
    player.trickTimer += deltaTime;
    let trickProgress = player.trickTimer / (TWEAK._trickBaseDuration * TWEAK._trickTimeMultiplier + TWEAK._trickTimeAdder);
    switch (player.currentTrick) {
      case "leftHelicopter":
        player.trickRotation -= TWEAK._trickRotationSpeed * (deltaTime / 1000);
        break;
      case "rightHelicopter":
        player.trickRotation += TWEAK._trickRotationSpeed * (deltaTime / 1000);
        break;
      case "airBrake":
      case "parachute":
        player.trickOffset = TWEAK._trickOffsetDistance * Math.sin(Math.PI * trickProgress);
        break;
    }
    if (trickProgress >= 1) {
      completeTrick();
    }
  }
}
register("processTrick", processTrick);

// Helper function to get current jump data safely
function getCurrentJumpData() {
  // Safely access window.jumpData or provide fallback with default values
  return window.jumpData || { peakHeight: 0, startTime: Date.now() };
}

function completeTrick() {
  // Get jump data safely
  let jumpData = getCurrentJumpData();
  let currentTime = Date.now();
  
  // Store trick name before resetting
  const trickName = player.currentTrick;
  
  // Get timing values with safety checks
  let trickStartTime = player.trickTimer ? (currentTime - player.trickTimer) : currentTime;
  let elapsedTime = Math.max(0, (currentTime - trickStartTime) / 1000); // seconds, ensure positive
  
  // Get base values with safety checks
  let baseValue = TWEAK._trickMoneyBase || 50; // Fallback to 50 if undefined
  
  // Get multipliers with safety checks for division by zero
  let trickTimeNormalization = TWEAK._trickTimeMultiplier || 1; // Fallback to 1 if undefined
  if (trickTimeNormalization <= 0) trickTimeNormalization = 1; // Prevent division by zero
  
  let airtimeMultiplier = 1 + (elapsedTime / trickTimeNormalization);
  
  // Get height multiplier with safety checks
  let peakHeight = jumpData.peakHeight || 0;
  let trickHeightNormalization = 10; // Default value if no configuration exists
  
  if (typeof TWEAK._trickHeightNormalization !== 'undefined' && TWEAK._trickHeightNormalization > 0) {
    trickHeightNormalization = TWEAK._trickHeightNormalization;
  }
  
  let heightMultiplier = 1 + (peakHeight / trickHeightNormalization);
  
  // Calculate final money amount
  let totalMoney = Math.floor(baseValue * airtimeMultiplier * heightMultiplier);
  
  // Debug log to help identify issues
  console.log(`Debug trick calculation: baseValue=${baseValue}, elapsedTime=${elapsedTime.toFixed(2)}s, airtimeMultiplier=${airtimeMultiplier.toFixed(2)}, peakHeight=${peakHeight}, heightMultiplier=${heightMultiplier.toFixed(2)}`);
  
  // Ensure totalMoney is a valid number
  if (isNaN(totalMoney) || !isFinite(totalMoney)) {
    console.error(`Error calculating trick money for ${trickName}. Using default value.`);
    totalMoney = baseValue; // Fallback to base value if calculation fails
  }
  
  // Chain bonus logic
  let chainBonus = 1;
  if (player.lastTrick && player.lastTrick !== player.currentTrick) {
    player.trickChainCount++;
    chainBonus = Math.pow(TWEAK._trickChainMultiplier, player.trickChainCount);
    totalMoney *= chainBonus;
  } else {
    player.trickChainCount = 0;
  }
  
  // Apply trick value multiplier if it exists
  if (player.currentTrickValueMultiplier) {
    totalMoney *= player.currentTrickValueMultiplier;
  }
  
  // Final money amount as integer
  let finalMoney = Math.floor(totalMoney);
  
  // Add money and display
  player.money += finalMoney;
  showMoneyGain(finalMoney, `(${trickName})`);
  addFloatingText(`+$${finalMoney} ${trickName}`, player.x, player.absY);
  console.log(`Completed ${trickName}! +$${finalMoney}`);
  
  // Reset trick state
  player.lastTrick = player.currentTrick;
  player.currentTrick = null;
  player.trickTimer = 0;
  player.trickRotation = 0;
  player.trickOffset = 0;
  playTrickCompleteSound();
}
register("completeTrick", completeTrick);

function resetTrickState() {
  player.currentTrick = null;
  player.trickTimer = 0;
  player.trickRotation = 0;
  player.trickOffset = 0;
  player.lastTrick = null;
  player.trickChainCount = 0;
}
register("resetTrickState", resetTrickState);

function playTrickCompleteSound() {
  playTone(600, "sine", 0.1, 0.2);
}
register("playTrickCompleteSound", playTrickCompleteSound);

// Expose checkTrickInputs globally so that other modules (like downhill.js) can call it.
window.checkTrickInputs = checkTrickInputs;
// Expose resetTrickState globally so game.js can use it during state transitions
window.resetTrickState = resetTrickState;

export {
  startTrick,
  checkTrickInputs,
  processTrick,
  completeTrick,
  resetTrickState,
  playTrickCompleteSound,
};
