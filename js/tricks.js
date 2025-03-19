/* tricks.js - Trick System & Logic */

// Function to start a trick
function startTrick(trickName) {
  if (player.currentTrick) return;
  player.currentTrick = trickName;
  player.trickTimer = 0;
  player.trickRotation = 0;
  player.trickOffset = 0;
  let now = Date.now();
  let cooldownEnd = player.trickCooldowns[trickName] || 0;
  let timeLeft = Math.max(0, cooldownEnd - now);
  player.currentTrickValueMultiplier = timeLeft > 0 ? Math.max(0.1, 1 - (timeLeft / TWEAK._trickCooldown)) : 1;
  player.trickCooldowns[trickName] = now + TWEAK._trickCooldown;
  console.log(`Starting ${trickName} (Value: ${(player.currentTrickValueMultiplier * 100).toFixed(0)}%)`);
}

// Check trick inputs and start a trick if applicable
function checkTrickInputs() {
  if (!player.currentTrick && player.isJumping) {
    if (keysDown["ArrowLeft"]) startTrick("leftHelicopter");
    else if (keysDown["ArrowRight"]) startTrick("rightHelicopter");
    else if (keysDown["ArrowUp"]) startTrick("airBrake");
    else if (keysDown["ArrowDown"]) startTrick("parachute");
  }
}

// Process the current trick's animation and state
function processTrick(deltaTime) {
  if (player.currentTrick) {
    player.trickTimer += deltaTime;
    let trickProgress = player.trickTimer / (TWEAK._trickBaseDuration * TWEAK._trickTimeMultiplier + TWEAK._trickTimeAdder);
    
    // Apply trick-specific effects
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
    
    // Check if trick is complete
    if (trickProgress >= 1) {
      completeTrick();
    }
  }
}

// Complete a trick and award money
function completeTrick() {
  let trickMoney = TWEAK._trickMoneyBase;
  let chainBonus = 1;
  
  if (player.lastTrick && player.lastTrick !== player.currentTrick) {
    player.trickChainCount++;
    chainBonus = Math.pow(TWEAK._trickChainMultiplier, player.trickChainCount);
    trickMoney *= chainBonus;
  } else {
    player.trickChainCount = 0;
  }
  
  trickMoney *= player.currentTrickValueMultiplier;
  let finalMoney = Math.floor(trickMoney);
  player.money += finalMoney;
  showMoneyGain(finalMoney, `(${player.currentTrick})`);
  addFloatingText(`+$${finalMoney} ${player.currentTrick}`, player.x, player.absY);
  console.log(`Completed ${player.currentTrick}! +$${finalMoney}`);
  
  player.lastTrick = player.currentTrick;
  player.currentTrick = null;
  player.trickTimer = 0;
  player.trickRotation = 0;
  player.trickOffset = 0;
  
  playTrickCompleteSound();
}

// Reset trick state when landing or crashing
function resetTrickState() {
  player.currentTrick = null;
  player.trickTimer = 0;
  player.trickRotation = 0;
  player.trickOffset = 0;
  player.lastTrick = null;
  player.trickChainCount = 0;
}

// Play sound when a trick is completed
function playTrickCompleteSound() {
  playTone(600, "sine", 0.1, 0.2);
}