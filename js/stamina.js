// Global counter for stamina depletion re-entries
let reentryCount = 0;

// In stamina.js
class Stamina {
    constructor() {
      // Max stamina is dynamic: base value * Attend Leg Day upgrade effect
      this.baseMaxStamina = 100;
      this.currentStamina = this.getMaxStamina();
      this.staminaDrainWalking = 0.1;  // Drains steadily when walking uphill
      this.staminaDrainJumping = 2.0;    // Drains once on jump launch
      this.staminaDrainSledding = 0.01;  // Drains very slowly when sledding
      this.isVisible = false;
      this.jumpTriggered = false;        // Initialize jump flag
      this.previousState = null;         // Track previous game state
      this.lastLogTime = 0;              // Timestamp for throttling log messages
      
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
      this.canvas.width = 200;
      this.canvas.height = 20;
      this.canvas.style.position = "fixed";
      this.canvas.style.top = "40px";
      this.canvas.style.left = "40px";
      this.canvas.style.zIndex = "1000";
      document.body.appendChild(this.canvas);
    }
  
    // Calculate dynamic max stamina based on upgrade level
    getMaxStamina() {
      // We use the Attend Leg Day upgrade effect to scale max stamina (soft cap applies)
      if (typeof window.getUpgradeEffect === 'function' && window.playerUpgrades) {
        return Math.round(this.baseMaxStamina * window.getUpgradeEffect('attendLegDay', window.playerUpgrades.attendLegDay));
      }
      return this.baseMaxStamina;
    }

    // New method to drain stamina on jump initiation
    drainJump() {
      if (!this.jumpTriggered) {
        this.currentStamina = parseFloat((this.currentStamina - this.staminaDrainJumping).toFixed(2));
        this.jumpTriggered = true;
        this.throttledLog("Jump drain: stamina reduced by " + this.staminaDrainJumping + " New stamina: " + this.currentStamina);
      }
    }
  
    // Reset jump flag (to be called on landing)
    resetJumpTrigger() {
      this.jumpTriggered = false;
      this.throttledLog("Jump trigger reset");
    }

    // Throttled logging function to limit messages to once per second
    throttledLog(message) {
      const currentTime = Date.now();
      if (currentTime - this.lastLogTime >= 1000) { // Only log once per second
        console.log(message);
        this.lastLogTime = currentTime;
      }
    }

    handleStaminaDepletion() {
        this.throttledLog("Stamina depleted - returning to house");
        
        // Move player to house
        changeState(window.GameState.HOUSE);
        
        // Refill stamina
        this.currentStamina = this.maxStamina;
        this.throttledLog("Stamina refilled to maximum");
        
        // Despawn all animals
        despawnAllAnimals();
        this.throttledLog("All animals despawned");
        
        // Calculate and charge re-entry fee
        const fee = 100 * (reentryCount + 1);
        player.money = Math.max(0, player.money - fee);
        this.throttledLog(`Charged re-entry fee: $${fee}`);
        
        // Update the money display to show the new amount after the fee
        updateMoneyDisplay();
        
        // Increment re-entry counter
        reentryCount++;
        this.throttledLog(`Re-entry count increased to: ${reentryCount}`);
    }
  
    update() {
      // Check for entering house state (state transition)
      const enteringHouse = this.previousState !== window.GameState.HOUSE && window.currentState === window.GameState.HOUSE;
      
      // Only show stamina bar if the player is NOT at home
      this.isVisible = (window.currentState !== window.GameState.HOUSE);
      if (!this.isVisible) {
        if (enteringHouse) {
          this.currentStamina = this.getMaxStamina(); // Reset stamina only when entering the house (dynamic max)
          this.throttledLog("At home - resetting stamina");
        }
        this.canvas.style.display = "none";
        this.previousState = window.currentState; // Update previous state
        return;
      }
      this.canvas.style.display = "block";
  
      // Drain stamina when moving uphill
      if (window.currentState === window.GameState.UPHILL) {
        if (keysDown["w"] || keysDown["a"] || keysDown["s"] || keysDown["d"]) {
          // Fix floating-point precision issue
          this.currentStamina = parseFloat((this.currentStamina - this.staminaDrainWalking).toFixed(2));
          this.throttledLog("UPHILL movement: draining stamina by " + this.staminaDrainWalking + " Current stamina: " + this.currentStamina);
        }
      }
  
      // Drain stamina very slowly when sledding
      if (player.isSliding) {
        // Fix floating-point precision issue
        this.currentStamina = parseFloat((this.currentStamina - this.staminaDrainSledding).toFixed(2));
        this.throttledLog("Sledding: draining stamina by " + this.staminaDrainSledding + " Current stamina: " + this.currentStamina);
      }
  
      // Check for stamina depletion
      if (this.currentStamina <= 0 && window.currentState !== window.GameState.HOUSE) {
        this.handleStaminaDepletion();
      }
  
      // Clamp stamina value between 0 and dynamic max
      this.currentStamina = parseFloat(Math.max(0, Math.min(this.currentStamina, this.getMaxStamina())).toFixed(2));
  
      // Render the stamina bar
      this.render();
      
      // Update previous state
      this.previousState = window.currentState;
    }
  
    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      // Determine stamina bar color based on stamina percentage
      // Always use dynamic max stamina for rendering
      let staminaRatio = this.currentStamina / this.getMaxStamina();
      let color = "#00FF00"; // Green (full stamina)
      if (staminaRatio < 0.5) color = "#FFA500"; // Orange (moderate stamina)
      if (staminaRatio < 0.2) color = "#FF0000"; // Red (critical stamina)
  
      // Draw the bar background
      this.ctx.fillStyle = "#333";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
      // Draw the stamina portion
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.canvas.width * staminaRatio, this.canvas.height);

      // Overlay current/max stamina as text for player clarity
      // Use white text with a dark outline for maximum readability over any bar color
      const current = Math.floor(this.currentStamina);
      const max = this.getMaxStamina();
      const text = `${current} / ${max}`;
      this.ctx.font = 'bold 15px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      // Draw outline for contrast
      this.ctx.strokeStyle = '#222';
      this.ctx.lineWidth = 3;
      this.ctx.strokeText(text, this.canvas.width / 2, this.canvas.height / 2);
      // Draw main text
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    }
  }
  
  // Initialize stamina system
  const stamina = new Stamina();
  
  // Hook into the game's update loop
  function updateStamina() {
    stamina.update();
    requestAnimationFrame(updateStamina);
  }
  updateStamina();

// Make stamina available globally
window.stamina = stamina;
