/* world.js */
import { player } from './player.js';
import { generateTreeClumps } from './trees.js';
import { canvas } from './render.js';
import { updateMoneyDisplay } from './render.js';
import { GameState } from './gamestate.js';
import { changeState } from './game.js';
import {
    setPlayerStartAbsY,
    setDownhillStartTime,
    calculateScore
} from './mechanics.js';

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

  const playerSize = 30; // Estimate based on what's visible in the game

  const treeObstacles = generateTreeClumps({
    count: treeClusterCount,
    terrainBounds,
    playerSize
  });

  terrain.push(...treeObstacles);
  terrain.sort((a, b) => a.y - b.y);
}

function awardMoney() {
    const moneyEarned = calculateScore(player, performance.now());
    console.log(`Awarding money: $${moneyEarned}`);
    // player.money += moneyEarned; // Removed to avoid double-awards
    updateMoneyDisplay();
}

// Check if player has reached the house/bottom of the mountain
function checkHouseTransition() {
  if (player.absY >= mountainHeight - (player.height * 5)) {
    player.absY = mountainHeight - (player.height * 5);
    console.log("Reached bottom. Returning to house.");
    awardMoney();
    changeState(GameState.HOUSE);
    return true;
  }
  return false;
}

export {
    mountainHeight,
    terrain,
    generateTerrain,
    setDownhillStartTime,
    earlyFinish,
    awardMoney,
    checkHouseTransition
};
