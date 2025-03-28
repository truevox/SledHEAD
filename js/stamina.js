import { GameState } from './gamestate.js';
import { keysDown } from './input.js';

// Global counter for stamina depletion re-entries
let reentryCount = 0;

// Create a new canvas for the stamina bar - with improved visibility styles
const staminaCanvas = document.createElement('canvas');
staminaCanvas.width = 200;
staminaCanvas.height = 20;
staminaCanvas.style.position = 'fixed';
staminaCanvas.style.bottom = '20px';
staminaCanvas.style.left = '20px';
staminaCanvas.style.zIndex = '1000'; // Ensure it's above other elements
staminaCanvas.style.display = 'none';
staminaCanvas.style.border = '2px solid white'; // Add border for better visibility
staminaCanvas.id = 'staminaCanvas';
document.body.appendChild(staminaCanvas);
console.log('Stamina canvas created with ID:', staminaCanvas.id);

// Store reference to game state and state change function
let gameStateRef = null;
let changeStateFunc = null;
// Add references for player and house re-entry
let playerRef = null;
let houseReEntryRef = null;
let updateMoneyDisplayFunc = null;

// Function to set references from game.js
function setGameReferences(currentState, changeState, player, reEntryRef, updateMoneyDisplay) {
  gameStateRef = currentState;
  changeStateFunc = changeState;
  playerRef = player;
  houseReEntryRef = reEntryRef;
  updateMoneyDisplayFunc = updateMoneyDisplay;
  console.log('Game references set, current state:', currentState);
}

// In stamina.js
class Stamina {
  constructor(options = {}) {
    this.maxStamina = options.maxStamina || 100;
    this.baseMaxStamina = this.maxStamina; // Store base value for upgrades
    this.currentStamina = options.currentStamina || this.maxStamina;
    this.regenRate = options.regenRate || 1; // Stamina per second
    this.baseRegenRate = this.regenRate; // Store base value for upgrades
    this.drainRate = options.drainRate || 5; // Stamina per second
    this.baseDrainRate = this.drainRate; // Store base value for upgrades
    this.recoveryMultiplier = options.recoveryMultiplier || 0.5; // Recovery speed multiplier when resting
    this.canvas = staminaCanvas;
    this.ctx = this.canvas.getContext('2d');
    this.isActive = false;
    this.jumpCost = options.jumpCost || 20;
    this.baseJumpCost = this.jumpCost; // Store base value for upgrades
    this.render();
    // Don't call applyUpgrades here; it will be called after upgrades.js initialization
    console.log('Stamina instance created with max:', this.maxStamina);
  }
  
  applyUpgrades(playerUpgrades) {
    // Use the passed playerUpgrades parameter instead of global access
    if (!playerUpgrades) return;
    
    // Get the current level of the Attend Leg Day upgrade
    const legDayLevel = playerUpgrades.attendLegDay || 0;
    
    if (legDayLevel > 0) {
      // Improve stamina parameters based on upgrade level
      // Each level of Leg Day:
      // - Increases max stamina by 10% of base
      // - Decreases drain rate by 5% of base
      // - Increases regen rate by 8% of base
      // - Decreases jump cost by 5% of base
      
      const maxStaminaBonus = 1 + (legDayLevel * 0.1); // +10% per level
      const drainRateBonus = 1 - (legDayLevel * 0.05); // -5% per level
      const regenRateBonus = 1 + (legDayLevel * 0.08); // +8% per level
      const jumpCostBonus = 1 - (legDayLevel * 0.05); // -5% per level
      
      this.maxStamina = Math.floor(this.baseMaxStamina * maxStaminaBonus);
      this.drainRate = this.baseDrainRate * drainRateBonus;
      this.regenRate = this.baseRegenRate * regenRateBonus;
      this.jumpCost = Math.max(5, Math.floor(this.baseJumpCost * jumpCostBonus)); // Minimum jump cost of 5
      
      // Log the new stamina values
      console.log(`Applied Leg Day level ${legDayLevel}:`, {
        maxStamina: this.maxStamina,
        drainRate: this.drainRate.toFixed(2),
        regenRate: this.regenRate.toFixed(2),
        jumpCost: this.jumpCost
      });
    }
  }
  
  // Helper function to determine if stamina should regenerate
  shouldRegenStamina(state) {
    // Only regenerate stamina in HOUSE or DOWNHILL states
    return state === GameState.HOUSE || state === GameState.DOWNHILL;
  }
  
