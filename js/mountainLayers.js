/* mountainLayers.js - Configuration for segmented cylinder mountain structure */

// Mountain layers configuration 
// Each layer defines:
// - id: unique identifier for the layer
// - startY: absolute Y coordinate where this layer begins (inclusive)
// - endY: absolute Y coordinate where this layer ends (exclusive)
// - width: horizontal width (circumference) of this specific layer
// - totalAnimalsPerLayer: maximum number of persistent animals in this layer
// Layers are ordered by increasing Y coordinate (from top to bottom of the mountain)
const mountainLayers = [
  {
    id: 0, //Peak Layer
    startY: 0,
    endY: 5000,
    width: 1000,
    totalAnimalsPerLayer: 25
  },
  {
    id: 1, //Mid-Peak Layer
    startY: 5000,
    endY: 10000,
    width: 1500,
    totalAnimalsPerLayer: 25
  },
  {
    id: 2, //Mid-Base Layer
    startY: 10000,
    endY: 15000,
    width: 2000,
    totalAnimalsPerLayer: 25
  },
  {
    id: 3, // Base Layer (STARTING ZONE)
    startY: 15000,
    endY: 20000,
    width: 2500,
    totalAnimalsPerLayer: 100  // Reduced to a more reasonable number
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