/* trees.js - Tree Generation & Rendering */
import { getResolution } from './resolution.js';

// Function to generate tree clumps across the terrain
function generateTreeClumps({ count, terrainBounds, playerSize }) {
  const trees = [];
  const clumpRadius = playerSize * 5;
  
  for (let i = 0; i < count; i++) {
    // Generate clump center position
    const clumpX = Math.random() * (terrainBounds.xMax - terrainBounds.xMin) + terrainBounds.xMin;
    const clumpY = Math.random() * (terrainBounds.yMax - terrainBounds.yMin) + terrainBounds.yMin;
    
    // Generate 3-7 trees per clump
    const treesInClump = Math.floor(Math.random() * 5) + 3;
    
    for (let j = 0; j < treesInClump; j++) {
      // Generate tree position within clump (random angle and distance from center)
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * clumpRadius;
      
      const treeX = clumpX + Math.cos(angle) * distance;
      const treeY = clumpY + Math.sin(angle) * distance;
      
      // Make sure tree is within terrain bounds
      if (treeX >= terrainBounds.xMin && treeX <= terrainBounds.xMax &&
          treeY >= terrainBounds.yMin && treeY <= terrainBounds.yMax) {
        
        // Randomize tree size (35-60px width, 70-120px height)
        const width = 35 + Math.random() * 25;
        const height = 70 + Math.random() * 50;
        
        // Generate variation for tree appearance
        const variation = {
          type: Math.random() > 0.3 ? 'pine' : 'oak',
          lushness: 0.5 + Math.random() * 0.5,
          colorShift: Math.random() * 0.3 - 0.15 // -15% to +15% color shift
        };
        
        trees.push({
          x: treeX,
          y: treeY,
          width,
          height,
          type: 'tree', // Differentiate from rocks
          variation
        });
      }
    }
  }
  
  return trees;
}

// Function to draw a tree on the canvas
function drawTree(ctx, tree) {
  const resolution = getResolution();
  const scale = resolution.scale;
  
  // Scale tree based on the resolution
  const width = tree.width * scale;
  const height = tree.height * scale;
  const x = tree.x - width / 2;
  const y = tree.y - height / 2;
  
  // Choose base colors based on tree type
  let trunkColor, foliageColor;
  
  if (tree.variation && tree.variation.type === 'pine') {
    trunkColor = '#8B4513'; // Brown for pine trunk
    foliageColor = '#006400'; // Dark green for pine needles
  } else {
    trunkColor = '#A0522D'; // Sienna for oak trunk
    foliageColor = '#228B22'; // Forest green for oak leaves
  }
  
  // Apply color shift variation if provided
  if (tree.variation && tree.variation.colorShift) {
    // Adjust foliage color based on color shift
    const shiftAmount = tree.variation.colorShift;
    foliageColor = adjustColor(foliageColor, shiftAmount);
  }
  
  // Draw tree trunk
  ctx.fillStyle = trunkColor;
  const trunkWidth = width * 0.2;
  const trunkHeight = height * 0.6;
  ctx.fillRect(
    x + (width - trunkWidth) / 2,
    y + height - trunkHeight,
    trunkWidth,
    trunkHeight
  );
  
  // Draw tree foliage (pine or oak)
  ctx.fillStyle = foliageColor;
  
  if (tree.variation && tree.variation.type === 'pine') {
    // Pine tree - triangular foliage
    const foliageHeight = height * 0.8;
    const foliageBase = y + height - trunkHeight;
    
    // Draw 3 triangular layers for pine
    for (let i = 0; i < 3; i++) {
      const layerY = foliageBase - (foliageHeight * (i / 3));
      const layerWidth = width * (1 - i * 0.2);
      
      ctx.beginPath();
      ctx.moveTo(x + (width - layerWidth) / 2, layerY);
      ctx.lineTo(x + (width + layerWidth) / 2, layerY);
      ctx.lineTo(x + width / 2, layerY - foliageHeight / 3);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    // Oak tree - rounded foliage
    const centerX = x + width / 2;
    const foliageY = y + height - trunkHeight - height * 0.05;
    const foliageRadius = width * 0.6;
    
    // Draw main foliage circle
    ctx.beginPath();
    ctx.arc(centerX, foliageY, foliageRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some smaller circles around for more natural look
    if (tree.variation && tree.variation.lushness > 0.6) {
      const smallCircleCount = Math.floor(tree.variation.lushness * 5);
      
      for (let i = 0; i < smallCircleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = foliageRadius * 0.6;
        
        ctx.beginPath();
        ctx.arc(
          centerX + Math.cos(angle) * distance,
          foliageY + Math.sin(angle) * distance,
          foliageRadius * 0.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}

// Helper function to adjust hex color by a shift amount
function adjustColor(hexColor, shiftAmount) {
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  // Apply shift to green component (for foliage)
  const shiftedG = Math.min(255, Math.max(0, g + Math.floor(g * shiftAmount)));
  
  // Convert back to hex
  return '#' + r.toString(16).padStart(2, '0') +
               shiftedG.toString(16).padStart(2, '0') +
               b.toString(16).padStart(2, '0');
}

// Export tree-related functions
export { generateTreeClumps, drawTree };
