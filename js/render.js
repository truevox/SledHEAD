/* render.js - Rendering Logic */

// Add throttled logging mechanism
const renderLogThrottleTimes = {};
function throttledRenderLog(message, throttleTime = 5000) {
  const currentTime = Date.now();
  const key = message.split(' ')[0]; // Use the first word of the message as the key
  
  if (!renderLogThrottleTimes[key] || (currentTime - renderLogThrottleTimes[key] >= throttleTime)) {
    console.log(message);
    renderLogThrottleTimes[key] = currentTime;
  }
}

// Floating Text System (unchanged)
class FloatingText {
  constructor(text, x, y) {
    this.text = text;
    this.x = x;
    this.initialY = y;
    this.age = 0;
    this.lifetime = 1000;
    this.visualOffsetY = -30;
  }

  update(deltaTime) {
    this.age += deltaTime;
    this.visualOffsetY -= deltaTime * 0.25;
    return this.age < this.lifetime;
  }

  draw(ctx, cameraY) {
    const alpha = 1 - (this.age / this.lifetime);
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    const screenY = player.absY - cameraY + this.visualOffsetY;
    ctx.fillText(this.text, this.x, screenY);
  }
}

function addFloatingText(text, x, y) {
  window.floatingTexts.push(new FloatingText(text, x, y - 30));
}

// No changes to money display logic
function updateLiveMoney() {
  let distanceTraveled = Math.max(1, player.absY - playerStartAbsY);
  distanceTraveled = Math.max(1, distanceTraveled);
  let moneyEarned = Math.floor(distanceTraveled / 100);
  moneyEarned = Math.max(1, moneyEarned);
  let moneyText = document.getElementById("moneyText");
  if (moneyText) {
    moneyText.textContent = `Money: $${player.money} (+$${moneyEarned})`;
  }
}

function showMoneyGain(amount, source = "") {
  let moneyText = document.getElementById("moneyText");
  if (moneyText) {
    if (source) {
      moneyText.textContent = `Money: $${player.money} (+$${amount} ${source})`;
    } else {
      moneyText.textContent = `Money: $${player.money} (+$${amount})`;
    }
    moneyText.classList.add("money-increase");
    setTimeout(() => {
      moneyText.classList.remove("money-increase");
    }, 100);
  }
}

function updateMoneyDisplay() {
  let moneyText = document.getElementById("moneyText");
  if (moneyText) {
    moneyText.textContent = `Money: $${player.money}`;
  }
}

// MAIN RENDER
function render() {
  // Clear the canvas each frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background color depends on state
  ctx.fillStyle = (window.currentState === window.GameState.DOWNHILL) ? "#ADD8E6" : "#98FB98";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawEntities();
  ctx.save();
  window.floatingTexts.forEach(text => text.draw(ctx, player.absY - canvas.height / 2));
  ctx.restore();
  drawReHitIndicator();
  throttledRenderLog("render END", 5000);
}

