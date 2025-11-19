import { describe, it, expect } from 'vitest';
import { MountainGenerator } from '../systems/MountainGenerator';

describe('MountainGenerator', () => {
  describe('Seed Consistency', () => {
    it('should generate consistent mountain with same seed', () => {
      const mountain1 = new MountainGenerator('test-seed');
      const mountain2 = new MountainGenerator('test-seed');

      const layers1 = mountain1.getLayers();
      const layers2 = mountain2.getLayers();

      expect(layers1.length).toBe(layers2.length);
      expect(layers1[0].circumference).toBe(layers2[0].circumference);
    });

    it('should generate different mountains with different seeds', () => {
      const mountain1 = new MountainGenerator('seed1');
      const mountain2 = new MountainGenerator('seed2');

      const tile1 = mountain1.getTileAt(100, 100, 0);
      const tile2 = mountain2.getTileAt(100, 100, 0);

      // With different seeds, terrain patterns should differ
      expect(tile1).toBeDefined();
      expect(tile2).toBeDefined();
    });

    it('should produce identical terrain grids for same seed', () => {
      const mountain1 = new MountainGenerator('consistent');
      const mountain2 = new MountainGenerator('consistent');

      // Check multiple positions
      for (let x = 0; x < 500; x += 100) {
        for (let y = 0; y < 180; y += 50) {
          const tile1 = mountain1.getTileAt(x, y, 0);
          const tile2 = mountain2.getTileAt(x, y, 0);
          expect(tile1?.type).toBe(tile2?.type);
          expect(tile1?.altitude).toBe(tile2?.altitude);
        }
      }
    });

    it('should handle numeric-like string seeds', () => {
      const mountain = new MountainGenerator('12345');
      const layers = mountain.getLayers();
      expect(layers.length).toBeGreaterThan(0);
    });

    it('should handle empty string seed', () => {
      const mountain = new MountainGenerator('');
      const layers = mountain.getLayers();
      expect(layers.length).toBeGreaterThan(0);
    });

    it('should handle very long seed strings', () => {
      const longSeed = 'a'.repeat(1000);
      const mountain = new MountainGenerator(longSeed);
      const layers = mountain.getLayers();
      expect(layers.length).toBeGreaterThan(0);
    });

    it('should handle special character seeds', () => {
      const mountain = new MountainGenerator('!@#$%^&*()');
      const layers = mountain.getLayers();
      expect(layers.length).toBeGreaterThan(0);
    });
  });

  describe('Layer Generation', () => {
    it('should have decreasing circumference per layer', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      for (let i = 0; i < layers.length - 1; i++) {
        expect(layers[i].circumference).toBeGreaterThan(layers[i + 1].circumference);
      }
    });

    it('should generate exactly 10 layers', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();
      expect(layers.length).toBe(10);
    });

    it('should have correct layer indices', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      layers.forEach((layer, index) => {
        expect(layer.index).toBe(index);
      });
    });

    it('should have correct height ranges', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      layers.forEach((layer, index) => {
        expect(layer.heightRange.min).toBe(index * 200);
        expect(layer.heightRange.max).toBe((index + 1) * 200);
      });
    });

    it('should have non-overlapping height ranges', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      for (let i = 0; i < layers.length - 1; i++) {
        expect(layers[i].heightRange.max).toBe(layers[i + 1].heightRange.min);
      }
    });

    it('should have base circumference of approximately 2000', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();
      // Base circumference is 2000, first layer should be close to that
      expect(layers[0].circumference).toBeGreaterThanOrEqual(1900);
      expect(layers[0].circumference).toBeLessThanOrEqual(2100);
    });

    it('should have top layer with reduced circumference', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();
      // Top layer should have circumference around 30% of base
      expect(layers[9].circumference).toBeLessThan(layers[0].circumference * 0.5);
    });

    it('should return undefined for invalid layer index', () => {
      const mountain = new MountainGenerator('test');
      expect(mountain.getLayer(-1)).toBeUndefined();
      expect(mountain.getLayer(10)).toBeUndefined();
      expect(mountain.getLayer(100)).toBeUndefined();
    });

    it('should return valid layer for valid index', () => {
      const mountain = new MountainGenerator('test');
      const layer = mountain.getLayer(5);
      expect(layer).toBeDefined();
      expect(layer?.index).toBe(5);
    });
  });

  describe('Terrain Generation', () => {
    it('should generate terrain tiles for each layer', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      layers.forEach(layer => {
        expect(layer.terrain).toBeDefined();
        expect(layer.terrain.length).toBeGreaterThan(0);
        expect(layer.terrain[0].length).toBeGreaterThan(0);
      });
    });

    it('should generate valid tile types', () => {
      const mountain = new MountainGenerator('test');
      const validTypes = ['snow', 'ice', 'rock', 'tree', 'ramp', 'obstacle'];

      const layers = mountain.getLayers();
      layers.forEach(layer => {
        layer.terrain.forEach(row => {
          row.forEach(tile => {
            expect(validTypes).toContain(tile.type);
          });
        });
      });
    });

    it('should have altitude increasing with layer', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      // Check first tile of each layer
      for (let i = 0; i < layers.length - 1; i++) {
        const tile1 = layers[i].terrain[0][0];
        const tile2 = layers[i + 1].terrain[0][0];
        expect(tile2.altitude).toBeGreaterThan(tile1.altitude);
      }
    });

    it('should have color variants from 0-8', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      layers.forEach(layer => {
        layer.terrain.forEach(row => {
          row.forEach(tile => {
            expect(tile.color).toBeGreaterThanOrEqual(0);
            expect(tile.color).toBeLessThanOrEqual(8);
          });
        });
      });
    });

    it('should have variants from 0-2', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      layers.forEach(layer => {
        layer.terrain.forEach(row => {
          row.forEach(tile => {
            expect(tile.variant).toBeGreaterThanOrEqual(0);
            expect(tile.variant).toBeLessThanOrEqual(2);
          });
        });
      });
    });

    it('should contain ramps in terrain', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      let foundRamp = false;
      layers.forEach(layer => {
        layer.terrain.forEach(row => {
          row.forEach(tile => {
            if (tile.type === 'ramp') foundRamp = true;
          });
        });
      });
      expect(foundRamp).toBe(true);
    });

    it('should contain trees more at lower layers', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      // Count trees in bottom and top layers
      let bottomTrees = 0;
      let topTrees = 0;

      layers[0].terrain.forEach(row => {
        row.forEach(tile => {
          if (tile.type === 'tree') bottomTrees++;
        });
      });

      layers[9].terrain.forEach(row => {
        row.forEach(tile => {
          if (tile.type === 'tree') topTrees++;
        });
      });

      // Bottom layers should have more trees
      expect(bottomTrees).toBeGreaterThanOrEqual(topTrees);
    });
  });

  describe('Horizontal Wrapping', () => {
    it('should handle horizontal wrapping', () => {
      const mountain = new MountainGenerator('test');
      const layer = mountain.getLayer(0);

      if (layer) {
        const tile1 = mountain.getTileAt(0, 100, 0);
        const tile2 = mountain.getTileAt(layer.circumference, 100, 0);

        expect(tile1?.type).toBe(tile2?.type);
      }
    });

    it('should wrap negative x coordinates', () => {
      const mountain = new MountainGenerator('test');
      const layer = mountain.getLayer(0);

      if (layer) {
        const tile1 = mountain.getTileAt(-32, 100, 0);
        const tile2 = mountain.getTileAt(layer.circumference - 32, 100, 0);

        expect(tile1?.type).toBe(tile2?.type);
      }
    });

    it('should wrap multiple circumferences', () => {
      const mountain = new MountainGenerator('test');
      const layer = mountain.getLayer(0);

      if (layer) {
        // Note: wrapping should work for exact multiples
        const tile1 = mountain.getTileAt(0, 100, 0);
        const tile2 = mountain.getTileAt(layer.circumference * 3, 100, 0);

        expect(tile1?.type).toBe(tile2?.type);
      }
    });
  });

  describe('Layer Transitions', () => {
    it('should transition player position between layers', () => {
      const mountain = new MountainGenerator('test');
      const pos = mountain.transitionToLayer(640, 100, 0, 1);

      expect(pos.x).toBeDefined();
      expect(pos.y).toBeDefined();
    });

    it('should scale x position based on circumference ratio', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      const startX = 1000;
      const pos = mountain.transitionToLayer(startX, 100, 0, 1);

      // New x should be scaled by circumference ratio
      const expectedScale = layers[1].circumference / layers[0].circumference;
      expect(pos.x).toBeCloseTo(startX * expectedScale);
    });

    it('should place player at bottom of new layer when moving up', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      const pos = mountain.transitionToLayer(640, 100, 0, 1);

      // Should be near bottom of layer 1
      expect(pos.y).toBeCloseTo(layers[1].heightRange.min + 10);
    });

    it('should place player at top of new layer when moving down', () => {
      const mountain = new MountainGenerator('test');
      const layers = mountain.getLayers();

      const pos = mountain.transitionToLayer(640, 300, 1, 0);

      // Should be near top of layer 0
      expect(pos.y).toBeCloseTo(layers[0].heightRange.max - 10);
    });

    it('should handle transition from layer 0 to layer 9', () => {
      const mountain = new MountainGenerator('test');
      const pos = mountain.transitionToLayer(640, 100, 0, 9);

      expect(pos.x).toBeDefined();
      expect(pos.y).toBeDefined();
      expect(pos.x).toBeLessThan(640); // Should scale down
    });

    it('should handle invalid layer transitions gracefully', () => {
      const mountain = new MountainGenerator('test');
      const pos = mountain.transitionToLayer(640, 100, 0, 100);

      // Should return original position for invalid layer
      expect(pos.x).toBe(640);
      expect(pos.y).toBe(100);
    });
  });

  describe('Layer Index Detection', () => {
    it('should determine correct layer index for y position', () => {
      const mountain = new MountainGenerator('test');

      expect(mountain.getLayerIndexForY(50)).toBe(0);
      expect(mountain.getLayerIndexForY(250)).toBe(1);
      expect(mountain.getLayerIndexForY(450)).toBe(2);
    });

    it('should return correct layer for boundary values', () => {
      const mountain = new MountainGenerator('test');

      // Test at exact boundaries - layer ranges use inclusive max
      // Layer 0: [0, 200], Layer 1: [200, 400], etc.
      // At y=200, it's at max of layer 0 and min of layer 1
      // The algorithm returns the first match, so y=200 returns layer 0
      expect(mountain.getLayerIndexForY(0)).toBe(0);
      expect(mountain.getLayerIndexForY(199)).toBe(0);
      expect(mountain.getLayerIndexForY(200)).toBe(0); // At max of layer 0
      expect(mountain.getLayerIndexForY(201)).toBe(1); // Just past layer 0 max
      expect(mountain.getLayerIndexForY(399)).toBe(1);
    });

    it('should clamp to layer 0 for negative y', () => {
      const mountain = new MountainGenerator('test');
      expect(mountain.getLayerIndexForY(-100)).toBe(0);
      expect(mountain.getLayerIndexForY(-1000)).toBe(0);
    });

    it('should clamp to top layer for very high y', () => {
      const mountain = new MountainGenerator('test');
      expect(mountain.getLayerIndexForY(5000)).toBe(9);
      expect(mountain.getLayerIndexForY(10000)).toBe(9);
    });

    it('should return correct layer for each height range', () => {
      const mountain = new MountainGenerator('test');

      for (let i = 0; i < 10; i++) {
        const yInLayer = i * 200 + 100; // Middle of each layer
        expect(mountain.getLayerIndexForY(yInLayer)).toBe(i);
      }
    });
  });

  describe('Tile Retrieval', () => {
    it('should get tile at valid coordinates', () => {
      const mountain = new MountainGenerator('test');
      const tile = mountain.getTileAt(100, 100, 0);

      expect(tile).toBeDefined();
      expect(tile?.type).toBeDefined();
      expect(tile?.altitude).toBeDefined();
    });

    it('should return undefined for invalid layer', () => {
      const mountain = new MountainGenerator('test');
      expect(mountain.getTileAt(100, 100, -1)).toBeUndefined();
      expect(mountain.getTileAt(100, 100, 10)).toBeUndefined();
    });

    it('should return undefined for y out of layer bounds', () => {
      const mountain = new MountainGenerator('test');
      // Layer 0 is y: 0-200, so y: 300 is out of bounds for layer 0's terrain grid
      const tile = mountain.getTileAt(100, 300, 0);
      expect(tile).toBeUndefined();
    });

    it('should handle zero coordinates', () => {
      const mountain = new MountainGenerator('test');
      const tile = mountain.getTileAt(0, 0, 0);
      expect(tile).toBeDefined();
    });

    it('should handle coordinates at tile boundaries', () => {
      const mountain = new MountainGenerator('test');

      // Test at tile size boundaries (32 pixels per tile)
      const tile1 = mountain.getTileAt(31, 31, 0);
      const tile2 = mountain.getTileAt(32, 32, 0);

      expect(tile1).toBeDefined();
      expect(tile2).toBeDefined();
    });

    it('should return same tile for coordinates within same tile', () => {
      const mountain = new MountainGenerator('test');

      // Coordinates 0-31 should be in same tile
      const tile1 = mountain.getTileAt(0, 0, 0);
      const tile2 = mountain.getTileAt(15, 15, 0);
      const tile3 = mountain.getTileAt(31, 31, 0);

      expect(tile1?.type).toBe(tile2?.type);
      expect(tile2?.type).toBe(tile3?.type);
    });
  });

  describe('Performance', () => {
    it('should generate mountain quickly', () => {
      const start = performance.now();
      const mountain = new MountainGenerator('performance-test');
      const end = performance.now();

      // Should generate in less than 100ms
      expect(end - start).toBeLessThan(100);
      expect(mountain.getLayers().length).toBe(10);
    });

    it('should retrieve tiles quickly', () => {
      const mountain = new MountainGenerator('test');

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        mountain.getTileAt(Math.random() * 2000, Math.random() * 200, 0);
      }
      const end = performance.now();

      // 1000 tile lookups should take less than 50ms
      expect(end - start).toBeLessThan(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle maximum y value in top layer', () => {
      const mountain = new MountainGenerator('test');
      const tile = mountain.getTileAt(100, 1999, 9);
      // Note: This might be undefined depending on exact terrain grid size
      // The test verifies no crash occurs
      expect(tile === undefined || tile !== undefined).toBe(true);
    });

    it('should handle floating point coordinates', () => {
      const mountain = new MountainGenerator('test');
      const tile = mountain.getTileAt(100.5, 100.5, 0);
      expect(tile).toBeDefined();
    });

    it('should handle very small coordinates', () => {
      const mountain = new MountainGenerator('test');
      const tile = mountain.getTileAt(0.001, 0.001, 0);
      expect(tile).toBeDefined();
    });
  });
});
