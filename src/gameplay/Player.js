// src/gameplay/Player.js
import { TWEAK } from '../utils/Constants.js';

export const player = {
    x: window.innerWidth / 2,
    absY: 0,
    width: 20,
    height: 20,
    velocityY: 0,
    xVel: 0,
    collisions: 0,
    bestTime: Infinity,
    money: 200, // Starter cash
    cameraAngle: 270,
    altitudeLine: 50,
    currentTrick: null,
    trickTimer: 0,
    trickRotation: 0,
    trickOffset: 0,
    lastTrick: null,
    trickChainCount: 0,
    trickCooldowns: {
      leftHelicopter: 0,
      rightHelicopter: 0,
      airBrake: 0,
      parachute: 0
    },
    isJumping: false,
    isCharging: false,
    canJump: true,
    reHitActivated: false,
    jumpTimer: 0,
    jumpDuration: 0,
    jumpChargeTime: 0,
    hasReachedJumpPeak: false,
    jumpHeightFactor: 0,
    jumpZoomBonus: 0,
    baseWidth: 20,
    baseHeight: 20,
    jumpStartTime: 0,
    jumpStartY: 0,
    jumpPeakY: 0,
    jumpOsc: null,
    jumpGain: null
  };
  
  export function onPlayerJumpStart(isReHit = false) {
    const timestamp = new Date().toISOString();
    player.isJumping = true;
    player.canJump = false;
    player.reHitActivated = isReHit;
    player.jumpTimer = 0;
    
    // If this is a re-hit jump, extend the duration
    if (isReHit) {
      player.jumpDuration *= TWEAK.reHitBonusDuration;
      player.jumpHeightFactor = 1; // Maintain current height factor for smoother chaining
      
      // Keep the current velocity for smoother transition
      player.velocityY = Math.min(player.velocityY, -8); // Cap upward velocity
      
      console.log(`[${timestamp}] 🔄 RE-HIT JUMP: Extended duration=${player.jumpDuration.toFixed(2)}ms, Y-position=${player.absY.toFixed(1)}, Velocity=${player.velocityY.toFixed(2)}`);
    } else {
      // Normal jump initialization
      player.jumpDuration = TWEAK.jumpBaseAscent;
      player.jumpHeightFactor = 1;
      player.jumpStartTime = performance.now();
      player.jumpStartY = player.absY;
      player.jumpPeakY = player.absY;
      player.velocityY = -10; // Initial upward velocity
      
      console.log(`[${timestamp}] 🦘 JUMP START: Duration=${player.jumpDuration.toFixed(2)}ms, Y-position=${player.jumpStartY.toFixed(1)}, Initial velocity=${player.velocityY.toFixed(2)}`);
    }
    
    // Initialize jump sound with different parameters for re-hit
    import('../utils/AudioUtils.js').then(({ onPlayerJumpStart: initJumpSound, playTone }) => {
      if (isReHit) {
        // Higher pitch for re-hit sound
        playTone(700, "sine", 0.1, 0.3);
      }
      initJumpSound();
    });
  }
  
  export function onPlayerJumpPeak() {
    const timestamp = new Date().toISOString();
    const peakHeight = player.jumpPeakY - player.jumpStartY;
    const timeToPeak = (performance.now() - player.jumpStartTime) / 1000;
    
    console.log(`[${timestamp}] 🏔️ JUMP PEAK: Height=${peakHeight.toFixed(1)}, Time to peak=${timeToPeak.toFixed(2)}s, Y-position=${player.jumpPeakY.toFixed(1)}`);
    
    // Trigger jump peak sound effect
    import('../utils/AudioUtils.js').then(({ onPlayerJumpPeak: triggerJumpPeakSound }) => {
      triggerJumpPeakSound();
    });
  }
  
  export function cleanupJumpSound() {
    // Use the AudioUtils version of cleanupJumpSound
    import('../utils/AudioUtils.js').then(({ cleanupJumpSound: cleanupAudio }) => {
      cleanupAudio();
    });
  }
  
  export function onPlayerLand() {
    const timestamp = new Date().toISOString();
    const jumpTime = (performance.now() - player.jumpStartTime) / 1000;
    const jumpHeight = player.jumpPeakY - player.jumpStartY;
    const totalDistance = player.absY - player.jumpStartY;
    const averageSpeed = Math.abs(totalDistance / jumpTime);
    
    // Reset re-hit state
    player.reHitActivated = false;
    player.isJumping = false;
    player.canJump = true;
    player.jumpTimer = 0;
    
    console.log(`[${timestamp}] 🏁 JUMP COMPLETE: Duration=${jumpTime.toFixed(2)}s, Peak height=${jumpHeight.toFixed(1)}, Distance=${totalDistance.toFixed(1)}, Avg speed=${averageSpeed.toFixed(2)}/s`);
    cleanupJumpSound();
  }
  