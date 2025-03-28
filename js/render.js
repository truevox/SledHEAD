/* render.js - Rendering Logic */

/*
❓ Is the new drawing logic modular enough?
Not quite yet.
Right now, the drawing code is still inline and monolithic. For long-term cleanliness, you may wanna:

Extract the trick rendering into its own helper function (e.g., drawTrickVisuals(ctx, player))

Possibly separate general player rendering (hitbox/body) vs trick effects
*/

// Import resolution utilities
import { getResolution } from './resolution.js';
import { player } from './player.js';
import { GameState } from './gamestate.js';
import { getCameraOffset, mapRange, lerpColor } from './utils.js';
import { drawTree } from './trees.js';
import { drawAnimal, isAnimalInsideCone, activeAnimal } from './wildlife.js';
import { TWEAK } from './settings.js';
import { showStackedNotification } from './notify.js';
import { playerUpgrades } from './upgrades.js';
import { terrain, mountainHeight } from './world.js';

let floatingTexts = [];

// Get canvas elements (avoiding circular references)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Floating Text System
class FloatingText {
  constructor(text, x, y) {
    this.text = text;
    this.x = x;
    this.initialY = y; // Relative to the player
    this.age = 0;
    this.lifetime = 1000; // Duration in ms
    this.visualOffsetY = -30; // Start offset
  }

  update(deltaTime) {
    this.age += deltaTime;
    this.visualOffsetY -= deltaTime * 0.25; // Slow upward float
    return this.age < this.lifetime;
  }

  draw(ctx, cameraY) {
    const resolution = getResolution();
    const scale = resolution.scale * (window.devicePixelRatio || 1);
    const alpha = 1 - (this.age / this.lifetime);
    
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.font = `bold ${24 * scale}px Arial`;
    ctx.textAlign = "center";
    
    const screenY = player.absY - cameraY + this.visualOffsetY;
    ctx.fillText(this.text, this.x, screenY);
  }
}

function addFloatingText(text, x, y) {
  floatingTexts.push(new FloatingText(text, x, y - 30));
}

let startPositionY = 0;

// Live Money Update Functions
function updateLiveMoney() {
  // Calculate real distance traveled based on starting and ending Y positions
  let distanceTraveled = Math.max(1, player.absY - startPositionY);
  
  // Ensure at least 1 unit
  distanceTraveled = Math.max(1, distanceTraveled);
  
  let moneyEarned = Math.floor(distanceTraveled / 100); // Every 100 distance = $1
  moneyEarned = Math.max(1, moneyEarned); // Guarantee at least $1
  
  let moneyText = document.getElementById("moneyText");
  if (moneyText) {
    moneyText.textContent = `Money: $${player.money} (+$${moneyEarned})`;
  }
}

// Function to set the start position for money calculation
function setStartPosition(y) {
  startPositionY = y;
}

function showMoneyGain(amount, source = "") {
  let moneyText = document.getElementById("moneyText");
  if (moneyText) {
    if (source) {
      moneyText.textContent = `Money: $${player.money} (+$${amount} ${source})`;
    } else {
      moneyText.textContent = `Money: $${player.money} (+$${amount})`;
    }
    moneyText.classList.add("money-increase");
    setTimeout(() => {
      moneyText.classList.remove("money-increase");
    }, 100);
  }
}

// General money display update
function updateMoneyDisplay() {
  let moneyText = document.getElementById("moneyText");
  if (moneyText) {
    moneyText.textContent = `Money: $${player.money}`;
  }
}

