// src/rendering/Effects.js
import { mapRange, lerpColor } from '../utils/MathUtils.js';
import { player } from '../gameplay/Player.js';
import { activeAnimal } from '../gameplay/Wildlife.js';

export function drawCameraOverlay(ctx, player, canvas, mountainHeight) {
  // Only display overlay in UPHILL state
  if (window.currentState !== 'UPHILL') return;
  
  let cameraOffset = player.absY - (canvas.height / 2); // or use getCameraOffset()
  let centerX = player.x;
  let centerY = player.absY - cameraOffset;
  let coneLength = 300;
  // Calculate POV angle using a base value plus any upgrade bonus (example: 30° base and +5° per level)
  let povAngle = 30 + (player.optimalOptics ? player.optimalOptics * 5 : 0);
  let leftAngle = (player.cameraAngle - povAngle / 2) * (Math.PI / 180);
  let rightAngle = (player.cameraAngle + povAngle / 2) * (Math.PI / 180);
  
  ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + coneLength * Math.cos(leftAngle), centerY + coneLength * Math.sin(leftAngle));
  ctx.lineTo(centerX + coneLength * Math.cos(rightAngle), centerY + coneLength * Math.sin(rightAngle));
  ctx.closePath();
  ctx.fill();

  // Altitude line: map altitudeLine [0,100] to an offset
  let offsetTop = ((coneLength / 2) + player.height);
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

  if (activeAnimal && isAnimalInsideCone(player, activeAnimal)) {
    let flashSpeed = mapRange(Math.abs(player.altitudeLine - activeAnimal.altitude), 0, 100, 10, 200);
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

function isAnimalInsideCone(player, animal) {
  let povAngle = 30 + (player.optimalOptics ? player.optimalOptics * 5 : 0);
  let leftLimit = player.cameraAngle - povAngle / 2;
  let rightLimit = player.cameraAngle + povAngle / 2;
  let angleToAnimal = Math.atan2(animal.y - player.absY, animal.x - player.x) * (180 / Math.PI);
  if (angleToAnimal < 0) angleToAnimal += 360;
  return angleToAnimal >= leftLimit && angleToAnimal <= rightLimit;
}
