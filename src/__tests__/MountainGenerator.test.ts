import { describe, it, expect } from 'vitest';
import { MountainGenerator } from '../systems/MountainGenerator';

describe('MountainGenerator', () => {
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

    expect(tile1?.type).not.toBe(tile2?.type);
  });

  it('should have decreasing circumference per layer', () => {
    const mountain = new MountainGenerator('test');
    const layers = mountain.getLayers();

    for (let i = 0; i < layers.length - 1; i++) {
      expect(layers[i].circumference).toBeGreaterThan(layers[i + 1].circumference);
    }
  });

  it('should handle horizontal wrapping', () => {
    const mountain = new MountainGenerator('test');
    const layer = mountain.getLayer(0);

    if (layer) {
      const tile1 = mountain.getTileAt(0, 100, 0);
      const tile2 = mountain.getTileAt(layer.circumference, 100, 0);

      expect(tile1?.type).toBe(tile2?.type);
    }
  });

  it('should transition player position between layers', () => {
    const mountain = new MountainGenerator('test');
    const pos = mountain.transitionToLayer(640, 100, 0, 1);

    expect(pos.x).toBeDefined();
    expect(pos.y).toBeDefined();
  });

  it('should determine correct layer index for y position', () => {
    const mountain = new MountainGenerator('test');

    expect(mountain.getLayerIndexForY(50)).toBe(0);
    expect(mountain.getLayerIndexForY(250)).toBe(1);
    expect(mountain.getLayerIndexForY(450)).toBe(2);
  });
});
