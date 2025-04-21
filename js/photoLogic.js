// photoLogic.js - Pure logic for multi-animal photo shots (testable, no browser globals)

// Export for browser global usage
if (typeof window !== 'undefined') {
  window.calculatePhotoResults = calculatePhotoResults;
}


/**
 * Calculate photo results for a group of animals in the camera cone.
 * @param {Object[]} animalsWithInfo - Array of {animal, diffAngle, dist} for each animal in shot.
 * @param {Object} player - Player state (x, absY, altitudeLine, cameraAngle, upgrades).
 * @param {Object} TWEAK - Tweakable constants for scoring.
 * @param {number} [primaryIdx=0] - Index of primary animal.
 * @returns {Object[]} Array of results for each animal, primary first: { animal, isPrimary, totalMoney, centerBonus, altitudeBonus, details }
 */
function calculatePhotoResults(animalsWithInfo, player, TWEAK, primaryIdx = 0) {
  const results = [];
  // Sort so primary is first
  let sorted = animalsWithInfo.slice();
  if (primaryIdx !== 0) {
    const [primary] = sorted.splice(primaryIdx, 1);
    sorted.unshift(primary);
  }
  sorted.forEach((info, idx) => {
    const animal = info.animal;
    // Altitude Bonus
    let diffAlt = Math.abs(player.altitudeLine - animal.altitude);
    let altitudeMatchBonus = diffAlt > 50 ? 1 : 1 + (TWEAK.altitudeMatchMultiplier - 1) * Math.exp(-diffAlt / 15);
    // Center Bonus
    let diffAngle = info.diffAngle;
    let coneAngle = TWEAK.basePOVAngle + (player.upgrades.optimalOptics * TWEAK.optimalOpticsPOVIncrease);
    let sweetSpotPercentage = 0.10 + (player.upgrades.optimalOptics * 0.01);
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
    // Movement and type
    let movementBonus = animal.state !== "sitting" ? TWEAK.fleeingAnimalMultiplier : 1;
    let animalTypeMultiplier = animal.type === "bear" ? TWEAK.bearMultiplier : TWEAK.birdMultiplier;
    let repeatPenalty = animal.hasBeenPhotographed ? TWEAK.repeatPhotoPenalty : 1;
    // Primary gets full, others half
    let multiplier = (idx === 0) ? 1 : 0.5;
    let totalMoney = Math.floor(TWEAK.basePhotoValue * altitudeMatchBonus * centerBonus * movementBonus * animalTypeMultiplier * repeatPenalty * multiplier);
    results.push({
      animal,
      isPrimary: idx === 0,
      totalMoney,
      centerBonus,
      altitudeBonus: altitudeMatchBonus,
      details: {
        base: TWEAK.basePhotoValue,
        movementBonus,
        animalTypeMultiplier,
        repeatPenalty,
        multiplier,
        diffAngle,
        diffAlt
      }
    });
  });
  return results;
}

if (typeof module !== 'undefined') {
  module.exports = { calculatePhotoResults };
}
