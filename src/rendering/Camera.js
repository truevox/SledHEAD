export class Camera {
    constructor(scene) {
        this.scene = scene;
        this.angle = 270; // Default camera angle (pointing up)
        this.altitudeLine = 50; // Default altitude line position (50%)
        this.povCone = null; // Visual representation of camera view
        this.altitudeIndicator = null; // Visual representation of altitude line
        
        this.createVisuals();
    }

    createVisuals() {
        // Create POV cone graphics
        this.povCone = this.scene.add.graphics();
        
        // Create altitude line graphics
        this.altitudeIndicator = this.scene.add.graphics();
        
        // Update visuals
        this.updateVisuals();
    }

    updateVisuals() {
        // Clear previous graphics
        this.povCone.clear();
        this.altitudeIndicator.clear();
        
        // Get player position
        const player = this.scene.player;
        const centerX = player.x;
        const centerY = player.y;
        
        // Draw POV cone
        const coneLength = 300;
        const povAngle = this.getPOVAngle();
        const leftAngle = (this.angle - povAngle / 2) * (Math.PI / 180);
        const rightAngle = (this.angle + povAngle / 2) * (Math.PI / 180);
        
        this.povCone.fillStyle(0xFFFF00, 0.2);
        this.povCone.beginPath();
        this.povCone.moveTo(centerX, centerY);
        this.povCone.lineTo(
            centerX + coneLength * Math.cos(leftAngle),
            centerY + coneLength * Math.sin(leftAngle)
        );
        this.povCone.lineTo(
            centerX + coneLength * Math.cos(rightAngle),
            centerY + coneLength * Math.sin(rightAngle)
        );
        this.povCone.closePath();
        this.povCone.fill();
        
        // Draw altitude line
        const offsetTop = ((coneLength / 2) + player.height);
        const offsetBottom = player.height / 2;
        const offset = this.mapRange(this.altitudeLine, 0, 100, offsetTop, offsetBottom);
        
        const rad = this.angle * Math.PI / 180;
        const lineCenterX = centerX + offset * Math.cos(rad);
        const lineCenterY = centerY + offset * Math.sin(rad);
        
        const lineLength = 100;
        const perpX = -Math.sin(rad);
        const perpY = Math.cos(rad);
        
        const x1 = lineCenterX - (lineLength / 2) * perpX;
        const y1 = lineCenterY - (lineLength / 2) * perpY;
        const x2 = lineCenterX + (lineLength / 2) * perpX;
        const y2 = lineCenterY + (lineLength / 2) * perpY;
        
        // Color gradient based on altitude
        const t = 1 - (this.altitudeLine / 100);
        const color = this.lerpColor(0xFF0000, 0x0000FF, t);
        
        this.altitudeIndicator.lineStyle(3, color);
        this.altitudeIndicator.beginPath();
        this.altitudeIndicator.moveTo(x1, y1);
        this.altitudeIndicator.lineTo(x2, y2);
        this.altitudeIndicator.strokePath();
    }

    adjustAngle(delta) {
        this.angle = (this.angle + delta + 360) % 360;
        this.updateVisuals();
    }

    adjustAltitudeLine(delta) {
        this.altitudeLine = Math.max(0, Math.min(100, this.altitudeLine + delta));
        this.updateVisuals();
    }

    getAngle() {
        return this.angle;
    }

    getAltitudeLine() {
        return this.altitudeLine;
    }

    getPOVAngle() {
        const baseAngle = 30; // Base POV angle
        const opticsLevel = this.scene.player.upgrades?.optimalOptics || 0;
        const opticsBonus = opticsLevel * 5; // 5 degrees per level
        return baseAngle + opticsBonus;
    }

    // Utility function to map a value from one range to another
    mapRange(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    // Utility function to interpolate between two colors
    lerpColor(color1, color2, t) {
        const r1 = (color1 >> 16) & 255;
        const g1 = (color1 >> 8) & 255;
        const b1 = color1 & 255;
        
        const r2 = (color2 >> 16) & 255;
        const g2 = (color2 >> 8) & 255;
        const b2 = color2 & 255;
        
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        
        return (r << 16) | (g << 8) | b;
    }
}