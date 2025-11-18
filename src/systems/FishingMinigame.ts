import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

interface Fish {
  type: 'trout' | 'salmon' | 'bass' | 'pike' | 'sturgeon' | 'golden_trout';
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  size: number;
  rarity: number;
  value: number;
  behavior: 'schooling' | 'lurking' | 'darting' | 'circling';
  photographed: boolean;
  sprite?: Phaser.GameObjects.Sprite;
}

interface PhotoScore {
  fish: Fish;
  centering: number;
  focusQuality: number;
  rarityBonus: number;
  sizeBonus: number;
  totalEarnings: number;
}

export class FishingMinigame {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private active: boolean = false;

  // Camera system
  private cameraDepth: number = 0;
  private maxDepth: number = 300;
  private cameraAngle: number = 0; // -45 to 45 degrees
  private cameraView?: Phaser.GameObjects.Rectangle;
  private viewfinderFrame?: Phaser.GameObjects.Graphics;

  // Fish spawning
  private fishes: Fish[] = [];
  private maxFish: number = 15;
  private spawnTimer: number = 0;
  private spawnInterval: number = 2000;

  // Input
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;

  // UI
  private uiContainer?: Phaser.GameObjects.Container;
  private depthText?: Phaser.GameObjects.Text;
  private angleText?: Phaser.GameObjects.Text;
  private photoCountText?: Phaser.GameObjects.Text;
  private feedbackText?: Phaser.GameObjects.Text;
  private waterOverlay?: Phaser.GameObjects.Graphics;

  // Session tracking
  private photosTaken: number = 0;
  private sessionEarnings: number = 0;
  private totalPhotos: number = 0;

