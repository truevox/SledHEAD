// src/mechanics/PhotoSystem.js
import { player } from '../gameplay/Player.js';
import { activeAnimal } from '../gameplay/Wildlife.js';
import { addFloatingText } from '../utils/UIUtils.js';
import { playTone } from '../utils/UIUtils.js';

// Constants for photo system
const PHOTO_SETTINGS = {
  baseCooldown: 1000, // 1 second cooldown between photos
  basePhotoValue: 200, // Base money value for a photo
  altitudeMatchMultiplier: 2.5, // Bonus for matching altitude
  centerPOVMultiplier: 2.0, // Bonus for centering the animal
  movingAnimalMultiplier: 1.5, // Bonus for photographing moving animals
  bearMultiplier: 1.5, // Bonus for photographing bears
  birdMultiplier: 1.2, // Bonus for photographing birds
  repeatPhotoPenalty: 0.5 // Penalty for photographing the same animal again
};

let lastPhotoTime = 0;

/**
 * Check if an animal is inside the player's camera field of view
 * @param {Object} animal - The animal to check
 * @returns {boolean} - Whether the animal is in the camera's field of view
 */
function isAnimalInsideCone(animal) {
  if (!animal) return false;
  
  // Calculate angle to animal
  let animalAngle = Math.atan2(animal.y - player.absY, animal.x - player.x) * (180 / Math.PI);
  if (animalAngle < 0) animalAngle += 360;
  
  // Calculate difference in angle
  let diffAngle = Math.abs(animalAngle - player.cameraAngle);
  if (diffAngle > 180) diffAngle = 360 - diffAngle;
  
  // Base POV angle (could be modified by upgrades later)
  const povAngle = 60;
  
  // Check if animal is within camera cone
  return diffAngle <= povAngle / 2;
}

/**
 * Take a photo of an animal if one is in view
 * @returns {boolean} - Whether a photo was successfully taken
 */
export function takePhoto() {
  const now = Date.now();
  
  // Check cooldown
  if (now - lastPhotoTime < PHOTO_SETTINGS.baseCooldown) return false;
  
  // Check if there's an animal in view
  if (!activeAnimal || !isAnimalInsideCone(activeAnimal)) return false;
  
  // Update last photo time
  lastPhotoTime = now;
  
  // Calculate photo value
  let baseValue = PHOTO_SETTINGS.basePhotoValue;
  
  // Altitude bonus
  let diffAlt = Math.abs(player.altitudeLine - activeAnimal.altitude);
  let altitudeMatchBonus = diffAlt <= 50 
    ? 1 + (PHOTO_SETTINGS.altitudeMatchMultiplier - 1) * Math.exp(-diffAlt / 15) 
    : 1;
  
  // Center bonus
  let animalAngle = Math.atan2(activeAnimal.y - player.absY, activeAnimal.x - player.x) * (180 / Math.PI);
  if (animalAngle < 0) animalAngle += 360;
  
  let diffAngle = Math.abs(animalAngle - player.cameraAngle);
  if (diffAngle > 180) diffAngle = 360 - diffAngle;
  
  const povAngle = 60; // Base POV angle
  const sweetSpotPercentage = 0.10;
  const sweetSpotAngle = povAngle * sweetSpotPercentage;
  
  let centerBonus;
  if (diffAngle <= sweetSpotAngle) {
    centerBonus = PHOTO_SETTINGS.centerPOVMultiplier;
  } else if (diffAngle < povAngle / 2) {
    let factor = (diffAngle - sweetSpotAngle) / (povAngle / 2 - sweetSpotAngle);
    centerBonus = 1 + (PHOTO_SETTINGS.centerPOVMultiplier - 1) * Math.exp(-factor * 3);
  } else {
    centerBonus = 1;
  }
  
  // Movement bonus
  let movementBonus = activeAnimal.state !== "sitting" 
    ? PHOTO_SETTINGS.movingAnimalMultiplier 
    : 1;
  
  // Animal type multiplier
  let animalTypeMultiplier = activeAnimal.type === "bear" 
    ? PHOTO_SETTINGS.bearMultiplier 
    : PHOTO_SETTINGS.birdMultiplier;
  
  // Repeat penalty
  let repeatPenalty = activeAnimal.hasBeenPhotographed 
    ? PHOTO_SETTINGS.repeatPhotoPenalty 
    : 1;
  
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

/**
 * Initialize the photo system
 */
export function initPhotoSystem() {
  // Set up key event listener for space bar to take photos
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !event.repeat) {
      takePhoto();
    }
  });
  
  console.log("Photo system initialized");
}
