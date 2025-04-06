/* tricks.js - Trick System & Logic */
import { register } from './registry.js';

// Default durations for trick phases (these will be used if TWEAK values aren't set)
const DEFAULT_START_PHASE_DURATION = 300; // ms
const DEFAULT_END_PHASE_DURATION = 300; // ms

// Starts a trick phase (start, mid, or end)
function startTrickPhase(trickName, phase) {
  // Only allow starting a trick if player is jumping and not in cooldown
  if (!player.isJumping || player.trickCooldowns[trickName] > 0) return;
  
  // Handle phase transitions
  if (phase === 'start') {
    // Starting a brand new trick
    if (player.trickState !== 'none') return; // Don't start if we're already in a trick
    
    console.log(`[${getTimestamp()}] TRICK START PHASE: ${trickName} (Jump Height: ${player.jumpZoomBonus.toFixed(2)})`);
    
    player.currentTrick = trickName;
    player.trickState = 'start';
    player.trickPhaseTimer = 0;
    player.trickTotalTime = 0;
    player.trickRotation = 0;
    player.trickOffset = 0;
    player.trickButtonHeld = true;
  } 
  else if (phase === 'mid') {
    // Transition from start to mid phase
    if (player.trickState !== 'start' || player.currentTrick !== trickName) return;
    
    console.log(`[${getTimestamp()}] TRICK MID PHASE: ${trickName}`);
    
    player.trickState = 'mid';
    player.trickPhaseTimer = 0;
  } 
  else if (phase === 'end') {
    // Transition to end phase
    if ((player.trickState !== 'start' && player.trickState !== 'mid') || player.currentTrick !== trickName) return;
    
    console.log(`[${getTimestamp()}] TRICK END PHASE: ${trickName}`);
    
    player.trickState = 'end';
    player.trickPhaseTimer = 0;
    player.trickButtonHeld = false;
  }
  
  return true;
}
register("startTrickPhase", startTrickPhase);

function checkTrickInputs() {
  // This function is no longer needed as trick start is handled by keydown event
  // We keep it to maintain compatibility with existing code
}
register("checkTrickInputs", checkTrickInputs);

function processTrick(deltaTime) {
  if (!player.currentTrick) return;
  
  // Update timers
  player.trickPhaseTimer += deltaTime;
  player.trickTotalTime += deltaTime;
  
  // Get the durations from TWEAK settings or use defaults
  const startPhaseDuration = (TWEAK && TWEAK._trickStartPhaseDuration) ? TWEAK._trickStartPhaseDuration : DEFAULT_START_PHASE_DURATION;
  const endPhaseDuration = (TWEAK && TWEAK._trickEndPhaseDuration) ? TWEAK._trickEndPhaseDuration : DEFAULT_END_PHASE_DURATION;
  
  // Handle phase transitions
  if (player.trickState === 'start' && player.trickPhaseTimer >= startPhaseDuration) {
    // If button is still held, transition to mid phase, otherwise go to end
    if (isTrickButtonHeld(player.currentTrick)) {
      startTrickPhase(player.currentTrick, 'mid');
    } else {
      startTrickPhase(player.currentTrick, 'end');
    }
  } 
  else if (player.trickState === 'end' && player.trickPhaseTimer >= endPhaseDuration) {
    // End phase complete, finish the trick
    completeTrick();
  }
  
  // Process animations based on trick type and current phase
  processAnimations(deltaTime);
}
register("processTrick", processTrick);

function processAnimations(deltaTime) {
  if (!player.currentTrick) return;
  
  // Get the durations from TWEAK settings or use defaults
  const startPhaseDuration = (TWEAK && TWEAK._trickStartPhaseDuration) ? TWEAK._trickStartPhaseDuration : DEFAULT_START_PHASE_DURATION;
  const endPhaseDuration = (TWEAK && TWEAK._trickEndPhaseDuration) ? TWEAK._trickEndPhaseDuration : DEFAULT_END_PHASE_DURATION;
  
  switch (player.currentTrick) {
    case "leftHelicopter":
    case "rightHelicopter":
      // Helicopter trick animation
      const rotationSpeed = TWEAK._trickRotationSpeed * (deltaTime / 1000);
      const rotationDir = player.currentTrick === "leftHelicopter" ? -1 : 1;
      
      if (player.trickState === 'start') {
        // Start phase: rotate 180 degrees
        const startProgress = Math.min(1, player.trickPhaseTimer / startPhaseDuration);
        player.trickRotation = rotationDir * 180 * startProgress;
      } 
      else if (player.trickState === 'mid') {
        // Mid phase: continue rotating
        player.trickRotation += rotationDir * rotationSpeed * 360; // Constant rotation
      } 
      else if (player.trickState === 'end') {
        // End phase: interpolate back to 0 from current rotation
        const endProgress = Math.min(1, player.trickPhaseTimer / endPhaseDuration);
        const startRotation = player.trickRotation;
        // Calculate shortest path to 0 (consider rotation is in degrees)
        let targetRotation = 0;
        while (targetRotation < startRotation - 180) targetRotation += 360;
        while (targetRotation > startRotation + 180) targetRotation -= 360;
        
        player.trickRotation = startRotation + (targetRotation - startRotation) * endProgress;
      }
      break;
      
    case "airBrake":
    case "parachute":
      // Air Brake and Parachute animation
      const maxOffset = TWEAK._trickOffsetDistance;
      
      if (player.trickState === 'start') {
        // Start phase: extend to full
        const startProgress = Math.min(1, player.trickPhaseTimer / startPhaseDuration);
        player.trickOffset = maxOffset * startProgress;
      } 
      else if (player.trickState === 'mid') {
        // Mid phase: hold at full extension
        player.trickOffset = maxOffset;
      } 
      else if (player.trickState === 'end') {
        // End phase: return to normal position
        const endProgress = Math.min(1, player.trickPhaseTimer / endPhaseDuration);
        player.trickOffset = maxOffset * (1 - endProgress);
      }
      break;
  }
}
register("processAnimations", processAnimations);

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
  
  // Use total trick time for scoring
  let elapsedTime = Math.max(0, player.trickTotalTime / 1000); // Convert to seconds
  
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
  resetTrickState();
  playTrickCompleteSound();
}
register("completeTrick", completeTrick);

function resetTrickState() {
  player.currentTrick = null;
  player.trickState = 'none';
  player.trickPhaseTimer = 0;
  player.trickTotalTime = 0;
  player.trickRotation = 0;
  player.trickOffset = 0;
  player.trickButtonHeld = false;
}
register("resetTrickState", resetTrickState);

function playTrickCompleteSound() {
  playTone(600, "sine", 0.1, 0.2);
}
register("playTrickCompleteSound", playTrickCompleteSound);

// Expose functions globally
window.startTrickPhase = startTrickPhase;
window.checkTrickInputs = checkTrickInputs;
window.resetTrickState = resetTrickState;

export {
  startTrickPhase,
  checkTrickInputs,
  processTrick,
  completeTrick,
  resetTrickState,
  playTrickCompleteSound,
};
