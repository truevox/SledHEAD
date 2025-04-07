/* mountainLayers.test.js - Tests for mountain layer configuration */

// Mock the window object if running in Node.js environment
if (typeof window === 'undefined') {
  global.window = {};
}

// Import the module directly if in Node.js environment, or assume it's already loaded in browser
let mountainLayers, getLayerByY, scaleXPositionBetweenLayers;

if (typeof require !== 'undefined') {
  const mountainLayersModule = require('../../js/mountainLayers.js');
  mountainLayers = mountainLayersModule.mountainLayers;
  getLayerByY = mountainLayersModule.getLayerByY;
  scaleXPositionBetweenLayers = mountainLayersModule.scaleXPositionBetweenLayers;
} else {
  // In browser environment
  mountainLayers = window.mountainLayers;
  getLayerByY = window.getLayerByY;
  scaleXPositionBetweenLayers = window.scaleXPositionBetweenLayers;
}

// Test suite for mountainLayers
describe('Mountain Layers', () => {
  // Test that the mountain layers are defined and have the expected structure
  test('mountain layers are defined with correct structure', () => {
    expect(mountainLayers).toBeDefined();
    expect(Array.isArray(mountainLayers)).toBe(true);
    expect(mountainLayers.length).toBeGreaterThan(0);
    
    mountainLayers.forEach(layer => {
      expect(layer).toHaveProperty('id');
      expect(layer).toHaveProperty('startY');
      expect(layer).toHaveProperty('endY');
      expect(layer).toHaveProperty('width');
      expect(layer.startY).toBeLessThan(layer.endY);
    });
  });

  // Test that layers have decreasing width as Y increases (mountain gets narrower at higher elevations)
  test('mountain layers have decreasing width as Y decreases (higher elevation)', () => {
    for (let i = 0; i < mountainLayers.length - 1; i++) {
      expect(mountainLayers[i].width).toBeLessThan(mountainLayers[i + 1].width);
    }
  });

  // Test suite for getLayerByY function
  describe('getLayerByY', () => {
    // Test that getLayerByY returns the correct layer for a point within a layer
    test('returns correct layer for Y coordinate within layer bounds', () => {
      mountainLayers.forEach(layer => {
        const midPoint = (layer.startY + layer.endY) / 2;
        const result = getLayerByY(midPoint);
        expect(result).toBe(layer);
      });
    });

    // Test that getLayerByY handles Y at the exact start of a layer
    test('returns correct layer for Y at the exact start of a layer', () => {
      mountainLayers.forEach(layer => {
        const result = getLayerByY(layer.startY);
        expect(result).toBe(layer);
      });
    });

    // Test that getLayerByY handles Y at the exact end of a layer
    test('returns correct layer for Y at the exact end of a layer', () => {
      for (let i = 0; i < mountainLayers.length - 1; i++) {
        const result = getLayerByY(mountainLayers[i].endY);
        expect(result).toBe(mountainLayers[i + 1]);
      }
    });

    // Test that getLayerByY handles Y below the first layer (above the mountain)
    test('returns first layer for Y below the first layer (above the mountain)', () => {
      const result = getLayerByY(mountainLayers[0].startY - 1000);
      expect(result).toBe(mountainLayers[0]);
    });

    // Test that getLayerByY handles Y beyond the last layer (below the mountain)
    test('returns last layer for Y beyond the last layer (below the mountain)', () => {
      const lastLayer = mountainLayers[mountainLayers.length - 1];
      const result = getLayerByY(lastLayer.endY + 1000);
      expect(result).toBe(lastLayer);
    });
  });

  // Test suite for scaleXPositionBetweenLayers function
  describe('scaleXPositionBetweenLayers', () => {
    // Test that X position is scaled correctly when moving between layers
    test('correctly scales X position when moving between layers', () => {
      const currentX = 500;
      const sourceLayer = { width: 1000 };
      const targetLayer = { width: 2000 };
      
      const result = scaleXPositionBetweenLayers(currentX, sourceLayer, targetLayer);
      expect(result).toBe(1000); // 500 * (2000/1000) = 1000
    });

    // Test that X position is scaled correctly when moving from wider to narrower layer
    test('correctly scales X position when moving from wider to narrower layer', () => {
      const currentX = 1000;
      const sourceLayer = { width: 2000 };
      const targetLayer = { width: 1000 };
      
      const result = scaleXPositionBetweenLayers(currentX, sourceLayer, targetLayer);
      expect(result).toBe(500); // 1000 * (1000/2000) = 500
    });
  });
}); 