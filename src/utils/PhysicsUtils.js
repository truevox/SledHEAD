// src/utils/PhysicsUtils.js
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  export function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    // Check for invalid dimensions that might cause collision detection issues
    if (w1 <= 0 || h1 <= 0 || w2 <= 0 || h2 <= 0) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ⚠️ PHYSICS ANOMALY: Invalid collision dimensions detected, Object1=(${w1}x${h1}), Object2=(${w2}x${h2})`);
      return false;
    }
    
    // Check for objects that are extremely far apart (optimization issue)
    const distanceX = Math.abs((x1 + w1/2) - (x2 + w2/2));
    const distanceY = Math.abs((y1 + h1/2) - (y2 + h2/2));
    const farThreshold = 10000; // Arbitrary large distance threshold
    
    if (distanceX > farThreshold || distanceY > farThreshold) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🛠️ PHYSICS OPTIMIZATION: Distant objects in collision check, Distance=(${distanceX.toFixed(0)}, ${distanceY.toFixed(0)})`);
    }
    
    return !(x2 > x1 + w1 || 
             x2 + w2 < x1 || 
             y2 > y1 + h1 || 
             y2 + h2 < y1);
  }
  
  export function resolveCollision(player, obstacle) {
    const timestamp = new Date().toISOString();
    
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
    
    // Check for anomalies in collision data
    if (isNaN(overlapX) || isNaN(overlapY)) {
      console.log(`[${timestamp}] ❌ PHYSICS ERROR: NaN detected in collision calculation, Player=(${playerCenterX}, ${playerCenterY}), Obstacle=(${obstacleCenterX}, ${obstacleCenterY})`);
      return;
    }
    
    if (overlapX < 0 || overlapY < 0) return;
    
    // Check for unusually large overlaps (potential physics anomaly)
    const maxReasonableOverlap = Math.max(player.width, player.height, obstacle.width, obstacle.height);
    if (overlapX > maxReasonableOverlap || overlapY > maxReasonableOverlap) {
      console.log(`[${timestamp}] 🚨 PHYSICS ANOMALY: Unusually large overlap detected, OverlapX=${overlapX.toFixed(1)}, OverlapY=${overlapY.toFixed(1)}, Max reasonable=${maxReasonableOverlap.toFixed(1)}`);
    }
    
    // Log the collision detection (only for significant collisions to avoid spam)
    if (Math.max(overlapX, overlapY) > 5) {
      console.log(`[${timestamp}] 💥 COLLISION DETECTED: Player position=(${playerCenterX.toFixed(1)}, ${playerCenterY.toFixed(1)}), Obstacle position=(${obstacleCenterX.toFixed(1)}, ${obstacleCenterY.toFixed(1)}), Overlap=(${overlapX.toFixed(1)}, ${overlapY.toFixed(1)})`);
    }
    
    let resolutionDirection = "";
    let resolutionAmount = 0;
    let previousX = player.x;
    let previousY = player.absY;
    
    if (overlapX < overlapY) {
      if (dx > 0) {
        player.x += overlapX * 0.3;
        resolutionDirection = "RIGHT";
        resolutionAmount = overlapX * 0.3;
      } else {
        player.x -= overlapX * 0.3;
        resolutionDirection = "LEFT";
        resolutionAmount = overlapX * 0.3;
      }
    } else {
      if (dy > 0) {
        player.absY += overlapY * 0.3;
        resolutionDirection = "DOWN";
        resolutionAmount = overlapY * 0.3;
      } else {
        player.absY -= overlapY * 0.3;
        resolutionDirection = "UP";
        resolutionAmount = overlapY * 0.3;
      }
    }
    
    // Check for anomalies in the resolution
    if (isNaN(player.x) || isNaN(player.absY)) {
      console.log(`[${timestamp}] ❌ PHYSICS ERROR: NaN position after collision resolution, Previous=(${previousX}, ${previousY}), Direction=${resolutionDirection}`);
      // Restore previous position to prevent NaN propagation
      player.x = previousX;
      player.absY = previousY;
      return;
    }
    
    // Check for extreme position changes
    const positionDeltaX = Math.abs(player.x - previousX);
    const positionDeltaY = Math.abs(player.absY - previousY);
    if (positionDeltaX > 100 || positionDeltaY > 100) {
      console.log(`[${timestamp}] 🚨 PHYSICS ANOMALY: Extreme position change after collision, Delta=(${positionDeltaX.toFixed(1)}, ${positionDeltaY.toFixed(1)}), Direction=${resolutionDirection}`);
    }
    
    // Log the collision resolution (only for significant resolutions)
    if (resolutionAmount > 5) {
      console.log(`[${timestamp}] ⚙️ COLLISION RESOLVED: Direction=${resolutionDirection}, Amount=${resolutionAmount.toFixed(1)}, New player position=(${player.x.toFixed(1)}, ${player.absY.toFixed(1)})`);
    }
  }
  