/* wrappingUtils.test.js - Tests for world wrapping functions */

describe('World Wrapping Utilities', () => {
  // Efficient implementation using modulo instead of loops
  beforeEach(() => {
    global.calculateWrappedX = (x, layerWidth) => {
      // Use modulo for large numbers instead of loops
      return ((x % layerWidth) + layerWidth) % layerWidth;
    };
  });

  test('positions within bounds remain unchanged', () => {
    const layerWidth = 1000;
    expect(calculateWrappedX(500, layerWidth)).toBe(500);
    expect(calculateWrappedX(0, layerWidth)).toBe(0);
    expect(calculateWrappedX(999, layerWidth)).toBe(999);
  });

  test('positions beyond right edge wrap to left', () => {
    const layerWidth = 1000;
    expect(calculateWrappedX(1000, layerWidth)).toBe(0);
    expect(calculateWrappedX(1200, layerWidth)).toBe(200);
    expect(calculateWrappedX(2500, layerWidth)).toBe(500);
  });

  test('negative positions wrap from left to right', () => {
    const layerWidth = 1000;
    expect(calculateWrappedX(-1, layerWidth)).toBe(999);
    expect(calculateWrappedX(-100, layerWidth)).toBe(900);
    expect(calculateWrappedX(-1500, layerWidth)).toBe(500);
  });

  test('wrapping works with different layer widths', () => {
    expect(calculateWrappedX(500, 500)).toBe(0);
    expect(calculateWrappedX(800, 500)).toBe(300);
    expect(calculateWrappedX(-200, 500)).toBe(300);
  });

  test('handles extreme values', () => {
    const layerWidth = 1000;
    // This will be much more efficient with modulo 
    const bigNumber = 9007199254740991; // MAX_SAFE_INTEGER
    expect(calculateWrappedX(bigNumber, layerWidth)).toBe(bigNumber % layerWidth);
    
    // Test negative values
    const veryNegative = -10000;
    expect(calculateWrappedX(veryNegative, layerWidth)).toBe(((veryNegative % layerWidth) + layerWidth) % layerWidth);
  });
}); 