// src/utils/Constants.js
// Game constants and tweakable values

export const TWEAK = {
  // Jump mechanics
  jumpBaseAscent: 800,         // Base jump duration in ms
  jumpMaxHoldTime: 1000,       // Maximum time to hold jump charge
  jumpType: "immediate",       // Jump type: "immediate" or "charge"
  
  // Re-hit jump mechanics
  reHitWindowStart: 0.85,      // When re-hit window starts (85% through jump)
  reHitBonusDuration: 1.5,     // Duration multiplier for re-hit jumps
  reHitIndicatorScale: 2.0,    // Scale of the re-hit indicator relative to player
  reHitIndicatorOutlineColor: "#0088FF", // Blue outline for the indicator
  reHitIndicatorColor: "#00FFFF",  // Cyan color for the indicator
  
  // Jump physics
  jumpHeightPerRocketSurgery: 0.2,  // Height bonus per upgrade level
  jumpTimePerRocketSurgery: 0.15,   // Duration bonus per upgrade level
  jumpZoomPerHeightIncrease: 0.05,  // Camera zoom per height increase
  jumpCollisionMultiplier: 0.5,     // Collision impact on jumps
  
  // Collision and bounce physics
  bounceImpulse: 5,            // Base bounce strength
  maxCollisions: 3,            // Maximum collisions before run ends
  collisionPenalty: 50,        // Money penalty per collision
  bounceDecay: 0.8,           // Decay factor for subsequent bounces
  collisionInvulnTime: 500,    // Invulnerability time after collision (ms)
  
  // Helper functions
  getMaxCollisions() {
    return this.maxCollisions;
  },
  
  getBounceImpulse(collisionCount) {
    return this.bounceImpulse * Math.pow(this.bounceDecay, collisionCount);
  }
};
