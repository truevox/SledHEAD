// src/utils/PhysicsUtils.js
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  export function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x2 > x1 + w1 || 
             x2 + w2 < x1 || 
             y2 > y1 + h1 || 
             y2 + h2 < y1);
  }
  
  export function resolveCollision(player, obstacle) {
    let playerCenterX = player.x;
    let playerCenterY = player.absY;
    let obstacleCenterX = obstacle.x + obstacle.width / 2;
    let obstacleCenterY = obstacle.y + obstacle.height / 2;
    let halfWidthPlayer = player.width / 2;
    let halfWidthObstacle = obstacle.width / 2;
    let halfHeightPlayer = player.height / 2;
    let halfHeightObstacle = obstacle.height / 2;
    let dx = playerCenterX - obstacleCenterX;
    let dy = playerCenterY - obstacleCenterY;
    let overlapX = halfWidthPlayer + halfWidthObstacle - Math.abs(dx);
    let overlapY = halfHeightPlayer + halfHeightObstacle - Math.abs(dy);
    if (overlapX < 0 || overlapY < 0) return;
    if (overlapX < overlapY) {
      if (dx > 0) {
        player.x += overlapX * 0.3;
      } else {
        player.x -= overlapX * 0.3;
      }
    } else {
      if (dy > 0) {
        player.absY += overlapY * 0.3;
      } else {
        player.absY -= overlapY * 0.3;
      }
    }
  }
  