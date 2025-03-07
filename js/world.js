/* world.js */
const mountainHeight = 200000; // Mountain is now 100x bigger!
let terrain = [];
const obstacleCount = 2000;
let earlyFinish = false;
function generateTerrain() {
  terrain = [];
  for (let i = 0; i < obstacleCount; i++) {
    let obstacle = {
      x: Math.random() * (canvas.width - 70) + 10,
      y: Math.random() * mountainHeight,
      width: 30 + Math.random() * 40,
      height: 10 + Math.random() * 20
    };
    terrain.push(obstacle);
  }
  terrain.sort((a, b) => a.y - b.y);
}
function awardMoney() {
    let distanceTraveled = Math.max(1, player.absY); // Ensure at least 1 unit
    let moneyEarned = Math.floor(distanceTraveled / 100); // Every 100 distance = $1
    
    moneyEarned = Math.max(1, moneyEarned); // Guarantee at least $1
  
    console.log(`Awarding money: $${moneyEarned} (Distance traveled: ${distanceTraveled})`);
    player.money += moneyEarned;
    updateMoneyDisplay();
  }
  
