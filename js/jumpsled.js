// jumpsled.js
// This file contains all jump-related functions for SledHEAD
import { player } from './player.js';
import { playerStamina } from './stamina.js';
import { unlockAudioContext } from './utils.js';

let jumpOsc = null;
let jumpGain = null;
let audioCtx = null;

// Initialize audio context if needed
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function onPlayerJumpStart() {
  player.jumpStartTime = performance.now();
  player.jumpStartY = player.absY;
  player.jumpPeakY = player.absY;
  console.log("Jump initiated at Y:", player.jumpStartY.toFixed(1));
  unlockAudioContext();
  jumpOsc = audioCtx.createOscillator();
  jumpGain = audioCtx.createGain();
  jumpOsc.type = "sine";
  jumpGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  jumpOsc.connect(jumpGain);
  jumpGain.connect(audioCtx.destination);
  jumpOsc.start();
  
  // Drain stamina on jump initiation
  playerStamina.drainJump();
}

function onPlayerJumpPeak() {
  console.log("Reached peak of jump.");
  // Optionally add a sound effect here.
}

function cleanupJumpSound() {
  if (jumpOsc) {
    jumpOsc.stop();
    jumpOsc.disconnect();
    jumpOsc = null;
  }
  if (jumpGain) {
    jumpGain.disconnect();
    jumpGain = null;
  }
}

function onPlayerLand() {
  const jumpTime = (performance.now() - player.jumpStartTime) / 1000;
  const jumpHeight = player.jumpPeakY - player.jumpStartY;
  const totalDistance = player.absY - player.jumpStartY;
  console.log(`Jump complete! Time: ${jumpTime.toFixed(2)}s, Peak Height: ${jumpHeight.toFixed(1)}, Distance: ${totalDistance.toFixed(1)}`);
  cleanupJumpSound();
  playerStamina.resetJumpTrigger();
}

// Export the jump-related functions
export {
    onPlayerJumpStart,
    onPlayerJumpPeak,
    onPlayerLand,
    initAudio
};