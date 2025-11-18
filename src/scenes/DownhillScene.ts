import Phaser from 'phaser';
import { MountainGenerator } from '../systems/MountainGenerator';
import { TrickSystem } from '../systems/TrickSystem';
import { GameStateManager } from '../utils/GameStateManager';
import { TerrainTile } from '../types';

interface Gate {
  x: number;
  y: number;
  passed: boolean;
  sprite?: Phaser.GameObjects.Rectangle;
}

export class DownhillScene extends Phaser.Scene {
  private mountainGenerator!: MountainGenerator;
  private trickSystem!: TrickSystem;
  private gameStateManager!: GameStateManager;

  // Player
  private player!: Phaser.GameObjects.Rectangle;
  private playerVelocityX: number = 0;
  private playerVelocityY: number = 0;
  private playerSpeed: number = 0;
  private isJumping: boolean = false;
  private isOnGround: boolean = true;
  private canJump: boolean = true;

  // Physics constants
  private readonly GRAVITY = 0.5;
  private readonly MAX_SPEED = 15;
  private readonly ACCELERATION = 0.3;
  private readonly STEERING_SPEED = 5;
  private readonly JUMP_POWER = -15;
  private readonly FRICTION = 0.98;

  // Terrain rendering
  private terrainGraphics!: Phaser.GameObjects.Graphics;
  private obstacleSprites: Phaser.GameObjects.Rectangle[] = [];

  // Camera and scrolling
  private worldStartY: number = 2000; // Start at high altitude
  private currentLayer: number = 9; // Start at top layer

  // Game state
  private startTime: number = 0;
  private currentTime: number = 0;
  private moneyEarned: number = 0;
  private tricksLanded: number = 0;
  private collisions: number = 0;
  private gates: Gate[] = [];
  private gatesPassed: number = 0;
  private runEnded: boolean = false;

  // HUD elements
  private hudGraphics!: Phaser.GameObjects.Graphics;
  private speedText!: Phaser.GameObjects.Text;
  private altitudeText!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  // Durability (based on upgrades)
  private currentDurability: number = 100;
  private maxDurability: number = 100;

  constructor() {
    super({ key: 'DownhillScene' });
  }

