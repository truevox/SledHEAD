import { MountainLayer, TerrainTile } from '../types';

export class MountainGenerator {
  private seed: string;
  private layers: MountainLayer[] = [];
  private readonly NUM_LAYERS = 10;
  private readonly BASE_CIRCUMFERENCE = 2000;
  private readonly LAYER_HEIGHT = 200;

  constructor(seed: string) {
    this.seed = seed;
    this.generateLayers();
  }

  private seededRandom(x: number, y: number, layer: number): number {
    const seedNum = this.stringToNumber(this.seed);
    const n = Math.sin(x * 12.9898 + y * 78.233 + layer * 45.543 + seedNum) * 43758.5453;
    return n - Math.floor(n);
  }

  private stringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  private generateLayers(): void {
    for (let i = 0; i < this.NUM_LAYERS; i++) {
      const circumference = this.BASE_CIRCUMFERENCE * (1 - (i / this.NUM_LAYERS) * 0.7);
      const layer: MountainLayer = {
        index: i,
        circumference: Math.floor(circumference),
        heightRange: {
          min: i * this.LAYER_HEIGHT,
          max: (i + 1) * this.LAYER_HEIGHT,
        },
        terrain: this.generateTerrainForLayer(i, Math.floor(circumference)),
      };
      this.layers.push(layer);
    }
  }

  private generateTerrainForLayer(layerIndex: number, circumference: number): TerrainTile[][] {
    const tileSize = 32;
    const width = Math.ceil(circumference / tileSize);
    const height = Math.ceil(this.LAYER_HEIGHT / tileSize);
    const terrain: TerrainTile[][] = [];

    for (let y = 0; y < height; y++) {
      const row: TerrainTile[] = [];
      for (let x = 0; x < width; x++) {
        const tile = this.generateTile(x, y, layerIndex);
        row.push(tile);
      }
      terrain.push(row);
    }

    // Add ramps strategically
    this.addRamps(terrain, layerIndex);
    // Add obstacles
    this.addObstacles(terrain, layerIndex);

    return terrain;
  }

  private generateTile(x: number, y: number, layer: number): TerrainTile {
    const rand = this.seededRandom(x, y, layer);
    const altitude = layer * this.LAYER_HEIGHT + (y * 32);

    // Higher layers have more ice, lower layers have more rock
    const iceChance = layer * 0.05;
    const rockChance = (this.NUM_LAYERS - layer) * 0.02;

    let type: TerrainTile['type'] = 'snow';
    if (rand < rockChance) {
      type = 'rock';
    } else if (rand < rockChance + iceChance) {
      type = 'ice';
    }

    // Snow color varies by altitude (lighter = higher)
    const colorVariant = Math.floor((layer / this.NUM_LAYERS) * 9);

    return {
      type,
      altitude,
      color: colorVariant,
      variant: Math.floor(this.seededRandom(x + 100, y + 100, layer) * 3),
    };
  }

  private addRamps(terrain: TerrainTile[][], layer: number): void {
    const width = terrain[0].length;
    const height = terrain.length;

    // Add ramps every 50-100 tiles horizontally
    for (let x = 10; x < width; x += Math.floor(50 + this.seededRandom(x, 0, layer) * 50)) {
      const y = Math.floor(this.seededRandom(x, 1, layer) * (height - 3)) + 1;

      // Create a small ramp
      for (let i = 0; i < 3 && x + i < width; i++) {
        for (let j = 0; j < 2 && y + j < height; j++) {
          terrain[y + j][x + i].type = 'ramp';
        }
      }
    }
  }

  private addObstacles(terrain: TerrainTile[][], layer: number): void {
    const width = terrain[0].length;
    const height = terrain.length;

    // Add trees (more at lower layers)
    const treeCount = Math.floor((this.NUM_LAYERS - layer) * 5);
    for (let i = 0; i < treeCount; i++) {
      const x = Math.floor(this.seededRandom(i, 0, layer) * width);
      const y = Math.floor(this.seededRandom(i, 1, layer) * height);

      if (terrain[y] && terrain[y][x] && terrain[y][x].type === 'snow') {
        terrain[y][x].type = 'tree';
      }
    }

    // Add rocks
    const rockCount = Math.floor(layer * 3);
    for (let i = 0; i < rockCount; i++) {
      const x = Math.floor(this.seededRandom(i + 1000, 0, layer) * width);
      const y = Math.floor(this.seededRandom(i + 1000, 1, layer) * height);

      if (terrain[y] && terrain[y][x] && terrain[y][x].type === 'snow') {
        terrain[y][x].type = 'obstacle';
      }
    }
  }

  getLayers(): MountainLayer[] {
    return this.layers;
  }

  getLayer(index: number): MountainLayer | undefined {
    return this.layers[index];
  }

  getTileAt(x: number, y: number, layer: number): TerrainTile | undefined {
    const currentLayer = this.layers[layer];
    if (!currentLayer) return undefined;

    const tileSize = 32;
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);

    // Handle horizontal wrapping
    const wrappedX = ((tileX % currentLayer.terrain[0].length) + currentLayer.terrain[0].length) % currentLayer.terrain[0].length;

    if (tileY >= 0 && tileY < currentLayer.terrain.length) {
      return currentLayer.terrain[tileY][wrappedX];
    }

    return undefined;
  }

  /**
   * Transition player position between layers
   */
  transitionToLayer(currentX: number, currentY: number, currentLayer: number, newLayer: number): { x: number; y: number } {
    const oldLayer = this.layers[currentLayer];
    const targetLayer = this.layers[newLayer];

    if (!oldLayer || !targetLayer) {
      return { x: currentX, y: currentY };
    }

    // Scale horizontal position based on circumference change
    const scaleFactor = targetLayer.circumference / oldLayer.circumference;
    const newX = currentX * scaleFactor;

    // Position at appropriate boundary of new layer
    let newY = currentY;
    if (newLayer > currentLayer) {
      // Moving up: place at bottom of new layer
      newY = targetLayer.heightRange.min + 10;
    } else {
      // Moving down: place at top of new layer
      newY = targetLayer.heightRange.max - 10;
    }

    return { x: newX, y: newY };
  }

  /**
   * Get the current layer index based on y position
   */
  getLayerIndexForY(y: number): number {
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      if (y >= layer.heightRange.min && y <= layer.heightRange.max) {
        return i;
      }
    }
    // Clamp to valid range
    if (y < 0) return 0;
    return this.layers.length - 1;
  }
}
