// settings.js - various TWEAK settings and their
// knob-turnings go here

/* Global Configuration & Shared Globals */
var TWEAK = {
    tweakNob: 1,

    // Animal spawning and movement
    minSpawnTime: 5000, // Minimum delay between spawns (5 sec)
    maxSpawnTime: 10000, // Maximum delay between spawns (10 sec)
    minIdleTime: 3000, // Minimum time an animal sits still (1 sec)
    maxIdleTime: 8000, // Maximum time an animal sits still (20 sec)
    minMoveSpeed: 5, // Slowest movement speed for animals
    maxMoveSpeed: 11.2, // Fastest movement speed for animals
    fleeAngle: 45, // This may be obsolete - confirm before removing
    photoCooldown: 1000, // Must wait 1 second between photos
    repeatPhotoPenalty: 0.5, // 50% less money if the same animal is photographed again
    minAnimalSpawnDistance: 400,
    maxAnimalSpawnDistance: 500,
    bearSpawnProbability: 0.3, // 30% chance of a bear
    bearSpeed: 6, // Bears move a bit slower
    birdSpeed: 9, // Birds move faster
    bearDetectionRadius: 150, // Bears detect player from farther away
    birdDetectionRadius: 50, // Birds have smaller detection radius
    maxAnimalPhotoDistance: 600, // Maximum distance for taking photos

    // Jumping stuff
    jumpType: "immediate",               // "immediate" or "charge" - DO NOT REMOVE
    jumpCollisionMultiplier: 3,
    jumpBaseAscent: 1000,                 // Base ascent time (ms)
    jumpMaxHoldTime: 1000,               // Maximum charge duration (1 sec)
    jumpPeakScale: 2,                    // Base peak visual jump scale
    jumpHeightPerRocketSurgery: 0.05,    // Each level adds 5% to jump height
    jumpTimePerRocketSurgery: 0.05,      // Each level adds 5% to jump duration
    jumpZoomPerHeightIncrease: 0.5,      // For every 100% height increase, add 50% more zoom

    // Re-Hit Jump System
    reHitWindowStart: 0.70,              // When re-hit window opens (70% through jump)
    reHitIndicatorScale: 2.5,            // Size multiplier for indicator circle
    reHitIndicatorColor: "rgba(255, 0, 255, 0.4)",  // Bright magenta with more opacity
    reHitIndicatorOutlineColor: "#FF00FF", // Solid magenta outline
    reHitBonusDuration: 1.2,             // Duration multiplier for re-hit jumps
    
    // Trick Physics Adjustments
    parachuteGravityFactor: 0.8,         // Gravity reduction during parachute
    airBrakeFrictionMultiplier: 0.85,    // Speed reduction during air brake

    // Camera and aiming
    basePOVAngle: 30,
    optimalOpticsPOVIncrease: 5,
    altitudeFlashMinSpeed: 200,
    altitudeFlashMaxSpeed: 10,
    altitudeGradientStart: "blue",
    altitudeGradientEnd: "red",

    // Photo scoring
    basePhotoValue: 50, // Base money earned from a photo
    altitudeMatchMultiplier: 2,
    centerPOVMultiplier: 1.5,
    fleeingAnimalMultiplier: 3,

    // Animal multipliers
    bearMultiplier: 1.5,
    birdMultiplier: 1,
    
    // House entry costs
    houseEntryLoanDeduction: 0.005, // 0.5% loan deduction when entering house

    // Underlying base values
    _sledMass: 1.0,
    _baseGravity: 0.1,
    _baseHorizontalAccel: 0.25,
    _baseFriction: 0.95,
    _baseMaxXVel: 3,
    _rocketSurgeryFactorPerLevel: 0.1,
    _optimalOpticsAccelFactorPerLevel: 0.02,
    _optimalOpticsFrictionFactorPerLevel: 0.005,
    _fancierFootwearUpSpeedPerLevel: 0.3,
    _baseUpSpeed: 2,
    _baseCollisionsAllowed: 3,
    _starterCash: 200, // Jacked up for testing
    
    _bounceImpulse: 3,  // New bounce impulse value

    // Trick system configuration
    _trickCooldown: 5000,          // Base cooldown per trick (5 sec)
    _trickTimeMultiplier: 1.0,     // Global trick duration multiplier
    _trickTimeAdder: 0,            // Global trick duration additive time
    _trickBaseDuration: 250,       // Base duration for tricks (ms)
    _trickRotationSpeed: 720,     // Degrees per second for helicopter tricks (3 full spins)
    _trickOffsetDistance: 40,      // Pixels to offset sled for air brake/parachute
    _trickMoneyBase: 50,           // Base money earned per trick
    _trickChainMultiplier: 1.5,    // Multiplier for chaining different tricks
    
    // Getters to apply tweakNob multiplier

    get sledMass() { return this._sledMass * this.tweakNob; },
    set sledMass(val) { this._sledMass = val; },
    
    get baseGravity() { return this._baseGravity * this.tweakNob; },
    set baseGravity(val) { this._baseGravity = val; },
    
    get baseHorizontalAccel() { return this._baseHorizontalAccel; },
    set baseHorizontalAccel(val) { this._baseHorizontalAccel = val; },
    
    get baseFriction() { return this._baseFriction; }, // * this.tweakNob
    set baseFriction(val) { this._baseFriction = val; },
    
    get baseMaxXVel() { return this._baseMaxXVel * this.tweakNob; },
    set baseMaxXVel(val) { this._baseMaxXVel = val; },
    
    get rocketSurgeryFactorPerLevel() { return this._rocketSurgeryFactorPerLevel * this.tweakNob; },
    set rocketSurgeryFactorPerLevel(val) { this._rocketSurgeryFactorPerLevel = val; },
    
    get optimalOpticsAccelFactorPerLevel() { return this._optimalOpticsAccelFactorPerLevel * this.tweakNob; },
    set optimalOpticsAccelFactorPerLevel(val) { this._optimalOpticsAccelFactorPerLevel = val; },
    
    get optimalOpticsFrictionFactorPerLevel() { return this._optimalOpticsFrictionFactorPerLevel * this.tweakNob; },
    set optimalOpticsFrictionFactorPerLevel(val) { this._optimalOpticsFrictionFactorPerLevel = val; },
    
    get fancierFootwearUpSpeedPerLevel() { return this._fancierFootwearUpSpeedPerLevel * this.tweakNob; },
    set fancierFootwearUpSpeedPerLevel(val) { this._fancierFootwearUpSpeedPerLevel = val; },
    
    get baseUpSpeed() { return this._baseUpSpeed * this.tweakNob; },
    set baseUpSpeed(val) { this._baseUpSpeed = val; },
    
    get baseCollisionsAllowed() { return this._baseCollisionsAllowed * this.tweakNob; },
    set baseCollisionsAllowed(val) { this._baseCollisionsAllowed = val; },
    
    get starterCash() { return this._starterCash * this.tweakNob; },
    set starterCash(val) { this._starterCash = val; },
    
    // New dynamic bounceImpulse getter/setter
    get bounceImpulse() { return this._bounceImpulse * this.tweakNob; },
    set bounceImpulse(val) { this._bounceImpulse = val; },

    // Debug settings
    showCollisionBoxes: true  // Set to true to show collision boxes for debugging
};
  
// New: function to compute max collisions
TWEAK.getMaxCollisions = function() {
    // Ensure playerUpgrades exists before accessing it
    return TWEAK.baseCollisionsAllowed + (typeof playerUpgrades !== "undefined" && playerUpgrades.sledDurability ? playerUpgrades.sledDurability : 0);
};

// Export the TWEAK object
export { TWEAK };

