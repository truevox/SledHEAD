// camera.js
// This file is responsible for handling the photography
// mechanics.

// Global variables for photo system
var lastPhotoTime = 0;

// ------------------- Photo (Critter) Minigame Logic -------------------
// Handles taking a photo of an animal when conditions are met.
function takePhoto() {
  let now = Date.now();
  if (now - lastPhotoTime < TWEAK.photoCooldown) return; // Enforce cooldown
  if (!activeAnimal || !isAnimalInsideCone(activeAnimal)) return;
  lastPhotoTime = now;
  
  let baseValue = TWEAK.basePhotoValue;
  // Altitude Bonus: exponential falloff within 50 units.
  let diffAlt = Math.abs(player.altitudeLine - activeAnimal.altitude);
  let altitudeMatchBonus;
  if (diffAlt > 50) {
    altitudeMatchBonus = 1;
  } else {
    altitudeMatchBonus = 1 + (TWEAK.altitudeMatchMultiplier - 1) * Math.exp(-diffAlt / 15);
  }
  
  // Center Bonus: based on the angle difference between camera direction and animal.
  let animalAngle = Math.atan2(activeAnimal.y - player.absY, activeAnimal.x - player.x) * (180 / Math.PI);
  if (animalAngle < 0) animalAngle += 360;
  let diffAngle = Math.abs(animalAngle - player.cameraAngle);
  if (diffAngle > 180) diffAngle = 360 - diffAngle;
  let coneAngle = TWEAK.basePOVAngle + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsPOVIncrease);
  let sweetSpotPercentage = 0.10 + (playerUpgrades.optimalOptics * 0.01);
  let sweetSpotAngle = coneAngle * sweetSpotPercentage;
  let centerBonus;
  if (diffAngle <= sweetSpotAngle) {
    centerBonus = TWEAK.centerPOVMultiplier;
  } else if (diffAngle < coneAngle / 2) {
    let factor = (diffAngle - sweetSpotAngle) / (coneAngle / 2 - sweetSpotAngle);
    centerBonus = 1 + (TWEAK.centerPOVMultiplier - 1) * Math.exp(-factor * 3);
  } else {
    centerBonus = 1;
  }
  
  // Movement Bonus and Animal Type Multiplier:
  let movementBonus = activeAnimal.state !== "sitting" ? TWEAK.fleeingAnimalMultiplier : 1;
  let animalTypeMultiplier = activeAnimal.type === "bear" ? TWEAK.bearMultiplier : TWEAK.birdMultiplier;
  let repeatPenalty = activeAnimal.hasBeenPhotographed ? TWEAK.repeatPhotoPenalty : 1;
  
  let totalMoney = Math.floor(baseValue * altitudeMatchBonus * centerBonus * movementBonus * animalTypeMultiplier * repeatPenalty);
  player.money += totalMoney;
  showMoneyGain(totalMoney, `(📸 ${activeAnimal.type})`);
  addFloatingText(`+$${totalMoney} 📸`, player.x, player.absY);
  console.log(`Captured ${activeAnimal.type}! Calculation details: Base=$${baseValue}, AltitudeBonus=${altitudeMatchBonus.toFixed(2)}, CenterBonus=${centerBonus.toFixed(2)}, MovementBonus=${movementBonus.toFixed(2)}, AnimalTypeMultiplier=${animalTypeMultiplier}, RepeatPenalty=${repeatPenalty}, Total=$${totalMoney}.`);
  
  // After taking a photo, animal should always flee
  if (activeAnimal.state === "sitting") {
    console.log(`Animal (${activeAnimal.type}) startled by camera - changing state from sitting to fleeing`);
    activeAnimal.state = "fleeing";
    activeAnimal.fleeingLogOnce = false; // Reset so we get the fleeing log message
  }
  
  activeAnimal.hasBeenPhotographed = true;
}

// Check if the animal is inside the camera cone
function isAnimalInsideCone(animal) {
  // Distance check
  let dx = animal.x - player.x;
  let dy = animal.y - player.absY;
  let distanceSquared = dx * dx + dy * dy;
  let maxDistance = TWEAK.maxAnimalPhotoDistance;
  if (distanceSquared > maxDistance * maxDistance) return false;
  
  // Angle check
  let animalAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (animalAngle < 0) animalAngle += 360;
  let diffAngle = Math.abs(animalAngle - player.cameraAngle);
  if (diffAngle > 180) diffAngle = 360 - diffAngle;
  let coneAngle = TWEAK.basePOVAngle + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsPOVIncrease);
  
  return diffAngle <= coneAngle / 2;
}