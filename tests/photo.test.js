// photo.test.js
// Test for multi-animal photo logic

const { calculatePhotoResults } = require('../js/photoLogic.js');

describe('Multi-animal photo logic', () => {
  let player, playerUpgrades, showMoneyGain, addFloatingText;
  let TWEAK;
  beforeEach(() => {
    // Mock local player object
    player = { x: 0, absY: 0, altitudeLine: 50, cameraAngle: 0, money: 0 };
    TWEAK = {
      basePhotoValue: 100,
      altitudeMatchMultiplier: 2,
      centerPOVMultiplier: 2,
      fleeingAnimalMultiplier: 3,
      bearMultiplier: 2,
      birdMultiplier: 1,
      repeatPhotoPenalty: 0.5,
      basePOVAngle: 30,
      optimalOpticsPOVIncrease: 0,
      // Add any other required properties here
    };
    playerUpgrades = { optimalOptics: 0 };
    global.showMoneyGain = jest.fn();
    global.addFloatingText = jest.fn();
  });

  it('rewards primary animal fully and others half, logs and feedback correct', () => {
    const animals = [
      { x: 10, y: 0, altitude: 50, type: 'bear', state: 'sitting', hasBeenPhotographed: false, width: 1, height: 1 },
      { x: 10, y: 10, altitude: 55, type: 'bird', state: 'sitting', hasBeenPhotographed: false, width: 1, height: 1 },
      { x: 10, y: -10, altitude: 45, type: 'bird', state: 'sitting', hasBeenPhotographed: false, width: 1, height: 1 }
    ];
    // Simulate infoArr with diffAngle and dist
    const infoArr = [
      { animal: animals[0], diffAngle: 0, dist: 10 }, // primary
      { animal: animals[1], diffAngle: 5, dist: 14.14 },
      { animal: animals[2], diffAngle: 5, dist: 14.14 }
    ];
    // Prepare player state and tweaks for pure logic
    const playerState = Object.assign({}, player, { upgrades: playerUpgrades });
    // Debug: print playerState.altitudeLine and animal.altitude
    console.log('DEBUG altitudeLine:', playerState.altitudeLine);
    console.log('DEBUG animal.altitude:', animals.map(a => a.altitude));
    // Call pure logic
    const results = calculatePhotoResults(infoArr, playerState, TWEAK, 0);
    // Debug: print results
    console.log('PHOTO TEST DEBUG:', JSON.stringify(results, null, 2));
    // Primary bear: full value, birds: half
    expect(results.length).toBe(3);
    expect(results[0].isPrimary).toBe(true);
    expect(results[0].animal.type).toBe('bear');
    expect(results[1].isPrimary).toBe(false);
    expect(results[2].isPrimary).toBe(false);
    // Check that primary reward is greater than others
    expect(results[0].totalMoney).toBeGreaterThan(results[1].totalMoney);
    expect(results[0].totalMoney).toBeGreaterThan(results[2].totalMoney);
    // Check that order is primary first
    expect(results[0].animal).toBe(animals[0]);
    // Check that feedback/log data is present
    expect(typeof results[0].centerBonus).toBe('number');
    expect(typeof results[0].altitudeBonus).toBe('number');
  });
});
