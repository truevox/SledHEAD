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
        
        // Calculate collision bounds based on tree type
        const isPine = variation.type === 'pine';
        const collisionWidth = isPine ? width : width * 1.2; // Oak trees are wider due to foliage
        const collisionHeight = height;
        
        // Calculate trunk dimensions
        const trunkWidth = width * 0.2;
        const trunkHeight = height * 0.6;
        
        // Calculate foliage dimensions
        const foliageRadius = isPine ? width * 0.5 : width * 0.6;
        const foliageOffsetY = -(height * 0.25); // Negative because it's above the center
        
        // Create collision zones for trunk and canopy
        const collisionZones = [
          {
            // Trunk collision (rectangle)
            type: 'rect',
            offsetX: 0,
            offsetY: height / 2 - trunkHeight / 2,
            width: trunkWidth,
            height: trunkHeight
          }
        ];
        
        // Add canopy collision zone
        if (isPine) {
          // For pine trees - triangle-like shape using a series of rectangles
          const foliageHeight = height * 0.8;
          for (let layer = 0; layer < 3; layer++) {
            const layerWidth = width * (1 - layer * 0.2);
            const layerHeight = foliageHeight / 3;
            const layerY = -height * 0.1 - (layer * layerHeight);
            
            collisionZones.push({
              type: 'rect',
              offsetX: 0,
              offsetY: layerY,
              width: layerWidth,
              height: layerHeight
            });
          }
        } else {
          // For oak trees - circular canopy
          collisionZones.push({
            type: 'circle',
            offsetX: 0,
            offsetY: foliageOffsetY,
            radius: foliageRadius
          });
        }
        
        trees.push({
          x: treeX,
          y: treeY,
          width: collisionWidth, // Keep for compatibility
          height: collisionHeight, // Keep for compatibility
          visualWidth: width,
          visualHeight: height,
          type: 'tree',
          variation,
          collisionZones: collisionZones
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
  
  // Handle both formats - the one from world.js/terrain array and the one from render.js
  const treeX = tree.x;
  const treeY = tree.y;
  const treeWidth = tree.visualWidth || tree.width;
  const treeHeight = tree.visualHeight || tree.height;
  const variation = tree.variation || { type: 'pine', lushness: 0.7, colorShift: 0 };
  
  // Choose base colors based on tree type
  let trunkColor, foliageColor;
  
  if (variation.type === 'pine') {
    trunkColor = '#8B4513';
    foliageColor = '#006400';
  } else {
    trunkColor = '#A0522D';
    foliageColor = '#228B22';
  }
  
  // Apply color shift variation if provided
  if (variation.colorShift) {
    const shiftAmount = variation.colorShift;
    foliageColor = adjustColor(foliageColor, shiftAmount);
  }
  
  // Draw tree trunk
  ctx.fillStyle = trunkColor;
  const trunkWidth = treeWidth * 0.2;
  const trunkHeight = treeHeight * 0.6;
  ctx.fillRect(
    treeX - trunkWidth / 2,
    treeY + treeHeight / 2 - trunkHeight,
    trunkWidth,
    trunkHeight
  );
  
  // Draw tree foliage (pine or oak)
  ctx.fillStyle = foliageColor;
  
  if (variation.type === 'pine') {
    // Pine tree - triangular foliage
    const foliageHeight = treeHeight * 0.8;
    const foliageBase = treeY + treeHeight / 2 - trunkHeight;
    
    // Draw 3 triangular layers for pine
    for (let i = 0; i < 3; i++) {
      const layerY = foliageBase - (foliageHeight * (i / 3));
      const layerWidth = treeWidth * (1 - i * 0.2);
      
      ctx.beginPath();
      ctx.moveTo(treeX - layerWidth / 2, layerY);
      ctx.lineTo(treeX + layerWidth / 2, layerY);
      ctx.lineTo(treeX, layerY - foliageHeight / 3);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    // Oak tree - rounded foliage
    const foliageY = treeY + treeHeight / 2 - trunkHeight - treeHeight * 0.05;
    const foliageRadius = treeWidth * 0.6;
    
    // Draw main foliage circle
    ctx.beginPath();
    ctx.arc(treeX, foliageY, foliageRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some smaller circles around for more natural look
    if (variation.lushness > 0.6) {
      const smallCircleCount = Math.floor(variation.lushness * 5);
      
      for (let i = 0; i < smallCircleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = foliageRadius * 0.6;
        
        ctx.beginPath();
        ctx.arc(
          treeX + Math.cos(angle) * distance,
          foliageY + Math.sin(angle) * distance,
          foliageRadius * 0.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
  
  // Uncomment for debugging collision zones
  /*
  if (tree.collisionZones) {
    // Draw collision zones for debugging
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    
    tree.collisionZones.forEach(zone => {
      if (zone.type === 'rect') {
        ctx.strokeRect(
          treeX + zone.offsetX - zone.width / 2,
          treeY + zone.offsetY - zone.height / 2,
          zone.width,
          zone.height
        );
      } else if (zone.type === 'circle') {
        ctx.beginPath();
        ctx.arc(
          treeX + zone.offsetX,
          treeY + zone.offsetY,
          zone.radius,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    });
  }
  */
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