function drawEntities(currentState) {
  const resolution = getResolution();
  const scale = resolution.scale;
  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);

  // Clear the entire canvas with the current scale
  ctx.clearRect(0, 0, canvas.width * scale, canvas.height * scale);

  // Draw background
  ctx.fillStyle = currentState === GameState.DOWNHILL ? "#ADD8E6" : "#98FB98";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw terrain obstacles
  terrain.forEach(obstacle => {
    // Only render obstacles near the visible area
    if (obstacle.y >= cameraOffset - 50 && obstacle.y <= cameraOffset + canvas.height + 50) {
      if (obstacle.type === 'tree') {
        // Use the tree drawing function for trees
        drawTree(ctx, {
          ...obstacle, 
          y: obstacle.y - cameraOffset
        });
        
        // Draw tree collision box for debugging
        if (TWEAK.showCollisionBoxes) {
          // Draw overall collision box
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            obstacle.x, 
            obstacle.y - cameraOffset, 
            obstacle.width * scale, 
            obstacle.height * scale
          );
          
          // Draw collision zones
          if (obstacle.collisionZones) {
            ctx.strokeStyle = 'orange';
            obstacle.collisionZones.forEach(zone => {
              if (zone.type === 'rect') {
                const zoneX = obstacle.x + zone.offsetX * scale;
                const zoneY = obstacle.y - cameraOffset + zone.offsetY * scale;
                const zoneWidth = zone.width * scale;
                const zoneHeight = zone.height * scale;
                
                ctx.strokeRect(
                  zoneX - zoneWidth / 2, 
                  zoneY - zoneHeight / 2, 
                  zoneWidth, 
                  zoneHeight
                );
              } else if (zone.type === 'circle') {
                const zoneX = obstacle.x + zone.offsetX * scale;
                const zoneY = obstacle.y - cameraOffset + zone.offsetY * scale;
                const zoneRadius = zone.radius * scale;
                
                ctx.beginPath();
                ctx.arc(zoneX, zoneY, zoneRadius, 0, Math.PI * 2);
                ctx.stroke();
              }
            });
          }
          ctx.setLineDash([]);
        }
      } else {
        // Default drawing for rocks/other obstacles
        ctx.fillStyle = "#808080";
        ctx.fillRect(obstacle.x, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
        
        // Draw obstacle collision box for debugging
        if (TWEAK.showCollisionBoxes) {
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(obstacle.x, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
          ctx.setLineDash([]);
        }
      }
    }
  });

  let playerDrawY = player.absY - cameraOffset;
  ctx.save();
  
  // Draw player collision box for debugging
  if (TWEAK.showCollisionBoxes) {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      player.x - player.width * scale / 2, 
      playerDrawY - player.height * scale / 2, 
      player.width * scale, 
      player.height * scale
    );
    ctx.setLineDash([]);
  }
  
  // Apply trick-specific transformations
  if (player.currentTrick) {
    if (player.currentTrick === "leftHelicopter" || player.currentTrick === "rightHelicopter") {
      ctx.translate(player.x, playerDrawY);
      ctx.rotate(player.trickRotation * Math.PI / 180);
      ctx.translate(-player.x, -playerDrawY);
    } else if (player.currentTrick === "airBrake" || player.currentTrick === "parachute") {
      playerDrawY += player.currentTrick === "airBrake" ? player.trickOffset : -player.trickOffset;
    }
  }
  
  // Draw the player with scaling
  const playerScaledWidth = player.width * scale;
  const playerScaledHeight = player.height * scale;
  
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(
    player.x - playerScaledWidth / 2, 
    playerDrawY - playerScaledHeight / 2, 
    playerScaledWidth, 
    playerScaledHeight
  );
  
  if (player.currentTrick === "airBrake" || player.currentTrick === "parachute") {
    ctx.fillStyle = "#FFFF00";
    ctx.beginPath();
    ctx.arc(
      player.x, 
      playerDrawY - player.trickOffset, 
      playerScaledWidth / 3, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
  }
  
  ctx.restore();
  
  // Draw camera overlay (from wildlifephotos.js)
  drawCameraOverlay(currentState);
  
  // Draw any animals (from wildlifephotos.js)
  drawAnimal();
}

