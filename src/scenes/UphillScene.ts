import Phaser from 'phaser';
import { MountainGenerator } from '../systems/MountainGenerator';
import { GameStateManager } from '../utils/GameStateManager';
import { Animal } from '../types';

export class UphillScene extends Phaser.Scene {
  private mountainGenerator!: MountainGenerator;
  private gameState!: GameStateManager;

  // Player
  private player!: Phaser.GameObjects.Sprite;
  private playerX: number = 0;
  private playerY: number = 0;
  private currentLayer: number = 0;

  // Movement
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private eKey!: Phaser.Input.Keyboard.Key;
  private hKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  // World
  private worldContainer!: Phaser.GameObjects.Container;
  private terrainTiles: Phaser.GameObjects.Sprite[] = [];
  private obstacles: Phaser.GameObjects.Sprite[] = [];

  // Stamina
  private stamina: number = 100;
  private staminaDrainRate: number = 0.1;
  private lastMovementTime: number = 0;
  private staminaBar!: Phaser.GameObjects.Graphics;
  private staminaText!: Phaser.GameObjects.Text;

  // UI
  private moneyText!: Phaser.GameObjects.Text;
  private altitudeText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;

  // Wildlife Photography
  private animals: Animal[] = [];
  private animalSprites: Map<Animal, Phaser.GameObjects.Sprite> = new Map();
  private cameraReticle!: Phaser.GameObjects.Sprite;
  private reticleAngle: number = 0;
  private reticleAltitudeLine: number = 50; // Vertical position on reticle
  private photoResultText!: Phaser.GameObjects.Text;
  private photographedAnimals: Map<string, number> = new Map(); // Track repeat photos

  // Constants
  private readonly TILE_SIZE = 32;
  private readonly MOVE_SPEED = 3;
  private readonly CAMERA_SMOOTHNESS = 0.1;
  private readonly ANIMAL_SPAWN_MIN = 5000;
  private readonly ANIMAL_SPAWN_MAX = 10000;

  constructor() {
    super({ key: 'UphillScene' });
  }

  init(): void {
    this.gameState = GameStateManager.getInstance();
    const state = this.gameState.getState();

    // Initialize player position from game state
    this.playerX = state.playerPosition.x;
    this.playerY = state.playerPosition.y;
    this.currentLayer = state.playerPosition.layer;
    this.stamina = state.stamina;

    // Reset photography tracking
    this.photographedAnimals.clear();
    this.animals = [];
    this.animalSprites.clear();
  }

  create(): void {
    // Create mountain from seed
    const state = this.gameState.getState();
    this.mountainGenerator = new MountainGenerator(state.mountainSeed);

    // Create world container for scrolling
    this.worldContainer = this.add.container(0, 0);

    // Create terrain
    this.createTerrain();

    // Create player sprite
    this.player = this.add.sprite(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'player'
    );
    this.player.setScale(2);
    this.player.setDepth(100);

    // Setup input
    this.setupInput();

    // Create UI
    this.createUI();

    // Setup camera
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Start animal spawning
    this.scheduleNextAnimalSpawn();

    // Update initial UI
    this.updateUI();
  }

  private setupInput(): void {
    // WASD for movement
    this.wasdKeys = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Arrow keys for camera reticle
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Action keys
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.hKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Key press events
    this.eKey.on('down', () => this.startDownhillRun());
    this.hKey.on('down', () => this.returnToHouse());
    this.spaceKey.on('down', () => this.takePhoto());
  }