function drawEntities() {
  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
  // Get player's current layer for wrapping visualization
  const playerLayer = getLayerByY(player.absY);
  const playerLayerWidth = playerLayer.width;

  // Terrain
  terrain.forEach(obstacle => {
    if (obstacle.y >= cameraOffset - 50 && obstacle.y <= cameraOffset + canvas.height + 50) {
      // Get the layer for this obstacle
      const obstacleLayer = getLayerByY(obstacle.y);
      const layerWidth = obstacleLayer.width;
      
      if (obstacle.type === 'tree') {
        // Draw the tree
        drawTree(ctx, {
          x: obstacle.x,
          y: obstacle.y - cameraOffset,
          width: obstacle.width,
          height: obstacle.height
        });
        
        // Draw wrapped version if near edges
        const wrapThreshold = obstacle.width * 2;
        if (obstacle.x < wrapThreshold) {
          // Draw duplicate on right side
          drawTree(ctx, {
            x: obstacle.x + layerWidth,
            y: obstacle.y - cameraOffset,
            width: obstacle.width,
            height: obstacle.height
          });
        } else if (obstacle.x > layerWidth - wrapThreshold) {
          // Draw duplicate on left side
          drawTree(ctx, {
            x: obstacle.x - layerWidth,
            y: obstacle.y - cameraOffset,
            width: obstacle.width,
            height: obstacle.height
          });
        }
      } else {
        // Draw the rock
        ctx.fillStyle = "#808080";
        ctx.fillRect(obstacle.x, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
        
        // Draw wrapped version if near edges
        const wrapThreshold = obstacle.width * 2;
        if (obstacle.x < wrapThreshold) {
          // Draw duplicate on right side
          ctx.fillRect(obstacle.x + layerWidth, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
        } else if (obstacle.x > layerWidth - wrapThreshold) {
          // Draw duplicate on left side
          ctx.fillRect(obstacle.x - layerWidth, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
        }
      }
    }
  });

  // Player
  let playerDrawY = player.absY - cameraOffset;
  
  // Draw player with wrapping if near edges
  drawPlayerWithWrapping(playerDrawY, playerLayerWidth);

  drawCameraOverlay();
  drawAnimal();
}

/**
 * Draws the player with wrapping at layer edges
 * @param {number} playerDrawY - The Y position to draw the player at
 * @param {number} layerWidth - The width of the current layer
 */
function drawPlayerWithWrapping(playerDrawY, layerWidth) {
  // Define a threshold for when to draw the wrapped player
  const wrapThreshold = player.width * 2;
  
  // First, draw the player at their actual position
  drawPlayerAt(player.x, playerDrawY);
  
  // Check if player is near the edges and draw wrapped versions
  if (player.x < wrapThreshold) {
    // Draw duplicate on right side
    drawPlayerAt(player.x + layerWidth, playerDrawY);
  } else if (player.x > layerWidth - wrapThreshold) {
    // Draw duplicate on left side
    drawPlayerAt(player.x - layerWidth, playerDrawY);
  }
}

/**
 * Draws the player at the specified position
 * @param {number} x - The X position to draw at
 * @param {number} y - The Y position to draw at
 */
function drawPlayerAt(x, y) {
  ctx.save();
  if (player.currentTrick) {
    if (player.currentTrick === "leftHelicopter" || player.currentTrick === "rightHelicopter") {
      ctx.translate(x, y);
      ctx.rotate(player.trickRotation * Math.PI / 180);
      ctx.translate(-x, -y);
    } else if (player.currentTrick === "airBrake" || player.currentTrick === "parachute") {
      y += (player.currentTrick === "airBrake") ? player.trickOffset : -player.trickOffset;
    }
  }
  
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(x - player.width / 2, y - player.height / 2, player.width, player.height);

  if (player.currentTrick === "airBrake" || player.currentTrick === "parachute") {
    ctx.fillStyle = "#FFFF00";
    ctx.beginPath();
    ctx.arc(x, y - player.trickOffset, player.width / 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCameraOverlay() {
  if (window.currentState !== window.GameState.UPHILL) return;
  
  let cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
  let centerX = player.x;
  let centerY = player.absY - cameraOffset;
  
  // Get the current layer width for wrapping
  const playerLayer = getLayerByY(player.absY);
  const layerWidth = playerLayer.width;
  
  // Define wrapping threshold
  const wrapThreshold = 300; // Based on cone length
  
  // Draw the main camera overlay
  drawCameraOverlayAt(centerX, centerY);
  
  // Check if we need to draw wrapped versions
  if (centerX < wrapThreshold) {
    // Draw on right side
    drawCameraOverlayAt(centerX + layerWidth, centerY);
  } else if (centerX > layerWidth - wrapThreshold) {
    // Draw on left side
    drawCameraOverlayAt(centerX - layerWidth, centerY);
  }
}

/**
 * Draws the camera overlay at the specified position
 * @param {number} centerX - The X center position to draw at
 * @param {number} centerY - The Y center position to draw at
 */
function drawCameraOverlayAt(centerX, centerY) {
  let coneLength = 300;
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

  let offsetTop = (coneLength / 2) + player.height;
  let offsetBottom = player.height / 2;
  let offset = mapRange(player.altitudeLine, 0, 100, offsetTop, offsetBottom);
  let rad = player.cameraAngle * Math.PI / 180;
  let lineCenterX = centerX + offset * Math.cos(rad);
  let lineCenterY = centerY + offset * Math.sin(rad);
  let lineLength = 100;
  let perpX = -Math.sin(rad);
  let perpY = Math.cos(rad);
  let x1 = lineCenterX - (lineLength / 2) * perpX;
  let y1 = lineCenterY - (lineLength / 2) * perpY;
  let x2 = lineCenterX + (lineLength / 2) * perpX;
  let y2 = lineCenterY + (lineLength / 2) * perpY;
  let t = 1 - (player.altitudeLine / 100);
  let altitudeColor = lerpColor("#FF0000", "#0000FF", t);
  ctx.strokeStyle = altitudeColor;
  ctx.lineWidth = 3;

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

function drawReHitIndicator() {
  if (!player.isJumping) return;
  const progress = player.jumpTimer / player.jumpDuration;
  if (progress >= TWEAK.reHitWindowStart && progress < 1.0) {
    ctx.save();
    ctx.beginPath();
    const radius = (player.baseWidth * TWEAK.reHitIndicatorScale) / 2;
    const cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
    const screenY = canvas.height / 2 + (player.absY - cameraOffset - canvas.height / 2);
    ctx.shadowColor = TWEAK.reHitIndicatorOutlineColor;
    ctx.shadowBlur = 20;
    ctx.lineWidth = 3;
    const pulseScale = 1 + Math.sin(Date.now() / 100) * 0.1;
    ctx.arc(player.x, screenY, radius * pulseScale, 0, Math.PI * 2);
    ctx.fillStyle = TWEAK.reHitIndicatorColor;
    ctx.fill();
    ctx.strokeStyle = TWEAK.reHitIndicatorOutlineColor;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
}
