/* utils.js */
/* Global Configuration & Shared Globals */
var TWEAK = {
    tweakNob: 1, // Global multiplier for all tweak values
    
    // Underlying base values
    _sledMass: 1.0,
    _baseGravity: 0.2,
    _baseHorizontalAccel: 0.15,
    _baseFriction: 0.95,
    _baseMaxXVel: 3,
    _rocketSurgeryFactorPerLevel: 0.05,
    _optimalOpticsAccelFactorPerLevel: 0.02,
    _optimalOpticsFrictionFactorPerLevel: 0.005,
    _fancierFootwearUpSpeedPerLevel: 0.1,
    _baseUpSpeed: 2,
    _baseCollisionsAllowed: 3,
    _starterCash: 3300, // Jacked up for testing
    
    _bounceImpulse: 3,  // New bounce impulse value
    
    // Getters to apply tweakNob multiplier
    get sledMass() { return this._sledMass * this.tweakNob; },
    set sledMass(val) { this._sledMass = val; },
    
    get baseGravity() { return this._baseGravity * this.tweakNob; },
    set baseGravity(val) { this._baseGravity = val; },
    
    get baseHorizontalAccel() { return this._baseHorizontalAccel * this.tweakNob; },
    set baseHorizontalAccel(val) { this._baseHorizontalAccel = val; },
    
    get baseFriction() { return this._baseFriction * this.tweakNob; },
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
    set bounceImpulse(val) { this._bounceImpulse = val; }
};
  
// New: function to compute max collisions
TWEAK.getMaxCollisions = function() {
    // Ensure playerUpgrades exists before accessing it
    return TWEAK.baseCollisionsAllowed + (typeof playerUpgrades !== "undefined" && playerUpgrades.sledDurability ? playerUpgrades.sledDurability : 0);
};

var GameState = {
    HOUSE: 'house',
    DOWNHILL: 'downhill',
    UPHILL: 'uphill'
};

// Get the canvas element and its context.
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

/* NEW: Global keysDown object and event listeners */
var keysDown = {};

window.addEventListener("keydown", function(e) {
    keysDown[e.key] = true;
});

window.addEventListener("keyup", function(e) {
    delete keysDown[e.key];
});

/* Utility functions */
function formatUpgradeName(name) {
    let formattedName = name.replace(/([A-Z])/g, ' $1').trim();
    return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function checkCollision(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}
function getCameraOffset(playerAbsY, canvasHeight, mountainHeight) {
    let offset = playerAbsY - canvasHeight / 2;
    return clamp(offset, 0, mountainHeight - canvasHeight);
}
