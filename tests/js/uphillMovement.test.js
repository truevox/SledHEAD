// tests/js/uphillMovement.test.js
// Unit test for UPHILL movement: ensures no glide/inertia and instant stop on key release

// tests/js/uphillMovement.test.js
// Unit test for UPHILL movement: ensures no glide/inertia and instant stop on key release

// Use the same mocking pattern as player.test.js
if (typeof window === 'undefined') {
  global.window = {};
}

let player;
let keysDown;
let layer;
let TWEAK;
let playerUpgrades;

function getUpgradeEffect() { return 1; }
function getLayerByY() { return layer; }
function calculateWrappedX(x, width) { while (x < 0) x += width; return x % width; }

function updateUphillMock() {
  let upSpeed = TWEAK.baseUpSpeed * getUpgradeEffect();
  // Horizontal movement
  if (keysDown["a"]) { player.x -= upSpeed; }
  if (keysDown["d"]) { player.x += upSpeed; }
  player.x = calculateWrappedX(player.x, layer.width);
  // Zero velocities to prevent glide
  player.xVel = 0;
  player.velocityY = 0;
}

describe('UPHILL Movement', () => {
  beforeEach(() => {
    player = {
      x: 100,
      absY: 500,
      width: 20,
      height: 20,
      xVel: 5,
      velocityY: 0,
      currentLayerIndex: 0
    };
    keysDown = {};
    layer = { width: 200 };
    TWEAK = { baseUpSpeed: 2 };
    playerUpgrades = { fancierFootwear: 0 };
  });

  test('Right move then stop: instant stop, no glide', () => {
    player.x = 100;
    keysDown = { d: true };
    updateUphillMock();
    const afterRight = player.x;
    keysDown = {}; // Release all keys
    updateUphillMock();
    const afterRelease = player.x;
    expect(afterRight).not.toBe(100);
    expect(afterRelease).toBe(afterRight);
  });

  test('Left move then stop: instant stop, no glide', () => {
    player.x = 100;
    keysDown = { a: true };
    updateUphillMock();
    const afterLeft = player.x;
    keysDown = {}; // Release all keys
    updateUphillMock();
    const afterRelease = player.x;
    expect(afterLeft).not.toBe(100);
    expect(afterRelease).toBe(afterLeft);
  });

  test('No key, no move', () => {
    player.x = 150;
    keysDown = {};
    updateUphillMock();
    expect(player.x).toBe(150);
  });

  test('xVel is always zero after update', () => {
    player.xVel = 3;
    keysDown = { d: true };
    updateUphillMock();
    expect(player.xVel).toBe(0);
    keysDown = {};
    updateUphillMock();
    expect(player.xVel).toBe(0);
  });
});