function drawCameraOverlay(currentState) {
  if (currentState !== GameState.UPHILL) return;
  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
  let centerX = player.x;
  let centerY = player.absY - cameraOffset;
  let coneLength = 300;
  let povAngle = TWEAK.basePOVAngle + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsPOVIncrease);
  let leftAngle = (player.cameraAngle - povAngle / 2) * (Math.PI / 180);
  let rightAngle = (player.cameraAngle + povAngle / 2) * (Math.PI / 180);
  ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + coneLength * Math.cos(leftAngle), centerY + coneLength * Math.sin(leftAngle));
  ctx.lineTo(centerX + coneLength * Math.cos(rightAngle), centerY + coneLength * Math.sin(rightAngle));
  ctx.closePath();
  ctx.fill();
  let offsetTop = ((coneLength / 2) + player.height);
  let offsetBottom = player.height / 2;
  let offset = mapRange(player.altitudeLine, 0, 100, offsetTop, offsetBottom);
  let rad = player.cameraAngle * Math.PI / 180;
  let lineCenterX = centerX + offset * Math.cos(rad);
  let lineCenterY = centerY + offset * Math.sin(rad);
  let lineLength = 100;
  let perpX = -Math.sin(rad);
  let perpY = Math.cos(rad);
  let x1 = lineCenterX - (lineLength / 2) * perpX;
  let y1 = lineCenterY - (lineLength / 2) * perpY;
  let x2 = lineCenterX + (lineLength / 2) * perpX;
  let y2 = lineCenterY + (lineLength / 2) * perpY;
  let t = 1 - (player.altitudeLine / 100);
  let altitudeColor = lerpColor("#FF0000", "#0000FF", t);
  ctx.strokeStyle = altitudeColor;
  ctx.lineWidth = 3;
  if (activeAnimal && isAnimalInsideCone(activeAnimal)) {
    let flashSpeed = mapRange(Math.abs(player.altitudeLine - activeAnimal.altitude), 0, 100, TWEAK.altitudeFlashMaxSpeed, TWEAK.altitudeFlashMinSpeed);
    if (Math.floor(Date.now() / flashSpeed) % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function drawReHitIndicator() {
  if (!player.isJumping) return;
  const progress = player.jumpTimer / player.jumpDuration;
  if (progress >= TWEAK.reHitWindowStart && progress < 1.0) {
    ctx.save();
    ctx.beginPath();
    const radius = (player.baseWidth * TWEAK.reHitIndicatorScale) / 2;
    const cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
    const screenY = canvas.height / 2 + (player.absY - cameraOffset - canvas.height / 2);
    ctx.shadowColor = TWEAK.reHitIndicatorOutlineColor;
    ctx.shadowBlur = 20;
    ctx.lineWidth = 3;
    const pulseScale = 1 + Math.sin(Date.now() / 100) * 0.1;
    ctx.arc(player.x, screenY, radius * pulseScale, 0, Math.PI * 2);
    ctx.fillStyle = TWEAK.reHitIndicatorColor;
    ctx.fill();
    ctx.strokeStyle = TWEAK.reHitIndicatorOutlineColor;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
}

// Function to show sled repaired notice
function showSledRepairedNotice() {
    showStackedNotification('Sled Repaired!', 'success');
}

// The main render function called in gameLoop
function render(floatingTexts, currentState) {
    const resolution = getResolution();
    
    // Clear the entire canvas with the current scale
    ctx.clearRect(0, 0, resolution.width * resolution.scale, resolution.height * resolution.scale);
    
    // Draw all game entities
    drawEntities(currentState);
    
    // Save context state before drawing floating texts
    ctx.save();
    floatingTexts.forEach(text => text.draw(ctx, player.absY - canvas.height / 2));
    ctx.restore();
    
    // Draw any overlay indicators
    drawReHitIndicator();
}

// Export necessary functions
export { 
    render, 
    FloatingText, 
    addFloatingText, 
    showMoneyGain, 
    updateMoneyDisplay, 
    showSledRepairedNotice,
    updateLiveMoney,
    setStartPosition,
    canvas,
    ctx
};
