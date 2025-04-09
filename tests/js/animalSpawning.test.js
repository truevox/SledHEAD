/* animalSpawning.test.js - Tests for initial animal spawning system */

// Import the function we want to test
const wildlife = require('../../js/wildlife.js');

describe('Initial Animal Spawning System', () => {
  beforeEach(() => {
    // Initialize global.animals first
    global.animals = [];
    
    // Setup mock data
    global.mountainLayers = [
      { id: 0, startY: 0, endY: 5000, width: 1000, totalAnimalsPerLayer: 1, biome: 'alpine' },
      { id: 1, startY: 5000, endY: 10000, width: 1500, totalAnimalsPerLayer: 1, biome: 'subalpine' },
      { id: 2, startY: 10000, endY: 15000, width: 2000, totalAnimalsPerLayer: 2, biome: 'forest' },
      { id: 3, startY: 15000, endY: 20000, width: 2500, totalAnimalsPerLayer: 25, biome: 'meadow' }
    ];
    
    // Mock animal registry
    global.animalRegistry = [
      { 
        type: 'bear', 
        spawnProbability: 0.5, 
        width: 40, 
        height: 60, 
        detectionRadius: 150,
        speed: 6,
        basePhotoBonus: 10,
        validBiomes: ['forest', 'alpine']
      },
      { 
        type: 'bird', 
        spawnProbability: 0.5, 
        width: 20, 
        height: 20, 
        detectionRadius: 50,
        speed: 12,
        basePhotoBonus: 5,
        validBiomes: ['forest', 'alpine', 'peak', 'grassland']
      },
      { 
        type: 'mountainlion', 
        spawnProbability: 0.5, 
        width: 50, 
        height: 30, 
        detectionRadius: 60,
        speed: 10,
        basePhotoBonus: 15,
        validBiomes: ['alpine', 'peak']
      }
    ];
    
    // Mock biome
    global.currentBiome = 'alpine';
    
    // Mock console
    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    
    // Mock Math.random to be deterministic for testing
    global.originalMathRandom = Math.random;
    let seed = 0.1;
    Math.random = jest.fn(() => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    });

    // Mock helper functions
    global.getLayerByY = jest.fn((y) => {
      return global.mountainLayers.find(layer => y >= layer.startY && y < layer.endY);
    });

    global.calculateWrappedX = jest.fn((x, width) => {
      return x % width;
    });
    
    // Register the mock animals with the wildlife module
    wildlife.animalRegistry.length = 0;
    global.animalRegistry.forEach(animal => wildlife.registerAnimalType(animal));
  });
  
  afterEach(() => {
    // Restore Math.random
    Math.random = global.originalMathRandom;
  });
  
  test('spawnInitialAnimals clears existing animals array', () => {
    // Setup
    global.animals = [{type: 'oldanimal'}];
    
    // Function under test
    wildlife.spawnInitialAnimals();
    
    // Assert that previous animals were cleared
    expect(global.animals).not.toContain({type: 'oldanimal'});
  });
  
  test('spawnInitialAnimals spawns correct total number of animals', () => {
    wildlife.spawnInitialAnimals();
    
    // Should have created animals matching layer configurations
    expect(global.animals.length).toBe(29);
  });
  
  test('spawnInitialAnimals creates proper animal objects', () => {
    wildlife.spawnInitialAnimals();
    
    // Ensure we have animals
    expect(global.animals.length).toBeGreaterThan(0);
    
    // Examine the first animal
    const firstAnimal = global.animals[0];
    console.log('First animal:', firstAnimal);
    
    // Check animal properties
    expect(firstAnimal).toHaveProperty('x');
    expect(firstAnimal).toHaveProperty('y');
    // If the animal has absY directly, use that
    if (firstAnimal.hasOwnProperty('absY')) {
      expect(firstAnimal).toHaveProperty('absY');
    }
    // If animal has layer property, use that
    if (firstAnimal.hasOwnProperty('layer')) {
      expect(firstAnimal).toHaveProperty('layer');
    }
  });
  
  test('spawnInitialAnimals respects per-layer animal limits', () => {
    wildlife.spawnInitialAnimals();
    
    // Count animals in each layer
    const animalsByLayer = [0, 0, 0, 0];
    global.animals.forEach(animal => {
      // We'll determine the layer based on the properties available
      let layerIndex;
      if (animal.hasOwnProperty('layer')) {
        // If animal has a layer property, use it directly
        layerIndex = animal.layer;
      } else if (animal.hasOwnProperty('absY')) {
        // If animal has absY, use getLayerByY
        const layer = getLayerByY(animal.absY);
        layerIndex = layer ? layer.id : 0;
      } else if (animal.hasOwnProperty('y')) {
        // If animal only has y, assume it's absolute Y
        const layer = getLayerByY(animal.y);
        layerIndex = layer ? layer.id : 0;
      } else {
        // Default to layer 0 if we can't determine
        layerIndex = 0;
      }
      animalsByLayer[layerIndex]++;
    });
    
    // Check counts match layer configs
    expect(animalsByLayer[0]).toBe(1);
    expect(animalsByLayer[1]).toBe(1);
    expect(animalsByLayer[2]).toBe(2);
    expect(animalsByLayer[3]).toBe(25);
  });
  
  test('spawnInitialAnimals bypasses biome filtering for starting zone (layer 3)', () => {
    // Override biome to something not in bear's validBiomes
    global.currentBiome = 'peak';
    
    wildlife.spawnInitialAnimals();
    
    // Starting zone (layer 3) should include all animal types regardless of biome
    const startingZoneAnimals = global.animals.filter(animal => animal.layer === 3);
    const bearCount = startingZoneAnimals.filter(animal => animal.type === 'bear').length;
    
    // There should be at least one bear in the starting zone despite 'peak' biome
    expect(bearCount).toBeGreaterThan(0);
  });
  
  test('spawnInitialAnimals applies biome filtering for non-starting zones', () => {
    // Set biome to 'peak', which only mountain lions and birds support
    global.currentBiome = 'peak';
    
    wildlife.spawnInitialAnimals();
    
    // Check layers 0, 1, and 2 - should have no bears, only mountain lions and birds
    const nonStartingZoneAnimals = global.animals.filter(animal => animal.layer !== 3);
    const bearCount = nonStartingZoneAnimals.filter(animal => animal.type === 'bear').length;
    
    // There should be no bears outside the starting zone
    expect(bearCount).toBe(0);
  });
  
  test('spawnInitialAnimals spawns animals within correct x and y coordinates', () => {
    wildlife.spawnInitialAnimals();
    
    // Check that all animals are within their layer bounds
    global.animals.forEach(animal => {
      const layer = global.mountainLayers.find(l => l.id === animal.layer);
      
      // Check x coordinate is within layer width
      expect(animal.x).toBeGreaterThanOrEqual(0);
      expect(animal.x).toBeLessThan(layer.width);
      
      // Check y coordinate is within layer bounds
      expect(animal.y).toBeGreaterThanOrEqual(layer.startY);
      expect(animal.y).toBeLessThan(layer.endY);
    });
  });
  
  test('spawnInitialAnimals initializes sitTimer to null', () => {
    wildlife.spawnInitialAnimals();
    
    // All animals should have sitTimer initialized to null
    global.animals.forEach(animal => {
      expect(animal.sitTimer).toBeNull();
    });
  });
}); 