import Phaser from 'phaser';

export class ProceduralArt {
  /**
   * Generates a player sprite programmatically
   */
  static generatePlayerSprite(scene: Phaser.Scene, key: string): void {
    const graphics = scene.add.graphics();

    // Player body (simple stick figure on sled)
    graphics.fillStyle(0x3498db, 1); // Blue jacket
    graphics.fillCircle(8, 4, 3); // Head

    graphics.fillStyle(0x2c3e50, 1); // Dark pants
    graphics.fillRect(6, 7, 4, 4); // Body

    // Sled
    graphics.fillStyle(0xe74c3c, 1); // Red sled
    graphics.fillRect(4, 11, 8, 2);
    graphics.fillStyle(0xc0392b, 1);
    graphics.fillRect(3, 12, 10, 1); // Runners

    graphics.generateTexture(key, 16, 16);
    graphics.destroy();
  }

  /**
   * Generates trick animation frames
   */
  static generateTrickFrames(scene: Phaser.Scene): void {
    // Generate 48 frames for all tricks (16 tricks * 3 frames each)
    for (let i = 0; i < 48; i++) {
      const graphics = scene.add.graphics();
      const angle = (i * 7.5) * Math.PI / 180; // Rotation for animation

      // Note: Phaser's Graphics doesn't support transform save/restore
      // We'll render frames without rotation for simplicity

      // Player
      graphics.fillStyle(0x3498db, 1);
      graphics.fillCircle(8, 4, 3);
      graphics.fillStyle(0x2c3e50, 1);
      graphics.fillRect(6, 7, 4, 4);

      // Sled (position varies by trick)
      graphics.fillStyle(0xe74c3c, 1);
      const sledOffset = Math.sin(angle) * 2;
      graphics.fillRect(4, 11 + sledOffset, 8, 2);

      graphics.generateTexture(`trick_frame_${i}`, 16, 16);
      graphics.destroy();
    }
  }

  /**
   * Generates terrain tiles
   */
  static generateTerrainTiles(scene: Phaser.Scene): void {
    // Snow tile (various shades based on altitude)
    for (let shade = 0; shade < 10; shade++) {
      const graphics = scene.add.graphics();
      const brightness = 0.7 + (shade * 0.03); // Lighter at higher altitudes
      const snowColor = Phaser.Display.Color.HSVToRGB(0.6, 0.05, brightness);

      graphics.fillStyle(snowColor.color, 1);
      graphics.fillRect(0, 0, 32, 32);

      // Add some texture
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * 32;
        const y = Math.random() * 32;
        const sparkleColor = Phaser.Display.Color.HSVToRGB(0.6, 0.02, brightness + 0.1);
        graphics.fillStyle(sparkleColor.color, 0.5);
        graphics.fillCircle(x, y, 1);
      }

      graphics.generateTexture(`snow_${shade}`, 32, 32);
      graphics.destroy();
    }

    // Ice tile
    const iceGraphics = scene.add.graphics();
    const iceColor = Phaser.Display.Color.HSVToRGB(0.55, 0.3, 0.9);
    iceGraphics.fillStyle(iceColor.color, 0.8);
    iceGraphics.fillRect(0, 0, 32, 32);
    // Shine effect
    iceGraphics.fillStyle(0xffffff, 0.3);
    iceGraphics.fillRect(8, 8, 16, 4);
    iceGraphics.generateTexture('ice', 32, 32);
    iceGraphics.destroy();

    // Rock tile
    const rockGraphics = scene.add.graphics();
    rockGraphics.fillStyle(0x5a5a5a, 1);
    rockGraphics.fillRect(0, 0, 32, 32);
    rockGraphics.fillStyle(0x3a3a3a, 1);
    rockGraphics.fillCircle(8, 8, 6);
    rockGraphics.fillCircle(24, 20, 8);
    rockGraphics.generateTexture('rock', 32, 32);
    rockGraphics.destroy();

