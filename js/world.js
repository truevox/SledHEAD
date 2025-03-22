/* world.js */
const mountainHeight = 200000; // Mountain is now 100x bigger!
let terrain = [];
const obstacleCount = 1500; // Reduced rock count to make room for trees
const treeClusterCount = 3000; // Number of tree clusters to generate
let earlyFinish = false;

function generateTerrain() {
  terrain = [];
  
  // Generate rock obstacles
  for (let i = 0; i < obstacleCount; i++) {
    let obstacle = {
      x: Math.random() * (canvas.width - 70) + 10,
      y: Math.random() * mountainHeight,
      width: 30 + Math.random() * 40,
      height: 10 + Math.random() * 20,
      type: 'rock' // Explicitly mark as rock
    };
    terrain.push(obstacle);
  }
  
  // Generate tree clusters
  const terrainBounds = { 
    xMin: 0, 
    xMax: canvas.width, 
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
    // So the distance traveled downhill is player.absY - playerStartAbsY
    let distanceTraveled = Math.max(1, player.absY - playerStartAbsY);
    
    // Ensure at least 1 unit
    distanceTraveled = Math.max(1, distanceTraveled);
    
    let moneyEarned = Math.floor(distanceTraveled / 100); // Every 100 distance = $1
    moneyEarned = Math.max(1, moneyEarned); // Guarantee at least $1
  
    console.log(`Awarding money: $${moneyEarned} (Distance traveled: ${distanceTraveled}, from Y=${playerStartAbsY} to Y=${player.absY})`);
    player.money += moneyEarned;
    updateMoneyDisplay();
  }

