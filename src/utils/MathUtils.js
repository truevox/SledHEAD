// src/utils/MathUtils.js
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
  }
  
  export function lerpColor(colorA, colorB, t) {
    // Convert hex to RGB and interpolate linearly
    const a = hexToRgb(colorA);
    const b = hexToRgb(colorB);
    const result = {
      r: Math.round(a.r + (b.r - a.r) * t),
      g: Math.round(a.g + (b.g - a.g) * t),
      b: Math.round(a.b + (b.b - a.b) * t)
    };
    return `rgb(${result.r}, ${result.g}, ${result.b})`;
  }
  
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(ch => ch + ch).join('');
    }
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }
  
  export function getCameraOffset(playerAbsY, canvasHeight, mountainHeight) {
    // Center the player vertically on the canvas
    return playerAbsY - canvasHeight / 2;
  }
  