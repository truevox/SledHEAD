// src/utils/UIUtils.js
import { player } from '../gameplay/Player.js';

export function updateMoneyDisplay() {
  const moneyText = document.getElementById("moneyText");
  
  if (moneyText) {
    moneyText.textContent = `Money: $${player.money}`;
    // Log only when needed, or use debug level logging
    // console.log(`[${new Date().toISOString()}] 💰 UI: Money display updated, Current balance=$${player.money.toLocaleString()}`);
  } else {
    console.error(`[${new Date().toISOString()}] ⚠️ UI ERROR: Failed to update money display, element not found`);
  }
}

// Import the canvas-based floating text system
import { addFloatingText as addCanvasFloatingText } from '../rendering/Renderer.js';

/**
 * Adds a floating text notification at the specified position
 * This is a wrapper around the canvas-based floating text system
 * @param {string} text - The text to display
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {object} options - Optional settings (color, size, lifetime)
 */
export function addFloatingText(text, x, y, options = {}) {
  addCanvasFloatingText(text, x, y, options);
}

export function playTone(frequency, type, duration, volume) {
  const audioCtx = getAudioContext();
  let oscillator = audioCtx.createOscillator();
  let gainNode = audioCtx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

export function playTrickCompleteSound() {
  playTone(600, "sine", 0.1, 0.2);
}

export function unlockAudioContext() {
  const timestamp = new Date().toISOString();
  const audioCtx = getAudioContext();
  
  if (audioCtx.state !== 'running') {
    audioCtx.resume()
      .then(() => {
        console.log(`[${timestamp}] 🔊 UI: Audio context successfully unlocked, state=${audioCtx.state}`);
      })
      .catch(error => {
        console.log(`[${timestamp}] ❌ UI ERROR: Failed to unlock audio context: ${error.message}`);
      });
  }
}

let _audioContext = null;
export function getAudioContext() {
  if (!_audioContext) {
    _audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioContext;
}
