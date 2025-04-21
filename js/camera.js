// camera.js
// This file is responsible for handling the photography
// mechanics.

// Global variables for photo system
var lastPhotoTime = 0;

// ------------------- Photo (Critter) Minigame Logic -------------------
// Handles taking a photo of an animal when conditions are met.
function takePhoto() {
  let now = Date.now();
  if (now - lastPhotoTime < TWEAK.photoCooldown) return;

  // Gather all animals in the cone
  let animalsInShot = [];
  if (animals && animals.length > 0) {
    animals.forEach(animal => {
      if (isAnimalInsideCone(animal)) {
        // Calculate center angle difference and distance
        let dx = animal.x - player.x;
        let dy = animal.y - player.absY;
        let animalAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (animalAngle < 0) animalAngle += 360;
        let diffAngle = Math.abs(animalAngle - player.cameraAngle);
        if (diffAngle > 180) diffAngle = 360 - diffAngle;
        let dist = Math.sqrt(dx*dx + dy*dy);
        animalsInShot.push({ animal, diffAngle, dist });
      }
    });
  }
  // Fallback to legacy activeAnimal
  if ((!animalsInShot || animalsInShot.length === 0) && activeAnimal && isAnimalInsideCone(activeAnimal)) {
    let dx = activeAnimal.x - player.x;
    let dy = activeAnimal.y - player.absY;
    let animalAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (animalAngle < 0) animalAngle += 360;
    let diffAngle = Math.abs(animalAngle - player.cameraAngle);
    if (diffAngle > 180) diffAngle = 360 - diffAngle;
    let dist = Math.sqrt(dx*dx + dy*dy);
    animalsInShot.push({ animal: activeAnimal, diffAngle, dist });
  }
  if (animalsInShot.length === 0) return;
  // Find primary: closest to center, then closest by distance
  animalsInShot.sort((a, b) => a.diffAngle !== b.diffAngle ? a.diffAngle - b.diffAngle : a.dist - b.dist);
  photographAnimals(animalsInShot.map(obj => obj.animal), 0, animalsInShot);
}

// Helper function to calculate and award money for photographing an animal
// Multi-animal photo logic using pure logic from photoLogic.js
function photographAnimals(animalArr, primaryIdx = 0, infoArr = null) {
  lastPhotoTime = Date.now();
  // Compose infoArr if not provided
  if (!infoArr) {
    infoArr = animalArr.map(animal => {
      let dx = animal.x - player.x;
      let dy = animal.y - player.absY;
      let animalAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (animalAngle < 0) animalAngle += 360;
      let diffAngle = Math.abs(animalAngle - player.cameraAngle);
      if (diffAngle > 180) diffAngle = 360 - diffAngle;
      let dist = Math.sqrt(dx*dx + dy*dy);
      return { animal, diffAngle, dist };
    });
  }
  // Prepare player and upgrades for pure logic
  const playerState = Object.assign({}, player, { upgrades: playerUpgrades });
  // Use the pure logic (browser global)
  if (!window.calculatePhotoResults) {
    throw new Error('calculatePhotoResults is not defined on window. Make sure photoLogic.js is loaded before camera.js.');
  }
  const results = window.calculatePhotoResults(infoArr, playerState, TWEAK, primaryIdx);

  let feedbackLines = [];
  let logLines = [];
  results.forEach((res, idx) => {
    player.money += res.totalMoney;
    showMoneyGain(res.totalMoney, `(📸 ${res.animal.type}${res.isPrimary ? ' [PRIMARY]' : ''})`);
    addFloatingText(`+$${res.totalMoney} 📸${res.isPrimary ? ' [PRIMARY]' : ''}`, player.x, player.absY - idx * 25);
    feedbackLines.push(`${res.isPrimary ? '[PRIMARY] ' : ''}${res.animal.type} +$${res.totalMoney} (center: ${res.centerBonus.toFixed(2)}, altitude: ${res.altitudeBonus.toFixed(2)})`);
    logLines.push(`${res.isPrimary ? '[PRIMARY] ' : ''}${res.animal.type}: $${res.totalMoney} [Base=$${res.details.base}, AltitudeBonus=${res.altitudeBonus.toFixed(2)}, CenterBonus=${res.centerBonus.toFixed(2)}, MovementBonus=${res.details.movementBonus.toFixed(2)}, AnimalTypeMultiplier=${res.details.animalTypeMultiplier}, RepeatPenalty=${res.details.repeatPenalty}, Multiplier=${res.details.multiplier}]`);
    // Flee logic
    if (res.animal.state === "sitting") {
      res.animal.state = "fleeing";
      res.animal.fleeingLogOnce = false;
    }
    res.animal.hasBeenPhotographed = true;
  });
  // On-screen feedback (primary animal's floating text is already shown)
  addFloatingText(`Photo: ${feedbackLines.join(', ')}`, player.x, player.absY - 60);
  // Console log
  console.log(`Photo taken: ${logLines.join(' | ')}`);
}

// Legacy single-animal fallback for compatibility
function photographAnimal(animal) {
  photographAnimals([animal], 0);
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

// Export camera functions for browser global access (for render.js, utils.js, etc)
// This is required for legacy and non-module usage. Do not remove!
if (typeof window !== 'undefined') {
  window.takePhoto = takePhoto;
  window.isAnimalInsideCone = isAnimalInsideCone;
}