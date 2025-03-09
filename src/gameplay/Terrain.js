// src/gameplay/Terrain.js
export let terrain = [];

export function generateTerrain() {
  terrain = [];
  let numObstacles = 20;
  for (let i = 0; i < numObstacles; i++) {
    terrain.push({
      x: Math.random() * window.innerWidth,
      y: i * 150 + 100,
      width: 30,
      height: 30
    });
  }
}

import { checkCollision, resolveCollision } from '../utils/PhysicsUtils.js';

export function updateTerrainCollisions(player) {
  for (let i = 0; i < terrain.length; i++) {
    let obstacle = terrain[i];
    if (checkCollision(
      player.x - player.width / 2, player.absY - player.height / 2,
      player.width, player.height,
      obstacle.x, obstacle.y,
      obstacle.width, obstacle.height
    )) {
      resolveCollision(player, obstacle);
    }
  }
}
