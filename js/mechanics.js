/* mechanics.js - Gameplay Mechanics & Interactions */

// Update all gameplay state and physics – including jump/trick handling and collision updates.
function updateMechanics(deltaTime) {
    deltaTime *= 1;
    if (window.currentState === window.GameState.DOWNHILL) {
      // Call the refactored downhill function from downhill.js
      updateDownhill(deltaTime);
    } else if (window.currentState === window.GameState.UPHILL) {
      // Call the refactored uphill function from uphill.js
      updateUphill(deltaTime);
    }
  }
  
  // Note: Jump-related functions moved to jumpsled.js

function lerpPlayerToGround(duration, onComplete) {
  const startY = player.absY;
  const endY = mountainHeight - (player.height * 3); // Safe landing height
  const startTime = performance.now();

  function animate() {
    const now = performance.now();
    const t = Math.min(1, (now - startTime) / duration);
    // Use smooth easing
    const easedT = t * t * (3 - 2 * t);
    player.absY = startY + (endY - startY) * easedT;
    
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      player.absY = endY;
      if (onComplete) onComplete();
    }
  }

  animate();
}
