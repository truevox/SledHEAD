import { GameState } from './gamestate.js';
import { keysDown } from './input.js';
import { playerUpgrades } from './upgrades.js';

// Global counter for stamina depletion re-entries
let reentryCount = 0;

// Create a new canvas for the stamina bar
const staminaCanvas = document.createElement('canvas');
staminaCanvas.width = 200;
staminaCanvas.height = 20;
staminaCanvas.style.position = 'fixed';
staminaCanvas.style.bottom = '20px';
staminaCanvas.style.left = '20px';
staminaCanvas.style.display = 'none';
staminaCanvas.id = 'staminaCanvas';
document.body.appendChild(staminaCanvas);

// Store reference to game state and state change function
let gameStateRef = null;
let changeStateFunc = null;

// Function to set references from game.js
function setGameReferences(currentState, changeState) {
  gameStateRef = currentState;
  changeStateFunc = changeState;
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
    this.applyUpgrades(); // Apply any existing upgrades on creation
  }
  
  applyUpgrades() {
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
  
  update(deltaTime, state) {
    const rateInMs = deltaTime / 1000; // Convert to seconds
    
    if (state === GameState.UPHILL) {
      // Drain stamina when moving uphill
      if (isMoving()) {
        this.currentStamina = Math.max(0, this.currentStamina - this.drainRate * rateInMs);
      } else {
        // Regenerate some stamina when standing still
        this.currentStamina = Math.min(this.maxStamina, this.currentStamina + this.regenRate * this.recoveryMultiplier * rateInMs);
      }
      
      if (!this.isActive) {
        this.show();
      }
    } else if (state === GameState.DOWNHILL) {
      // Recover stamina when sledding downhill
      this.currentStamina = Math.min(this.maxStamina, this.currentStamina + this.regenRate * rateInMs);
      
      if (!this.isActive) {
        this.show();
      }
    } else {
      // In house: recover fully and hide the bar
      this.currentStamina = this.maxStamina;
      this.hide();
    }
    
    this.render();
    return this.currentStamina > 0; // Return true if player still has stamina
  }
  
  show() {
    this.canvas.style.display = 'block';
    this.isActive = true;
  }
  
  hide() {
    this.canvas.style.display = 'none';
    this.isActive = false;
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

// Update function to be called in the game loop
function updateStamina(deltaTime) {
  if (!gameStateRef) return; // Skip if game references not set
  
  const hasStamina = playerStamina.update(deltaTime, gameStateRef);
  
  if (!hasStamina && gameStateRef === GameState.UPHILL && changeStateFunc) {
    // Player ran out of stamina uphill - force them to head downhill
    changeStateFunc(GameState.DOWNHILL);
  }
}

// Export the stamina system
export { playerStamina, updateStamina, setGameReferences };
