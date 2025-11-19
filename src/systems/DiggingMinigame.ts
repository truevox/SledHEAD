import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

type DigMethod = 'dig' | 'pick' | 'pan';
type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface DigSpot {
  x: number;
  y: number;
  method: DigMethod;
  difficulty: number; // 1-5
  quality: number; // 0-1, determines reward quality
  discovered: boolean;
  excavated: boolean;
  sprite?: Phaser.GameObjects.Sprite;
  glowSprite?: Phaser.GameObjects.Sprite;
}

interface DigItem {
  name: string;
  type: 'treasure' | 'fossil' | 'gem' | 'mineral' | 'artifact';
  rarity: ItemRarity;
  value: number;
  description: string;
  emoji: string;
}

interface LegendaryLens {
  name: string;
  type: 'pirate' | 'amber' | 'diamond' | 'ruby' | 'emerald' | 'opal';
  owned: boolean;
  detectsRarity: ItemRarity;
  glowColor: number;
  description: string;
}

interface CollectionLog {
  [key: string]: {
    found: boolean;
    count: number;
    firstFoundDate?: number;
  };
}

export class DiggingMinigame {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private active: boolean = false;

  // Dig spots
  private digSpots: DigSpot[] = [];
  private currentSpot?: DigSpot;

  // Legendary Lenses system
  private lenses: LegendaryLens[] = [
    { name: 'Pirate Lens', type: 'pirate', owned: false, detectsRarity: 'uncommon', glowColor: 0x8B4513, description: 'Reveals buried treasure' },
    { name: 'Amber Lens', type: 'amber', owned: false, detectsRarity: 'uncommon', glowColor: 0xFFBF00, description: 'Reveals ancient fossils' },
    { name: 'Diamond Lens', type: 'diamond', owned: false, detectsRarity: 'rare', glowColor: 0xB9F2FF, description: 'Reveals precious gems' },
    { name: 'Ruby Lens', type: 'ruby', owned: false, detectsRarity: 'rare', glowColor: 0xE0115F, description: 'Reveals rare minerals' },
    { name: 'Emerald Lens', type: 'emerald', owned: false, detectsRarity: 'epic', glowColor: 0x50C878, description: 'Reveals epic artifacts' },
    { name: 'Opal Lens', type: 'opal', owned: false, detectsRarity: 'legendary', glowColor: 0xFF69B4, description: 'Reveals legendary items' },
  ];
  private currentLens?: LegendaryLens;

  // Collection log
  private collectionLog: CollectionLog = {};

  // Excavation minigame
  private excavating: boolean = false;
  private excavationProgress: number = 0;
  private excavationSpeed: number = 1;
  private requiredProgress: number = 100;

  // Input
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private eKey?: Phaser.Input.Keyboard.Key;
  private lKey?: Phaser.Input.Keyboard.Key;

  // UI
  private uiContainer?: Phaser.GameObjects.Container;
  private feedbackText?: Phaser.GameObjects.Text;
  private progressBar?: Phaser.GameObjects.Graphics;
  private collectionText?: Phaser.GameObjects.Text;
  private lensText?: Phaser.GameObjects.Text;
  private detectorEffect?: Phaser.GameObjects.Graphics;

