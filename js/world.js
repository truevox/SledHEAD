/* world.js */
const mountainHeight = 2000;
let terrain = [];
const obstacleCount = 40;
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
  let runTime = (performance.now() - downhillStartTime) / 1000;
  if (runTime === 0) runTime = 1;
  let distanceFactor = Math.pow(player.absY / mountainHeight, 2);
  let timeFactor = 30 / runTime;
  let moneyEarned = Math.floor(100 * distanceFactor * timeFactor);
  console.log("Awarding money: $" + moneyEarned, "(Distance factor:", distanceFactor, "Time factor:", timeFactor, ")");
  player.money += moneyEarned;
}
