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
