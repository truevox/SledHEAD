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
    // if (activeAnimal) return; // Only one animal at a time

    let type = Math.random() < 0.5 ? "bear" : "bird";
    let isBear = (type === "bear");

    let spawnX = Math.random() * canvas.width;

    // Choose a target within the middle 80% of the screen
    let targetX = Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
    let targetY = player.absY + (canvas.height * 0.8) + canvas.height * 0.1;

    activeAnimal = {
        type: type,
        x: spawnX,
        y: 0,
        targetX: targetX,
        targetY: targetY,
        // Bears tend to be low (20) and birds high (80)
        altitude: isBear ? 20 : 80,
        width: isBear ? player.width * 2 : player.width / 2,
        height: isBear ? player.height * 2 : player.height / 2,
        state: "approaching", // "approaching", "sitting", "fleeing"
        hasBeenPhotographed: false,
        idleTime: Math.random() * (TWEAK.maxIdleTime - TWEAK.minIdleTime) + TWEAK.minIdleTime,
        speed: Math.random() * (TWEAK.maxMoveSpeed - TWEAK.minMoveSpeed) + TWEAK.minMoveSpeed,
        fleeAngleActual: 0 // Will be set when switching to fleeing
    };

    // Spawn from just off the top of the screen
    let spawnY = player.absY - 500; // ADJUST ME
    activeAnimal.y = spawnY;

    activeAnimal.state = "sitting";

    setTimeout(() => {
        if (activeAnimal) {
            activeAnimal.state = "fleeing";
            // Choose flee direction: base 0° (right) or 180° (left) plus a random offset up to TWEAK.fleeAngle.
            let baseAngle = Math.random() < 0.5 ? 0 : 180;
            let angleOffset = Math.random() * TWEAK.fleeAngle;
            activeAnimal.fleeAngleActual = baseAngle + (Math.random() < 0.5 ? -angleOffset : angleOffset);
        }
    }, activeAnimal.idleTime);

    console.log(`Spawned ${activeAnimal.type} at (${activeAnimal.x.toFixed(2)}, ${activeAnimal.y.toFixed(2)}) moving to (${activeAnimal.targetX.toFixed(2)}, ${activeAnimal.targetY.toFixed(2)})`);
    console.log(`Animal idleTime: ${activeAnimal.idleTime.toFixed(2)}`); // Debug idleTime
}

function updateAnimal() {
    if (!activeAnimal) return;

    // Debugging logs in updateAnimal function
    console.log(`Update Animal - State: ${activeAnimal.state}, Pos: (${activeAnimal.x.toFixed(2)}, ${activeAnimal.y.toFixed(2)})`);

    if (activeAnimal.state === "approaching") {
        let dx = activeAnimal.targetX - activeAnimal.x;
        let dy = activeAnimal.targetY - activeAnimal.y;
        let distance = Math.sqrt(dx * dx + dy * dy) / 200;
        if (distance < 5) {
            activeAnimal.state = "sitting";
        }
    } else if (activeAnimal.state === "fleeing") {
        let rad = activeAnimal.fleeAngleActual * Math.PI / 180;
        activeAnimal.x += Math.cos(rad) * activeAnimal.speed;
        activeAnimal.y += Math.sin(rad) * activeAnimal.speed;
        // When the animal moves completely off screen, remove it and schedule the next spawn.
        if (activeAnimal.x < -100 || activeAnimal.x > canvas.width + 100 ||
            activeAnimal.y < -100 || activeAnimal.y > canvas.height + 100) {
            activeAnimal = null;
            setTimeout(spawnAnimal, Math.random() * (TWEAK.maxSpawnTime - TWEAK.minSpawnTime) + TWEAK.minSpawnTime);
        }
    } else if (activeAnimal.state === "fleeing") {
        // Debug log when animal starts fleeing
        if (activeAnimal.fleeingLogOnce !== true) {
            console.log(`Animal fleeing - Angle: ${activeAnimal.fleeAngleActual.toFixed(2)}, Speed: ${activeAnimal.speed.toFixed(2)}`);
            activeAnimal.fleeingLogOnce = true; // Prevent repeated logs
        }

        let rad = activeAnimal.fleeAngleActual * Math.PI / 180;
        activeAnimal.x += Math.cos(rad) * activeAnimal.speed * 0.5; // Slow down flee speed by 50%
        activeAnimal.y += Math.sin(rad) * activeAnimal.speed * 0.5; // Slow down flee speed by 50%

        // Debug log during fleeing movement
        console.log(`Animal fleeing - Pos: (${activeAnimal.x.toFixed(2)}, ${activeAnimal.y.toFixed(2)})`);

        // When the animal moves completely off screen, remove it and schedule the next spawn.
        if (activeAnimal.x < -100 || activeAnimal.x > canvas.width + 100 ||
            activeAnimal.y < -100 || activeAnimal.y > canvas.height + 100) {
            console.log(`Animal offscreen - removed`); // Debug log when animal is removed
            activeAnimal = null;
            setTimeout(spawnAnimal, Math.random() * (TWEAK.maxSpawnTime - TWEAK.minSpawnTime) + TWEAK.minSpawnTime);
        }
    }
}

