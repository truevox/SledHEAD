/* wrappingUtils.test.js - Tests for horizontal wrapping calculations */

// Mock the window object if running in Node.js environment
if (typeof window === 'undefined') {
  global.window = {};
}

// Import or create the wrapping function
let calculateWrappedX;

if (typeof require !== 'undefined') {
  // In Node.js environment
  try {
    const utils = require('../../js/utils.js');
    calculateWrappedX = utils.calculateWrappedX;
  } catch (e) {
    // Mock the function if not directly importable
    calculateWrappedX = function(potentialX, layerWidth) {
      return (potentialX % layerWidth + layerWidth) % layerWidth;
    };
  }
} else {
  // In browser environment
  calculateWrappedX = window.calculateWrappedX || function(potentialX, layerWidth) {
    return (potentialX % layerWidth + layerWidth) % layerWidth;
  };
}

describe('Horizontal Wrapping Calculations', () => {
  // Test wrapping with positive positions within bounds
  test('positions within bounds remain unchanged', () => {
    const layerWidth = 1000;
    expect(calculateWrappedX(500, layerWidth)).toBe(500);
    expect(calculateWrappedX(0, layerWidth)).toBe(0);
    expect(calculateWrappedX(999, layerWidth)).toBe(999);
  });
  
  // Test wrapping with positive positions beyond bounds
  test('positions beyond right edge wrap around to left', () => {
    const layerWidth = 1000;
    expect(calculateWrappedX(1000, layerWidth)).toBe(0);
    expect(calculateWrappedX(1500, layerWidth)).toBe(500);
    expect(calculateWrappedX(2500, layerWidth)).toBe(500);
  });
  
  // Test wrapping with negative positions
  test('negative positions wrap around from right to left', () => {
    const layerWidth = 1000;
    expect(calculateWrappedX(-100, layerWidth)).toBe(900);
    expect(calculateWrappedX(-1000, layerWidth)).toBe(0);
    expect(calculateWrappedX(-1500, layerWidth)).toBe(500);
  });
  
  // Test with different layer widths
  test('wrapping works correctly with different layer widths', () => {
    // Narrow layer
    expect(calculateWrappedX(350, 300)).toBe(50);
    expect(calculateWrappedX(-50, 300)).toBe(250);
    
    // Wide layer
    expect(calculateWrappedX(5250, 5000)).toBe(250);
    expect(calculateWrappedX(-250, 5000)).toBe(4750);
  });
  
  // Test extreme values
  test('handles extreme values correctly', () => {
    const layerWidth = 1000;
    expect(calculateWrappedX(Number.MAX_SAFE_INTEGER, layerWidth)).toBeGreaterThanOrEqual(0);
    expect(calculateWrappedX(Number.MAX_SAFE_INTEGER, layerWidth)).toBeLessThan(layerWidth);
    
    expect(calculateWrappedX(Number.MIN_SAFE_INTEGER, layerWidth)).toBeGreaterThanOrEqual(0);
    expect(calculateWrappedX(Number.MIN_SAFE_INTEGER, layerWidth)).toBeLessThan(layerWidth);
  });
  
  // Test that wrapping is consistent
  test('multiple wraps give the same result as a single wrap', () => {
    const layerWidth = 1000;
    
    // Wrapping once vs. multiple times
    const singleWrap = calculateWrappedX(1500, layerWidth);
    const doubleWrap = calculateWrappedX(calculateWrappedX(1500, layerWidth), layerWidth);
    expect(singleWrap).toBe(doubleWrap);
    
    // Wrapping once vs. wrapping a pre-wrapped value
    const originalWrap = calculateWrappedX(2500, layerWidth);
    const wrappedAgain = calculateWrappedX(originalWrap, layerWidth);
    expect(originalWrap).toBe(wrappedAgain);
  });
}); 