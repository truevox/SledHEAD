// src/utils/UIUtils.js
import { player } from '../gameplay/Player.js';

export function updateMoneyDisplay() {
  const moneyText = document.getElementById("moneyText");
  if (moneyText) {
    moneyText.textContent = `Money: $${player.money}`;
  }
}

// Enhanced Floating Text System using DOM elements and CSS animations
export function addFloatingText(text, x, y) {
  let floatingTextEl = document.createElement("div");
  floatingTextEl.className = "floating-text";
  floatingTextEl.style.position = "absolute";
  floatingTextEl.style.left = `${x}px`;
  floatingTextEl.style.top = `${y}px`;
  floatingTextEl.textContent = text;
  document.body.appendChild(floatingTextEl);
  setTimeout(() => {
    floatingTextEl.remove();
  }, 1000);
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
  const audioCtx = getAudioContext();
  if (audioCtx.state !== 'running') {
    audioCtx.resume();
  }
}

let _audioContext = null;
export function getAudioContext() {
  if (!_audioContext) {
    _audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioContext;
}