function drawAnimal() {
    if (!activeAnimal) return;
    let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
    // Draw bears in black and birds in purple.
    ctx.fillStyle = activeAnimal.type === "bear" ? "#000000" : "#800080";
    ctx.fillRect(activeAnimal.x, activeAnimal.y - cameraOffset, activeAnimal.width, activeAnimal.height);
}

function drawEntities() {
  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = currentState === GameState.DOWNHILL ? "#ADD8E6" : "#98FB98";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  terrain.forEach(obstacle => {
    if (obstacle.y >= cameraOffset - 50 && obstacle.y <= cameraOffset + canvas.height + 50) {
      ctx.fillStyle = "#808080"; // Obstacles now grey
      ctx.fillRect(obstacle.x, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
    }
  });
  let playerDrawY = player.absY - cameraOffset;
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(player.x - player.width / 2, playerDrawY - player.height / 2, player.width, player.height);
  drawCameraOverlay();
  drawAnimal();
}

function drawCameraOverlay() {
  // Only display the overlay when in UPHILL mode.
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

  // Altitude Line:
  // Map altitudeLine [0,100] to an offset along the camera's central axis such that
  // 0 aligns with the player sprite’s bottom and 100 with its top.
  let offsetTop = ((coneLength / 2) + player.height);
  let offsetBottom = player.height / 2;
  let offset = mapRange(player.altitudeLine, 0, 100, offsetTop, offsetBottom);

  let rad = player.cameraAngle * Math.PI / 180;
  let lineCenterX = centerX + offset * Math.cos(rad);
  let lineCenterY = centerY + offset * Math.sin(rad);

  // Draw altitude line perpendicular to camera direction.
  let lineLength = 100;
  let perpX = -Math.sin(rad);
  let perpY = Math.cos(rad);
  let x1 = lineCenterX - (lineLength / 2) * perpX;
  let y1 = lineCenterY - (lineLength / 2) * perpY;
  let x2 = lineCenterX + (lineLength / 2) * perpX;
  let y2 = lineCenterY + (lineLength / 2) * perpY;

  // Color: blue when altitudeLine is 100 (top) and red when 0 (bottom)
  let t = 1 - (player.altitudeLine / 100);
  let altitudeColor = lerpColor("#FF0000", "#0000FF", t);
  ctx.strokeStyle = altitudeColor;
  ctx.lineWidth = 3;

  // Flash the altitude line only if an animal is inside the POV cone.
  if (activeAnimal && isAnimalInsideCone(activeAnimal)) {
      let flashSpeed = mapRange(Math.abs(player.altitudeLine - activeAnimal.altitude), 0, 100, TWEAK.altitudeFlashMaxSpeed, TWEAK.altitudeFlashMinSpeed);
      if (Math.floor(Date.now() / flashSpeed) % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
      }
  } else {
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
