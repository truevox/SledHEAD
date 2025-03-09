// src/gameplay/Player.js
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
  
  export function onPlayerJumpStart() {
    player.jumpStartTime = performance.now();
    player.jumpStartY = player.absY;
    player.jumpPeakY = player.absY;
    console.log("🦘 Jump initiated at Y:", player.jumpStartY.toFixed(1));
    import('../utils/UIUtils.js').then(({ unlockAudioContext, getAudioContext }) => {
      unlockAudioContext();
      let audioCtx = getAudioContext();
      player.jumpOsc = audioCtx.createOscillator();
      player.jumpGain = audioCtx.createGain();
      player.jumpOsc.type = "sine";
      player.jumpGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      player.jumpOsc.connect(player.jumpGain);
      player.jumpGain.connect(audioCtx.destination);
      player.jumpOsc.start();
    });
  }
  
  export function onPlayerJumpPeak() {
    console.log("Reached peak of jump.");
  }
  
  export function cleanupJumpSound() {
    if (player.jumpOsc) {
      player.jumpOsc.stop();
      player.jumpOsc.disconnect();
      player.jumpOsc = null;
    }
    if (player.jumpGain) {
      player.jumpGain.disconnect();
      player.jumpGain = null;
    }
  }
  
  export function onPlayerLand() {
    const jumpTime = (performance.now() - player.jumpStartTime) / 1000;
    const jumpHeight = player.jumpPeakY - player.jumpStartY;
    const totalDistance = player.absY - player.jumpStartY;
    console.log(`🏁 Jump complete! Time: ${jumpTime.toFixed(2)}s, Peak Height: ${jumpHeight.toFixed(1)}, Total Distance: ${totalDistance.toFixed(1)}`);
    cleanupJumpSound();
  }
  