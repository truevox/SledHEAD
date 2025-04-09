/* animal-test.js - Test bear spawning and visibility */

console.log("🧪 Animal Testing Script Loaded");

// Function to get pixel color at a specific x,y coordinate on the canvas
function getPixelColor(x, y) {
  if (!window.ctx) {
    console.error("❌ No canvas context available");
    return null;
  }
  
  try {
    // Read pixel data from the canvas
    const pixelData = window.ctx.getImageData(x, y, 1, 1).data;
    // Convert RGBA to hex color
    const hex = "#" + 
      ("0" + pixelData[0].toString(16)).slice(-2) +
      ("0" + pixelData[1].toString(16)).slice(-2) +
      ("0" + pixelData[2].toString(16)).slice(-2);
    
    return {
      r: pixelData[0],
      g: pixelData[1],
      b: pixelData[2],
      a: pixelData[3],
      hex: hex,
      isBrown: isBrownColor(pixelData[0], pixelData[1], pixelData[2])
    };
  } catch (e) {
    console.error("❌ Error getting pixel color:", e);
    return null;
  }
}

// Function to determine if a color is "brown" (used for terrain)
function isBrownColor(r, g, b) {
  // Brown color detection logic
  // Basic brown detection: more red than blue, more red than green, not too bright
  return (r > b && r > g && r < 200 && g < 180 && b < 100);
}

// Function to spawn a bear at specific coordinates
function spawnBearAt(x, y, layer) {
  if (!window.animalRegistry) {
    console.error("❌ No animal registry available");
    return null;
  }
  
  // Find the bear in the registry
  const bearType = window.animalRegistry.find(animal => animal.type === "bear");
  if (!bearType) {
    console.error("❌ No bear type found in registry");
    return null;
  }
  
  // Get the appropriate layer if not provided
  const animalLayer = layer || getLayerByY(y);
  if (!animalLayer) {
    console.error("❌ Could not determine layer for bear");
    return null;
  }
  
  // Create the bear
  const bear = {
    type: "bear",
    x: x,
    y: y,
    width: bearType.width || 40,
    height: bearType.height || 60,
    color: "#8B4513", // Brown color
    state: "sitting",
    speed: bearType.speed || 8,
    altitude: 50,
    hasBeenPhotographed: false,
    detectionRadius: bearType.detectionRadius || 100,
    fleeAngleActual: Math.random() * 360,
    fleeingLogOnce: false,
    lastStateChange: Date.now(),
    stateChangeCount: 0,
    basePhotoBonus: bearType.basePhotoBonus || 10,
    customDraw: bearType.customDraw,
    layer: animalLayer.id,
    sitTimer: null,
    // Add a test marker
    isTestBear: true
  };
  
  // Add the bear to the global animals array
  if (!window.animals) {
    window.animals = [];
  }
  
  window.animals.push(bear);
  console.log(`🐻 Test bear spawned at (${x}, ${y}) in layer ${animalLayer.id}`);
  
  return bear;
}

// Function to create a visual indicator at a specific position
function createVisualMarker(x, y, color, text) {
  const marker = document.createElement('div');
  marker.style.position = 'absolute';
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;
  marker.style.width = '20px';
  marker.style.height = '20px';
  marker.style.backgroundColor = color;
  marker.style.border = '2px solid white';
  marker.style.borderRadius = '50%';
  marker.style.zIndex = '9999';
  marker.style.transform = 'translate(-50%, -50%)';
  
  if (text) {
    marker.setAttribute('data-content', text);
    marker.style.setProperty('--content', `"${text}"`);
    marker.style.position = 'relative';
    
    const label = document.createElement('div');
    label.textContent = text;
    label.style.position = 'absolute';
    label.style.top = '25px';
    label.style.left = '0';
    label.style.color = 'white';
    label.style.backgroundColor = 'rgba(0,0,0,0.7)';
    label.style.padding = '4px';
    label.style.borderRadius = '4px';
    label.style.whiteSpace = 'nowrap';
    label.style.transform = 'translateX(-50%)';
    label.style.fontFamily = 'monospace';
    label.style.fontSize = '12px';
    
    marker.appendChild(label);
  }
  
  document.body.appendChild(marker);
  return marker;
}

