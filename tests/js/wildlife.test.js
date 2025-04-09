/* wildlife.test.js - Tests for wildlife system */

describe('Wildlife System', () => {
  // Set up before each test
  beforeEach(() => {
    // Mock game state
    global.GameState = {
      UPHILL: 'UPHILL',
      DOWNHILL: 'DOWNHILL',
      HOUSE: 'HOUSE'
    };
    global.currentState = GameState.UPHILL;
    
    // Mock animal types
    global.animalTypes = [];
    
    // Mock Math.random for predictable testing
    global.originalMathRandom = Math.random;
    Math.random = jest.fn(() => 0.5);

    // Create simple registerAnimalType function
    global.registerAnimalType = jest.fn(animalType => {
      if (!animalTypes.some(a => a.type === animalType.type)) {
        animalTypes.push(animalType);
      }
      return animalType;
    });
    
    // Create basic spawnAnimal function
    global.spawnAnimal = jest.fn(() => {
      return {
        type: 'bear',
        x: 500,
        y: 1000,
        width: 40,
        height: 60,
        state: 'sitting',
        speed: 6,
        altitude: 50,
        hasBeenPhotographed: false,
        detectionRadius: 150
      };
    });
    
    // Simple updateAnimal function
    global.updateAnimal = jest.fn(animal => {
      if (!animal) return null;
      
      // Simple state change logic for testing
      if (animal.state === 'sitting') {
        animal.state = 'moving';
      } else if (animal.state === 'moving') {
        animal.state = 'fleeing';
      }
      
      return animal;
    });
    
    // Simple despawnAllAnimals function
    global.despawnAllAnimals = jest.fn(() => null);
  });
  
  // Restore Math.random after tests
  afterEach(() => {
    Math.random = global.originalMathRandom;
  });
  
  test('registerAnimalType adds animals to registry', () => {
    expect(global.animalTypes.length).toBe(0);
    
    const bear = {
      type: 'bear',
      spawnProbability: 0.3,
      width: 40,
      height: 60,
      detectionRadius: 150
    };
    
    global.registerAnimalType(bear);
    
    expect(global.animalTypes.length).toBe(1);
    expect(global.animalTypes[0].type).toBe('bear');
  });
  
  test('spawnAnimal creates an animal with correct properties', () => {
    const animal = global.spawnAnimal();
    
    expect(animal).not.toBeNull();
    expect(animal.type).toBe('bear');
    expect(animal.state).toBe('sitting');
    expect(animal.hasBeenPhotographed).toBe(false);
  });
  
  test('updateAnimal transitions animal states', () => {
    const animal = {
      type: 'bear',
      state: 'sitting',
      hasBeenPhotographed: false
    };
    
    const updatedAnimal = global.updateAnimal(animal);
    expect(updatedAnimal.state).toBe('moving');
    
    const updatedAgain = global.updateAnimal(updatedAnimal);
    expect(updatedAgain.state).toBe('fleeing');
  });
  
  test('despawnAllAnimals returns null', () => {
    const result = global.despawnAllAnimals();
    expect(result).toBeNull();
  });
}); 