  update(deltaTime, state) {
    const rateInMs = deltaTime / 1000; // Convert to seconds
    
    if (state === GameState.UPHILL) {
      // Drain stamina when moving uphill
      if (isMoving()) {
        this.currentStamina = Math.max(0, this.currentStamina - this.drainRate * rateInMs);
      } else {
        // No longer regenerate stamina when standing still in UPHILL state
        // This fixes the bug where stamina would regenerate while standing still
      }
      
      if (!this.isActive) {
        console.log('Showing stamina bar in UPHILL state');
        this.show();
      }
    } else if (this.shouldRegenStamina(state)) {
      if (state === GameState.HOUSE) {
        // In HOUSE state, hide the bar and fully restore stamina
        this.currentStamina = this.maxStamina;
        if (this.isActive) {
          console.log('Hiding stamina bar in HOUSE state');
          this.hide();
        }
      } else if (state === GameState.DOWNHILL) {
        // In DOWNHILL state, drain a little stamina instead of regenerating
        const downhillDrainRate = 2; // Stamina per second lost in downhill mode
        this.currentStamina = Math.max(0, this.currentStamina - downhillDrainRate * rateInMs);
        if (!this.isActive) {
          console.log('Showing stamina bar in DOWNHILL state (draining)');
          this.show();
        }
      }
    }
    
    this.render();
    return this.currentStamina > 0; // Return true if player still has stamina
  }
  
  show() {
    this.canvas.style.display = 'block';
    this.isActive = true;
    console.log('Stamina bar shown. Element now visible:', this.canvas.style.display === 'block');
    
    // Force the stamina bar to be in the right place and visible
    document.body.appendChild(this.canvas);
  }
  
  hide() {
    this.canvas.style.display = 'none';
    this.isActive = false;
    console.log('Stamina bar hidden');
  }
  
  drainJump() {
    this.currentStamina = Math.max(0, this.currentStamina - this.jumpCost);
    this.render();
  }
  
  resetJumpTrigger() {
    // Any cleanup or reset logic needed after landing
    this.render();
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Determine stamina bar color based on stamina percentage
    let staminaRatio = this.currentStamina / this.maxStamina;
    let color = "#00FF00"; // Green (full stamina)
    if (staminaRatio < 0.5) color = "#FFA500"; // Orange (moderate stamina)
    if (staminaRatio < 0.2) color = "#FF0000"; // Red (critical stamina)
    
    // Draw the bar background
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw the stamina portion
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width * staminaRatio, this.canvas.height);
  }
}

// Helper function to check if the player is moving - import from input.js
function isMoving() {
  return keysDown["w"] || keysDown["a"] || keysDown["s"] || keysDown["d"];
}

// Create the stamina instance
const playerStamina = new Stamina({
  maxStamina: 100,
  regenRate: 10, // Regenerate 10 stamina per second when sledding
  drainRate: 15,  // Drain 15 stamina per second when hiking
  jumpCost: 20    // Cost 20 stamina to jump
});

// Function to initialize stamina with upgrades
function initializeStamina(playerUpgrades) {
  playerStamina.applyUpgrades(playerUpgrades);
}

// Update function to be called in the game loop
function updateStamina(deltaTime) {
  if (!gameStateRef) {
    console.warn('Skipping stamina update, game references not set');
    return;
  }
  
  const hasStamina = playerStamina.update(deltaTime, gameStateRef);
  
  if (!hasStamina && changeStateFunc) {
    if (gameStateRef === GameState.UPHILL || gameStateRef === GameState.DOWNHILL) {
      console.log(`Out of stamina in ${gameStateRef} state! Sending player home`);
      
      // Apply a stamina penalty - $50 times the number of house re-entries
      if (playerRef !== null && houseReEntryRef !== null) {
        // Ensure houseReEntry is at least 1 (first penalty is $50)
        const reEntryCount = Math.max(1, houseReEntryRef);
        const staminaPenalty = 50 * reEntryCount;
        
        console.log(`Before penalty: $${playerRef.money}, applying penalty: -$${staminaPenalty}`);
        playerRef.money = Math.max(0, playerRef.money - staminaPenalty);
        console.log(`After penalty: $${playerRef.money}`);
        
        // Update the money display if the function exists
        if (updateMoneyDisplayFunc) {
          updateMoneyDisplayFunc();
        }
      } else {
        console.warn('Could not apply stamina penalty - playerRef or houseReEntryRef not set');
      }
      
      // Player ran out of stamina - send them home
      changeStateFunc(GameState.HOUSE);
    }
  }
}

// Make sure the stamina bar is correctly positioned after everything loads
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, ensuring stamina bar is correctly positioned');
  // Force re-append to ensure it's in the DOM and properly positioned
  document.body.appendChild(staminaCanvas);
});

// Export the stamina system
export { playerStamina, updateStamina, setGameReferences, initializeStamina };
