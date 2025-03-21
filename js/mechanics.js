/* mechanics.js - Gameplay Mechanics & Interactions */

// Update all gameplay state and physics – including jump/trick handling and collision updates.
function updateMechanics(deltaTime) {
    deltaTime *= 1;
    if (currentState === GameState.DOWNHILL) {
      // Call the refactored downhill function from downhill.js
      updateDownhill(deltaTime);
    } else if (currentState === GameState.UPHILL) {
      // Call the refactored uphill function from uphill.js
      updateUphill(deltaTime);
    }
  }
  
  // Note: Jump-related functions moved to jumpsled.js
