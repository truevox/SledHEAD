// Global counter for stamina depletion re-entries
let reentryCount = 0;

// In stamina.js
class Stamina {
    constructor() {
      this.maxStamina = 100;
      this.currentStamina = this.maxStamina;
      this.staminaDrainWalking = 0.1;  // Drains steadily when walking uphill
      this.staminaDrainJumping = 2.0;    // Drains once on jump launch
      this.staminaDrainSledding = 0.01;  // Drains very slowly when sledding
      this.isVisible = false;
      this.jumpTriggered = false;        // Initialize jump flag
      this.previousState = null;         // Track previous game state
      this.lastLogTime = 0;              // Timestamp for throttling log messages
      
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.canvas.width = 200;
      this.canvas.height = 20;
      this.canvas.style.position = "fixed";
      this.canvas.style.top = "40px";
      this.canvas.style.left = "40px";
      this.canvas.style.zIndex = "1000";
      document.body.appendChild(this.canvas);
    }
  
    // New method to drain stamina on jump initiation
    drainJump() {
      if (!this.jumpTriggered) {
        this.currentStamina -= this.staminaDrainJumping;
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
        changeState(GameState.HOUSE);
        
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
        
        // Increment re-entry counter
        reentryCount++;
        this.throttledLog(`Re-entry count increased to: ${reentryCount}`);
    }
  
    update() {
      // Check for entering house state (state transition)
      const enteringHouse = this.previousState !== GameState.HOUSE && currentState === GameState.HOUSE;
      
      // Only show stamina bar if the player is NOT at home
      this.isVisible = (currentState !== GameState.HOUSE);
      if (!this.isVisible) {
        if (enteringHouse) {
          this.currentStamina = this.maxStamina; // Reset stamina only when entering the house
          this.throttledLog("At home - resetting stamina");
        }
        this.canvas.style.display = "none";
        this.previousState = currentState; // Update previous state
        return;
      }
      this.canvas.style.display = "block";
  
      // Drain stamina when moving uphill
      if (currentState === GameState.UPHILL) {
        if (keysDown["w"] || keysDown["a"] || keysDown["s"] || keysDown["d"]) {
          this.currentStamina -= this.staminaDrainWalking;
          this.throttledLog("UPHILL movement: draining stamina by " + this.staminaDrainWalking + " Current stamina: " + this.currentStamina);
        }
      }
  
      // (No jump drain logic here now—it's moved to mechanics.js)
  
      // Drain stamina very slowly when sledding
      if (player.isSliding) {
        this.currentStamina -= this.staminaDrainSledding;
        this.throttledLog("Sledding: draining stamina by " + this.staminaDrainSledding + " Current stamina: " + this.currentStamina);
      }
  
      // Check for stamina depletion
      if (this.currentStamina <= 0 && currentState !== GameState.HOUSE) {
        this.handleStaminaDepletion();
      }
  
      // Clamp stamina value between 0 and max
      this.currentStamina = Math.max(0, Math.min(this.currentStamina, this.maxStamina));
  
      // Render the stamina bar
      this.render();
      
      // Update previous state
      this.previousState = currentState;
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
  
  // Initialize stamina system
  const stamina = new Stamina();
  
  // Hook into the game's update loop
  function updateStamina() {
    stamina.update();
    requestAnimationFrame(updateStamina);
  }
  updateStamina();
