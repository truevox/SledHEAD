/* resolution.js - Canvas Resolution and Scaling Management */

let logicalWidth = 800;
let logicalHeight = 600;
let internalScale = 1;

export function initializeCanvas(canvas, ctx) {
    resizeCanvas(canvas, ctx);
    window.addEventListener('resize', () => resizeCanvas(canvas, ctx));
}

export function resizeCanvas(canvas, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = logicalWidth * internalScale;
    const displayHeight = logicalHeight * internalScale;
    
    // Set canvas dimensions taking DPI into account
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    
    // Set display size through CSS
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // Scale the context to handle DPI
    ctx.setTransform(dpr * internalScale, 0, 0, dpr * internalScale, 0, 0);
}

export function setInternalResolution(scale) {
    internalScale = scale;
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    resizeCanvas(canvas, ctx);
}

export function getResolution() {
    return {
        width: logicalWidth,
        height: logicalHeight,
        scale: internalScale,
        dpr: window.devicePixelRatio || 1
    };
}

export function normalizeCoords(x, y, canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return [
        (x - rect.left) * scaleX / dpr,
        (y - rect.top) * scaleY / dpr
    ];
}