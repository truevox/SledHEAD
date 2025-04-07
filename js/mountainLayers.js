/* mountainLayers.js - Configuration for segmented cylinder mountain structure */

// Mountain layers configuration 
// Each layer defines:
// - id: unique identifier for the layer
// - startY: absolute Y coordinate where this layer begins (inclusive)
// - endY: absolute Y coordinate where this layer ends (exclusive)
// - width: horizontal width (circumference) of this specific layer
// Layers are ordered by increasing Y coordinate (from top to bottom of the mountain)
const mountainLayers = [
  {
    id: 0,
    startY: 0,
    endY: 50000,
    width: 1000
  },
  {
    id: 1,
    startY: 50000,
    endY: 100000,
    width: 1500
  },
  {
    id: 2,
    startY: 100000,
    endY: 150000,
    width: 2000
  },
  {
    id: 3,
    startY: 150000,
    endY: 200000, //200000,
    width: 2500  //2500
  }
];

/**
 * Gets the mountain layer containing the given absolute Y coordinate
 * @param {number} absoluteY - The absolute Y coordinate to check
 * @returns {Object|null} The layer object containing the Y coordinate, or null if outside all layers
 */
function getLayerByY(absoluteY) {
  // Return the first layer that contains the Y coordinate
  const layer = mountainLayers.find(layer => 
    absoluteY >= layer.startY && absoluteY < layer.endY
  );

  // Handle edge cases
  if (!layer) {
    if (absoluteY < mountainLayers[0].startY) {
      // Y is above the mountain (below first layer's startY)
      return mountainLayers[0];
    } else if (absoluteY >= mountainLayers[mountainLayers.length - 1].endY) {
      // Y is below the mountain (beyond last layer's endY)
      return mountainLayers[mountainLayers.length - 1];
    }
  }

  return layer;
}

/**
 * Calculates the scaled X position when moving between layers
 * @param {number} currentX - The current X position
 * @param {Object} sourceLayer - The layer the entity is moving from
 * @param {Object} targetLayer - The layer the entity is moving to
 * @returns {number} The scaled X position in the target layer
 */
function scaleXPositionBetweenLayers(currentX, sourceLayer, targetLayer) {
  const scaleFactor = targetLayer.width / sourceLayer.width;
  return currentX * scaleFactor;
}

// Export the mountainLayers array and utility functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    mountainLayers,
    getLayerByY,
    scaleXPositionBetweenLayers
  };
} else {
  // For browser environment
  window.mountainLayers = mountainLayers;
  window.getLayerByY = getLayerByY;
  window.scaleXPositionBetweenLayers = scaleXPositionBetweenLayers;
} 