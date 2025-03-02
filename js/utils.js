/* utils.js */
function formatUpgradeName(name) {
    let formattedName = name.replace(/([A-Z])/g, ' $1').trim();
    return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
  }
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  function checkCollision(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }
  function getCameraOffset(playerAbsY, canvasHeight, mountainHeight) {
    let offset = playerAbsY - canvasHeight / 2;
    return clamp(offset, 0, mountainHeight - canvasHeight);
  }
  