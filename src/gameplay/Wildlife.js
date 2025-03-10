// src/gameplay/Wildlife.js
import { player } from './Player.js';
import { getCameraOffset } from '../utils/MathUtils.js';
import { checkCollision, resolveCollision } from '../utils/PhysicsUtils.js';
import { addFloatingText, playTone, updateMoneyDisplay } from '../utils/UIUtils.js';

export let activeAnimal = null;
let lastPhotoTime = 0;

// Constants for photo system
const TWEAK = {
  // Photo system settings
  photoCooldown: 1000, // 1 second cooldown between photos
  basePhotoValue: 200, // Base money value for a photo
  altitudeMatchMultiplier: 2.5, // Bonus for matching altitude
  centerPOVMultiplier: 2.0, // Bonus for centering the animal
  movingAnimalMultiplier: 1.5, // Bonus for photographing moving animals
  bearMultiplier: 1.5, // Bonus for photographing bears
  birdMultiplier: 1.2, // Bonus for photographing birds
  repeatPhotoPenalty: 0.5, // Penalty for photographing the same animal again
  basePOVAngle: 60, // Base field of view angle for the camera
  
  // Animal behavior settings
  minIdleTime: 3000, // Minimum time before animal starts fleeing (3 seconds)
  maxIdleTime: 15000, // Maximum time before animal starts fleeing (15 seconds)
  minFleeSpeed: 5, // Minimum speed when fleeing
  maxFleeSpeed: 11.2, // Maximum speed when fleeing
  bearAltitude: 20, // Default altitude for bears
  birdAltitude: 80, // Default altitude for birds
  fleeAngleRange: { // Angles for fleeing direction
    left: { min: 135, max: 170 },
    right: { min: 20, max: 55 }
  },
  maxAngleOffset: 45 // Maximum random offset for flee angle
};

export function spawnAnimal() {
  if (activeAnimal) return;
  
  const timestamp = new Date().toISOString();
  
  // Determine animal type and characteristics
  let type = Math.random() < 0.5 ? "bear" : "bird";
  let isBear = (type === "bear");
  
  // Calculate spawn position
  let spawnX = (window.innerWidth * 0.1) + (Math.random() * window.innerWidth * 0.9);
  let spawnY = player.absY - (window.innerHeight / 2);
  
  // Initialize animal with enhanced state management
  activeAnimal = {
    // Basic properties
    type: type,
    x: spawnX,
    y: spawnY,
    altitude: isBear ? TWEAK.bearAltitude : TWEAK.birdAltitude,
    width: isBear ? player.width * 2 : player.width / 2,
    height: isBear ? player.height * 2 : player.height / 2,
    
    // State management
    state: "idle",
    stateStartTime: Date.now(),
    idleTime: Math.random() * (TWEAK.maxIdleTime - TWEAK.minIdleTime) + TWEAK.minIdleTime,
    hasBeenPhotographed: false,
    
    // Movement properties
    speed: Math.random() * (TWEAK.maxFleeSpeed - TWEAK.minFleeSpeed) + TWEAK.minFleeSpeed,
    fleeAngleActual: 0,
    fleeAngleBase: 0,
    isLeftSide: spawnX <= window.innerWidth / 2,
    
    // Animation properties
    bobOffset: 0,
    bobSpeed: Math.random() * 0.1 + 0.05
  };
  
  const animalEmoji = isBear ? "🐻" : "🐦";
  console.log(`[${timestamp}] ${animalEmoji} ANIMAL SPAWN: Type=${activeAnimal.type}, Position=(${spawnX.toFixed(0)}, ${spawnY.toFixed(0)}), Altitude=${activeAnimal.altitude}, Size=${activeAnimal.width.toFixed(1)}x${activeAnimal.height.toFixed(1)}`);
  console.log(`[${timestamp}] ⏱️ STATE CHANGE: ${activeAnimal.type} entering idle state for ${(activeAnimal.idleTime / 1000).toFixed(1)}s`);
}