  // Stats
  private sessionFinds: number = 0;
  private sessionValue: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameStateManager.getInstance();
    this.loadCollectionLog();
  }

  private loadCollectionLog(): void {
    try {
      const saved = localStorage.getItem('sledhead_collection_log');
      if (saved) {
        this.collectionLog = JSON.parse(saved);
      }
    } catch (_e) {
      console.error('Failed to load collection log:', _e);
    }
  }

  private saveCollectionLog(): void {
    try {
      localStorage.setItem('sledhead_collection_log', JSON.stringify(this.collectionLog));
    } catch (_e) {
      console.error('Failed to save collection log:', _e);
    }
  }

  start(): void {
    this.active = true;
    this.excavating = false;
    this.sessionFinds = 0;
    this.sessionValue = 0;

    this.setupInput();
    this.createUI();
    this.generateDigSpots();
  }

  private setupInput(): void {
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    this.spaceKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.eKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.lKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.L);
  }

  private createUI(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.uiContainer = this.scene.add.container(0, 0).setDepth(1000);

    // Detector effect (for legendary lenses)
    this.detectorEffect = this.scene.add.graphics().setDepth(999);

    // Collection stats
    this.collectionText = this.scene.add.text(20, 20, '', {
      fontSize: '20px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(1001);
    this.uiContainer.add(this.collectionText);

    // Current lens
    this.lensText = this.scene.add.text(20, 50, 'Lens: None (Press L)', {
      fontSize: '18px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(1001);
    this.uiContainer.add(this.lensText);

    // Feedback text
    this.feedbackText = this.scene.add.text(width / 2, height - 100, '', {
      fontSize: '28px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 5,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1002);
    this.uiContainer.add(this.feedbackText);

    // Progress bar
    this.progressBar = this.scene.add.graphics().setDepth(1001);

    // Instructions
    const instructions = this.scene.add.text(width / 2, height - 50,
      'E: Excavate | L: Change Lens | Arrow Keys: Move | ESC: Exit', {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1001);
    this.uiContainer.add(instructions);

    this.updateCollectionText();
    this.updateLensText();
  }

  private generateDigSpots(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Generate 10-15 dig spots
    const numSpots = Phaser.Math.Between(10, 15);

    for (let i = 0; i < numSpots; i++) {
      const method = Phaser.Utils.Array.GetRandom(['dig', 'pick', 'pan'] as DigMethod[]);
      const spot: DigSpot = {
        x: Phaser.Math.Between(50, width - 50),
        y: Phaser.Math.Between(100, height - 150),
        method,
        difficulty: Phaser.Math.Between(1, 5),
        quality: Math.random(),
        discovered: false,
        excavated: false,
      };

      // Create sprite
      const color = this.getSpotColor(method);
      const sprite = this.scene.add.sprite(spot.x, spot.y, '');

      // Create simple texture
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(color, 0.7);

      if (method === 'dig') {
        graphics.fillCircle(0, 0, 15);
      } else if (method === 'pick') {
        graphics.fillRect(-12, -12, 24, 24);
      } else {
        graphics.fillTriangle(-15, 15, 15, 15, 0, -15);
      }

      graphics.generateTexture(`spot_${i}_${Date.now()}`, 30, 30);
      graphics.destroy();

      sprite.setTexture(`spot_${i}_${Date.now()}`);
      sprite.setAlpha(0.3);
      sprite.setDepth(800);

      spot.sprite = sprite;
      this.digSpots.push(spot);
    }
  }

  private getSpotColor(method: DigMethod): number {
    const colors = {
      dig: 0x8B4513,   // Brown for soft earth
      pick: 0x778899,  // Gray for ice/rock
      pan: 0x4682B4,   // Blue for water
    };
    return colors[method];
  }

  private updateDetectorEffect(): void {
    if (!this.detectorEffect || !this.currentLens) return;

    this.detectorEffect.clear();

    // Pulse effect around valuable spots
    for (const spot of this.digSpots) {
      if (spot.excavated || !spot.sprite) continue;

      // Check if this spot would be valuable based on quality
      const rarity = this.getExpectedRarity(spot.quality);
      const rarityRank = this.getRarityRank(rarity);
      const lensRank = this.getRarityRank(this.currentLens.detectsRarity);

      if (rarityRank >= lensRank) {
        // Show glow
        const pulseSize = 30 + Math.sin(Date.now() / 500) * 10;
        this.detectorEffect.fillStyle(this.currentLens.glowColor, 0.3);
        this.detectorEffect.fillCircle(spot.x, spot.y, pulseSize);

        // Make spot more visible
        spot.discovered = true;
        spot.sprite.setAlpha(0.8);
      }
    }
  }

  private getRarityRank(rarity: ItemRarity): number {
    const ranks = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
    return ranks[rarity];
  }

  private getExpectedRarity(quality: number): ItemRarity {
    if (quality < 0.5) return 'common';
    if (quality < 0.7) return 'uncommon';
    if (quality < 0.85) return 'rare';
    if (quality < 0.95) return 'epic';
    return 'legendary';
  }

  private handleInput(_delta: number): void {
    if (!this.cursors || this.excavating) return;

    // Change lens
    if (Phaser.Input.Keyboard.JustDown(this.lKey!)) {
      this.cycleLens();
    }

    // Check for nearby dig spot
    const nearbySpot = this.findNearbySpot();

    if (nearbySpot && Phaser.Input.Keyboard.JustDown(this.eKey!)) {
      this.startExcavation(nearbySpot);
    }
  }

  private findNearbySpot(): DigSpot | undefined {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const centerX = width / 2;
    const centerY = height / 2;

    return this.digSpots.find(spot => {
      if (spot.excavated) return false;
      const distance = Phaser.Math.Distance.Between(centerX, centerY, spot.x, spot.y);
      return distance < 50;
    });
  }

  private cycleLens(): void {
    const ownedLenses = this.lenses.filter(l => l.owned);

    if (ownedLenses.length === 0) {
      this.showFeedback('No lenses owned! Find them while digging.', 0xff0000);
      return;
    }

    const currentIndex = this.currentLens ? ownedLenses.indexOf(this.currentLens) : -1;
    const nextIndex = (currentIndex + 1) % (ownedLenses.length + 1);

    if (nextIndex === ownedLenses.length) {
      this.currentLens = undefined;
    } else {
      this.currentLens = ownedLenses[nextIndex];
    }

    this.updateLensText();
  }

  private updateLensText(): void {
    if (!this.lensText) return;

    if (this.currentLens) {
      this.lensText.setText(`Lens: ${this.currentLens.name}`);
      this.lensText.setColor(`#${this.currentLens.glowColor.toString(16).padStart(6, '0')}`);
    } else {
      this.lensText.setText('Lens: None (Press L)');
      this.lensText.setColor('#00ffff');
    }
  }

  private startExcavation(spot: DigSpot): void {
    this.excavating = true;
    this.excavationProgress = 0;
    this.currentSpot = spot;
    this.requiredProgress = 100 * spot.difficulty;
    this.excavationSpeed = this.getExcavationSpeed(spot.method);

    this.showFeedback(`Excavating... (SPACE to dig)`, 0xffff00);
  }

  private getExcavationSpeed(method: DigMethod): number {
    const speeds = {
      dig: 2,    // Fastest
      pick: 1.5, // Medium
      pan: 1,    // Slowest but finds more variety
    };
    return speeds[method];
  }

  private handleExcavation(delta: number): void {
    if (!this.excavating || !this.currentSpot) return;

    // Press SPACE to make progress
    if (this.spaceKey?.isDown) {
      this.excavationProgress += this.excavationSpeed * (delta / 16);
    }

    this.updateProgressBar();

    if (this.excavationProgress >= this.requiredProgress) {
      this.completeExcavation();
    }
  }

  private updateProgressBar(): void {
    if (!this.progressBar) return;

    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.progressBar.clear();

    if (this.excavating) {
      // Background
      this.progressBar.fillStyle(0x333333, 1);
      this.progressBar.fillRect(width / 2 - 200, height - 150, 400, 30);

      // Progress
      const progress = Math.min(1, this.excavationProgress / this.requiredProgress);
      this.progressBar.fillStyle(0x00ff00, 1);
      this.progressBar.fillRect(width / 2 - 200, height - 150, 400 * progress, 30);

      // Border
      this.progressBar.lineStyle(3, 0xffffff, 1);
      this.progressBar.strokeRect(width / 2 - 200, height - 150, 400, 30);
    }
  }

  private completeExcavation(): void {
    if (!this.currentSpot) return;

    this.excavating = false;
    this.currentSpot.excavated = true;

    // Generate item based on spot quality and method
    const item = this.generateItem(this.currentSpot);
    this.awardItem(item);

    // Hide spot
    this.currentSpot.sprite?.destroy();

    // Small chance to find a lens
    if (Math.random() < 0.05) {
      this.findLens();
    }

    this.currentSpot = undefined;
  }

  private generateItem(spot: DigSpot): DigItem {
    const rarity = this.getExpectedRarity(spot.quality);

    // Item pools by method
    const itemPools = {
      dig: [
        { name: 'Ancient Coin', type: 'treasure', emoji: '🪙' },
        { name: 'Pottery Shard', type: 'artifact', emoji: '🏺' },
        { name: 'Dinosaur Bone', type: 'fossil', emoji: '🦴' },
        { name: 'Trilobite', type: 'fossil', emoji: '🐚' },
        { name: 'Pirate Treasure', type: 'treasure', emoji: '💰' },
      ],
      pick: [
        { name: 'Quartz Crystal', type: 'mineral', emoji: '💎' },
        { name: 'Iron Ore', type: 'mineral', emoji: '⚙️' },
        { name: 'Ruby', type: 'gem', emoji: '💎' },
        { name: 'Sapphire', type: 'gem', emoji: '💎' },
        { name: 'Diamond', type: 'gem', emoji: '💎' },
      ],
      pan: [
        { name: 'Gold Nugget', type: 'mineral', emoji: '✨' },
        { name: 'Silver Flakes', type: 'mineral', emoji: '✨' },
        { name: 'Tiny Gems', type: 'gem', emoji: '💎' },
        { name: 'Amber Piece', type: 'fossil', emoji: '🟡' },
        { name: 'Pearl', type: 'treasure', emoji: '🔮' },
      ],
    };

    const pool = itemPools[spot.method];
    const selected = Phaser.Utils.Array.GetRandom(pool);

    const values = {
      common: 20,
      uncommon: 50,
      rare: 150,
      epic: 500,
      legendary: 2000,
    };

    return {
      name: selected.name,
      type: selected.type as DigItem['type'],
      rarity,
      value: values[rarity] * Phaser.Math.FloatBetween(0.8, 1.2),
      description: `A ${rarity} ${selected.type} found while ${spot.method}ging`,
      emoji: selected.emoji,
    };
  }

  private awardItem(item: DigItem): void {
    this.sessionFinds++;
    this.sessionValue += item.value;
    this.gameState.addMoney(Math.floor(item.value));

    // Update collection log
    if (!this.collectionLog[item.name]) {
      this.collectionLog[item.name] = {
        found: true,
        count: 0,
        firstFoundDate: Date.now(),
      };
    }
    this.collectionLog[item.name].count++;
    this.saveCollectionLog();

    // Show feedback
    const color = this.getRarityColor(item.rarity);
    this.showFeedback(
      `${item.emoji} ${item.name} (${item.rarity.toUpperCase()}) +$${Math.floor(item.value)}`,
      color
    );

    this.updateCollectionText();

    // Flash effect
    this.scene.cameras.main.flash(200, ...this.hexToRgb(color));
  }

  private findLens(): void {
    const unfoundLenses = this.lenses.filter(l => !l.owned);
    if (unfoundLenses.length === 0) return;

    const lens = Phaser.Utils.Array.GetRandom(unfoundLenses);
    lens.owned = true;

    this.showFeedback(`🔍 Legendary Lens Found! ${lens.name}`, 0xff00ff);
    this.scene.cameras.main.flash(500, 255, 0, 255);

    // Save lenses state
    try {
      localStorage.setItem('sledhead_lenses', JSON.stringify(this.lenses));
    } catch (_e) {
      console.error('Failed to save lenses:', _e);
    }
  }

  private getRarityColor(rarity: ItemRarity): number {
    const colors = {
      common: 0xaaaaaa,
      uncommon: 0x00ff00,
      rare: 0x0088ff,
      epic: 0xaa00ff,
      legendary: 0xff8800,
    };
    return colors[rarity];
  }

  private hexToRgb(hex: number): [number, number, number] {
    return [
      (hex >> 16) & 255,
      (hex >> 8) & 255,
      hex & 255,
    ];
  }

  private showFeedback(text: string, color: number): void {
    if (!this.feedbackText) return;

    this.feedbackText.setText(text);
    this.feedbackText.setColor(`#${color.toString(16).padStart(6, '0')}`);
    this.feedbackText.setAlpha(1);

    this.scene.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      duration: 3000,
      ease: 'Power2',
    });
  }

  private updateCollectionText(): void {
    if (!this.collectionText) return;

    const uniqueItems = Object.keys(this.collectionLog).length;
    this.collectionText.setText(
      `Collection: ${uniqueItems} items | Session: ${this.sessionFinds} finds | $${Math.floor(this.sessionValue)}`
    );
  }

  update(_time: number, delta: number): void {
    if (!this.active) return;

    this.handleInput(delta);
    this.handleExcavation(delta);
    this.updateDetectorEffect();
  }

  stop(): void {
    this.active = false;
    this.excavating = false;

    // Cleanup
    this.digSpots.forEach(spot => spot.sprite?.destroy());
    this.digSpots = [];

    this.uiContainer?.destroy();
    this.progressBar?.destroy();
    this.detectorEffect?.destroy();
  }

  isActive(): boolean {
    return this.active;
  }

  getCollectionLog(): CollectionLog {
    return { ...this.collectionLog };
  }

  destroy(): void {
    this.stop();
  }
}