  create(): void {
    // Initialize managers
    this.gameStateManager = GameStateManager.getInstance();
    const gameState = this.gameStateManager.getState();

    // Create mountain
    this.mountainGenerator = new MountainGenerator(gameState.mountainSeed);

    // Initialize trick system
    this.trickSystem = new TrickSystem(this);

    // Setup player
    this.createPlayer();

    // Setup terrain rendering
    this.terrainGraphics = this.add.graphics();

    // Setup camera
    this.setupCamera();

    // Create gates for time trial
    this.createGates();

    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Create HUD
    this.createHUD();

    // Calculate max durability based on upgrades
    const durabilityLevel = this.gameStateManager.getUpgrade('personal', 'sledDurability');
    this.maxDurability = 100 + (durabilityLevel * 50);
    this.currentDurability = this.maxDurability;

    // Start the run
    this.startTime = Date.now();

    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private createPlayer(): void {
    // Create a simple player representation (can be replaced with sprite later)
    this.player = this.add.rectangle(200, this.worldStartY, 32, 32, 0x3498db);
    this.player.setStrokeStyle(2, 0x2c3e50);

    // Reset velocities
    this.playerVelocityX = 0;
    this.playerVelocityY = 0;
    this.playerSpeed = 0;
  }

  private setupCamera(): void {
    // Set camera bounds (we'll update as player descends)
    this.cameras.main.setBounds(0, 0, 2000, 2000);

    // Camera follows player with offset to show more of the descent
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setFollowOffset(-300, 0); // Player on left side
  }

  private createGates(): void {
    // Create time trial gates at intervals
    for (let y = 1800; y > 200; y -= 300) {
      this.gates.push({
        x: 1000,
        y: y,
        passed: false,
      });
    }
  }

  private createHUD(): void {
    // Create HUD background
    this.hudGraphics = this.add.graphics();
    this.hudGraphics.setScrollFactor(0);
    this.hudGraphics.setDepth(999);

    // Draw HUD background
    this.hudGraphics.fillStyle(0x000000, 0.5);
    this.hudGraphics.fillRect(10, 10, 300, 150);

    // Create text elements
    this.speedText = this.add.text(20, 20, 'Speed: 0 mph', {
      fontSize: '20px',
      color: '#ffffff',
    }).setScrollFactor(0).setDepth(1000);

    this.altitudeText = this.add.text(20, 50, 'Altitude: 2000 ft', {
      fontSize: '20px',
      color: '#ffffff',
    }).setScrollFactor(0).setDepth(1000);

    this.moneyText = this.add.text(20, 80, 'Earned: $0', {
      fontSize: '20px',
      color: '#FFD700',
    }).setScrollFactor(0).setDepth(1000);

    this.timeText = this.add.text(20, 110, 'Time: 0.0s', {
      fontSize: '20px',
      color: '#ffffff',
    }).setScrollFactor(0).setDepth(1000);

    // Durability bar
    this.add.text(20, 140, 'Durability:', {
      fontSize: '18px',
      color: '#ffffff',
    }).setScrollFactor(0).setDepth(1000);
  }

  update(_time: number, _delta: number): void {
    if (this.runEnded) return;

    // Update systems
    this.trickSystem.update();

    // Update current time
    this.currentTime = Date.now() - this.startTime;

    // Handle input
    this.handleInput();

    // Apply physics
    this.applyPhysics();

    // Update player position
    this.player.x += this.playerVelocityX;
    this.player.y += this.playerVelocityY;

    // Wrap player around horizontally (cylindrical mountain)
    const currentLayerData = this.mountainGenerator.getLayer(this.currentLayer);
    if (currentLayerData && this.player.x > currentLayerData.circumference) {
      this.player.x = 0;
    } else if (this.player.x < 0) {
      this.player.x = currentLayerData ? currentLayerData.circumference : 2000;
    }

    // Check ground collision
    this.checkGroundCollision();

    // Check obstacle collision
    this.checkObstacleCollision();

    // Check gates
    this.checkGates();

    // Update HUD
    this.updateHUD();

    // Render terrain
    this.renderTerrain();

    // Check for run end
    if (this.player.y <= 50) {
      this.endRun();
    }

    // Update current layer based on altitude
    const newLayer = this.mountainGenerator.getLayerIndexForY(this.player.y);
    if (newLayer !== this.currentLayer) {
      this.currentLayer = newLayer;
    }
  }

  private handleInput(): void {
    // Steering (left/right)
    if (this.cursors.left.isDown) {
      if (this.isJumping) {
        // Add trick input
        this.trickSystem.addInput('LEFT');
      } else {
        // Steer left
        this.playerVelocityX -= this.STEERING_SPEED * 0.1;
      }
    }

    if (this.cursors.right.isDown) {
      if (this.isJumping) {
        // Add trick input
        this.trickSystem.addInput('RIGHT');
      } else {
        // Steer right
        this.playerVelocityX += this.STEERING_SPEED * 0.1;
      }
    }

    // Jump
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canJump && this.isOnGround) {
      this.jump();
    }

    // Trick inputs (only while jumping)
    if (this.isJumping) {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        this.trickSystem.addInput('UP');
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        this.trickSystem.addInput('DOWN');
      }
    }
  }

  private applyPhysics(): void {
    // Gravity (always pulling down)
    this.playerVelocityY += this.GRAVITY;

    // Speed increases as we descend (acceleration from gravity)
    if (!this.isJumping && this.isOnGround) {
      // Get slope information from terrain
      const tile = this.getTileAtPlayer();

      // Accelerate downhill
      const slopeAcceleration = this.ACCELERATION;
      this.playerSpeed += slopeAcceleration;

      // Speed bonus from upgrades
      const rocketLevel = this.gameStateManager.getUpgrade('personal', 'rocketSurgery');
      const speedBonus = 1 + (rocketLevel * 0.1);
      this.playerSpeed = Math.min(this.MAX_SPEED * speedBonus, this.playerSpeed);

      // Apply speed to downward velocity
      this.playerVelocityY = Math.max(this.playerVelocityY, this.playerSpeed * 0.5);

      // Ice terrain increases speed
      if (tile && tile.type === 'ice') {
        this.playerSpeed *= 1.1;
      }
    }

    // Apply friction to horizontal velocity
    this.playerVelocityX *= this.FRICTION;

    // Clamp velocities
    this.playerVelocityX = Math.max(-this.STEERING_SPEED, Math.min(this.STEERING_SPEED, this.playerVelocityX));

    // Rotation based on velocity
    const rotation = this.playerVelocityX * 0.1;
    this.player.setRotation(rotation);
  }

  private jump(): void {
    this.playerVelocityY = this.JUMP_POWER;
    this.isJumping = true;
    this.isOnGround = false;
    this.canJump = false;

    // Leg day upgrade increases jump power
    const legLevel = this.gameStateManager.getUpgrade('personal', 'attendLegDay');
    this.playerVelocityY *= (1 + legLevel * 0.1);
  }

  private checkGroundCollision(): void {
    const tile = this.getTileAtPlayer();
    if (!tile) return;

    // Simple collision: check if player is at or below terrain level
    const tileY = Math.floor(this.player.y / 32) * 32;
    const playerBottom = this.player.y + 16;

    if (playerBottom >= tileY && this.playerVelocityY > 0) {
      // Landing
      if (this.isJumping) {
        this.land(tile);
      }

      this.isOnGround = true;
      this.canJump = true;
      this.player.y = tileY - 16;
      this.playerVelocityY = 0;
    } else {
      this.isOnGround = false;
    }
  }

  private land(_tile: TerrainTile): void {
    // Check if we were doing a trick
    if (this.trickSystem.isTrickInProgress()) {
      const trickFeedback = this.trickSystem.completeTrick();

      if (trickFeedback) {
        // Calculate earnings
        const earnings = Math.floor(trickFeedback.value * trickFeedback.multiplier);

        // Crowd hypeman upgrade increases earnings
        const hypeLevel = this.gameStateManager.getUpgrade('personal', 'crowdHypeman');
        const finalEarnings = Math.floor(earnings * (1 + hypeLevel * 0.15));

        this.moneyEarned += finalEarnings;
        this.tricksLanded++;
      }
    }

    this.isJumping = false;
    this.trickSystem.reset();
  }

  private checkObstacleCollision(): void {
    const tile = this.getTileAtPlayer();

    if (!tile) return;

    // Check for collision with obstacles
    if (tile.type === 'tree' || tile.type === 'obstacle' || tile.type === 'rock') {
      this.crash();
    }
  }

  private crash(): void {
    // Calculate damage based on speed
    const damage = Math.floor(this.playerSpeed * 5);
    this.currentDurability -= damage;
    this.collisions++;

    // Fail any trick in progress
    if (this.trickSystem.isTrickInProgress()) {
      this.trickSystem.failTrick();
    }

    // Reduce speed
    this.playerSpeed *= 0.5;
    this.playerVelocityY *= 0.5;

    // Visual feedback
    this.cameras.main.shake(200, 0.01);
    const originalColor = this.player.fillColor;
    this.player.setFillStyle(0xff0000);
    this.time.delayedCall(200, () => {
      this.player.setFillStyle(originalColor);
    });

    // Check if sled is destroyed
    if (this.currentDurability <= 0) {
      this.sledDestroyed();
    }
  }

  private sledDestroyed(): void {
    // End run with penalty
    this.moneyEarned = Math.floor(this.moneyEarned * 0.5); // Lose half earnings
    this.endRun();
  }

  private checkGates(): void {
    for (const gate of this.gates) {
      if (!gate.passed && Math.abs(this.player.y - gate.y) < 50) {
        if (Math.abs(this.player.x - gate.x) < 100) {
          gate.passed = true;
          this.gatesPassed++;

          // Time bonus
          const timeBonus = 50;
          this.moneyEarned += timeBonus;

          // Visual feedback
          this.showGatePassedFeedback();
        }
      }
    }
  }

  private showGatePassedFeedback(): void {
    const text = this.add.text(
      this.cameras.main.width / 2,
      150,
      '🚪 Gate! +$50',
      {
        fontSize: '32px',
        color: '#00ff00',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

    this.tweens.add({
      targets: text,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy()
    });
  }

  private getTileAtPlayer(): TerrainTile | undefined {
    return this.mountainGenerator.getTileAt(this.player.x, this.player.y, this.currentLayer);
  }

  private renderTerrain(): void {
    this.terrainGraphics.clear();

    // Clean up old obstacle sprites
    this.obstacleSprites.forEach(sprite => sprite.destroy());
    this.obstacleSprites = [];

    const cam = this.cameras.main;
    const visibleArea = {
      x: cam.scrollX,
      y: cam.scrollY,
      width: cam.width,
      height: cam.height,
    };

    // Get current layer
    const layer = this.mountainGenerator.getLayer(this.currentLayer);
    if (!layer) return;

    // Render visible terrain tiles
    const tileSize = 32;
    const startX = Math.floor(visibleArea.x / tileSize);
    const endX = Math.ceil((visibleArea.x + visibleArea.width) / tileSize);
    const startY = Math.floor(visibleArea.y / tileSize);
    const endY = Math.ceil((visibleArea.y + visibleArea.height) / tileSize);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const tile = this.mountainGenerator.getTileAt(x * tileSize, y * tileSize, this.currentLayer);
        if (!tile) continue;

        const screenX = x * tileSize;
        const screenY = y * tileSize;

        // Render based on tile type
        let color = 0xffffff; // snow
        switch (tile.type) {
          case 'ice':
            color = 0x87ceeb;
            break;
          case 'rock':
            color = 0x808080;
            break;
          case 'tree':
            color = 0x228b22;
            break;
          case 'ramp':
            color = 0xffff00;
            break;
          case 'obstacle':
            color = 0x8b4513;
            break;
        }

        this.terrainGraphics.fillStyle(color, 1);
        this.terrainGraphics.fillRect(screenX, screenY, tileSize, tileSize);

        // Draw obstacles as sprites for better visibility
        if (tile.type === 'tree' || tile.type === 'obstacle' || tile.type === 'rock') {
          const obstacle = this.add.rectangle(screenX + 16, screenY + 16, tileSize, tileSize, color);
          obstacle.setStrokeStyle(2, 0x000000);
          this.obstacleSprites.push(obstacle);
        }
      }
    }

    // Render gates
    this.gates.forEach(gate => {
      if (Math.abs(gate.y - this.player.y) < cam.height) {
        const color = gate.passed ? 0x00ff00 : 0xff0000;
        this.terrainGraphics.fillStyle(color, 0.5);
        this.terrainGraphics.fillRect(gate.x - 50, gate.y - 5, 100, 10);
      }
    });
  }

  private updateHUD(): void {
    // Update speed (convert to mph for display)
    const mph = Math.floor(this.playerSpeed * 10);
    this.speedText.setText(`Speed: ${mph} mph`);

    // Update altitude
    const altitude = Math.floor(this.player.y);
    this.altitudeText.setText(`Altitude: ${altitude} ft`);

    // Update money
    this.moneyText.setText(`Earned: $${this.moneyEarned}`);

    // Update time
    const seconds = (this.currentTime / 1000).toFixed(1);
    this.timeText.setText(`Time: ${seconds}s`);

    // Update durability bar
    this.hudGraphics.clear();
    this.hudGraphics.fillStyle(0x000000, 0.5);
    this.hudGraphics.fillRect(10, 10, 300, 180);

    // Durability bar
    const durabilityPercent = this.currentDurability / this.maxDurability;
    const barWidth = 280 * durabilityPercent;
    const barColor = durabilityPercent > 0.5 ? 0x00ff00 : durabilityPercent > 0.25 ? 0xffff00 : 0xff0000;

    this.hudGraphics.fillStyle(0x333333, 1);
    this.hudGraphics.fillRect(20, 165, 280, 20);
    this.hudGraphics.fillStyle(barColor, 1);
    this.hudGraphics.fillRect(20, 165, barWidth, 20);
  }

  private endRun(): void {
    if (this.runEnded) return;
    this.runEnded = true;

    // Update game state
    this.gameStateManager.addMoney(this.moneyEarned);
    this.gameStateManager.incrementStat('totalRuns', 1);
    this.gameStateManager.incrementStat('totalTricks', this.tricksLanded);
    this.gameStateManager.incrementStat('totalCollisions', this.collisions);

    // Check best time
    const stats = this.gameStateManager.getStats();
    if (this.currentTime < stats.bestTime || stats.bestTime === 0) {
      this.gameStateManager.incrementStat('bestTime', this.currentTime - stats.bestTime);
    }

    // Show run summary
    this.showRunSummary();
  }

  private showRunSummary(): void {
    const cam = this.cameras.main;

    // Create semi-transparent overlay
    this.add.rectangle(
      cam.scrollX + cam.width / 2,
      cam.scrollY + cam.height / 2,
      cam.width,
      cam.height,
      0x000000,
      0.8
    ).setDepth(2000);

    // Summary box
    this.add.rectangle(
      cam.scrollX + cam.width / 2,
      cam.scrollY + cam.height / 2,
      600,
      500,
      0x2c3e50
    ).setDepth(2001).setStrokeStyle(4, 0xffffff);

    // Title
    this.add.text(
      cam.scrollX + cam.width / 2,
      cam.scrollY + cam.height / 2 - 200,
      'RUN COMPLETE!',
      {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(2002);

    // Stats
    const stats = [
      `Time: ${(this.currentTime / 1000).toFixed(1)}s`,
      `Money Earned: $${this.moneyEarned}`,
      `Tricks Landed: ${this.tricksLanded}`,
      `Gates Passed: ${this.gatesPassed}/${this.gates.length}`,
      `Collisions: ${this.collisions}`,
      `Final Speed: ${Math.floor(this.playerSpeed * 10)} mph`,
    ];

    let yOffset = -100;
    stats.forEach(stat => {
      this.add.text(
        cam.scrollX + cam.width / 2,
        cam.scrollY + cam.height / 2 + yOffset,
        stat,
        {
          fontSize: '24px',
          color: '#ecf0f1',
        }
      ).setOrigin(0.5).setDepth(2002);
      yOffset += 40;
    });

    // Continue button
    const continueText = this.add.text(
      cam.scrollX + cam.width / 2,
      cam.scrollY + cam.height / 2 + 200,
      'Press SPACE to continue',
      {
        fontSize: '24px',
        color: '#FFD700',
      }
    ).setOrigin(0.5).setDepth(2002);

    // Pulse animation
    this.tweens.add({
      targets: continueText,
      alpha: { from: 1, to: 0.5 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Wait for space key
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Return to house scene (or menu if house doesn't exist)
        if (this.scene.get('HouseScene')) {
          this.scene.start('HouseScene');
        } else {
          this.scene.start('MenuScene');
        }
      });
    });
  }

  shutdown(): void {
    // Cleanup
    if (this.trickSystem) {
      this.trickSystem.destroy();
    }
    this.obstacleSprites.forEach(sprite => sprite.destroy());
    this.obstacleSprites = [];
  }
}