// Main test function
function runBearSpawnTest() {
  console.log("🧪 Starting bear spawn test...");
  
  // Create a results panel
  const resultsPanel = document.createElement('div');
  resultsPanel.id = 'test-results';
  resultsPanel.style.position = 'fixed';
  resultsPanel.style.bottom = '10px';
  resultsPanel.style.left = '10px';
  resultsPanel.style.backgroundColor = 'rgba(0,0,0,0.8)';
  resultsPanel.style.color = 'white';
  resultsPanel.style.padding = '10px';
  resultsPanel.style.borderRadius = '5px';
  resultsPanel.style.fontFamily = 'monospace';
  resultsPanel.style.zIndex = '9999';
  resultsPanel.style.maxWidth = '80%';
  resultsPanel.style.maxHeight = '30%';
  resultsPanel.style.overflowY = 'auto';
  
  document.body.appendChild(resultsPanel);
  
  // Add a header to the results panel
  const header = document.createElement('h3');
  header.textContent = '🧪 Bear Spawn Test Results';
  header.style.margin = '0 0 10px 0';
  resultsPanel.appendChild(header);
  
  // Function to add a log entry
  function logResult(message, isError = false) {
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    logEntry.style.margin = '5px 0';
    logEntry.style.fontSize = '12px';
    if (isError) {
      logEntry.style.color = '#ff6b6b';
    }
    resultsPanel.appendChild(logEntry);
    console.log(message);
  }
  
  // Check if we can access the canvas and context
  if (!window.canvas || !window.ctx) {
    logResult("❌ Canvas or context not available", true);
    return;
  }
  
  // Determine the center of the view
  const centerX = Math.floor(window.canvas.width / 2);
  const centerY = Math.floor(window.canvas.height / 2);
  
  // Store test points and markers
  const testPoints = [];
  const markers = [];
  
  // Start at the center
  let testX = centerX;
  let testY = centerY;
  
  logResult(`🔍 Testing from center point (${centerX}, ${centerY})`);
  
  // Get the color at the center
  let initialColor = getPixelColor(testX, testY);
  
  if (!initialColor) {
    logResult("❌ Could not read pixel color at center", true);
    return;
  }
  
  logResult(`🎨 Initial color at center: ${initialColor.hex} (${initialColor.isBrown ? 'Brown' : 'Not Brown'})`);
  
  // Add marker for the center
  markers.push(createVisualMarker(testX, testY, '#FFFF00', 'Center'));
  
  // Find a non-brown location if center is brown
  let attempts = 0;
  const maxAttempts = 10;
  
  // If initial position is brown, move until we find non-brown
  while (initialColor.isBrown && attempts < maxAttempts) {
    attempts++;
    testX += 30; // Shift right by 30px
    
    // Wrap around if needed
    if (testX >= window.canvas.width) {
      testX = 30;
      testY += 30;
      
      if (testY >= window.canvas.height) {
        testY = centerY;
      }
    }
    
    initialColor = getPixelColor(testX, testY);
    
    if (!initialColor) {
      logResult(`❌ Could not read pixel color at (${testX}, ${testY})`, true);
      continue;
    }
    
    logResult(`🔍 Attempt ${attempts}: Testing (${testX}, ${testY}) - Color: ${initialColor.hex} (${initialColor.isBrown ? 'Brown' : 'Not Brown'})`);
  }
  
  if (initialColor.isBrown) {
    logResult(`❌ Could not find non-brown location after ${maxAttempts} attempts`, true);
    
    // Add a red marker for failure
    markers.push(createVisualMarker(testX, testY, '#FF0000', 'Failed'));
    
    // Add final test result
    const finalResult = document.createElement('div');
    finalResult.textContent = "❌ TEST FAILED: Could not find suitable spawn location";
    finalResult.style.margin = '10px 0';
    finalResult.style.fontWeight = 'bold';
    finalResult.style.color = '#ff6b6b';
    resultsPanel.appendChild(finalResult);
    
    return;
  }
  
  // We found a non-brown location
  logResult(`✅ Found non-brown location at (${testX}, ${testY}) - Color: ${initialColor.hex}`);
  
  // Add marker for the test location
  markers.push(createVisualMarker(testX, testY, '#00FF00', 'Test Point'));
  
  // Convert screen coordinates to world coordinates
  const playerAbsY = player.absY || 0;
  const cameraOffset = window.getCameraOffset(playerAbsY, window.canvas.height, window.mountainHeight);
  
  // Calculate absolute Y position in the world
  const worldY = playerAbsY - (window.canvas.height / 2 - testY) + cameraOffset;
  
  // Get the layer at this Y position
  const layer = window.getLayerByY(worldY);
  if (!layer) {
    logResult("❌ Could not determine layer for the test point", true);
    return;
  }
  
  // Calculate X position in the world relative to layer width
  let worldX = testX;
  if (window.cameraX) {
    worldX = (worldX + window.cameraX) % layer.width;
  }
  
  logResult(`🌍 World coordinates: (${worldX.toFixed(1)}, ${worldY.toFixed(1)}) in layer ${layer.id}`);
  
  // Spawn a bear at this location
  const bear = spawnBearAt(worldX, worldY, layer);
  
  if (!bear) {
    logResult("❌ Failed to spawn bear", true);
    return;
  }
  
  // Wait a short time for the bear to be rendered
  setTimeout(() => {
    // Get the color again at the same screen position
    const afterColor = getPixelColor(testX, testY);
    
    if (!afterColor) {
      logResult("❌ Could not read pixel color after spawning bear", true);
      return;
    }
    
    logResult(`🎨 Color after bear spawn: ${afterColor.hex} (${afterColor.isBrown ? 'Brown' : 'Not Brown'})`);
    
    // Check if the color is now brown (indicating the bear was rendered)
    const passed = afterColor.isBrown;
    
    if (passed) {
      logResult("✅ TEST PASSED: Pixel is now brown, indicating the bear was rendered");
      markers.push(createVisualMarker(testX, testY, '#00FF00', 'PASS'));
    } else {
      logResult("❌ TEST FAILED: Pixel is not brown after bear spawn", true);
      markers.push(createVisualMarker(testX, testY, '#FF0000', 'FAIL'));
    }
    
    // Add final test result
    const finalResult = document.createElement('div');
    finalResult.textContent = passed ? 
      "✅ TEST PASSED: Bear was spawned and rendered correctly" : 
      "❌ TEST FAILED: Bear was spawned but not rendered correctly";
    finalResult.style.margin = '10px 0';
    finalResult.style.fontWeight = 'bold';
    finalResult.style.color = passed ? '#00ff9d' : '#ff6b6b';
    resultsPanel.appendChild(finalResult);
    
    // Add a close button to the results panel
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close Results';
    closeButton.style.padding = '5px 10px';
    closeButton.style.marginTop = '10px';
    closeButton.style.backgroundColor = '#4a4a4a';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '3px';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('click', () => {
      // Remove all markers
      markers.forEach(marker => {
        document.body.removeChild(marker);
      });
      
      // Remove the results panel
      document.body.removeChild(resultsPanel);
      
      // Optional: remove the test bear after test
      if (bear && bear.isTestBear) {
        const index = window.animals.indexOf(bear);
        if (index > -1) {
          window.animals.splice(index, 1);
        }
      }
    });
    
    resultsPanel.appendChild(closeButton);
  }, 500); // Wait 500ms for render to complete
}

// Add a button to run the test to the debug controls
document.addEventListener('DOMContentLoaded', () => {
  const debugControls = document.getElementById('debug-controls');
  
  if (debugControls) {
    const testButton = document.createElement('button');
    testButton.id = 'run-bear-test';
    testButton.textContent = 'Test Bear Spawn';
    testButton.style.backgroundColor = '#673ab7';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.padding = '5px 10px';
    testButton.style.cursor = 'pointer';
    testButton.style.borderRadius = '3px';
    
    testButton.addEventListener('click', runBearSpawnTest);
    
    debugControls.appendChild(testButton);
    console.log("🧪 Bear spawn test button added to debug controls");
  }
});

console.log("🧪 Animal Testing Script Initialized"); 