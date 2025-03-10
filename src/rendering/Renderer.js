// src/rendering/Renderer.js
import { getCameraOffset, mapRange, lerpColor } from '../utils/MathUtils.js';
import { player } from '../gameplay/Player.js';
import { drawAnimal } from '../gameplay/Wildlife.js';
import Camera from './Camera.js';
import { TWEAK } from '../utils/Constants.js';

// Initialize camera
const camera = new Camera(window.innerHeight, 1000);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Floating text system for in-game notifications
let floatingTexts = [];

/**
 * Adds a floating text notification at the specified position
 * @param {string} text - The text to display
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {object} options - Optional settings (color, size, lifetime)
 */
export function addFloatingText(text, x, y, options = {}) {
  const timestamp = new Date().toISOString();
  
  const defaults = {
    color: '#FFD700', // Gold color by default
    size: 24,
    lifetime: 1500,
    offsetY: -30,
    floatSpeed: 0.08,
    bobAmplitude: 3,
    bobFrequency: 0.005
  };
  
  // Determine notification type for logging
  let notificationType = "STANDARD";
  let notificationEmoji = "💬";
  
  // Special handling for photo rewards
  if (text.includes('📸')) {
    defaults.color = '#00FFFF'; // Cyan for photo rewards
    defaults.size = 28;
    defaults.lifetime = 2000;
    defaults.floatSpeed = 0.06; // Slower float for emphasis
    defaults.bobAmplitude = 5; // More pronounced bobbing
    notificationType = "PHOTO";
    notificationEmoji = "📷";
  } else if (text.includes('+$')) {
    notificationType = "MONEY";
    notificationEmoji = "💰";
  } else if (text.includes('Upgraded')) {
    notificationType = "UPGRADE";
    notificationEmoji = "🔺";
  } else if (text.includes('Not enough')) {
    notificationType = "ERROR";
    notificationEmoji = "⚠️";
  }
  
  const settings = {...defaults, ...options};
  floatingTexts.push(new FloatingText(text, x, y, settings));
  
  console.log(`[${timestamp}] ${notificationEmoji} FLOATING TEXT (${notificationType}): "${text}", Position=(${x.toFixed(0)}, ${y.toFixed(0)}), Duration=${settings.lifetime}ms`);
}

/**
 * FloatingText class for rendering animated text notifications
 */
class FloatingText {
  /**
   * Create a new floating text instance with enhanced visual effects
   * @param {string} text - The text to display
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {object} options - Display options
   */
  constructor(text, x, y, options) {
    // Text content and position
    this.text = text;
    this.x = x;
    this.initialY = y;
    
    // Timing and lifetime
    this.age = 0;
    this.lifetime = options.lifetime || 1500;
    this.spawnTime = Date.now();
    
    // Visual properties
    this.visualOffsetY = options.offsetY || -30;
    this.horizontalOffset = 0;
    this.color = options.color || '#FFD700';
    this.size = options.size || 24;
    this.fontFamily = options.fontFamily || 'Arial';
    this.scale = 0;
    
    // Animation properties
    this.floatSpeed = options.floatSpeed || 0.08;
    this.bobAmplitude = options.bobAmplitude || 3;
    this.bobFrequency = options.bobFrequency || 0.005;
    this.fadeInDuration = 200; // ms
    this.scaleInDuration = 300; // ms
  }

  /**
   * Update the floating text state with enhanced animations
   * @param {number} deltaTime - Time elapsed since last update
   * @returns {boolean} - Whether the text is still active
   */
  update(deltaTime) {
    this.age += deltaTime;
    const timeSinceSpawn = Date.now() - this.spawnTime;
    
    // Pop-in scale animation
    if (timeSinceSpawn < this.scaleInDuration) {
      this.scale = Math.min(1, timeSinceSpawn / this.scaleInDuration);
    } else {
      this.scale = 1;
    }
    
    // Smooth floating motion
    this.visualOffsetY -= deltaTime * this.floatSpeed;
    
    // Gentle horizontal bobbing
    this.horizontalOffset = Math.sin(timeSinceSpawn * this.bobFrequency) * this.bobAmplitude;
    
    return this.age < this.lifetime;
  }

