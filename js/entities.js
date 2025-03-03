/* entities.js */
function resolveCollision(player, obstacle) {
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

function drawEntities() {
  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = currentState === GameState.DOWNHILL ? "#ADD8E6" : "#98FB98";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  terrain.forEach(obstacle => {
    if (obstacle.y >= cameraOffset - 50 && obstacle.y <= cameraOffset + canvas.height + 50) {
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(obstacle.x, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
    }
  });
  let playerDrawY = player.absY - cameraOffset;
  ctx.fillStyle = "#964B00";
  ctx.fillRect(player.x - player.width / 2, playerDrawY - player.height / 2, player.width, player.height);
  drawCameraOverlay();
  drawAnimal(); // Add this call so the animal is drawn
}


function drawCameraOverlay() {
  // Only show the overlay when in the UPHILL state
  if (currentState !== GameState.UPHILL) return;

  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
  let centerX = player.x;
  let centerY = player.absY - cameraOffset;
  let coneLength = 300;  // Length of the camera cone

  // Draw the camera POV Cone
  let povAngle = TWEAK.basePOVAngle + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsPOVIncrease);
  let leftAngle = (player.cameraAngle - povAngle / 2) * (Math.PI / 180);
  let rightAngle = (player.cameraAngle + povAngle / 2) * (Math.PI / 180);

  ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + coneLength * Math.cos(leftAngle), centerY + coneLength * Math.sin(leftAngle));
  ctx.lineTo(centerX + coneLength * Math.cos(rightAngle), centerY + coneLength * Math.sin(rightAngle));
  ctx.closePath();
  ctx.fill();

  /*
    Altitude Line Offset:
    altitudeLine=0  => top of sprite (slightly above)
    altitudeLine=100 => bottom of sprite
  */
  let offsetTop = ((coneLength / 2) + player.height); // let offsetTop = -((coneLength / 2) + (player.height / 2));
  let offsetBottom = player.height / 2;

  // Convert altitudeLine (0..100) into offset along camera's central axis
  let offset = mapRange(player.altitudeLine, 0, 100, offsetTop, offsetBottom);

  // Position along the camera's central axis
  let rad = player.cameraAngle * Math.PI / 180;
  let lineCenterX = centerX + offset * Math.cos(rad);
  let lineCenterY = centerY + offset * Math.sin(rad);

  // The altitude line is drawn perpendicular to camera direction
  let lineLength = 100; 
  let perpX = -Math.sin(rad);
  let perpY = Math.cos(rad);

  let x1 = lineCenterX - (lineLength / 2) * perpX;
  let y1 = lineCenterY - (lineLength / 2) * perpY;
  let x2 = lineCenterX + (lineLength / 2) * perpX;
  let y2 = lineCenterY + (lineLength / 2) * perpY;

  // Color from blue (#0000FF) at altitudeLine=0 to red (#FF0000) at 100
  let t = player.altitudeLine / 100;
  let altitudeColor = lerpColor("#0000FF", "#FF0000", t);
  ctx.strokeStyle = altitudeColor;
  ctx.lineWidth = 3;

  // Flash only if there's an animal inside the POV cone
  if (typeof animal !== "undefined" && animal && isAnimalInsideCone(animal)) {
    let flashSpeed = mapRange(
      Math.abs(player.altitudeLine - animal.y),
      0, 100,
      TWEAK.altitudeFlashMaxSpeed,
      TWEAK.altitudeFlashMinSpeed
    );
    if (Math.floor(Date.now() / flashSpeed) % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  } else {
    // Draw steadily if no animal is in the cone
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}



function isAnimalInsideCone(animal) {
  let povAngle = TWEAK.basePOVAngle + (playerUpgrades.optimalOptics * TWEAK.optimalOpticsPOVIncrease);
  let leftLimit = player.cameraAngle - povAngle / 2;
  let rightLimit = player.cameraAngle + povAngle / 2;

  let angleToAnimal = Math.atan2(animal.y - player.absY, animal.x - player.x) * (180 / Math.PI);
  if (angleToAnimal < 0) angleToAnimal += 360;

  return angleToAnimal >= leftLimit && angleToAnimal <= rightLimit;
}

/* ============================= */
/* ANIMAL SPAWNING AND BEHAVIOR  */
/* ============================= */

let activeAnimal = null;
let lastPhotoTime = 0;

function spawnAnimal() {
    if (activeAnimal) return; // Only one animal at a time

    let type = Math.random() < 0.5 ? "bear" : "bird"; // 50/50 chance of either
    let isBear = type === "bear";
    
    activeAnimal = {
        type: type,
        x: Math.random() < 0.5 ? -50 : canvas.width + 50, // Left or right off-screen
        y: Math.random() * (canvas.height * 0.8) + (isBear ? canvas.height * 0.1 : 0), // Bears lower, birds higher
        altitude: Math.random() < 0.8 ? (isBear ? 20 : 80) : (isBear ? 80 : 20), // 80% chance of normal altitude
        width: isBear ? player.width * 2 : player.width / 2,
        height: isBear ? player.height * 2 : player.height / 2,
        state: "sitting", // Starts sitting
        hasBeenPhotographed: false,
        idleTime: Math.random() * (TWEAK.maxIdleTime - TWEAK.minIdleTime) + TWEAK.minIdleTime,
        speed: Math.random() * (TWEAK.maxMoveSpeed - TWEAK.minMoveSpeed) + TWEAK.minMoveSpeed,
        direction: Math.random() < 0.5 ? -1 : 1 // Move left or right
    };

    setTimeout(() => {
        if (activeAnimal) activeAnimal.state = "moving";
    }, activeAnimal.idleTime);
    console.log(`Spawned animal of type ${activeAnimal.type} at (${activeAnimal.x}, ${activeAnimal.y})`);

}

// Function to update animal movement
function updateAnimal() {
    if (!activeAnimal) return;

    if (activeAnimal.state === "moving") {
        activeAnimal.x += activeAnimal.direction * activeAnimal.speed;
        activeAnimal.y += Math.tan(TWEAK.fleeAngle * Math.PI / 180) * activeAnimal.speed; // Flee at angle

        if (activeAnimal.x < -100 || activeAnimal.x > canvas.width + 100) {
            activeAnimal = null; // Remove when off-screen
            setTimeout(spawnAnimal, Math.random() * (TWEAK.maxSpawnTime - TWEAK.minSpawnTime) + TWEAK.minSpawnTime);
        }
    }
}

// Function to draw the animal
function drawAnimal() {
  if (!activeAnimal) return;
  // Set color: bears become black, birds become purple.
  ctx.fillStyle = activeAnimal.type === "bear" ? "#000000" : "#800080";
  ctx.fillRect(activeAnimal.x, activeAnimal.y, activeAnimal.width, activeAnimal.height);
}
