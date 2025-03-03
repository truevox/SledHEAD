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
  let type = Math.random() < 0.5 ? "bear" : "bird";
  let isBear = (type === "bear");

  // Spawn just outside the viewport horizontally
  let spawnX = Math.random() * window.innerWidth
  let spawnY = player.absY -(window.innerHeight / 2)

  activeAnimal = {
      type: type,
      x: spawnX,
      y: spawnY,
      altitude: isBear ? 20 : 80,
      width: isBear ? player.width * 2 : player.width / 2,
      height: isBear ? player.height * 2 : player.height / 2,
      state: "sitting",
      hasBeenPhotographed: false,
      idleTime: Math.random() * (TWEAK.maxIdleTime - TWEAK.minIdleTime) + TWEAK.minIdleTime,
      speed: Math.random() * (TWEAK.maxMoveSpeed - TWEAK.minMoveSpeed) + TWEAK.minMoveSpeed,
      fleeAngleActual: 0,
      despawnTimer: null
  };

  let distanceToPlayer = Math.sqrt((spawnX - player.x) ** 2 + (spawnY - player.absY) ** 2);
  let inViewport = spawnX >= 0 && spawnX <= canvas.width && spawnY >= 0 && spawnY <= canvas.height;
  console.log(`[Spawn] ${activeAnimal.type} at (${spawnX.toFixed(2)}, ${spawnY.toFixed(2)}) | Player at (${player.x.toFixed(2)}, ${player.absY.toFixed(2)}) | In Viewport: ${inViewport} | Distance to Player: ${distanceToPlayer.toFixed(2)}`);

  setTimeout(() => {
      if (activeAnimal) {
          activeAnimal.state = "fleeing";
          // Set flee angle to be generally downwards (90 degrees) with a random offset
          let baseAngle = Math.random() * (135 - TWEAK.fleeAngle) + TWEAK.fleeAngle; // Downwards
          let angleOffset = Math.random() * TWEAK.fleeAngle;
          activeAnimal.fleeAngleActual = baseAngle + (Math.random() < 0.5 ? -angleOffset : angleOffset);
          let distanceToPlayerFlee = Math.sqrt((activeAnimal.x - player.x) ** 2 + (activeAnimal.y - player.absY) ** 2);
          let inViewportFlee = activeAnimal.x >= 0 && activeAnimal.x <= canvas.width && activeAnimal.y >= 0 && activeAnimal.y <= canvas.height;
          console.log(`[Flee] ${activeAnimal.type} fleeing | In Viewport: ${inViewportFlee} | Distance to Player: ${distanceToPlayerFlee.toFixed(2)}`);
      }
  }, activeAnimal.idleTime);
}

function updateAnimal() {
    if (!activeAnimal) return;

    // Debugging logs in updateAnimal function
    console.log(`Update Animal - State: ${activeAnimal.state}, Pos: (${activeAnimal.x.toFixed(2)}, ${activeAnimal.y.toFixed(2)})`);

    if (activeAnimal.state === "fleeing") {
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

        // Debug log for animal position relative to screen bounds
        console.log(`Animal position: (${activeAnimal.x.toFixed(2)}, ${activeAnimal.y.toFixed(2)}), Canvas: ${canvas.width}x${canvas.height}`);
        
        // Only despawn when the animal is at least 1000 units south of the player
        if (activeAnimal.y > player.absY + 1000) {
            console.log(`Animal moved 1000 units south of player - removed`);
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
