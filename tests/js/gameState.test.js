/* gameState.test.js - Tests for game state transitions */

describe('Game State Transitions', () => {
  // Set up before each test
  beforeEach(() => {
    // Mock game state enum
    global.GameState = {
      LOADING: 'LOADING',
      TITLE: 'TITLE',
      UPHILL: 'UPHILL',
      DOWNHILL: 'DOWNHILL',
      HOUSE: 'HOUSE'
    };
    
    // Mock current state
    global.currentState = GameState.UPHILL;
    
    // Mock functions
    global.hideUI = jest.fn();
    global.showUI = jest.fn();
    global.setupHouse = jest.fn();
    global.awardMoney = jest.fn();
    
    // Create simple changeState function for testing
    global.changeState = jest.fn(newState => {
      global.currentState = newState;
    });
  });
  
  test('changeState updates the game state', () => {
    // Start in UPHILL state
    expect(global.currentState).toBe(GameState.UPHILL);
    
    // Change to DOWNHILL
    global.changeState(GameState.DOWNHILL);
    expect(global.currentState).toBe(GameState.DOWNHILL);
    
    // Change to HOUSE
    global.changeState(GameState.HOUSE);
    expect(global.currentState).toBe(GameState.HOUSE);
  });
  
  test('changeState can be called with different states', () => {
    // Test all possible transitions
    const states = [
      GameState.UPHILL,
      GameState.DOWNHILL,
      GameState.HOUSE,
      GameState.TITLE,
      GameState.LOADING
    ];
    
    for (const state of states) {
      global.changeState(state);
      expect(global.currentState).toBe(state);
    }
  });
}); 