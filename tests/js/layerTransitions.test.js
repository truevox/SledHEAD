/* layerTransitions.test.js - Tests for layer transition calculations */

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

// Test suite for layer transitions
describe('Layer Transitions', () => {
  // Test that X positions scale correctly when moving between layers
  test('X position scales proportionally when moving from narrower to wider layer', () => {
    // Get two adjacent layers
    const upperLayer = mountainLayers[0]; // Top layer (narrower)
    const lowerLayer = mountainLayers[1]; // Layer below (wider)
    
    // Position at 75% of upper layer width
    const xPositionUpper = upperLayer.width * 0.75;
    
    // Calculate expected position in lower layer (should maintain 75% position)
    const expectedPositionLower = lowerLayer.width * 0.75;
    
    // Test the scaling function
    const scaledPosition = scaleXPositionBetweenLayers(xPositionUpper, upperLayer, lowerLayer);
    expect(scaledPosition).toBeCloseTo(expectedPositionLower, 1);
  });
  
  test('X position scales proportionally when moving from wider to narrower layer', () => {
    // Get two adjacent layers
    const lowerLayer = mountainLayers[1]; // Lower layer (wider)
    const upperLayer = mountainLayers[0]; // Layer above (narrower)
    
    // Position at center of lower layer
    const xPositionLower = lowerLayer.width * 0.5;
    
    // Calculate expected position in upper layer (should maintain the proportional position)
    const expectedPositionUpper = upperLayer.width * 0.5;
    
    // Test the scaling function
    const scaledPosition = scaleXPositionBetweenLayers(xPositionLower, lowerLayer, upperLayer);
    expect(scaledPosition).toBeCloseTo(expectedPositionUpper, 1);
  });
  
  test('Entity at rightmost edge of a layer scales properly', () => {
    // Get two adjacent layers
    const upperLayer = mountainLayers[0];
    const lowerLayer = mountainLayers[1];
    
    // Position at the right edge of upper layer
    const xPositionUpper = upperLayer.width;
    
    // Calculate expected position in lower layer (should be at right edge)
    const expectedPositionLower = lowerLayer.width;
    
    // Test the scaling function
    const scaledPosition = scaleXPositionBetweenLayers(xPositionUpper, upperLayer, lowerLayer);
    expect(scaledPosition).toBeCloseTo(expectedPositionLower, 1);
  });
  
  test('Entity at leftmost edge of a layer scales properly', () => {
    // Get two adjacent layers
    const upperLayer = mountainLayers[0];
    const lowerLayer = mountainLayers[1];
    
    // Position at the left edge of upper layer
    const xPositionUpper = 0;
    
    // Calculate expected position in lower layer (should be at left edge)
    const expectedPositionLower = 0;
    
    // Test the scaling function
    const scaledPosition = scaleXPositionBetweenLayers(xPositionUpper, upperLayer, lowerLayer);
    expect(scaledPosition).toBeCloseTo(expectedPositionLower, 1);
  });
  
  // Test that entities stay positioned correctly relative to the layer width
  test('Entity positioned proportionally in each layer', () => {
    // Check that an entity at 25% of each layer's width is at different absolute X positions
    const positions = mountainLayers.map(layer => {
      return layer.width * 0.25; // 25% of each layer's width
    });
    
    // Each position should be different due to different layer widths
    for (let i = 0; i < positions.length - 1; i++) {
      expect(positions[i]).not.toEqual(positions[i + 1]);
    }
    
    // But when scaled between layers, they should maintain the same proportional position
    for (let i = 0; i < mountainLayers.length - 1; i++) {
      const sourceLayer = mountainLayers[i];
      const targetLayer = mountainLayers[i + 1];
      const sourcePosition = sourceLayer.width * 0.25;
      const scaledPosition = scaleXPositionBetweenLayers(sourcePosition, sourceLayer, targetLayer);
      expect(scaledPosition / targetLayer.width).toBeCloseTo(0.25, 5);
    }
  });
}); 