// src/scenes/DownhillScene.js
import { player, onPlayerJumpStart, onPlayerJumpPeak, cleanupJumpSound } from '../gameplay/Player.js';
import { updateMoneyDisplay, addFloatingText } from '../utils/UIUtils.js';
import { drawEntities } from '../rendering/Renderer.js';
import { updateAnimal, takePhoto } from '../gameplay/Wildlife.js';
import { TWEAK } from '../utils/Constants.js';
import { updateJumpSound, playTone } from '../utils/AudioUtils.js';
import { checkCollision, resolveCollision } from '../utils/PhysicsUtils.js';

export default class DownhillScene {
  constructor() {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🏔️ SCENE: DownhillScene initialized, starting downhill run`);
    
    // Reset player state for a new run
    player.x = window.innerWidth / 2;
    player.absY = 0;
    player.velocityY = 0;
    player.xVel = 0;
    player.collisions = 0;
    player.cameraAngle = 270; // Default camera angle (looking down)
    player.altitudeLine = 50; // Default altitude line position
    player.hasReachedJumpPeak = false; // Reset jump peak tracking
    player.lastCollisionTime = 0; // Track last collision time for invulnerability
    this.downhillStartTime = performance.now();
    this.spaceWasPressed = false; // Track space key state to prevent multiple photos per press
    
    // Initialize terrain obstacles
    this.terrain = [];
    this.generateTerrain();
  }
  
  generateTerrain() {
    const obstacleCount = 4000;
    const mountainWidth = window.innerWidth;
    const mountainHeight = 50000;
    
    for (let i = 0; i < obstacleCount; i++) {
      let obstacle = {
        x: Math.random() * mountainWidth,
        y: (i / obstacleCount) * mountainHeight,
        width: 20 + Math.random() * 30,
        height: 20 + Math.random() * 30
      };
      this.terrain.push(obstacle);
    }
  }

  update(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    let deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Update downhill gameplay logic (jump, physics, collisions, tricks, etc.)
    this.updateDownhillLogic(deltaTime);
    
    // Example of how to trigger floating text for testing
    // Uncomment to test the floating text system
    /*
    if (Math.random() < 0.01) { // 1% chance per frame to show a test message
      addFloatingText(`Test: ${Math.floor(Math.random() * 100)}`, 
                      player.x, 
                      player.absY, 
                      { color: '#FF9900', size: 28 });
    }
    */
  }

  updateDownhillLogic(deltaTime) {
    // Store previous position for collision resolution
    const prevX = player.x;
    const prevY = player.absY;
    
    // Update player physics
    player.absY += player.velocityY * (deltaTime / 16);
    player.velocityY += 0.1; // Gravity
    
    // Check for collisions with terrain
    const currentTime = performance.now();
    const isInvulnerable = (currentTime - player.lastCollisionTime) < TWEAK.collisionInvulnTime;
    
    if (!player.isJumping && !isInvulnerable) {
      for (let obstacle of this.terrain) {
        // Only check obstacles within a reasonable range
        if (Math.abs(obstacle.y - player.absY) > 200) continue;
        
        if (checkCollision(
          player.x - player.width/2, player.absY - player.height/2,
          player.width, player.height,
          obstacle.x, obstacle.y,
          obstacle.width, obstacle.height
        )) {
          // Apply bounce effect
          const bounceStrength = TWEAK.getBounceImpulse(player.collisions);
          player.velocityY = -bounceStrength;
          player.absY = prevY - bounceStrength;
          
          // Increment collision counter and apply penalty
          player.collisions++;
          player.money = Math.max(0, player.money - TWEAK.collisionPenalty);
          
          // Play collision sound
          playTone(200, "sawtooth", 0.1, 0.3);
          
          // Show collision feedback
          addFloatingText(`-$${TWEAK.collisionPenalty}`, player.x, player.absY, {
            color: '#FF4444',
            size: 24
          });
          
          // Update last collision time
          player.lastCollisionTime = currentTime;
          
          // Check if max collisions reached
          if (player.collisions >= TWEAK.getMaxCollisions()) {
            console.log("Max collisions reached. Ending run.");
            // TODO: Implement proper game over handling
            playTone(100, "sawtooth", 0.5, 0.5);
            addFloatingText("Run Ended!", player.x, player.absY, {
              color: '#FF0000',
              size: 32
            });
          }
          
          // Remove the obstacle we hit
          const index = this.terrain.indexOf(obstacle);
          if (index > -1) {
            this.terrain.splice(index, 1);
          }
          
          break; // Only handle one collision at a time
        }
      }
    }
    
    // Handle key inputs
    if (window.keysDown) {
      // Movement controls
      if (window.keysDown["a"]) { player.x -= 3; }
      if (window.keysDown["d"]) { player.x += 3; }
      
      // Camera controls for photo taking
      if (window.keysDown["ArrowLeft"]) { player.cameraAngle -= 2; }
      if (window.keysDown["ArrowRight"]) { player.cameraAngle += 2; }
      if (window.keysDown["ArrowUp"]) { player.altitudeLine = Math.max(0, player.altitudeLine - 2); }
      if (window.keysDown["ArrowDown"]) { player.altitudeLine = Math.min(100, player.altitudeLine + 2); }
      
      // Jump mechanics
      if (window.keysDown[" "]) {
        // Regular jump initiation
        if (!player.isJumping && player.canJump && !this.spaceWasPressed) {
          onPlayerJumpStart(false);
          this.spaceWasPressed = true;
        }
        // Re-hit jump during the re-hit window
        else if (player.isJumping && !player.reHitActivated) {
          const progress = player.jumpTimer / player.jumpDuration;
          if (progress >= TWEAK.reHitWindowStart && progress < 1.0) {
            console.log("Re-hit jump activated!");
            
            // Call onPlayerJumpStart with re-hit flag
            onPlayerJumpStart(true);
            
            // Visual feedback
            addFloatingText("Re-Hit!", player.x, player.absY, { 
              color: '#00FFFF', 
              size: 28 
            });
            
            // Track the re-hit for this jump
            this.spaceWasPressed = true;
            player.trickChainCount++; // Increment trick chain for re-hit bonus
          }
        }
      }
    }
    
    // Reset space key state when released
    if (window.keysDown && !window.keysDown[" "]) {
      this.spaceWasPressed = false;
      // Only reset re-hit state if we're not in the re-hit window
      if (player.isJumping) {
        const progress = player.jumpTimer / player.jumpDuration;
        if (progress < TWEAK.reHitWindowStart || progress >= 1.0) {
          player.reHitActivated = false;
        }
      }
    }
    
    // Update jump state
    if (player.isJumping) {
      player.jumpTimer += deltaTime;
      
      // Calculate jump progress (0 to 1)
      const progress = player.jumpTimer / player.jumpDuration;
      
      // Update jump sound based on progress
      updateJumpSound(progress);
      
      // Track if we've reached the peak of the jump (at 50% progress)
      if (progress >= 0.5 && !player.hasReachedJumpPeak) {
        player.hasReachedJumpPeak = true;
        onPlayerJumpPeak();
      }
      
      // Update visual feedback for re-hit window
      if (progress >= TWEAK.reHitWindowStart && progress < 1.0 && !player.reHitActivated) {
        // Pulse the player slightly to indicate re-hit availability
        const pulseScale = 1 + Math.sin(Date.now() / 100) * 0.1;
        player.width = player.baseWidth * pulseScale;
        player.height = player.baseHeight * pulseScale;
      } else {
        // Reset to normal size
        player.width = player.baseWidth;
        player.height = player.baseHeight;
      }
      
      // Check if jump is complete
      if (player.jumpTimer >= player.jumpDuration) {
        player.isJumping = false;
        player.canJump = true; // Allow jumping again
        player.reHitActivated = false;
        player.hasReachedJumpPeak = false;
        player.jumpTimer = 0;
        
        // Clean up jump sound when jump is complete
        cleanupJumpSound();
      }
    }
    
    // Normalize camera angle
    if (player.cameraAngle < 0) player.cameraAngle += 360;
    if (player.cameraAngle >= 360) player.cameraAngle -= 360;
    
    // Update wildlife
    updateAnimal();
    
    // Update money display
    updateMoneyDisplay();
  }

  draw() {
    // Draw terrain and player
    drawEntities(this.terrain);
  }
}
