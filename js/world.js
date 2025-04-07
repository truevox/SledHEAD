/* world.js */
const mountainHeight = 200000; // Mountain is now 100x bigger!
let terrain = [];
const obstacleCount = 1500; // Reduced rock count to make room for trees
const treeClusterCount = 3000; // Number of tree clusters to generate
let earlyFinish = false;
const heightMultiplierBase = 1; // Base value for height multiplier - can be adjusted later
const distanceMultiplierBase = 1; // Base value for distance multiplier - can be adjusted later
const speedMultiplierBase = 1; // Base value for speed multiplier - can be adjusted later

function generateTerrain() {
  terrain = [];
  
  // Generate rock obstacles
  for (let i = 0; i < obstacleCount; i++) {
    // Get Y position first to determine which layer this obstacle belongs to
    const obstacleY = Math.random() * mountainHeight;
    const layer = getLayerByY(obstacleY);
    
    let obstacle = {
      x: Math.random() * (layer.width - 70) + 10, // Use layer width instead of canvas width
      y: obstacleY,
      width: 30 + Math.random() * 40,
      height: 10 + Math.random() * 20,
      type: 'rock', // Explicitly mark as rock
      layer: layer.id // Store which layer this obstacle belongs to
    };
    terrain.push(obstacle);
  }
  
  // Generate tree clusters
  // Use the largest layer (bottom layer) width for the terrain bounds
  // but we'll adjust individual tree positions based on their specific layer
  const bottomLayer = getLayerByY(mountainHeight - 1);
  
  const terrainBounds = { 
    xMin: 0, 
    xMax: bottomLayer.width, // Use the bottom layer's width as the maximum
    yMin: 0, 
    yMax: mountainHeight 
  };
  
  // Assume player size reference (can be adjusted based on actual player dimensions)
  const playerSize = 30; // Estimate based on what's visible in the game
  
  const treeObstacles = generateTreeClumps({ 
    count: treeClusterCount, 
    terrainBounds, 
    playerSize 
  });
  
  // Add trees to terrain array
  terrain.push(...treeObstacles);
  
  // Sort all obstacles by Y position for rendering order
  terrain.sort((a, b) => a.y - b.y);
}

function awardMoney() {
    // Calculate real distance traveled based on starting and ending Y positions
    // Note: In this game's coordinate system, higher Y values mean lower on the mountain
    // So the distance traveled downhill is player.absY - window.playerStartAbsY
    let distanceTraveled = Math.max(1, player.absY - window.playerStartAbsY);
    
    // Ensure at least 1 unit
    distanceTraveled = Math.max(1, distanceTraveled);
    
    // Calculate the height multiplier based on starting position
    // Higher up the mountain (lower playerStartAbsY value) gives better multiplier
    // This will make a run from the top worth 3x more than from the bottom
    const startHeightRatio = 1 - (window.playerStartAbsY / mountainHeight); // 0 at bottom, 1 at top
    const startHeightMultiplier = 1 + (startHeightRatio * 2 * heightMultiplierBase); // Range: 1-3x
    
    // Calculate the distance multiplier based on how much of the mountain was traversed
    // This makes longer runs more valuable (e.g., a full mountain run worth 3x more than 10 runs of 10% each)
    const distanceRatio = distanceTraveled / mountainHeight; // What fraction of the mountain was traversed
    const distanceMultiplier = 1 + (Math.min(1, distanceRatio * 10) * 2 * distanceMultiplierBase); // Range: 1-3x
    // The formula ensures a full mountain run (10% of mountain = 1.2x, 20% = 1.4x, ... 100% = 3x)
    
    // Calculate speed multiplier based on the time taken to complete the run
    let speedMultiplier = 1;
    if (window.downhillStartTime !== null) {
        const runDuration = (performance.now() - window.downhillStartTime) / 1000; // Convert to seconds
        
        // Calculate expected time based on distance
        // Assuming an "average" speed would be covering the entire mountain in the below number of seconds
        const expectedTime = (distanceTraveled / mountainHeight) * 500;
        
        // Calculate speed ratio: lower than 1 means faster than expected
        // We want lower times to give higher multipliers
        const speedRatio = Math.max(0.1, Math.min(2, runDuration / Math.max(1, expectedTime)));
        
        // Invert the ratio: 1/speedRatio, so faster runs (lower speedRatio) get higher multipliers
        // Adjust the curve to get 1x for average speed, up to 3x for twice as fast
        speedMultiplier = 1 + (Math.max(0, (1 - speedRatio)) * 3 * speedMultiplierBase); // Range: 1-3x
        
        console.log(`Run duration: ${runDuration.toFixed(2)}s, Expected: ${expectedTime.toFixed(2)}s, Speed ratio: ${speedRatio.toFixed(2)}, Multiplier: ${speedMultiplier.toFixed(2)}x`);
    }
    
    // Apply all multipliers to the money calculation
    let moneyEarned = Math.floor((distanceTraveled / 100) * startHeightMultiplier * distanceMultiplier * speedMultiplier);
    moneyEarned = Math.max(0, moneyEarned); // Guarantee no negative values
  
    console.log(`Awarding money: $${moneyEarned} (Distance: ${distanceTraveled}, Height multiplier: ${startHeightMultiplier.toFixed(2)}, Distance multiplier: ${distanceMultiplier.toFixed(2)}, Speed multiplier: ${speedMultiplier.toFixed(2)})`);
    player.money += moneyEarned;
    updateMoneyDisplay();
}

