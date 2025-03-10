// src/utils/AudioUtils.js
import { getAudioContext, unlockAudioContext } from './UIUtils.js';
import { TWEAK } from './Constants.js';

// Audio nodes for jump sound
let jumpOsc = null;
let jumpGain = null;

/**
 * Initialize jump sound when player starts a jump
 * Creates an oscillator and gain node for dynamic audio feedback
 */
export function onPlayerJumpStart() {
  const timestamp = new Date().toISOString();
  
  // Create a new oscillator and gain node for the jump sound
  unlockAudioContext();
  const audioCtx = getAudioContext();
  
  // Create and configure oscillator
  jumpOsc = audioCtx.createOscillator();
  jumpGain = audioCtx.createGain();
  jumpOsc.type = "sine";
  
  // Set initial frequency
  const initialFreq = 300;
  jumpOsc.frequency.setValueAtTime(initialFreq, audioCtx.currentTime);
  
  // Set an initial volume
  const initialVolume = 0.3;
  jumpGain.gain.setValueAtTime(initialVolume, audioCtx.currentTime);
  
  // Connect audio nodes
  jumpOsc.connect(jumpGain);
  jumpGain.connect(audioCtx.destination);
  
  // Start the oscillator
  jumpOsc.start();
  
  console.log(`[${timestamp}] 🔊 AUDIO: Jump sound initialized, Type=sine, Frequency=${initialFreq}Hz, Volume=${initialVolume}`);
}

/**
 * Update jump sound frequency based on jump progress
 * @param {number} progress - Jump progress from 0 to 1
 */
export function updateJumpSound(progress) {
  if (!jumpOsc) return;
  
  const audioCtx = getAudioContext();
  
  // Define frequency values in Hz
  const f_start = 300;
  const f_peak = 800;
  const f_end = 300;
  let freq;
  let jumpPhase = "";
  
  if (progress < 0.5) {
    // During ascent: non-linearly increase pitch (quadratic curve)
    const t = progress / 0.5; // Normalize to [0,1]
    freq = f_start + (f_peak - f_start) * (t * t);
    jumpPhase = "ascending";
  } else {
    // During descent: non-linearly decrease pitch (quadratic curve)
    const t = (progress - 0.5) / 0.5; // Normalize to [0,1]
    freq = f_peak - (f_peak - f_end) * (t * t);
    jumpPhase = "descending";
  }
  
  // Update oscillator frequency
  jumpOsc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  // Only log at specific progress points to avoid spamming
  if (progress === 0 || progress === 0.5 || progress === 1 || progress > 0.99) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🎵 AUDIO: Jump sound update, Progress=${progress.toFixed(2)}, Phase=${jumpPhase}, Frequency=${freq.toFixed(0)}Hz`);
  }
}

/**
 * Called when the jump reaches its peak
 */
export function onPlayerJumpPeak() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 💨 AUDIO: Reached peak of jump, Frequency=${jumpOsc ? jumpOsc.frequency.value.toFixed(0) : 'unknown'}Hz`);
  // You can optionally add a distinct sound here if desired
}

/**
 * Clean up jump sound resources
 * Should be called when jump ends
 */
export function cleanupJumpSound() {
  const timestamp = new Date().toISOString();
  
  if (jumpOsc) {
    jumpOsc.stop();
    jumpOsc.disconnect();
    jumpOsc = null;
  }
  
  if (jumpGain) {
    jumpGain.disconnect();
    jumpGain = null;
  }
  
  console.log(`[${timestamp}] 🔇 AUDIO: Jump sound cleaned up`);
}

/**
 * Play a simple tone with the given parameters
 * @param {number} frequency - Frequency in Hz
 * @param {string} type - Oscillator type (sine, square, sawtooth, triangle)
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume from 0 to 1
 */
export function playTone(frequency, type, duration, volume) {
  const timestamp = new Date().toISOString();
  
  const audioCtx = getAudioContext();
  unlockAudioContext();
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.type = type || "sine";
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Determine sound type for better logging
  let soundType = "Generic";
  if (frequency > 700 && frequency < 900) {
    soundType = "Victory";
  } else if (frequency > 500 && frequency < 700) {
    soundType = "Notification";
  } else if (frequency < 300) {
    soundType = "Error";
  }
  
  console.log(`[${timestamp}] 🔉 AUDIO: Playing ${soundType} tone, Frequency=${frequency}Hz, Type=${type || "sine"}, Volume=${volume}, Duration=${duration}s`);
  
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}
