/* tricks.js - Trick System & Logic */
import { register } from './registry.js';

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
register("startTrick", startTrick);

function checkTrickInputs() {
  if (!player.currentTrick && player.isJumping) {
    if (keysDown["ArrowLeft"]) startTrick("leftHelicopter");
    else if (keysDown["ArrowRight"]) startTrick("rightHelicopter");
    else if (keysDown["ArrowUp"]) startTrick("airBrake");
    else if (keysDown["ArrowDown"]) startTrick("parachute");
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

export {
  startTrick,
  checkTrickInputs,
  processTrick,
  completeTrick,
  resetTrickState,
  playTrickCompleteSound,
};