export function updateAnimal() {
  if (!activeAnimal) return;
  
  const now = Date.now();
  const stateTime = now - activeAnimal.stateStartTime;
  
  // Update bob animation for idle state
  if (activeAnimal.state === "idle") {
    activeAnimal.bobOffset = Math.sin(now * activeAnimal.bobSpeed) * 5;
    
    // Check if idle time has elapsed
    if (stateTime >= activeAnimal.idleTime) {
      // Transition to fleeing state
      activeAnimal.state = "fleeing";
      activeAnimal.stateStartTime = now;
      
      // Calculate flee angle based on spawn position
      const angleRange = activeAnimal.isLeftSide ? TWEAK.fleeAngleRange.right : TWEAK.fleeAngleRange.left;
      activeAnimal.fleeAngleBase = Math.random() * (angleRange.max - angleRange.min) + angleRange.min;
      const angleOffset = Math.random() * TWEAK.maxAngleOffset;
      activeAnimal.fleeAngleActual = activeAnimal.fleeAngleBase + (Math.random() < 0.5 ? -angleOffset : angleOffset);
      
      const timestamp = new Date().toISOString();
      const animalEmoji = activeAnimal.type === "bear" ? "🐻" : "🐦";
      console.log(`[${timestamp}] ${animalEmoji} STATE CHANGE: ${activeAnimal.type} transitioning from idle to fleeing after ${(stateTime/1000).toFixed(1)}s`);
      console.log(`[${timestamp}] 🏃 MOVEMENT: Flee speed=${activeAnimal.speed.toFixed(1)}, Angle=${activeAnimal.fleeAngleActual.toFixed(1)}° (base: ${activeAnimal.fleeAngleBase.toFixed(1)}° + offset: ${angleOffset.toFixed(1)}°)`);
    }
  } 
  // Handle fleeing state movement
  else if (activeAnimal.state === "fleeing") {
    // Convert angle to radians and update position
    const rad = activeAnimal.fleeAngleActual * Math.PI / 180;
    const deltaX = Math.cos(rad) * activeAnimal.speed * 0.5;
    const deltaY = Math.sin(rad) * activeAnimal.speed * 0.5;
    
    activeAnimal.x += deltaX;
    activeAnimal.y += deltaY;
    
    // Log position updates periodically (every 2 seconds)
    if (stateTime % 2000 < 16) { // Assuming 60fps, so ~16ms per frame
      console.log(`[Position] ${activeAnimal.type} at (${activeAnimal.x.toFixed(0)}, ${activeAnimal.y.toFixed(0)}) moving at ${activeAnimal.speed.toFixed(1)} units/s`);
    }
    
    // Check if animal has moved off screen
    if (activeAnimal.x < -100 || activeAnimal.x > window.innerWidth + 100 || activeAnimal.y > player.absY + 1000) {
      const timestamp = new Date().toISOString();
      const animalEmoji = activeAnimal.type === "bear" ? "🐻" : "🐦";
      console.log(`[${timestamp}] ${animalEmoji} DESPAWN: ${activeAnimal.type} moved off screen at (${activeAnimal.x.toFixed(0)}, ${activeAnimal.y.toFixed(0)}), Flee duration=${((now - activeAnimal.stateStartTime)/1000).toFixed(1)}s`);
      activeAnimal = null;
      
      // Schedule next spawn
      const nextSpawnDelay = Math.random() * 5000 + 5000; // 5-10 seconds
      console.log(`[${timestamp}] 🔄 SYSTEM: Next animal will spawn in ${(nextSpawnDelay / 1000).toFixed(1)}s`);
      setTimeout(spawnAnimal, nextSpawnDelay);
    }
  }
}

export function updateWildlifeCollision(player) {
  if (activeAnimal) {
    if (checkCollision(
      player.x - player.width / 2, player.absY - player.height / 2,
      player.width, player.height,
      activeAnimal.x, activeAnimal.y,
      activeAnimal.width, activeAnimal.height
    )) {
      resolveCollision(player, activeAnimal);
    }
  }
}

export function drawAnimal(ctx) {
  if (!activeAnimal) return;
  
  let cameraOffset = getCameraOffset(player.absY, window.innerHeight, 1000);
  
  // Apply bob offset if in idle state
  let drawY = activeAnimal.y;
  if (activeAnimal.state === "idle") {
    drawY += activeAnimal.bobOffset;
  }
  
  // Draw animal with type-specific color and shadow
  ctx.save();
  
  // Add shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 3;
  
  // Draw with type-specific color
  ctx.fillStyle = activeAnimal.type === "bear" ? "#000000" : "#800080";
  ctx.fillRect(
    activeAnimal.x - activeAnimal.width / 2,
    drawY - cameraOffset - activeAnimal.height / 2,
    activeAnimal.width,
    activeAnimal.height
  );
  
  ctx.restore();
}

