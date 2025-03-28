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
  
  // Get tree variation if available, or use defaults
  const variation = tree.variation || {
    type: 'pine', // Default to pine if no variation
    trunkColor: '#8B4513',
    foliageColor: '#006400',
    colorShift: 0
  };
  
  // Apply scaling to all dimensions
  const scaledWidth = treeWidth * scale;
  const scaledHeight = treeHeight * scale;
  
  // Draw according to tree type
  if (variation.type === 'pine') {
    // Draw pine tree trunk
    const trunkWidth = scaledWidth * 0.2;
    const trunkHeight = scaledHeight * 0.6;
    
    ctx.fillStyle = variation.trunkColor;
    ctx.fillRect(
      treeX + (scaledWidth - trunkWidth) / 2, 
      treeY + scaledHeight - trunkHeight, 
      trunkWidth, 
      trunkHeight
    );
    
    // Draw pine tree triangular foliage
    const foliageColor = adjustColor(variation.foliageColor, variation.colorShift);
    ctx.fillStyle = foliageColor;
    
    // Multiple layers of triangles for pine needles
    const layers = 3;
    const layerHeight = scaledHeight * 0.7 / layers;
    
    for (let i = 0; i < layers; i++) {
      const layerWidth = scaledWidth * (1 - i * 0.2);
      const layerY = treeY + scaledHeight - trunkHeight - (i * layerHeight);
      
      ctx.beginPath();
      ctx.moveTo(treeX + (scaledWidth - layerWidth) / 2, layerY);
      ctx.lineTo(treeX + (scaledWidth + layerWidth) / 2, layerY);
      ctx.lineTo(treeX + scaledWidth / 2, layerY - layerHeight);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    // Draw oak tree trunk
    const trunkWidth = scaledWidth * 0.2;
    const trunkHeight = scaledHeight * 0.4;
    
    ctx.fillStyle = variation.trunkColor;
    ctx.fillRect(
      treeX + (scaledWidth - trunkWidth) / 2, 
      treeY + scaledHeight - trunkHeight, 
      trunkWidth, 
      trunkHeight
    );
    
    // Draw oak tree circular foliage
    const foliageColor = adjustColor(variation.foliageColor, variation.colorShift);
    ctx.fillStyle = foliageColor;
    
    const foliageRadius = scaledWidth * 0.6;
    const foliageY = treeY + scaledHeight - trunkHeight - foliageRadius * 0.8;
    
    ctx.beginPath();
    ctx.arc(treeX + scaledWidth / 2, foliageY, foliageRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Helper function to adjust hex color by a shift amount
function adjustColor(hexColor, shiftAmount) {
  // Default color if hexColor is undefined
  if (!hexColor) {
    hexColor = '#006400'; // Default to dark green
  }
  
  // Ensure hexColor is a valid hex color starting with #
  if (!hexColor.startsWith('#') || hexColor.length !== 7) {
    console.warn('Invalid hex color format:', hexColor);
    hexColor = '#006400'; // Default to dark green
  }
  
  try {
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
  } catch (error) {
    console.error('Error adjusting color:', error);
    return '#006400'; // Return default color on error
  }
}

// Export tree-related functions
export { generateTreeClumps, drawTree };
