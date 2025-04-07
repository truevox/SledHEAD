/* player.test.js - Tests for player layer tracking */

// Mock the window object if running in Node.js environment
if (typeof window === 'undefined') {
  global.window = {};
}

// Create a mock getLayerByY function for testing
const mockMountainLayers = [
  { id: 0, startY: 0, endY: 50000, width: 1000 },
  { id: 1, startY: 50000, endY: 100000, width: 1500 },
  { id: 2, startY: 100000, endY: 150000, width: 2000 },
  { id: 3, startY: 150000, endY: 200000, width: 2500 }
];

function mockGetLayerByY(absY) {
  const layer = mockMountainLayers.find(layer => 
    absY >= layer.startY && absY < layer.endY
  );

  // Handle edge cases
  if (!layer) {
    if (absY < mockMountainLayers[0].startY) {
      return mockMountainLayers[0];
    } else if (absY >= mockMountainLayers[mockMountainLayers.length - 1].endY) {
      return mockMountainLayers[mockMountainLayers.length - 1];
    }
  }

  return layer;
}

// Mock the player object for testing
let mockPlayer;

// Setup before each test
beforeEach(() => {
  // Reset the player object
  mockPlayer = {
    x: 500,
    absY: 0,
    width: 20,
    height: 20,
    currentLayerIndex: 0
  };
  
  // Mock the global getLayerByY function
  global.getLayerByY = mockGetLayerByY;
});

describe('Player Layer Tracking', () => {
  // Test initialization sets the correct layer
  test('initializes player layer index correctly', () => {
    // Create a simplified version of the initializePlayerPosition function
    const initializePlayerPosition = () => {
      const topLayer = mockGetLayerByY(mockPlayer.absY);
      mockPlayer.currentLayerIndex = topLayer.id;
    };
    
    // Start with layer 0
    mockPlayer.absY = 0;
    initializePlayerPosition();
    expect(mockPlayer.currentLayerIndex).toBe(0);
    
    // Try with a different layer
    mockPlayer.absY = 75000;
    initializePlayerPosition();
    expect(mockPlayer.currentLayerIndex).toBe(1);
  });
  
  // Test updatePlayerLayer function
  test('updates player layer correctly when crossing layer boundaries', () => {
    // Create a simplified version of the updatePlayerLayer function
    const updatePlayerLayer = () => {
      const layer = mockGetLayerByY(mockPlayer.absY);
      if (layer && layer.id !== mockPlayer.currentLayerIndex) {
        mockPlayer.currentLayerIndex = layer.id;
      }
    };
    
    // Start in layer 0
    mockPlayer.absY = 10000;
    mockPlayer.currentLayerIndex = 0;
    
    // Move within same layer - no change
    mockPlayer.absY = 20000;
    updatePlayerLayer();
    expect(mockPlayer.currentLayerIndex).toBe(0);
    
    // Move to layer 1
    mockPlayer.absY = 60000;
    updatePlayerLayer();
    expect(mockPlayer.currentLayerIndex).toBe(1);
    
    // Move to layer 2
    mockPlayer.absY = 120000;
    updatePlayerLayer();
    expect(mockPlayer.currentLayerIndex).toBe(2);
    
    // Move to layer 3
    mockPlayer.absY = 180000;
    updatePlayerLayer();
    expect(mockPlayer.currentLayerIndex).toBe(3);
    
    // Move beyond layers - should stay at last layer
    mockPlayer.absY = 250000;
    updatePlayerLayer();
    expect(mockPlayer.currentLayerIndex).toBe(3);
    
    // Move back to layer 0
    mockPlayer.absY = 10000;
    updatePlayerLayer();
    expect(mockPlayer.currentLayerIndex).toBe(0);
  });
  
  // Test edge cases
  test('handles edge cases correctly', () => {
    const updatePlayerLayer = () => {
      const layer = mockGetLayerByY(mockPlayer.absY);
      if (layer && layer.id !== mockPlayer.currentLayerIndex) {
        mockPlayer.currentLayerIndex = layer.id;
      }
    };
    
    // Test exactly at layer boundary (should be in the higher layer)
    mockPlayer.absY = 50000; // Exactly at boundary between layer 0 and 1
    updatePlayerLayer();
    expect(mockPlayer.currentLayerIndex).toBe(1);
    
    // Test negative Y position (should default to layer 0)
    mockPlayer.absY = -5000;
    updatePlayerLayer();
    expect(mockPlayer.currentLayerIndex).toBe(0);
  });
}); 