  /**
   * Draw the floating text with enhanced visual effects
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} cameraOffset - Camera Y offset
   */
  draw(ctx, cameraOffset) {
    ctx.save();
    
    // Calculate fade and position
    const timeSinceSpawn = Date.now() - this.spawnTime;
    const fadeInAlpha = Math.min(1, timeSinceSpawn / this.fadeInDuration);
    const fadeOutAlpha = 1 - (this.age / this.lifetime);
    const alpha = fadeInAlpha * fadeOutAlpha;
    
    // Apply scale and position transformations
    const screenY = this.initialY - cameraOffset + this.visualOffsetY;
    const drawX = this.x + this.horizontalOffset;
    
    ctx.translate(drawX, screenY);
    ctx.scale(this.scale, this.scale);
    
    // Set up text style
    ctx.font = `bold ${this.size}px ${this.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Draw outline
    ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.lineWidth = 4;
    ctx.strokeText(this.text, 0, 0);
    
    // Draw text
    ctx.fillStyle = `rgba(${this.hexToRgb(this.color)}, ${alpha})`;
    ctx.fillText(this.text, 0, 0);
    
    ctx.restore();
  }
  
  /**
   * Convert hex color to RGB for alpha blending
   * @param {string} hex - Hex color code
   * @returns {string} - RGB values as string
   */
  hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex values
    let r, g, b;
    if (hex.length === 3) {
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    
    return `${r}, ${g}, ${b}`;
  }
}

/**
 * Draws the re-hit indicator when the player is in the re-hit window
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cameraOffset - Camera Y offset
 */
export function drawReHitIndicator(ctx, cameraOffset) {
  if (!player.isJumping) return;
  
  // Calculate jump progress
  const progress = player.jumpTimer / player.jumpDuration;
  
  // Only draw indicator during re-hit window
  if (progress >= TWEAK.reHitWindowStart && progress < 1.0) {
    // Draw indicator above all other elements
    ctx.save();
    ctx.beginPath();
    
    // Calculate indicator size and position
    const radius = (player.baseWidth * TWEAK.reHitIndicatorScale) / 2;
    const indicatorY = player.absY - cameraOffset + player.height;
    
    // Add glow effect
    ctx.shadowColor = TWEAK.reHitIndicatorOutlineColor;
    ctx.shadowBlur = 15;
    ctx.globalCompositeOperation = 'source-over';
    
    // Add pulse animation
    const pulseScale = 1 + Math.sin(Date.now() / 100) * 0.1;
    ctx.arc(player.x, indicatorY, radius * pulseScale, 0, Math.PI * 2);
    
    // Fill and stroke
    ctx.fillStyle = TWEAK.reHitIndicatorColor;
    ctx.fill();
    ctx.strokeStyle = TWEAK.reHitIndicatorOutlineColor;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
}

export function drawEntities(terrain = []) {
  camera.update(player.absY);
let cameraOffset = camera.getOffset();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = (window.currentState === 'DOWNHILL') ? "#ADD8E6" : "#98FB98";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw terrain obstacles
  ctx.fillStyle = "#808080";
  for (const obstacle of terrain) {
    // Only draw obstacles within view range
    if (obstacle.y >= cameraOffset - 50 && obstacle.y <= cameraOffset + canvas.height + 50) {
      ctx.fillRect(obstacle.x, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
    }
  }

  ctx.save();
  let playerDrawY = player.absY - cameraOffset;
  if (player.currentTrick) {
    if (player.currentTrick === "leftHelicopter" || player.currentTrick === "rightHelicopter") {
      ctx.translate(player.x, playerDrawY);
      ctx.rotate(player.trickRotation * Math.PI / 180);
      ctx.translate(-player.x, -playerDrawY);
    } else if (player.currentTrick === "airBrake" || player.currentTrick === "parachute") {
      if (player.currentTrick === "airBrake") {
        playerDrawY += player.trickOffset;
      } else {
        playerDrawY -= player.trickOffset;
      }
    }
  }
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(player.x - player.width / 2, playerDrawY - player.height / 2, player.width, player.height);
  if (player.currentTrick === "airBrake" || player.currentTrick === "parachute") {
    ctx.fillStyle = "#FFFF00";
    ctx.beginPath();
    ctx.arc(player.x, playerDrawY - player.trickOffset, player.width / 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Draw camera overlay with POV cone and dynamic altitude line
  camera.drawCameraOverlay(ctx);
  drawAnimal(ctx);

  // Draw floating texts on canvas with proper delta time
  floatingTexts = floatingTexts.filter(ft => {
    const result = ft.update(16.67); // ~60fps, but ideally use actual deltaTime
    ft.draw(ctx, cameraOffset);
    return result; // Return value from update determines if text should remain active
  });
  
  // Draw re-hit indicator if player is in re-hit window
  drawReHitIndicator(ctx, cameraOffset);
}

export function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