  private createUI(): void {
    // Stamina bar background
    const staminaBg = this.add.sprite(
      this.cameras.main.width / 2,
      30,
      'ui_stamina_bg'
    );
    staminaBg.setScrollFactor(0);
    staminaBg.setDepth(200);

    // Stamina bar fill (we'll use graphics for dynamic sizing)
    this.staminaBar = this.add.graphics();
    this.staminaBar.setScrollFactor(0);
    this.staminaBar.setDepth(201);

    // Stamina text
    this.staminaText = this.add.text(
      this.cameras.main.width / 2,
      30,
      'Stamina: 100',
      {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      }
    );
    this.staminaText.setOrigin(0.5);
    this.staminaText.setScrollFactor(0);
    this.staminaText.setDepth(202);

    // Money display
    this.moneyText = this.add.text(
      20,
      20,
      `Money: $${this.gameState.getMoney()}`,
      {
        fontSize: '20px',
        color: '#2ecc71',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      }
    );
    this.moneyText.setScrollFactor(0);
    this.moneyText.setDepth(200);

    // Altitude indicator
    this.altitudeText = this.add.text(
      20,
      60,
      `Altitude: ${Math.floor(this.playerY)}m | Layer: ${this.currentLayer}`,
      {
        fontSize: '18px',
        color: '#3498db',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      }
    );
    this.altitudeText.setScrollFactor(0);
    this.altitudeText.setDepth(200);

    // Instructions
    this.instructionText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 30,
      'WASD: Move | Arrows: Camera | SPACE: Photo | E: Start Run | H: Return Home',
      {
        fontSize: '16px',
        color: '#ecf0f1',
        stroke: '#000000',
        strokeThickness: 3,
      }
    );
    this.instructionText.setOrigin(0.5);
    this.instructionText.setScrollFactor(0);
    this.instructionText.setDepth(200);

    // Camera reticle (hidden by default)
    this.cameraReticle = this.add.sprite(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'ui_camera_reticle'
    );
    this.cameraReticle.setScrollFactor(0);
    this.cameraReticle.setDepth(250);
    this.cameraReticle.setVisible(false);
    this.cameraReticle.setAlpha(0.7);

