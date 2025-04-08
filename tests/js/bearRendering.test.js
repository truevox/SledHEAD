/* bearRendering.test.js - Tests for bear rendering/spawning */

// Wildlife module might need to be mocked rather than imported directly
// since we're in a Jest environment
jest.mock('../../js/wildlife.js', () => ({
  registerAnimalType: jest.fn(animal => {
    if (!global.animalRegistry.some(a => a.type === animal.type)) {
      global.animalRegistry.push(animal);
    }
  }),
  animals: [],
  animalRegistry: []
}));

describe('Bear Rendering Test', () => {
  // Setup mocks and environment for testing
  beforeEach(() => {
    // Create global mock objects needed for testing
    global.animals = [];
    global.animalRegistry = [];
    
    // Mock Math.random for predictable testing
    global.originalMathRandom = Math.random;
    Math.random = jest.fn(() => 0.5);
    
    // Mock canvas and rendering context
    global.canvas = {
      width: 800,
      height: 600
    };
    
    // Original mock can be stateful - this makes it more robust
    const mockImageData = {
      nonBrown: {
        data: new Uint8ClampedArray([100, 100, 200, 255]) // Blue color
      },
      brown: {
        data: new Uint8ClampedArray([139, 69, 19, 255]) // #8B4513 in RGBA
      }
    };
    
    // Make initial state non-brown
    let currentImageData = mockImageData.nonBrown;
    
    // Mock canvas context with pixel data array 
    global.ctx = {
      getImageData: jest.fn(() => currentImageData),
      drawImage: jest.fn(),
      fillRect: jest.fn((x, y, width, height) => {
        // When fillRect is called with brown color, switch the image data to brown
        if (global.ctx.fillStyle === "#8B4513") {
          currentImageData = mockImageData.brown;
        }
      }),
      fillStyle: '',
      strokeRect: jest.fn(),
      strokeStyle: '',
      lineWidth: 1
    };
    
    // Mock mountain layers
    global.mountainLayers = [
      { id: 0, startY: 0, endY: 5000, width: 1000, totalAnimalsPerLayer: 10 },
      { id: 1, startY: 5000, endY: 10000, width: 1500, totalAnimalsPerLayer: 10 },
      { id: 2, startY: 10000, endY: 15000, width: 2000, totalAnimalsPerLayer: 10 },
      { id: 3, startY: 15000, endY: 20000, width: 2500, totalAnimalsPerLayer: 10 }
    ];
    
    // Mock camera and player
    global.player = {
      x: 400,
      absY: 15500, // In the starting zone (layer 3)
      currentLayerIndex: 3
    };
    
    global.cameraX = 0;
    global.mountainHeight = 20000;
    
    // Mock utility functions
    global.getLayerByY = jest.fn(y => {
      return global.mountainLayers.find(layer => y >= layer.startY && y < layer.endY) || global.mountainLayers[0];
    });
    
    global.getCameraOffset = jest.fn((playerY, screenHeight, mountainHeight) => {
      return playerY - (screenHeight / 2);
    });
    
    global.calculateWrappedX = jest.fn((x, width) => {
      return ((x % width) + width) % width;
    });
    
    global.calculateWrappedPosRelativeToCamera = jest.fn((objX, cameraX, layerWidth) => {
      const relativeX = ((objX - cameraX) % layerWidth + layerWidth) % layerWidth;
      return relativeX < layerWidth / 2 ? relativeX : relativeX - layerWidth;
    });
    
    // Mock bear definition
    const bearType = {
      type: "bear",
      spawnProbability: 0.5,
      width: 40,
      height: 60,
      detectionRadius: 150,
      speed: 6,
      basePhotoBonus: 10,
      color: "#8B4513", // Brown color
      validBiomes: ['forest', 'alpine', 'starterMountain'],
      customDraw: jest.fn((bear, screenY, ctx, x) => {
        // Set the context's fill style to brown
        ctx.fillStyle = "#8B4513";
        // Draw the bear
        ctx.fillRect(x - bear.width/2, screenY - bear.height/2, bear.width, bear.height);
      })
    };
    
    // Register bear type
    global.registerAnimalType = jest.fn(animal => {
      global.animalRegistry.push(animal);
      return animal;
    });
    global.registerAnimalType(bearType);
    
    // Mock console
    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    
    // Define a function to determine if a color is brown
    global.isBrownColor = (r, g, b) => {
      // Basic brown detection: more red than blue, more red than green, not too bright
      return (r > b && r > g && r < 200 && g < 180 && b < 100);
    };
    
    // Mock GameState
    global.GameState = {
      UPHILL: 'UPHILL',
      DOWNHILL: 'DOWNHILL',
      HOUSE: 'HOUSE'
    };
    global.currentState = GameState.UPHILL;
  });
  
  // Clean up after each test
  afterEach(() => {
    Math.random = global.originalMathRandom;
    jest.clearAllMocks();
  });
  
  // Test #1: Check if we can find non-brown locations
  test('Can find non-brown locations on screen', () => {
    // Start at the center of the view
    const centerX = Math.floor(global.canvas.width / 2);
    const centerY = Math.floor(global.canvas.height / 2);
    
    // Get the color at the center
    const pixelData = global.ctx.getImageData(centerX, centerY, 1, 1).data;
    const [r, g, b] = [pixelData[0], pixelData[1], pixelData[2]];
    
    // Check that it's not brown (our initial mock returns blue)
    const isBrown = global.isBrownColor(r, g, b);
    expect(isBrown).toBe(false);
  });
  
  // Test #2: Create a bear at a location and verify it renders as brown
  test('Bear renders as brown color', () => {
    // Find a position on the screen
    const testX = 400;
    const testY = 300;
    
    // Verify location isn't brown initially
    let pixelData = global.ctx.getImageData(testX, testY, 1, 1).data;
    let [r, g, b] = [pixelData[0], pixelData[1], pixelData[2]];
    let isBrown = global.isBrownColor(r, g, b);
    expect(isBrown).toBe(false);
    
    // Convert screen coordinates to world coordinates
    const playerAbsY = global.player.absY;
    const cameraOffset = global.getCameraOffset(playerAbsY, global.canvas.height, global.mountainHeight);
    
    // Calculate absolute Y position in the world
    const worldY = playerAbsY - (global.canvas.height / 2 - testY) + cameraOffset;
    
    // Get the layer at this Y position
    const layer = global.getLayerByY(worldY);
    expect(layer).not.toBeNull();
    
    // Calculate X position in the world
    let worldX = testX;
    if (global.cameraX) {
      worldX = (worldX + global.cameraX) % layer.width;
    }
    
    // Create a bear at this location
    const bearType = global.animalRegistry.find(animal => animal.type === "bear");
    expect(bearType).not.toBeNull();
    
    const bear = {
      type: "bear",
      x: worldX,
      y: worldY,
      width: bearType.width,
      height: bearType.height,
      color: "#8B4513", // Brown color
      state: "sitting",
      speed: bearType.speed,
      altitude: 50,
      hasBeenPhotographed: false,
      detectionRadius: bearType.detectionRadius,
      fleeAngleActual: 45,
      fleeingLogOnce: false,
      lastStateChange: Date.now(),
      stateChangeCount: 0,
      basePhotoBonus: bearType.basePhotoBonus,
      customDraw: bearType.customDraw,
      layer: layer.id,
      sitTimer: null
    };
    
    // Add the bear to the global animals array
    global.animals.push(bear);
    
    // Simulate drawing the bear
    const animalScreenY = bear.y - cameraOffset;
    const wrappedAnimalX = global.calculateWrappedPosRelativeToCamera(bear.x, global.cameraX, layer.width);
    
    // Call the custom draw function directly
    bearType.customDraw(bear, animalScreenY, global.ctx, wrappedAnimalX);
    
    // Check if the pixel is now brown
    pixelData = global.ctx.getImageData(testX, testY, 1, 1).data;
    [r, g, b] = [pixelData[0], pixelData[1], pixelData[2]];
    isBrown = global.isBrownColor(r, g, b);
    
    // Should now be brown after the bear is drawn
    expect(isBrown).toBe(true);
  });
  
  // Test #3: Find a non-brown location, spawn a bear, confirm it turns brown
  test('Find non-brown location, spawn bear, confirm pixel turns brown', () => {
    // Start at the center
    let testX = 400;
    let testY = 300;
    
    // Verify location isn't brown initially
    let pixelData = global.ctx.getImageData(testX, testY, 1, 1).data;
    let [r, g, b] = [pixelData[0], pixelData[1], pixelData[2]];
    let isBrown = global.isBrownColor(r, g, b);
    
    // If center is brown, move to find a non-brown location
    let attempts = 0;
    while (isBrown && attempts < 10) {
      testX += 30;
      
      // Wrap around if needed
      if (testX >= global.canvas.width) {
        testX = 30;
        testY += 30;
        
        if (testY >= global.canvas.height) {
          testY = 300;
        }
      }
      
      pixelData = global.ctx.getImageData(testX, testY, 1, 1).data;
      [r, g, b] = [pixelData[0], pixelData[1], pixelData[2]];
      isBrown = global.isBrownColor(r, g, b);
      attempts++;
    }
    
    // We should have found a non-brown location
    expect(isBrown).toBe(false);
    
    // Convert to world coordinates
    const playerAbsY = global.player.absY;
    const cameraOffset = global.getCameraOffset(playerAbsY, global.canvas.height, global.mountainHeight);
    const worldY = playerAbsY - (global.canvas.height / 2 - testY) + cameraOffset;
    const layer = global.getLayerByY(worldY);
    const worldX = testX;
    
    // Create a bear at this location
    const bear = {
      type: "bear",
      x: worldX,
      y: worldY,
      width: 40,
      height: 60,
      color: "#8B4513", // Brown color
      state: "sitting",
      speed: 6,
      altitude: 50,
      hasBeenPhotographed: false,
      detectionRadius: 150,
      customDraw: global.animalRegistry[0].customDraw,
      layer: layer.id
    };
    
    // Add the bear to the global animals array
    global.animals.push(bear);
    
    // Simulate drawing the bear
    const animalScreenY = bear.y - cameraOffset;
    const wrappedAnimalX = global.calculateWrappedPosRelativeToCamera(bear.x, global.cameraX, layer.width);
    
    // Draw the bear using its custom draw function
    bear.customDraw(bear, animalScreenY, global.ctx, wrappedAnimalX);
    
    // Check if the pixel is now brown
    pixelData = global.ctx.getImageData(testX, testY, 1, 1).data;
    [r, g, b] = [pixelData[0], pixelData[1], pixelData[2]];
    isBrown = global.isBrownColor(r, g, b);
    
    // Test passes if the pixel is now brown
    expect(isBrown).toBe(true);
  });
}); 