    // Ramp tile
    const rampGraphics = scene.add.graphics();
    rampGraphics.fillStyle(0xe8f4f8, 1);
    rampGraphics.fillTriangle(0, 32, 32, 32, 32, 0);
    rampGraphics.fillStyle(0xd0e8f0, 1);
    rampGraphics.fillTriangle(0, 32, 16, 16, 32, 32);
    rampGraphics.generateTexture('ramp', 32, 32);
    rampGraphics.destroy();
  }

  /**
   * Generates tree sprites
   */
  static generateTrees(scene: Phaser.Scene): void {
    for (let variant = 0; variant < 3; variant++) {
      const graphics = scene.add.graphics();

      // Trunk
      graphics.fillStyle(0x5d4e37, 1);
      graphics.fillRect(14, 24, 4, 16);

      // Pine foliage
      graphics.fillStyle(0x2d5016, 1);
      const layers = 3 + variant;
      for (let i = 0; i < layers; i++) {
        const y = 24 - (i * 6);
        const size = 20 - (i * 3);
        graphics.fillTriangle(16 - size/2, y, 16 + size/2, y, 16, y - 10);
      }

      graphics.generateTexture(`tree_${variant}`, 32, 40);
      graphics.destroy();
    }
  }

  /**
   * Generates animal sprites
   */
  static generateAnimals(scene: Phaser.Scene): void {
    // Bear
    const bearGraphics = scene.add.graphics();
    bearGraphics.fillStyle(0x4a3728, 1);
    bearGraphics.fillEllipse(16, 12, 16, 12); // Body
    bearGraphics.fillCircle(10, 8, 5); // Head
    bearGraphics.fillCircle(8, 6, 2); // Ear
    bearGraphics.fillCircle(12, 6, 2); // Ear
    bearGraphics.fillStyle(0x2c1e12, 1);
    bearGraphics.fillCircle(9, 8, 1); // Eye
    bearGraphics.generateTexture('animal_bear', 32, 24);
    bearGraphics.destroy();

    // Bird
    const birdGraphics = scene.add.graphics();
    birdGraphics.fillStyle(0x3498db, 1);
    birdGraphics.fillCircle(8, 6, 4); // Body
    birdGraphics.fillCircle(6, 5, 2); // Head
    birdGraphics.fillStyle(0x2980b9, 1);
    birdGraphics.fillTriangle(10, 6, 14, 4, 14, 8); // Wing
    birdGraphics.fillTriangle(0, 5, 4, 3, 4, 7); // Wing
    birdGraphics.generateTexture('animal_bird', 16, 12);
    birdGraphics.destroy();

    // Mountain Lion
    const lionGraphics = scene.add.graphics();
    lionGraphics.fillStyle(0xd4a76a, 1);
    lionGraphics.fillEllipse(16, 10, 14, 10); // Body
    lionGraphics.fillCircle(10, 8, 4); // Head
    lionGraphics.fillTriangle(9, 5, 8, 3, 10, 5); // Ear
    lionGraphics.fillTriangle(11, 5, 12, 3, 10, 5); // Ear
    lionGraphics.fillStyle(0x8b6f47, 1);
    lionGraphics.fillRect(18, 12, 8, 2); // Tail
    lionGraphics.generateTexture('animal_mountainlion', 28, 16);
    lionGraphics.destroy();

    // Deer
    const deerGraphics = scene.add.graphics();
    deerGraphics.fillStyle(0x8b7355, 1);
    deerGraphics.fillEllipse(16, 14, 12, 10); // Body
    deerGraphics.fillCircle(10, 10, 4); // Head
    deerGraphics.fillStyle(0x654321, 1);
    // Antlers
    deerGraphics.strokeRect(8, 4, 1, 4);
    deerGraphics.strokeRect(12, 4, 1, 4);
    deerGraphics.generateTexture('animal_deer', 32, 20);
    deerGraphics.destroy();

    // Fox
    const foxGraphics = scene.add.graphics();
    foxGraphics.fillStyle(0xff6b35, 1);
    foxGraphics.fillEllipse(12, 10, 10, 8); // Body
    foxGraphics.fillCircle(8, 8, 3); // Head
    foxGraphics.fillTriangle(7, 6, 6, 3, 8, 6); // Ear
    foxGraphics.fillTriangle(9, 6, 10, 3, 8, 6); // Ear
    foxGraphics.fillStyle(0xffffff, 1);
    foxGraphics.fillCircle(8, 9, 1.5); // Snout
    foxGraphics.generateTexture('animal_fox', 24, 16);
    foxGraphics.destroy();
  }

  /**
   * Generates UI elements
   */
  static generateUIElements(scene: Phaser.Scene): void {
    // Stamina bar background
    const staminaBgGraphics = scene.add.graphics();
    staminaBgGraphics.fillStyle(0x2c3e50, 1);
    staminaBgGraphics.fillRoundedRect(0, 0, 200, 20, 5);
    staminaBgGraphics.lineStyle(2, 0x34495e, 1);
    staminaBgGraphics.strokeRoundedRect(0, 0, 200, 20, 5);
    staminaBgGraphics.generateTexture('ui_stamina_bg', 200, 20);
    staminaBgGraphics.destroy();

    // Stamina bar fill
    const staminaFillGraphics = scene.add.graphics();
    staminaFillGraphics.fillStyle(0x27ae60, 1);
    staminaFillGraphics.fillRoundedRect(0, 0, 200, 20, 5);
    staminaFillGraphics.generateTexture('ui_stamina_fill', 200, 20);
    staminaFillGraphics.destroy();

    // Camera reticle for photography
    const reticleGraphics = scene.add.graphics();
    reticleGraphics.lineStyle(2, 0xffff00, 1);
    reticleGraphics.strokeCircle(50, 50, 40);
    reticleGraphics.strokeRect(48, 0, 4, 100);
    reticleGraphics.strokeRect(0, 48, 100, 4);
    reticleGraphics.lineStyle(3, 0xff0000, 0.5);
    reticleGraphics.strokeRect(0, 50, 100, 1); // Altitude line
    reticleGraphics.generateTexture('ui_camera_reticle', 100, 100);
    reticleGraphics.destroy();
  }

  /**
   * Generates NPC sprites
   */
  static generateNPCs(scene: Phaser.Scene): void {
    // Grandpa
    const grandpaGraphics = scene.add.graphics();
    grandpaGraphics.fillStyle(0x95a5a6, 1); // Gray hair
    grandpaGraphics.fillCircle(16, 8, 5); // Head
    grandpaGraphics.fillStyle(0xfbd4a5, 1); // Skin
    grandpaGraphics.fillCircle(16, 10, 4); // Face
    grandpaGraphics.fillStyle(0x8b4513, 1); // Brown coat
    grandpaGraphics.fillRect(12, 14, 8, 12); // Body
    grandpaGraphics.fillStyle(0x2c3e50, 1);
    grandpaGraphics.fillRect(12, 26, 3, 6); // Legs
    grandpaGraphics.fillRect(17, 26, 3, 6);
    grandpaGraphics.generateTexture('npc_grandpa', 32, 32);
    grandpaGraphics.destroy();

    // Jake (trick master)
    const jakeGraphics = scene.add.graphics();
    jakeGraphics.fillStyle(0x654321, 1); // Brown hair
    jakeGraphics.fillCircle(16, 8, 5);
    jakeGraphics.fillStyle(0xfbd4a5, 1);
    jakeGraphics.fillCircle(16, 10, 4);
    jakeGraphics.fillStyle(0xe74c3c, 1); // Red jacket
    jakeGraphics.fillRect(12, 14, 8, 12);
    jakeGraphics.fillStyle(0x34495e, 1);
    jakeGraphics.fillRect(12, 26, 3, 6);
    jakeGraphics.fillRect(17, 26, 3, 6);
    jakeGraphics.generateTexture('npc_jake', 32, 32);
    jakeGraphics.destroy();

    // Steve (sled tech)
    const steveGraphics = scene.add.graphics();
    steveGraphics.fillStyle(0x2c3e50, 1); // Dark hair
    steveGraphics.fillCircle(16, 8, 5);
    steveGraphics.fillStyle(0xfbd4a5, 1);
    steveGraphics.fillCircle(16, 10, 4);
    steveGraphics.fillStyle(0x95a5a6, 1); // Gray overalls
    steveGraphics.fillRect(12, 14, 8, 12);
    steveGraphics.fillStyle(0x7f8c8d, 1);
    steveGraphics.fillRect(12, 26, 3, 6);
    steveGraphics.fillRect(17, 26, 3, 6);
    steveGraphics.generateTexture('npc_steve', 32, 32);
    steveGraphics.destroy();
  }

  /**
   * Generates all procedural assets
   */
  static generateAllAssets(scene: Phaser.Scene): void {
    this.generatePlayerSprite(scene, 'player');
    this.generateTrickFrames(scene);
    this.generateTerrainTiles(scene);
    this.generateTrees(scene);
    this.generateAnimals(scene);
    this.generateUIElements(scene);
    this.generateNPCs(scene);
  }
}
