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
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(player.x - player.width / 2, playerDrawY - player.height / 2, player.width, player.height);
  drawCameraOverlay();

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