    // Photo result text
    this.photoResultText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      '',
      {
        fontSize: '24px',
        color: '#f39c12',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      }
    );
    this.photoResultText.setOrigin(0.5);
    this.photoResultText.setScrollFactor(0);
    this.photoResultText.setDepth(260);
    this.photoResultText.setVisible(false);
  }

  private createTerrain(): void {
    // Clear existing terrain
    this.terrainTiles.forEach(tile => tile.destroy());
    this.obstacles.forEach(obs => obs.destroy());
    this.terrainTiles = [];
    this.obstacles = [];

    const layer = this.mountainGenerator.getLayer(this.currentLayer);
    if (!layer) return;

    const terrain = layer.terrain;

    for (let ty = 0; ty < terrain.length; ty++) {
      for (let tx = 0; tx < terrain[0].length; tx++) {
        const tile = terrain[ty][tx];

        // Calculate world position with wrapping
        const worldX = tx * this.TILE_SIZE;
        const worldY = ty * this.TILE_SIZE;

        // Create tile sprite based on type
        let tileKey = '';
        switch (tile.type) {
          case 'snow':
            tileKey = `snow_${tile.color}`;
            break;
          case 'ice':
            tileKey = 'ice';
            break;
          case 'rock':
            tileKey = 'rock';
            break;
          case 'ramp':
            tileKey = 'ramp';
            break;
          case 'tree':
            tileKey = `tree_${tile.variant}`;
            break;
          case 'obstacle':
            tileKey = 'rock';
            break;
        }

        if (tileKey) {
          const tileSprite = this.add.sprite(worldX, worldY, tileKey);
          tileSprite.setOrigin(0, 0);

          if (tile.type === 'tree') {
            tileSprite.setDepth(50);
            this.obstacles.push(tileSprite);
          } else if (tile.type === 'obstacle') {
            tileSprite.setDepth(40);
            this.obstacles.push(tileSprite);
          } else {
            tileSprite.setDepth(0);
          }

          this.worldContainer.add(tileSprite);
          this.terrainTiles.push(tileSprite);
        }
      }
    }
  }

  private updateTerrain(): void {
    // Update terrain tiles for current layer
    const newLayer = this.mountainGenerator.getLayerIndexForY(this.playerY);

    if (newLayer !== this.currentLayer) {
      this.currentLayer = newLayer;
      this.createTerrain();
    }

    // Handle horizontal wrapping
    const layer = this.mountainGenerator.getLayer(this.currentLayer);
    if (!layer) return;

    const circumference = layer.circumference;

    // Wrap player X position
    if (this.playerX < 0) {
      this.playerX += circumference;
    } else if (this.playerX >= circumference) {
      this.playerX -= circumference;
    }

    // Update world container position for scrolling
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Smooth camera following
    const targetX = centerX - this.playerX;
    const targetY = centerY - this.playerY;

    this.worldContainer.x += (targetX - this.worldContainer.x) * this.CAMERA_SMOOTHNESS;
    this.worldContainer.y += (targetY - this.worldContainer.y) * this.CAMERA_SMOOTHNESS;
  }

  private handleMovement(_delta: number): void {
    let moving = false;
    let dx = 0;
    let dy = 0;

    // WASD movement
    if (this.wasdKeys.W.isDown) {
      dy = -this.MOVE_SPEED;
      moving = true;
    } else if (this.wasdKeys.S.isDown) {
      dy = this.MOVE_SPEED;
      moving = true;
    }

    if (this.wasdKeys.A.isDown) {
      dx = -this.MOVE_SPEED;
      moving = true;
    } else if (this.wasdKeys.D.isDown) {
      dx = this.MOVE_SPEED;
      moving = true;
    }

    // Apply movement
    if (moving) {
      this.playerX += dx;
      this.playerY += dy;

      // Drain stamina
      const staminaMultiplier = 1 - (this.gameState.getUpgrade('personal', 'attendLegDay') * 0.15);
      const ngpBonus = this.gameState.getState().newGamePlus.active
        ? this.gameState.getState().newGamePlus.bonuses.climb
        : 0;
      const finalDrain = this.staminaDrainRate * staminaMultiplier * (1 - ngpBonus);

      this.stamina = Math.max(0, this.stamina - finalDrain);
      this.lastMovementTime = this.time.now;

      // Check stamina depletion
      if (this.stamina <= 0) {
        this.outOfStamina();
      }
    }

    // Camera reticle control
    if (this.cursors.left!.isDown) {
      this.reticleAngle -= 2;
    } else if (this.cursors.right!.isDown) {
      this.reticleAngle += 2;
    }

    if (this.cursors.up!.isDown) {
      this.reticleAltitudeLine = Math.max(0, this.reticleAltitudeLine - 1);
    } else if (this.cursors.down!.isDown) {
      this.reticleAltitudeLine = Math.min(100, this.reticleAltitudeLine + 1);
    }

    // Update reticle rotation
    this.cameraReticle.setAngle(this.reticleAngle);
  }

  private scheduleNextAnimalSpawn(): void {
    const delay = Phaser.Math.Between(this.ANIMAL_SPAWN_MIN, this.ANIMAL_SPAWN_MAX);
    this.time.delayedCall(delay, () => {
      this.spawnAnimal();
      this.scheduleNextAnimalSpawn();
    });
  }

  private spawnAnimal(): void {
    const layer = this.mountainGenerator.getLayer(this.currentLayer);
    if (!layer) return;

    const types: Animal['type'][] = ['bear', 'bird', 'mountainlion', 'deer', 'fox'];
    const rarities: Record<Animal['type'], number> = {
      'deer': 1.0,
      'fox': 0.8,
      'bird': 0.7,
      'bear': 0.5,
      'mountainlion': 0.3,
    };

    const type = Phaser.Utils.Array.GetRandom(types);
    const rarity = rarities[type];

    // Random position around player
    const angle = Math.random() * Math.PI * 2;
    const distance = 200 + Math.random() * 300;
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    const animal: Animal = {
      type,
      position: {
        x: this.playerX + offsetX,
        y: this.playerY + offsetY,
      },
      altitude: this.playerY + offsetY,
      moving: Math.random() > 0.5,
      speed: 0.5 + Math.random() * 1.5,
      photographed: 0,
      rarity,
    };

    this.animals.push(animal);

    // Create sprite
    const sprite = this.add.sprite(
      animal.position.x,
      animal.position.y,
      `animal_${type}`
    );
    sprite.setScale(2);
    sprite.setDepth(60);
    this.worldContainer.add(sprite);
    this.animalSprites.set(animal, sprite);

    // Remove animal after 15 seconds
    this.time.delayedCall(15000, () => {
      this.removeAnimal(animal);
    });
  }

  private removeAnimal(animal: Animal): void {
    const index = this.animals.indexOf(animal);
    if (index > -1) {
      this.animals.splice(index, 1);
    }

    const sprite = this.animalSprites.get(animal);
    if (sprite) {
      sprite.destroy();
      this.animalSprites.delete(animal);
    }
  }

  private updateAnimals(_delta: number): void {
    this.animals.forEach(animal => {
      if (animal.moving) {
        // Simple random movement
        const moveAngle = Math.random() * Math.PI * 2;
        animal.position.x += Math.cos(moveAngle) * animal.speed;
        animal.position.y += Math.sin(moveAngle) * animal.speed;
        animal.altitude = animal.position.y;

        // Update sprite position
        const sprite = this.animalSprites.get(animal);
        if (sprite) {
          sprite.x = animal.position.x;
          sprite.y = animal.position.y;

          // Flip sprite based on movement direction
          if (Math.abs(Math.cos(moveAngle)) > 0.5) {
            sprite.setFlipX(Math.cos(moveAngle) < 0);
          }
        }
      }
    });
  }

  private takePhoto(): void {
    if (this.animals.length === 0) {
      this.showPhotoResult('No animals in range!', 0);
      return;
    }

    // Show camera reticle briefly
    this.cameraReticle.setVisible(true);

    // Check if any animal is in camera view
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const reticleRadius = 40;

    let bestMatch: { animal: Animal; score: number } | null = null;

    for (let i = 0; i < this.animals.length; i++) {
      const animal = this.animals[i];
      const sprite = this.animalSprites.get(animal);
      if (!sprite) continue;

      // Convert animal world position to screen position
      const screenX = sprite.x + this.worldContainer.x;
      const screenY = sprite.y + this.worldContainer.y;

      // Check if in reticle range
      const dx = screenX - centerX;
      const dy = screenY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < reticleRadius * 2) {
        // Calculate score based on various factors
        const centeringScore = 1 - (distance / (reticleRadius * 2));

        // Altitude match (reticleAltitudeLine is 0-100, map to screen height)
        const targetAltitude = this.playerY + ((this.reticleAltitudeLine - 50) * 10);
        const altitudeDiff = Math.abs(animal.altitude - targetAltitude);
        const altitudeScore = Math.max(0, 1 - (altitudeDiff / 100));

        // Movement bonus (moving animals are worth more)
        const movementBonus = animal.moving ? 1.5 : 1.0;

        // Rarity multiplier
        const rarityBonus = 1 + (1 - animal.rarity);

        const totalScore = centeringScore * altitudeScore * movementBonus * rarityBonus;

        if (!bestMatch || totalScore > bestMatch.score) {
          bestMatch = { animal, score: totalScore };
        }
      }
    }

    if (bestMatch) {
      const animal = bestMatch.animal;

      // Calculate earnings
      const baseValue = 50;
      const rarityMultiplier = 1 + (1 - animal.rarity) * 2; // Rarer = more money
      const scoreMultiplier = bestMatch.score;

      // Repeat penalty
      const timesPhotographed = this.photographedAnimals.get(animal.type) || 0;
      const repeatPenalty = Math.max(0.2, 1 - (timesPhotographed * 0.3));
      this.photographedAnimals.set(animal.type, timesPhotographed + 1);

      const earnings = Math.floor(baseValue * rarityMultiplier * scoreMultiplier * repeatPenalty);

      // Add money and update stats
      this.gameState.addMoney(earnings);
      this.gameState.incrementStat('totalPhotos', 1);

      // Show result
      const quality = bestMatch.score > 0.8 ? 'Excellent' : bestMatch.score > 0.5 ? 'Good' : 'Fair';
      this.showPhotoResult(
        `${quality} photo of ${animal.type}!\n+$${earnings}\n(${timesPhotographed > 0 ? 'Repeat -' + Math.floor((1 - repeatPenalty) * 100) + '%' : 'First photo!'})`,
        earnings
      );

      // Mark animal as photographed
      animal.photographed++;

      // Remove animal after being photographed
      this.time.delayedCall(500, () => {
        this.removeAnimal(animal);
      });
    } else {
      this.showPhotoResult('No animal in frame!', 0);
    }

    // Hide reticle after delay
    this.time.delayedCall(1000, () => {
      this.cameraReticle.setVisible(false);
    });
  }

  private showPhotoResult(message: string, earnings: number): void {
    this.photoResultText.setText(message);
    this.photoResultText.setVisible(true);

    if (earnings > 0) {
      this.photoResultText.setColor('#2ecc71'); // Green for success
    } else {
      this.photoResultText.setColor('#e74c3c'); // Red for failure
    }

    // Fade out after 2 seconds
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: this.photoResultText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.photoResultText.setVisible(false);
          this.photoResultText.setAlpha(1);
        },
      });
    });
  }

  private updateUI(): void {
    // Update stamina bar
    this.staminaBar.clear();
    const barWidth = 200;
    const barHeight = 20;
    const barX = this.cameras.main.width / 2 - barWidth / 2;
    const barY = 20;

    const fillWidth = (this.stamina / 100) * barWidth;

    // Color based on stamina level
    let color = 0x27ae60; // Green
    if (this.stamina < 30) {
      color = 0xe74c3c; // Red
    } else if (this.stamina < 60) {
      color = 0xf39c12; // Orange
    }

    this.staminaBar.fillStyle(color, 1);
    this.staminaBar.fillRoundedRect(barX, barY, fillWidth, barHeight, 5);

    this.staminaText.setText(`Stamina: ${Math.floor(this.stamina)}`);

    // Update money
    this.moneyText.setText(`Money: $${this.gameState.getMoney()}`);

    // Update altitude
    this.altitudeText.setText(`Altitude: ${Math.floor(this.playerY)}m | Layer: ${this.currentLayer}`);
  }

  private outOfStamina(): void {
    // Save position
    this.gameState.setState({
      playerPosition: {
        x: this.playerX,
        y: this.playerY,
        layer: this.currentLayer,
      },
      stamina: 0,
    });

    // Apply penalty (lose some money)
    const penalty = Math.floor(this.gameState.getMoney() * 0.1); // 10% penalty
    this.gameState.spendMoney(penalty);

    // Show message
    const messageText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      `Out of Stamina!\nLost $${penalty}\nReturning home...`,
      {
        fontSize: '32px',
        color: '#e74c3c',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center',
      }
    );
    messageText.setOrigin(0.5);
    messageText.setScrollFactor(0);
    messageText.setDepth(300);

    // Transition to house
    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('HouseScene');
      });
    });
  }

  private startDownhillRun(): void {
    // Save position
    this.gameState.setState({
      playerPosition: {
        x: this.playerX,
        y: this.playerY,
        layer: this.currentLayer,
      },
      stamina: this.stamina,
    });

    // Update highest altitude stat
    const stats = this.gameState.getStats();
    if (this.playerY > stats.highestAltitude) {
      this.gameState.incrementStat('highestAltitude', this.playerY - stats.highestAltitude);
    }

    // Transition to downhill scene
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('DownhillScene');
    });
  }

  private returnToHouse(): void {
    // Save position and stamina
    this.gameState.setState({
      playerPosition: {
        x: this.playerX,
        y: this.playerY,
        layer: this.currentLayer,
      },
      stamina: this.stamina,
    });

    // Transition to house
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('HouseScene');
    });
  }

  update(time: number, delta: number): void {
    // Handle movement
    this.handleMovement(delta);

    // Update terrain scrolling
    this.updateTerrain();

    // Update animals
    this.updateAnimals(delta);

    // Update UI
    this.updateUI();

    // Regenerate stamina when not moving (slowly)
    if (time - this.lastMovementTime > 1000 && this.stamina < 100) {
      const regenRate = 0.05; // Slower than drain
      this.stamina = Math.min(100, this.stamina + regenRate);
    }
  }
}