  // Upgrade bonuses
  private focusBonus: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameStateManager.getInstance();
    this.loadUpgradeBonuses();
  }

  private loadUpgradeBonuses(): void {
    const opticsLevel = this.gameState.getUpgrade('personal', 'optimalOptics');
    this.focusBonus = opticsLevel * 0.1;
  }

  start(): void {
    this.active = true;
    this.cameraDepth = 0;
    this.cameraAngle = 0;
    this.photosTaken = 0;
    this.sessionEarnings = 0;
    this.fishes = [];

    this.setupInput();
    this.createUI();
    this.createWaterOverlay();
    this.spawnInitialFish();
  }

  private setupInput(): void {
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    this.spaceKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  private createUI(): void {
    const centerX = this.scene.cameras.main.width / 2;
    const width = this.scene.cameras.main.width;

    this.uiContainer = this.scene.add.container(0, 0).setDepth(1000);

    // Camera viewfinder
    this.cameraView = this.scene.add.rectangle(
      centerX,
      300,
      400,
      300,
      0x000033,
      0.6
    ).setDepth(999);

    this.viewfinderFrame = this.scene.add.graphics();
    this.viewfinderFrame.lineStyle(4, 0x00ffff, 1);
    this.viewfinderFrame.strokeRect(centerX - 200, 150, 400, 300);
    this.viewfinderFrame.lineStyle(2, 0x00ffff, 0.5);
    this.viewfinderFrame.lineBetween(centerX - 200, 300, centerX + 200, 300);
    this.viewfinderFrame.lineBetween(centerX, 150, centerX, 450);
    this.viewfinderFrame.setDepth(1001);

    // Depth indicator
    this.depthText = this.scene.add.text(20, 20, 'Depth: 0m', {
      fontSize: '24px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setDepth(1002);

    // Angle indicator
    this.angleText = this.scene.add.text(20, 50, 'Angle: 0°', {
      fontSize: '24px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setDepth(1002);

    // Photo counter
    this.photoCountText = this.scene.add.text(width - 20, 20, 'Photos: 0 | $0', {
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(1, 0).setDepth(1002);

    // Feedback text
    this.feedbackText = this.scene.add.text(centerX, 500, '', {
      fontSize: '32px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 6,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1003);

    // Instructions
    const instructions = this.scene.add.text(centerX, 550,
      'Arrow Keys: Control Camera | SPACE: Take Photo | ESC: Exit', {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(1002);

    this.uiContainer.add([
      this.depthText,
      this.angleText,
      this.photoCountText,
      this.feedbackText,
      instructions
    ]);
  }

  private createWaterOverlay(): void {
    this.waterOverlay = this.scene.add.graphics().setDepth(998);
    this.updateWaterEffect();
  }

  private updateWaterEffect(): void {
    if (!this.waterOverlay) return;

    this.waterOverlay.clear();

    // Darker as you go deeper
    const opacity = Math.min(0.7, this.cameraDepth / this.maxDepth * 0.5);
    this.waterOverlay.fillStyle(0x001133, opacity);
    this.waterOverlay.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);

    // Caustics effect
    const causticOpacity = 0.1 - (this.cameraDepth / this.maxDepth * 0.1);
    if (causticOpacity > 0) {
      this.waterOverlay.fillStyle(0x00ffff, causticOpacity * Math.sin(Date.now() / 1000) * 0.5 + 0.05);
      for (let i = 0; i < 5; i++) {
        const x = (Date.now() / 1000 + i * 100) % this.scene.cameras.main.width;
        this.waterOverlay.fillCircle(x, 200 + Math.sin(Date.now() / 500 + i) * 50, 50);
      }
    }
  }

  private spawnInitialFish(): void {
    for (let i = 0; i < 5; i++) {
      this.spawnFish();
    }
  }

  private spawnFish(): void {
    if (this.fishes.length >= this.maxFish) return;

    const fishTypes: Fish['type'][] = ['trout', 'salmon', 'bass', 'pike', 'sturgeon', 'golden_trout'];
    const rarities = [1, 1, 1, 0.7, 0.3, 0.1]; // Spawn weights

    let selectedType: Fish['type'] = 'trout';
    const roll = Math.random();
    let cumulative = 0;

    for (let i = 0; i < fishTypes.length; i++) {
      cumulative += rarities[i] / rarities.reduce((a, b) => a + b, 0);
      if (roll < cumulative) {
        selectedType = fishTypes[i];
        break;
      }
    }

    const behaviors: Fish['behavior'][] = ['schooling', 'lurking', 'darting', 'circling'];
    const behavior = Phaser.Utils.Array.GetRandom(behaviors);

    const fish: Fish = {
      type: selectedType,
      position: {
        x: Phaser.Math.Between(100, this.scene.cameras.main.width - 100),
        y: Phaser.Math.Between(50, this.maxDepth),
      },
      velocity: {
        x: Phaser.Math.FloatBetween(-2, 2),
        y: Phaser.Math.FloatBetween(-1, 1),
      },
      size: this.getFishSize(selectedType),
      rarity: this.getFishRarity(selectedType),
      value: this.getFishValue(selectedType),
      behavior: behavior,
      photographed: false,
    };

    // Create sprite
    const color = this.getFishColor(selectedType);
    const sprite = this.scene.add.sprite(fish.position.x, fish.position.y, '');
    sprite.setDisplaySize(fish.size, fish.size * 0.6);

    // Create simple fish shape
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    graphics.fillEllipse(0, 0, fish.size, fish.size * 0.6);
    graphics.fillTriangle(fish.size/2, 0, fish.size, -fish.size/4, fish.size, fish.size/4);
    graphics.generateTexture(`fish_${Date.now()}_${Math.random()}`, fish.size * 1.5, fish.size);
    graphics.destroy();

    sprite.setTexture(`fish_${Date.now()}_${Math.random()}`);
    sprite.setDepth(900);

    fish.sprite = sprite;
    this.fishes.push(fish);
  }

  private getFishSize(type: Fish['type']): number {
    const sizes = {
      trout: 30,
      salmon: 40,
      bass: 35,
      pike: 50,
      sturgeon: 60,
      golden_trout: 35,
    };
    return sizes[type] * Phaser.Math.FloatBetween(0.8, 1.2);
  }

  private getFishRarity(type: Fish['type']): number {
    const rarities = {
      trout: 1,
      salmon: 1.2,
      bass: 1.1,
      pike: 1.5,
      sturgeon: 2,
      golden_trout: 3,
    };
    return rarities[type];
  }

  private getFishValue(type: Fish['type']): number {
    const values = {
      trout: 20,
      salmon: 30,
      bass: 25,
      pike: 50,
      sturgeon: 100,
      golden_trout: 200,
    };
    return values[type];
  }

  private getFishColor(type: Fish['type']): number {
    const colors = {
      trout: 0x888888,
      salmon: 0xff8866,
      bass: 0x556644,
      pike: 0x667744,
      sturgeon: 0x444444,
      golden_trout: 0xffdd00,
    };
    return colors[type];
  }

  private updateFishBehavior(fish: Fish, _delta: number): void {
    const _time = Date.now() / 1000;

    switch (fish.behavior) {
      case 'schooling':
        // Move in gentle waves
        fish.velocity.x = Math.sin(_time + fish.position.x) * 1.5;
        fish.velocity.y = Math.cos(_time * 0.5) * 0.5;
        break;

      case 'lurking':
        // Stay mostly still, occasional movement
        if (Math.random() < 0.01) {
          fish.velocity.x = Phaser.Math.FloatBetween(-3, 3);
          fish.velocity.y = Phaser.Math.FloatBetween(-1, 1);
        } else {
          fish.velocity.x *= 0.95;
          fish.velocity.y *= 0.95;
        }
        break;

      case 'darting':
        // Fast, erratic movement
        if (Math.random() < 0.05) {
          fish.velocity.x = Phaser.Math.FloatBetween(-4, 4);
          fish.velocity.y = Phaser.Math.FloatBetween(-2, 2);
        }
        break;

      case 'circling':
        // Circular motion
        const _speed = 2;
        fish.velocity.x = Math.cos(_time * _speed) * 2;
        fish.velocity.y = Math.sin(_time * _speed);
        break;
    }

    // Update position
    fish.position.x += fish.velocity.x;
    fish.position.y += fish.velocity.y;

    // Wrap around boundaries
    const width = this.scene.cameras.main.width;
    if (fish.position.x < 0) fish.position.x = width;
    if (fish.position.x > width) fish.position.x = 0;
    if (fish.position.y < 0) fish.position.y = this.maxDepth;
    if (fish.position.y > this.maxDepth) fish.position.y = 0;

    // Update sprite
    if (fish.sprite) {
      fish.sprite.setPosition(fish.position.x, fish.position.y);
      fish.sprite.setFlipX(fish.velocity.x < 0);

      // Fade based on depth and camera
      const depthDiff = Math.abs(fish.position.y - this.cameraDepth);
      const visibility = Math.max(0, 1 - depthDiff / 100);
      fish.sprite.setAlpha(visibility);

      // Scale based on depth
      const scale = 1 - (fish.position.y / this.maxDepth) * 0.5;
      fish.sprite.setScale(scale);
    }
  }

  private handleInput(delta: number): void {
    if (!this.cursors) return;

    // Control camera depth
    if (this.cursors.down?.isDown) {
      this.cameraDepth = Math.min(this.maxDepth, this.cameraDepth + delta * 0.05);
    }
    if (this.cursors.up?.isDown) {
      this.cameraDepth = Math.max(0, this.cameraDepth - delta * 0.05);
    }

    // Control camera angle
    if (this.cursors.left?.isDown) {
      this.cameraAngle = Math.max(-45, this.cameraAngle - delta * 0.1);
    }
    if (this.cursors.right?.isDown) {
      this.cameraAngle = Math.min(45, this.cameraAngle + delta * 0.1);
    }

    // Take photo
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey!)) {
      this.takePhoto();
    }
  }

  private takePhoto(): void {
    // Find fish in frame
    const centerX = this.scene.cameras.main.width / 2;
    const frameLeft = centerX - 200;
    const frameRight = centerX + 200;
    const frameTop = 150;
    const frameBottom = 450;

    const fishInFrame = this.fishes.filter(fish => {
      if (!fish.sprite || fish.sprite.alpha < 0.3) return false;

      const x = fish.sprite.x;
      const y = fish.sprite.y;

      return x >= frameLeft && x <= frameRight && y >= frameTop && y <= frameBottom;
    });

    if (fishInFrame.length === 0) {
      this.showFeedback('No fish in frame!', 0xff0000);
      return;
    }

    // Score the best fish
    let bestScore: PhotoScore | null = null;

    for (const fish of fishInFrame) {
      if (!fish.sprite) continue;

      // Calculate centering (0-1)
      const centeringX = 1 - Math.abs(fish.sprite.x - centerX) / 200;
      const centeringY = 1 - Math.abs(fish.sprite.y - 300) / 150;
      const centering = (centeringX + centeringY) / 2;

      // Calculate focus quality (based on depth match)
      const depthDiff = Math.abs(fish.position.y - this.cameraDepth);
      const focusQuality = Math.max(0, 1 - depthDiff / 50) + this.focusBonus;

      // Bonuses
      const rarityBonus = fish.rarity;
      const sizeBonus = fish.size / 60;

      // Total earnings
      const totalEarnings = Math.floor(
        fish.value * centering * focusQuality * rarityBonus * sizeBonus
      );

      const score: PhotoScore = {
        fish,
        centering,
        focusQuality: Math.min(1, focusQuality),
        rarityBonus,
        sizeBonus,
        totalEarnings,
      };

      if (!bestScore || score.totalEarnings > bestScore.totalEarnings) {
        bestScore = score;
      }
    }

    if (bestScore) {
      this.processPhoto(bestScore);
    }
  }

  private processPhoto(score: PhotoScore): void {
    this.photosTaken++;
    this.sessionEarnings += score.totalEarnings;
    this.gameState.addMoney(score.totalEarnings);

    // Mark fish as photographed
    score.fish.photographed = true;

    // Show feedback
    const quality = score.centering * score.focusQuality;
    let message = '';
    if (quality > 0.8) message = 'Perfect Shot!';
    else if (quality > 0.6) message = 'Great Photo!';
    else if (quality > 0.4) message = 'Good Catch!';
    else message = 'Photo Taken';

    this.showFeedback(
      `${message} ${this.getFishEmoji(score.fish.type)} +$${score.totalEarnings}`,
      0x00ff00
    );

    this.updatePhotoCounter();

    // Flash effect
    if (this.cameraView) {
      this.scene.tweens.add({
        targets: this.cameraView,
        alpha: 0,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          if (this.cameraView) this.cameraView.setAlpha(0.6);
        }
      });
    }
  }

  private getFishEmoji(type: Fish['type']): string {
    const emojis = {
      trout: '🐟',
      salmon: '🐠',
      bass: '🐟',
      pike: '🦈',
      sturgeon: '🐋',
      golden_trout: '✨🐟',
    };
    return emojis[type];
  }

  private showFeedback(text: string, color: number): void {
    if (!this.feedbackText) return;

    this.feedbackText.setText(text);
    this.feedbackText.setColor(`#${color.toString(16).padStart(6, '0')}`);
    this.feedbackText.setAlpha(1);

    this.scene.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
    });
  }

  private updatePhotoCounter(): void {
    if (!this.photoCountText) return;
    this.photoCountText.setText(`Photos: ${this.photosTaken} | $${this.sessionEarnings}`);
  }

  update(_time: number, delta: number): void {
    if (!this.active) return;

    this.handleInput(delta);
    this.updateWaterEffect();

    // Update UI
    if (this.depthText) {
      this.depthText.setText(`Depth: ${Math.floor(this.cameraDepth)}m`);
    }
    if (this.angleText) {
      this.angleText.setText(`Angle: ${Math.floor(this.cameraAngle)}°`);
    }

    // Update fish
    for (const fish of this.fishes) {
      this.updateFishBehavior(fish, delta);
    }

    // Spawn new fish
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnFish();
    }

    // Remove photographed fish after delay
    this.fishes = this.fishes.filter(fish => {
      if (fish.photographed) {
        if (fish.sprite) {
          this.scene.tweens.add({
            targets: fish.sprite,
            alpha: 0,
            duration: 1000,
            onComplete: () => fish.sprite?.destroy()
          });
        }
        return false;
      }
      return true;
    });
  }

  stop(): void {
    this.active = false;

    // Cleanup
    this.fishes.forEach(fish => fish.sprite?.destroy());
    this.fishes = [];

    this.cameraView?.destroy();
    this.viewfinderFrame?.destroy();
    this.uiContainer?.destroy();
    this.waterOverlay?.destroy();

    // Update stats
    this.totalPhotos += this.photosTaken;
  }

  isActive(): boolean {
    return this.active;
  }

  getSessionEarnings(): number {
    return this.sessionEarnings;
  }

  getPhotosTaken(): number {
    return this.photosTaken;
  }

  destroy(): void {
    this.stop();
  }
}
