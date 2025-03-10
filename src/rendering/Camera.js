// src/rendering/Camera.js
import { player } from '../gameplay/Player.js';
import { activeAnimal, isAnimalInsideCone } from '../gameplay/Wildlife.js';
import { mapRange, lerpColor, getCameraOffset } from '../utils/MathUtils.js';

export default class Camera {
  constructor(canvasHeight, mountainHeight) {
    this.canvasHeight = canvasHeight;
    this.mountainHeight = mountainHeight;
    this.offset = 0;
    this.zoom = 1;
    
    // Flash effect properties
    this.lastFlashTime = 0;
    this.baseFlashSpeed = 200; // Base flash speed in ms
    this.minFlashSpeed = 100; // Flash speed when perfectly aligned
    this.maxFlashSpeed = 500; // Flash speed when poorly aligned
    this.baseFlashAlpha = 0.4; // Base alpha for the POV cone
    this.flashIntensity = 0.3; // How much the flash affects alpha
    
    // Altitude line properties
    this.altitudeLineWidth = 4;
    this.altitudeLineGlow = 10;
    this.altitudeColors = {
      low: '#FF0000',    // Red for low altitude
      mid: '#FFFF00',    // Yellow for mid altitude
      high: '#0088FF'    // Blue for high altitude
    };
    
    // Animation properties
    this.pulseSpeed = 0.003;
    this.pulseIntensity = 0.2;
  }

  update(playerAbsY) {
    this.offset = getCameraOffset(playerAbsY, this.canvasHeight, this.mountainHeight);
  }

  getOffset() {
    return this.offset;
  }

  /**
   * Draw the camera overlay including POV cone and altitude line
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
   */
  /**
   * Draw the camera overlay with enhanced visual effects
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
   */
  drawCameraOverlay(ctx) {
    const cameraOffset = this.getOffset();
    const playerScreenY = player.absY - cameraOffset;
    const now = Date.now();
    
    ctx.save();
    ctx.translate(player.x, playerScreenY);
    ctx.rotate((player.cameraAngle - 90) * Math.PI / 180);

    // Calculate cone properties
    const coneLength = this.canvasHeight;
    const coneAngle = 60; // degrees
    const coneWidth = Math.tan(coneAngle * Math.PI / 360) * coneLength;

    // Draw cone with dynamic opacity
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-coneWidth, -coneLength);
    ctx.lineTo(coneWidth, -coneLength);
    ctx.closePath();

    // Handle cone flashing when animal is in view
    let coneAlpha = this.baseFlashAlpha;
    let isAnimalInView = false;
    
    if (activeAnimal && isAnimalInsideCone(activeAnimal)) {
      // Check if this is the first detection (state transition)
      if (!this._lastAnimalInView) {
        const timestamp = new Date().toISOString();
        const animalEmoji = activeAnimal.type === "bear" ? "🐻" : "🐦";
        const altitudeDiff = Math.abs(player.altitudeLine - activeAnimal.altitude);
        
        console.log(`[${timestamp}] 📷 CAMERA: ${animalEmoji} ${activeAnimal.type} detected in camera view, Altitude difference=${altitudeDiff.toFixed(1)}`);
      }
      
      isAnimalInView = true;
      const altitudeDiff = Math.abs(player.altitudeLine - activeAnimal.altitude);
      
      // Flash speed varies with altitude difference
      const flashSpeed = mapRange(
        altitudeDiff,
        0, 100,
        this.minFlashSpeed,
        this.maxFlashSpeed
      );
      
      // Create smooth flash effect
      coneAlpha = this.baseFlashAlpha + 
        this.flashIntensity * Math.sin(now * (Math.PI / flashSpeed));
    }
    
    // Store state for next frame to detect transitions
    this._lastAnimalInView = isAnimalInView;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${coneAlpha})`;
    ctx.fill();

    // Draw enhanced altitude line
    const altitudePercent = player.altitudeLine / 100;
    const altitudeOffset = mapRange(altitudePercent, 0, 1, -coneLength, 0);
    const lineWidth = coneWidth * 1.5;
    
    // Calculate multi-stage color gradient
    let altitudeColor;
    if (altitudePercent <= 0.5) {
      altitudeColor = lerpColor(
        this.altitudeColors.low,
        this.altitudeColors.mid,
        altitudePercent * 2
      );
    } else {
      altitudeColor = lerpColor(
        this.altitudeColors.mid,
        this.altitudeColors.high,
        (altitudePercent - 0.5) * 2
      );
    }
    
    // Add pulsing effect to the line
    const basePulse = Math.sin(now * this.pulseSpeed);
    const pulseScale = 1 + (isAnimalInView ? this.pulseIntensity * basePulse : 0);
    
    // Draw the altitude line with glow effect
    ctx.beginPath();
    ctx.moveTo(-lineWidth/2, altitudeOffset);
    ctx.lineTo(lineWidth/2, altitudeOffset);
    
    // Add glow effect
    ctx.shadowColor = altitudeColor;
    ctx.shadowBlur = this.altitudeLineGlow * pulseScale;
    ctx.strokeStyle = altitudeColor;
    ctx.lineWidth = this.altitudeLineWidth * pulseScale;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw center marker
    const markerSize = 6 * pulseScale;
    ctx.beginPath();
    ctx.arc(0, altitudeOffset, markerSize, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}