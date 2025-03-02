/* utils.js */
/* Global Configuration & Shared Globals */
const TWEAK = {
    sledMass: 1.0,             
    baseGravity: 0.1,          
    baseHorizontalAccel: 0.15, 
    baseFriction: 0.95,        
    baseMaxXVel: 3,            
    rocketSurgeryFactorPerLevel: 0.05,  
    optimalOpticsAccelFactorPerLevel: 0.02,  
    optimalOpticsFrictionFactorPerLevel: 0.005, 
    fancierFootwearUpSpeedPerLevel: 0.1,  
    baseUpSpeed: 2,            
    baseCollisionsAllowed: 3,
    starterCash: 200           
  };
  
  const GameState = {
    HOUSE: 'house',
    DOWNHILL: 'downhill',
    UPHILL: 'uphill'
  };
  
  // Get the canvas and context—make sure the canvas element exists in the DOM.
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
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
  