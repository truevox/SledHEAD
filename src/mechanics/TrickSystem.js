// src/mechanics/TrickSystem.js
import { player } from '../gameplay/Player.js';
import { addFloatingText, playTone, playTrickCompleteSound } from '../utils/UIUtils.js';

export function startTrick(trickName) {
  if (player.currentTrick) return;
  player.currentTrick = trickName;
  player.trickTimer = 0;
  player.trickRotation = 0;
  player.trickOffset = 0;
  let now = Date.now();
  let cooldownEnd = player.trickCooldowns[trickName] || 0;
  let timeLeft = Math.max(0, cooldownEnd - now);
  player.currentTrickValueMultiplier = timeLeft > 0 ? Math.max(0.1, 1 - (timeLeft / 5000)) : 1;
  player.trickCooldowns[trickName] = now + 5000;
  console.log(`Starting ${trickName} (Value: ${(player.currentTrickValueMultiplier * 100).toFixed(0)}%)`);
}

export function updateTrick(deltaTime) {
  if (player.currentTrick) {
    player.trickTimer += deltaTime;
    switch (player.currentTrick) {
      case "leftHelicopter":
        player.trickRotation -= 720 * (deltaTime / 1000);
        break;
      case "rightHelicopter":
        player.trickRotation += 720 * (deltaTime / 1000);
        break;
      case "airBrake":
      case "parachute":
        player.trickOffset = 40 * Math.sin(Math.PI * (player.trickTimer / 1000));
        break;
    }
    if (player.trickTimer >= 1000) {
      completeTrick();
    }
  }
}

function completeTrick() {
  let trickMoney = 50;
  let chainBonus = 1;
  if (player.lastTrick && player.lastTrick !== player.currentTrick) {
    player.trickChainCount++;
    chainBonus = Math.pow(1.5, player.trickChainCount);
    trickMoney *= chainBonus;
  } else {
    player.trickChainCount = 0;
  }
  trickMoney *= player.currentTrickValueMultiplier;
  let finalMoney = Math.floor(trickMoney);
  player.money += finalMoney;
  addFloatingText(`+$${finalMoney} (${player.currentTrick})`, player.x, player.absY);
  console.log(`${player.currentTrick} completed! +$${finalMoney}`);
  player.lastTrick = player.currentTrick;
  player.currentTrick = null;
  player.trickTimer = 0;
  player.trickRotation = 0;
  player.trickOffset = 0;
  playTrickCompleteSound();
}
