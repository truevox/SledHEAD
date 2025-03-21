/* trees.js - Tree Generation and Rendering */

/**
 * Generates clusters of trees across the terrain
 * @param {Object} options Configuration options
 * @param {number} options.count Number of tree clusters to generate
 * @param {Object} options.terrainBounds Bounds for placing trees {xMin, xMax, yMin, yMax}
 * @param {number} options.playerSize Reference size to scale trees relative to player
 * @returns {Array} Array of tree objects with positions and dimensions
 */
function generateTreeClumps(options) {
  const { count, terrainBounds, playerSize } = options;
  const clumps = [];
  
  for (let i = 0; i < count; i++) {
    const clump = [];
    const clumpSize = 2 + Math.floor(Math.random() * 3); // 2-4 trees per clump
    const clumpX = terrainBounds.xMin + Math.random() * (terrainBounds.xMax - terrainBounds.xMin);
    const clumpY = terrainBounds.yMin + Math.random() * (terrainBounds.yMax - terrainBounds.yMin);

    for (let j = 0; j < clumpSize; j++) {
      const sizeFactor = 0.5 + Math.random() * 1.5; // 50–200%
      const squareSize = playerSize * sizeFactor;
      const offsetX = (Math.random() - 0.5) * playerSize * 2;
      const offsetY = (Math.random() - 0.5) * playerSize * 2;
      
      clump.push({
        x: clumpX + offsetX,
        y: clumpY + offsetY,
        width: squareSize,
        height: squareSize,
        type: 'tree'
      });
    }
    
    clumps.push(...clump);
  }
  
  return clumps;
}

/**
 * Helper function to draw a more visually interesting tree
 * @param {CanvasRenderingContext2D} ctx Canvas context to draw on
 * @param {Object} tree Tree object with position and size information
 */
function drawTree(ctx, tree) {
  // Tree trunk (brown rectangle)
  const trunkWidth = tree.width * 0.3;
  const trunkHeight = tree.height * 0.6;
  const trunkX = tree.x + (tree.width - trunkWidth) / 2;
  const trunkY = tree.y + tree.height - trunkHeight;
  
  ctx.fillStyle = "#8B4513"; // saddle brown for trunk
  ctx.fillRect(trunkX, trunkY, trunkWidth, trunkHeight);
  
  // Tree canopy (green circle)
  const canopyRadius = tree.width * 0.6;
  const canopyCenterX = tree.x + tree.width / 2;
  const canopyCenterY = tree.y + tree.height * 0.4;
  
  ctx.fillStyle = "#228B22"; // forest green
  ctx.beginPath();
  ctx.arc(canopyCenterX, canopyCenterY, canopyRadius, 0, Math.PI * 2);
  ctx.fill();
}