/**
 * Check if an animal is inside the player's camera field of view
 * @param {Object} animal - The animal to check
 * @returns {boolean} - Whether the animal is in the camera's field of view
 */
export function isAnimalInsideCone(animal) {
  if (!animal) return false;
  
  // Calculate angle to animal
  let animalAngle = Math.atan2(animal.y - player.absY, animal.x - player.x) * (180 / Math.PI);
  if (animalAngle < 0) animalAngle += 360;
  
  // Calculate difference in angle
  let diffAngle = Math.abs(animalAngle - player.cameraAngle);
  if (diffAngle > 180) diffAngle = 360 - diffAngle;
  
  // Check if animal is within camera cone
  return diffAngle <= TWEAK.basePOVAngle / 2;
}

/**
 * Take a photo of an animal if one is in view
 * @returns {boolean} - Whether a photo was successfully taken
 */
export function takePhoto() {
  const now = Date.now();
  
  // Check cooldown
  if (now - lastPhotoTime < TWEAK.photoCooldown) return false;
  
  // Check if there's an animal in view
  if (!activeAnimal || !isAnimalInsideCone(activeAnimal)) return false;
  
  // Update last photo time
  lastPhotoTime = now;
  
  // Calculate photo value
  let baseValue = TWEAK.basePhotoValue;
  
  // Altitude bonus: Exponential falloff within 50 units
  let diffAlt = Math.abs(player.altitudeLine - activeAnimal.altitude);
  let altitudeMatchBonus;
  if (diffAlt > 50) {
    altitudeMatchBonus = 1;
  } else {
    altitudeMatchBonus = 1 + (TWEAK.altitudeMatchMultiplier - 1) * Math.exp(-diffAlt / 15);
  }
  
  // Center bonus: Exponential taper based on angle difference
  let animalAngle = Math.atan2(activeAnimal.y - player.absY, activeAnimal.x - player.x) * (180 / Math.PI);
  if (animalAngle < 0) animalAngle += 360;
  
  let diffAngle = Math.abs(animalAngle - player.cameraAngle);
  if (diffAngle > 180) diffAngle = 360 - diffAngle;
  
  const sweetSpotPercentage = 0.10;
  const sweetSpotAngle = TWEAK.basePOVAngle * sweetSpotPercentage;
  
  let centerBonus;
  if (diffAngle <= sweetSpotAngle) {
    centerBonus = TWEAK.centerPOVMultiplier;
  } else if (diffAngle < TWEAK.basePOVAngle / 2) {
    let factor = (diffAngle - sweetSpotAngle) / (TWEAK.basePOVAngle / 2 - sweetSpotAngle);
    centerBonus = 1 + (TWEAK.centerPOVMultiplier - 1) * Math.exp(-factor * 3);
  } else {
    centerBonus = 1;
  }
  
  // Movement bonus: Applies when the animal is not sitting
  let movementBonus = activeAnimal.state !== "sitting" ? TWEAK.movingAnimalMultiplier : 1;
  
  // Animal type multiplier
  let animalTypeMultiplier = activeAnimal.type === "bear" ? TWEAK.bearMultiplier : TWEAK.birdMultiplier;
  
  // Repeat penalty
  let repeatPenalty = activeAnimal.hasBeenPhotographed ? TWEAK.repeatPhotoPenalty : 1;
  
  // Calculate total money
  let totalMoney = Math.floor(
    baseValue * 
    altitudeMatchBonus * 
    centerBonus * 
    movementBonus * 
    animalTypeMultiplier * 
    repeatPenalty
  );
  
  // Add money to player
  player.money += totalMoney;
  updateMoneyDisplay();
  
  // Show floating text with enhanced styling
  addFloatingText(
    `+$${totalMoney} 📸 ${activeAnimal.type}`, 
    player.x, 
    player.absY,
    { 
      color: '#00FFFF', // Cyan color for photos
      size: 28,
      lifetime: 1500 // Longer lifetime for photo notifications
    }
  );
  
  // Play camera sound
  playPhotoSound();
  
  // Mark animal as photographed
  activeAnimal.hasBeenPhotographed = true;
  
  console.log(`📸 Captured ${activeAnimal.type}! Money: +$${totalMoney}`);
  
  return true;
}

/**
 * Play a camera shutter sound
 */
function playPhotoSound() {
  // High pitch click sound
  playTone(1200, "sine", 0.05, 0.2);
  // Then a lower confirmation tone
  setTimeout(() => {
    playTone(800, "sine", 0.1, 0.15);
  }, 50);
}
