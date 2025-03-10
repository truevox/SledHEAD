// src/mechanics/TrickSystem.js
import { player } from '../gameplay/Player.js';
import { addFloatingText, playTone, playTrickCompleteSound } from '../utils/UIUtils.js';

export function startTrick(trickName) {
  if (player.currentTrick) return;
  
  const timestamp = new Date().toISOString();
  player.currentTrick = trickName;
  player.trickTimer = 0;
  player.trickRotation = 0;
  player.trickOffset = 0;
  
  let now = Date.now();
  let cooldownEnd = player.trickCooldowns[trickName] || 0;
  let timeLeft = Math.max(0, cooldownEnd - now);
  player.currentTrickValueMultiplier = timeLeft > 0 ? Math.max(0.1, 1 - (timeLeft / 5000)) : 1;
  player.trickCooldowns[trickName] = now + 5000;
  
  // Get emoji based on trick type
  let trickEmoji = "🎮";
  switch(trickName) {
    case "leftHelicopter":
    case "rightHelicopter":
      trickEmoji = "🚁";
      break;
    case "airBrake":
      trickEmoji = "🛑";
      break;
    case "parachute":
      trickEmoji = "🪂";
      break;
  }
  
  console.log(`[${timestamp}] ${trickEmoji} TRICK START: ${trickName}, Value multiplier=${(player.currentTrickValueMultiplier * 100).toFixed(0)}%, Chain count=${player.trickChainCount}`);
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
  const timestamp = new Date().toISOString();
  const currentTrick = player.currentTrick; // Store for logging after it's cleared
  
  let trickMoney = 50;
  let chainBonus = 1;
  let chainDescription = "";
  
  if (player.lastTrick && player.lastTrick !== player.currentTrick) {
    player.trickChainCount++;
    chainBonus = Math.pow(1.5, player.trickChainCount);
    trickMoney *= chainBonus;
    chainDescription = `, Chain bonus=${chainBonus.toFixed(2)}x (${player.trickChainCount} tricks)`;
  } else {
    player.trickChainCount = 0;
    chainDescription = ", No chain bonus";
  }
  
  trickMoney *= player.currentTrickValueMultiplier;
  let finalMoney = Math.floor(trickMoney);
  player.money += finalMoney;
  
  // Get emoji based on trick type
  let trickEmoji = "🎮";
  switch(currentTrick) {
    case "leftHelicopter":
    case "rightHelicopter":
      trickEmoji = "🚁";
      break;
    case "airBrake":
      trickEmoji = "🛑";
      break;
    case "parachute":
      trickEmoji = "🪂";
      break;
  }
  
  console.log(`[${timestamp}] ${trickEmoji} TRICK COMPLETE: ${currentTrick}, Reward=$${finalMoney}, Value multiplier=${(player.currentTrickValueMultiplier * 100).toFixed(0)}%${chainDescription}, Total money=$${player.money}`);
  
  addFloatingText(`+$${finalMoney} (${currentTrick})`, player.x, player.absY);
  
  player.lastTrick = currentTrick;
  player.currentTrick = null;
  player.trickTimer = 0;
  player.trickRotation = 0;
  player.trickOffset = 0;
  playTrickCompleteSound();
}
