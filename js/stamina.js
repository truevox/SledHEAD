import { GameState } from './gamestate.js';
import { keysDown } from './input.js';
import { currentState, changeState } from './game.js';

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

// In stamina.js
class Stamina {
  constructor(options = {}) {
    this.maxStamina = options.maxStamina || 100;
    this.currentStamina = options.currentStamina || this.maxStamina;
    this.regenRate = options.regenRate || 1; // Stamina per second
    this.drainRate = options.drainRate || 5; // Stamina per second
    this.recoveryMultiplier = options.recoveryMultiplier || 0.5; // Recovery speed multiplier when resting
    this.canvas = staminaCanvas;
    this.ctx = this.canvas.getContext('2d');
    this.isActive = false;
    this.render();
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
    const jumpStaminaCost = 20; // Cost 20 stamina to jump
    this.currentStamina = Math.max(0, this.currentStamina - jumpStaminaCost);
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
  drainRate: 15  // Drain 15 stamina per second when hiking
});

// Update function to be called in the game loop
function updateStamina(deltaTime) {
  const hasStamina = playerStamina.update(deltaTime, currentState);
  if (!hasStamina && currentState === GameState.UPHILL) {
    // Player ran out of stamina uphill - force them to head downhill
    changeState(GameState.DOWNHILL);
  }
}

// Export the stamina system
export { playerStamina, updateStamina };
