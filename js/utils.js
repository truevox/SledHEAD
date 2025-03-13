// Utility functions for SledHEAD

// Configure canvas contexts to always use willReadFrequently
function configureCanvasContext() {
    // Store the original getContext function
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    
    // Override getContext to always include willReadFrequently
    HTMLCanvasElement.prototype.getContext = function(contextType, contextAttributes = {}) {
        if (contextType === '2d') {
            contextAttributes.willReadFrequently = true;
        }
        return originalGetContext.call(this, contextType, contextAttributes);
    };

    // Also patch any existing canvases
    const existingCanvases = document.getElementsByTagName('canvas');
    Array.from(existingCanvases).forEach(canvas => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        // Force a context reset if it exists
        if (ctx) {
            const imageData = ctx.getImageData(0, 0, canvas.width || 1, canvas.height || 1);
            ctx.putImageData(imageData, 0, 0);
        }
    });
}

// Configure Phaser's canvas creation
function configurePhaserCanvas() {
    if (typeof Phaser !== 'undefined') {
        // Patch Phaser's canvas creation if available
        const originalCreateCanvas = Phaser.Display.Canvas.CanvasPool.create;
        Phaser.Display.Canvas.CanvasPool.create = function(parent, width, height) {
            const canvas = originalCreateCanvas.call(this, parent, width, height);
            canvas.getContext('2d', { willReadFrequently: true });
            return canvas;
        };
    }
}

// Call configuration functions immediately
configureCanvasContext();
configurePhaserCanvas();

// Calculate reward from trick, considering combo multiplier
function calculateTrickReward(trickType, comboCount = 0) {
    const baseReward = CONSTANTS.TRICK_REWARDS[trickType] || 0;
    const comboMultiplier = comboCount > 0 ? Math.pow(CONSTANTS.TRICK_COMBO_MULTIPLIER, Math.min(comboCount, 5)) : 1;
    return Math.floor(baseReward * comboMultiplier);
}

// Calculate photo score and reward
function calculatePhotoScore(centeringFactor, altitudeMatchFactor, isAnimalMoving, repeatCount) {
    let score = CONSTANTS.PHOTO_BASE_REWARD;
    
    // Add centering bonus (0-1 factor)
    score += CONSTANTS.PHOTO_CENTER_BONUS * centeringFactor;
    
    // Add altitude matching bonus (0-1 factor)
    score += CONSTANTS.PHOTO_ALTITUDE_BONUS * altitudeMatchFactor;
    
    // Add moving bonus if applicable
    if (isAnimalMoving) {
        score += CONSTANTS.PHOTO_MOVING_BONUS;
    }
    
    // Apply repeat penalty if this animal was photographed before
    if (repeatCount > 0) {
        score *= Math.pow(CONSTANTS.PHOTO_REPEAT_PENALTY, repeatCount);
    }
    
    return Math.floor(score);
}

// Format money with $ and commas
function formatMoney(amount) {
    return '$' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Generate terrain based on perlin noise
function generateTerrain(width, height, scene) {
    // The graphics object to draw the terrain
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    
    // Array to store ground data for collision
    const groundData = [];
    
    // Seed for perlin noise
    const seed = Math.random();
    
    // Generate terrain points using perlin noise
    for (let x = 0; x < width; x += 20) {
        const y = height / 2 + Math.sin(x / 200) * 100 + Math.sin(x / 50) * 50;
        groundData.push({ x, y });
    }
    
    // Draw terrain
    graphics.beginPath();
    graphics.moveTo(0, height);
    
    groundData.forEach(point => {
        graphics.lineTo(point.x, point.y);
    });
    
    graphics.lineTo(width, height);
    graphics.closePath();
    graphics.fill();
    
    return { graphics, groundData };
}

// Other utility functions can be added below...