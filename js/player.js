/* player.js */
let player = {
    x: canvas.width / 2,
    absY: 0,
    width: 20,
    height: 20,
    velocityY: 0,
    xVel: 0,
    collisions: 0,
    bestTime: Infinity,
    money: TWEAK.starterCash,
    // Camera aim properties
    player,cameraAngle: 0,  // Camera rotation in degrees
    player,altitudeLine: 50, // Starts at 50% of the view range

  };
  