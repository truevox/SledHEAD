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

// Add test suite for vertical layer transitions
describe('Vertical Layer Transitions', () => {
  // Mock player object and layers for testing
  let mockPlayer;
  const mockMountainLayers = [
    { id: 0, startY: 0, endY: 5000, width: 1000, temperature: -10, biome: 'alpine' },
    { id: 1, startY: 5000, endY: 10000, width: 1500, temperature: 0, biome: 'subalpine' },
    { id: 2, startY: 10000, endY: 15000, width: 2000, temperature: 10, biome: 'forest' },
    { id: 3, startY: 15000, endY: 20000, width: 2500, temperature: 20, biome: 'meadow' }
  ];
  
  // Mock implementation of updatePlayerLayer based on the actual function
  function mockUpdatePlayerLayer() {
    const layer = mockMountainLayers.find(layer => 
      mockPlayer.absY >= layer.startY && mockPlayer.absY < layer.endY
    ) || mockMountainLayers[0]; // Default to top layer if out of bounds
    
    if (layer && layer.id !== mockPlayer.currentLayerIndex) {
      const previousLayerIndex = mockPlayer.currentLayerIndex;
      const previousLayer = mockMountainLayers[previousLayerIndex];
      
      // Store the previous layer's width before updating the current layer index
      const previousLayerWidth = previousLayer.width;
      
      // Update to the new layer
      mockPlayer.currentLayerIndex = layer.id;
      
      // Get the new layer's width
      const newLayerWidth = layer.width;
      
      // Calculate the scaling factor (prevent division by zero)
      const scaleFactor = previousLayerWidth > 0 ? newLayerWidth / previousLayerWidth : 1;
      
      // Handle special case: if player is exactly at the right edge, keep them at the right edge
      if (mockPlayer.x === previousLayerWidth) {
        mockPlayer.x = newLayerWidth;
      } else {
        // Scale the player's horizontal position proportionally
        mockPlayer.x = mockPlayer.x * scaleFactor;
        
        // Only apply wrapping if the position is actually out of bounds
        if (mockPlayer.x >= newLayerWidth || mockPlayer.x < 0) {
          mockPlayer.x = ((mockPlayer.x % newLayerWidth) + newLayerWidth) % newLayerWidth;
        }
      }
      
      // Determine transition direction (up or down)
      if (previousLayerIndex > layer.id) {
        // Moving UP to a higher layer (lower index)
        // Place player at the bottom edge of the new higher layer
        mockPlayer.absY = layer.endY - 1;
      } else {
        // Moving DOWN to a lower layer (higher index)
        // Place player at the top edge of the new lower layer
        mockPlayer.absY = layer.startY;
      }
    }
  }
  
  beforeEach(() => {
    // Reset the player object before each test
    mockPlayer = {
      absY: 25000,
      x: 500,
      currentLayerIndex: 0
    };
  });
  
  test('player transitions down correctly when crossing layer boundary', () => {
    // Setup transition down from layer 0 to layer 1
    mockPlayer.currentLayerIndex = 0;
    mockPlayer.absY = 4990;
    
    // Now cross layer boundary
    mockPlayer.absY = 5010;
    mockUpdatePlayerLayer();
    
    // Should have moved to layer 1 and been positioned at its startY
    expect(mockPlayer.currentLayerIndex).toBe(1);
    expect(mockPlayer.absY).toBe(5000);
  });
  
  test('player transitions up correctly when crossing layer boundary', () => {
    // Setup transition up from layer 1 to layer 0
    mockPlayer.currentLayerIndex = 1;
    mockPlayer.absY = 5010;
    
    // Now cross layer boundary upward
    mockPlayer.absY = 4990;
    mockUpdatePlayerLayer();
    
    // Should have moved to layer 0
    expect(mockPlayer.currentLayerIndex).toBe(0);
    expect(mockPlayer.absY).toBe(4999);
  });
  
  test('player transitions through multiple layers correctly', () => {
    // Start in layer 0
    mockPlayer.currentLayerIndex = 0;
    mockPlayer.absY = 2500;
    
    // Jump far down past multiple layers to layer 3
    mockPlayer.absY = 16000;
    mockUpdatePlayerLayer();
    
    // Should have moved to layer 3 and been positioned at its startY
    expect(mockPlayer.currentLayerIndex).toBe(3);
    expect(mockPlayer.absY).toBe(15000);
    
    // Now jump far up to layer 0 (simulating a long jump or teleport)
    mockPlayer.absY = 2500;
    mockUpdatePlayerLayer();
    
    // Should have moved to layer 0 and be positioned at endY - 1 (per the mockUpdatePlayerLayer implementation)
    expect(mockPlayer.currentLayerIndex).toBe(0);
    expect(mockPlayer.absY).toBe(4999);
  });
  
  test('x position is scaled proportionally when moving to a wider layer', () => {
    // Prepare a test player positioned exactly in the middle of layer 0
    mockPlayer.currentLayerIndex = 0;
    mockPlayer.x = 500; // 50% of the layer width (1000)
    mockPlayer.absY = 4990;
    
    // Move to layer 1
    mockPlayer.absY = 5010; 
    mockUpdatePlayerLayer();
    
    // X position should be scaled to maintain the same proportional position
    // 500/1000 = 0.5 (50% of width) => 0.5 * 1500 = 750
    expect(mockPlayer.x).toBe(750);
    
    // Relative position should remain the same (50% of width)
    expect(mockPlayer.x / mockMountainLayers[1].width).toBeCloseTo(0.5, 5);
  });
  
  test('x position is scaled proportionally when moving to a narrower layer', () => {
    // Start in layer 1 (width: 1500)
    mockPlayer.absY = 55000;
    mockPlayer.currentLayerIndex = 1;
    mockPlayer.x = 750; // Center of layer 1 (50% of width)
    
    // Move up to layer 0 (width: 1000)
    mockPlayer.absY = 45000;
    mockUpdatePlayerLayer();
    
    // X position should be scaled to maintain the same proportional position
    // 750/1500 = 0.5 (50% of width) => 0.5 * 1000 = 500
    expect(mockPlayer.x).toBe(500);
    
    // Relative position should remain the same (50% of width)
    expect(mockPlayer.x / mockMountainLayers[0].width).toBeCloseTo(0.5, 5);
  });
  
  test('x position scaling handles edge positions correctly', () => {
    // Test position at the right edge
    mockPlayer.currentLayerIndex = 0;
    mockPlayer.x = 999; // Just inside the right edge of layer 0
    mockPlayer.absY = 4990;
    
    // Move to layer 1
    mockPlayer.absY = 5010;
    mockUpdatePlayerLayer();
    
    // Should be at the right edge of layer 1 (or very close)
    expect(mockPlayer.x).toBeCloseTo(1498.5, 1);
    
    // Test left edge
    mockPlayer.absY = 5010;
    mockPlayer.currentLayerIndex = 1;
    mockPlayer.x = 0; // Left edge
    
    // Move back to layer 0
    mockPlayer.absY = 4990;
    mockUpdatePlayerLayer();
    
    // Should remain at left edge
    expect(mockPlayer.x).toBe(0);
  });
  
  test('x position scaling preserves position when jumping multiple layers', () => {
    // Prepare at 25% of layer 0 width
    mockPlayer.currentLayerIndex = 0;
    mockPlayer.x = 250; // 25% of 1000
    mockPlayer.absY = 4990;
    
    // Jump directly to layer 3 (skipping layers 1-2)
    mockPlayer.absY = 16000;
    mockUpdatePlayerLayer();
    
    // Position should be 25% of layer 3 width (2500 * 0.25 = 625)
    expect(mockPlayer.x).toBeCloseTo(625, 1);
    expect(mockPlayer.x / mockMountainLayers[3].width).toBeCloseTo(0.25, 5);
    
    // Jump back up to layer 0
    mockPlayer.absY = 4000;
    mockUpdatePlayerLayer();
    
    // Should be back to 25% of layer 0 width
    expect(mockPlayer.x).toBeCloseTo(250, 1);
    expect(mockPlayer.x / mockMountainLayers[0].width).toBeCloseTo(0.25, 5);
  });
  
  test('wrapping is applied correctly after scaling', () => {
    // Position the player near the right edge of layer 0
    mockPlayer.currentLayerIndex = 0;
    mockPlayer.x = 950; // 95% of 1000
    mockPlayer.absY = 4990;
    
    // Layer 1 is 1.5x wider than layer 0
    // When we move to layer 1, x should scale to 950 * 1.5 = 1425
    // which is less than layer 1 width (1500)
    
    // Test scaling without wrapping
    mockPlayer.absY = 5010;
    mockUpdatePlayerLayer();
    
    // Should be scaled but not wrapped
    expect(mockPlayer.x).toBeGreaterThanOrEqual(0);
    expect(mockPlayer.x).toBeLessThan(1500);
    expect(mockPlayer.x).toBeCloseTo(1425, 1);
  });
}); 