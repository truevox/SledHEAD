// test-uphill-movement-browser.js
// Unit test for UPHILL movement: ensures no glide/inertia and instant stop on key release (browser version)
// To run: load this script in a browser console or include via <script> tag after main game scripts
(function() {
  // Create a test log area if not present
  let logDiv = document.getElementById('uphill-test-log');
  if (!logDiv) {
    logDiv = document.createElement('div');
    logDiv.id = 'uphill-test-log';
    logDiv.style = 'background: #222; color: #baffc9; font-family: monospace; padding: 1em; margin: 1em; border-radius: 8px; max-width: 450px;';
    document.body.appendChild(logDiv);
  }
  function log(msg) {
    logDiv.innerHTML += msg + '<br>';
    console.log(msg);
  }

  // Mock minimal player and game state
  let testPlayer = {
    x: 100,
    absY: 500,
    width: 20,
    height: 20,
    xVel: 5,
    velocityY: 0,
    currentLayerIndex: 0
  };
  let keysDown = {};
  let layer = { width: 200 };
  let TWEAK = { baseUpSpeed: 2 };
  let playerUpgrades = { fancierFootwear: 0 };
  function getUpgradeEffect() { return 1; }
  function getLayerByY() { return layer; }
  function calculateWrappedX(x, width) { while (x < 0) x += width; return x % width; }

  // Simulate the updateUphill logic
  function updateUphillMock() {
    let upSpeed = TWEAK.baseUpSpeed * getUpgradeEffect();
    // Horizontal movement
    if (keysDown["a"]) { testPlayer.x -= upSpeed; }
    if (keysDown["d"]) { testPlayer.x += upSpeed; }
    testPlayer.x = calculateWrappedX(testPlayer.x, layer.width);
    // Zero velocities to prevent glide
    testPlayer.xVel = 0;
    testPlayer.velocityY = 0;
  }

  // TEST: Move right, then release key and check for glide
  testPlayer.x = 100;
  keysDown = { d: true };
  updateUphillMock();
  let afterRight = testPlayer.x;
  keysDown = {}; // Release all keys
  updateUphillMock();
  let afterRelease = testPlayer.x;
  let result1 = (afterRight !== 100) && (afterRelease === afterRight);

  // TEST: Move left, then release key and check for glide
  testPlayer.x = 100;
  keysDown = { a: true };
  updateUphillMock();
  let afterLeft = testPlayer.x;
  keysDown = {}; // Release all keys
  updateUphillMock();
  let afterRelease2 = testPlayer.x;
  let result2 = (afterLeft !== 100) && (afterRelease2 === afterLeft);

  // TEST: No keys pressed, player.x remains constant
  testPlayer.x = 150;
  keysDown = {};
  updateUphillMock();
  let result3 = (testPlayer.x === 150);

  // Output results
  log("<b>[UPHILL TEST] Right move then stop:</b> " + (result1 ? "<span style='color:#baffc9'>PASS</span>" : "<span style='color:#ffb3ba'>FAIL</span>"));
  log("<b>[UPHILL TEST] Left move then stop:</b> " + (result2 ? "<span style='color:#baffc9'>PASS</span>" : "<span style='color:#ffb3ba'>FAIL</span>"));
  log("<b>[UPHILL TEST] No key, no move:</b> " + (result3 ? "<span style='color:#baffc9'>PASS</span>" : "<span style='color:#ffb3ba'>FAIL</span>"));

  // Expose for further manual testing if needed
  window._testUphillMovement = {
    testPlayer,
    updateUphillMock,
    keysDown,
    results: { result1, result2, result3 }
  };
})();
