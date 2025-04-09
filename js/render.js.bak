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

// Store camera position for smooth interpolation
let cameraX = 0;
let cameraTargetX = 0;
const cameraLerpFactor = 0.1; // Adjust for smoother or snappier camera follow

// Make camera variables available globally
window.cameraX = cameraX;
window.cameraTargetX = cameraTargetX;

/**
 * Updates the camera position to follow the player's X position with wrapping
 * @param {number} playerX - Player's current X position
 * @param {number} layerWidth - Width of the current layer
 */
function updateCameraX(playerX, layerWidth) {
  // Calculate canvas center position - this is where we want the player to appear
  const canvasCenterX = canvas.width / 2;
  
  // Calculate the potential camera X position (centered on player)
  cameraTargetX = playerX - canvasCenterX;
  
  // Determine wrapping direction - calculate both direct and wrapped distance between camera positions
  const directDistance = Math.abs(cameraTargetX - cameraX);
  
  // If the player is near a layer edge, we need to handle wrapping specially
  // Check if the player is closer when wrapped
  const wrappedPlayerPos = playerX < canvasCenterX ? playerX + layerWidth : playerX - layerWidth;
  const wrappedCameraTarget = wrappedPlayerPos - canvasCenterX;
  const wrappedDistance = Math.abs(wrappedCameraTarget - cameraX);
  
  // Use the smaller distance for smoother camera transitions
  if (wrappedDistance < directDistance) {
    cameraTargetX = wrappedCameraTarget;
  }
  
  // Smooth interpolation to target position
  cameraX = cameraX + (cameraTargetX - cameraX) * cameraLerpFactor;
  
  // If we're very close to the target, snap to it to avoid microstutters
  if (Math.abs(cameraX - cameraTargetX) < 0.1) {
    cameraX = cameraTargetX;
  }
  
  // Update global variables for other modules to access
  window.cameraX = cameraX;
  window.cameraTargetX = cameraTargetX;
  
  // log camera position every second
  throttledRenderLog(`Camera: X=${cameraX.toFixed(1)}, TargetX=${cameraTargetX.toFixed(1)}, PlayerX=${playerX.toFixed(1)}`, 1000);
  
  // The actual drawing offset will be based on cameraX and wrapping will be handled in the drawing functions
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

  // Get player's current layer for camera and wrapping
  const playerLayer = getLayerByY(player.absY);
  const layerWidth = playerLayer.width;
  
  // Update camera position with wrapping support
  updateCameraX(player.x, layerWidth);

  drawEntities();
  ctx.save();
  window.floatingTexts.forEach(text => text.draw(ctx, player.absY - canvas.height / 2));
  ctx.restore();
  drawReHitIndicator();
  throttledRenderLog("render END", 5000);
}

function drawEntities() {
  // Get vertical camera offset (unchanged)
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
      
      // Calculate wrapped obstacle position relative to camera
      const wrappedObstacleX = calculateWrappedPosRelativeToCamera(obstacle.x, cameraX, layerWidth);
      
      if (obstacle.type === 'tree') {
        // Draw the tree
        drawTree(ctx, {
          x: wrappedObstacleX,
          y: obstacle.y - cameraOffset,
          width: obstacle.width,
          height: obstacle.height
        });
        
        // Draw wrapped versions if near edges of visible area
        const viewThreshold = canvas.width + obstacle.width * 2;
        
        // If the obstacle is near the right edge of view
        if (wrappedObstacleX > canvas.width - obstacle.width * 2) {
          drawTree(ctx, {
            x: wrappedObstacleX - layerWidth,
            y: obstacle.y - cameraOffset,
            width: obstacle.width,
            height: obstacle.height
          });
        }
        // If the obstacle is near the left edge of view
        else if (wrappedObstacleX < obstacle.width * 2) {
          drawTree(ctx, {
            x: wrappedObstacleX + layerWidth,
            y: obstacle.y - cameraOffset,
            width: obstacle.width,
            height: obstacle.height
          });
        }
      } else {
        // Draw the rock
        ctx.fillStyle = "#808080";
        ctx.fillRect(
          wrappedObstacleX, 
          obstacle.y - cameraOffset, 
          obstacle.width, 
          obstacle.height
        );
        
        // Draw wrapped versions if near edges of visible area
        const viewThreshold = canvas.width + obstacle.width * 2;
        
        // If the obstacle is near the right edge of view
        if (wrappedObstacleX > canvas.width - obstacle.width * 2) {
          ctx.fillRect(
            wrappedObstacleX - layerWidth, 
            obstacle.y - cameraOffset, 
            obstacle.width, 
            obstacle.height
          );
        }
        // If the obstacle is near the left edge of view
        else if (wrappedObstacleX < obstacle.width * 2) {
          ctx.fillRect(
            wrappedObstacleX + layerWidth, 
            obstacle.y - cameraOffset, 
            obstacle.width, 
            obstacle.height
          );
        }
      }
    }
  });

  // Player
  let playerDrawY = player.absY - cameraOffset;
  
  // Draw player centered on screen, regardless of its actual X position
  const playerDrawX = canvas.width / 2;
  drawPlayerAt(playerDrawX, playerDrawY);

  drawCameraOverlay();
  drawAnimal();
}

/**
 * Calculates the screen position of an entity considering camera position and wrapping
 * @param {number} entityX - Entity's world X position
 * @param {number} cameraX - Current camera X position
 * @param {number} layerWidth - Width of the current layer
 * @returns {number} The wrapped screen position
 */
function calculateWrappedPosRelativeToCamera(entityX, cameraX, layerWidth) {
  // Start with the direct calculation
  let screenX = entityX - cameraX;
  
  // Check if there's a closer wrapped position
  const directDist = Math.abs(screenX);
  const wrappedRight = screenX + layerWidth;
  const wrappedLeft = screenX - layerWidth;
  
  // Choose the closest representation
  if (Math.abs(wrappedRight) < directDist) {
    return wrappedRight;
  } else if (Math.abs(wrappedLeft) < directDist) {
    return wrappedLeft;
  }
  
  return screenX;
}

// Make the function available globally
window.calculateWrappedPosRelativeToCamera = calculateWrappedPosRelativeToCamera;

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
  
  // Use center of canvas for camera overlay, not the raw player position
  let centerX = canvas.width / 2;
  let centerY = player.absY - cameraOffset;
  
  // Draw the camera overlay at the center of the screen
  drawCameraOverlayAt(centerX, centerY);
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
