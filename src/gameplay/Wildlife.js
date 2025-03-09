// src/gameplay/Wildlife.js
import { player } from './Player.js';
import { getCameraOffset } from '../utils/MathUtils.js';
import { checkCollision, resolveCollision } from '../utils/PhysicsUtils.js';

export let activeAnimal = null;
let lastPhotoTime = 0;

export function spawnAnimal() {
  if (activeAnimal) return;
  let type = Math.random() < 0.5 ? "bear" : "bird";
  let isBear = (type === "bear");
  let spawnX = (window.innerWidth * 0.1) + (Math.random() * window.innerWidth * 0.9);
  let spawnY = player.absY - (window.innerHeight / 2);
  activeAnimal = {
    type: type,
    x: spawnX,
    y: spawnY,
    altitude: isBear ? 20 : 80,
    width: isBear ? player.width * 2 : player.width / 2,
    height: isBear ? player.height * 2 : player.height / 2,
    state: "sitting",
    hasBeenPhotographed: false,
    idleTime: Math.random() * (20000 - 1000) + 1000,
    speed: Math.random() * (11.2 - 5) + 5,
    fleeAngleActual: 0,
    despawnTimer: null
  };
  console.log(`[Spawn] ${activeAnimal.type} spawned.`);
  setTimeout(() => {
    if (activeAnimal) {
      activeAnimal.state = "fleeing";
      let baseAngle = spawnX > window.innerWidth / 2 
        ? (Math.random() * (170 - 135) + 135) 
        : (Math.random() * (55 - 20) + 20);
      let angleOffset = Math.random() * 45;
      activeAnimal.fleeAngleActual = baseAngle + (Math.random() < 0.5 ? -angleOffset : angleOffset);
      console.log(`[Flee] ${activeAnimal.type} fleeing at angle ${activeAnimal.fleeAngleActual.toFixed(2)}°`);
    }
  }, activeAnimal.idleTime);
}

export function updateAnimal() {
  if (!activeAnimal) return;
  if (activeAnimal.state === "fleeing") {
    if (!activeAnimal.fleeingLogOnce) {
      console.log(`Animal fleeing - Type: ${activeAnimal.type}`);
      activeAnimal.fleeingLogOnce = true;
    }
    let rad = activeAnimal.fleeAngleActual * Math.PI / 180;
    activeAnimal.x += Math.cos(rad) * activeAnimal.speed * 0.5;
    activeAnimal.y += Math.sin(rad) * activeAnimal.speed * 0.5;
    if (activeAnimal.x < -100 || activeAnimal.x > window.innerWidth + 100 || activeAnimal.y > player.absY + 1000) {
      console.log("Animal moved off screen - removed");
      activeAnimal = null;
      setTimeout(spawnAnimal, Math.random() * (10000 - 5000) + 5000);
    }
  }
}

export function updateWildlifeCollision(player) {
  if (activeAnimal) {
    if (checkCollision(
      player.x - player.width / 2, player.absY - player.height / 2,
      player.width, player.height,
      activeAnimal.x, activeAnimal.y,
      activeAnimal.width, activeAnimal.height
    )) {
      resolveCollision(player, activeAnimal);
    }
  }
}

export function drawAnimal(ctx) {
  if (!activeAnimal) return;
  let cameraOffset = getCameraOffset(player.absY, window.innerHeight, 1000);
  ctx.fillStyle = activeAnimal.type === "bear" ? "#000000" : "#800080";
  ctx.fillRect(activeAnimal.x, activeAnimal.y - cameraOffset, activeAnimal.width, activeAnimal.height);
}
