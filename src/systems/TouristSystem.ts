import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

// Tourist and Fan entity types
export interface Tourist {
  sprite: Phaser.GameObjects.Rectangle;
  x: number;
  y: number;
  type: 'tourist' | 'fan';
  speed: number;
  dodgeChance: number; // 0-1, how likely to dodge
  cheerRadius: number; // Distance at which fans react
  hasReacted: boolean;
  direction: number; // -1 for left, 1 for right, 0 for stationary
  color: number;
  targetX?: number; // For dodging movement
}

export interface CheerEffect {
  sprite: Phaser.GameObjects.Text;
  duration: number;
  startTime: number;
}

export class TouristSystem {
  private scene: Phaser.Scene;
  private gameStateManager: GameStateManager;

  // Entity management
  private tourists: Tourist[] = [];
  private cheerEffects: CheerEffect[] = [];

  // Spawn configuration
  private readonly TOURIST_SIZE = 16;
  private readonly MIN_SPAWN_DISTANCE = 200; // Minimum distance from player to spawn
  private readonly MAX_TOURISTS = 50; // Maximum number of tourists on screen
  private readonly SPAWN_INTERVAL = 2000; // ms between spawn attempts
  private lastSpawnTime: number = 0;

  // Visual configuration
  private readonly TOURIST_COLORS = [0x95a5a6, 0x7f8c8d, 0xbdc3c7]; // Gray/neutral
  private readonly FAN_COLORS = [0xe74c3c, 0x3498db, 0xf39c12, 0x9b59b6, 0x1abc9c]; // Bright

  // Gameplay configuration
  private readonly BASE_DODGE_CHANCE_TOURIST = 0.3; // 30% base dodge chance
  private readonly BASE_DODGE_CHANCE_FAN = 0.8; // 80% base dodge chance
  private readonly FAN_CHEER_RADIUS = 150;
  private readonly FAN_SPEED_BOOST = 1.5; // Multiplier for speed boost
  private readonly FAN_TIP_BASE = 5; // Base money from impressing fans

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameStateManager = GameStateManager.getInstance();
  }

  /**
   * Update the tourist system each frame
   */
  update(playerX: number, playerY: number, _playerSpeed: number, isDoingTrick: boolean): {
    collisions: number;
    speedBoost: number;
    moneyEarned: number;
  } {
    const currentTime = Date.now();
    let collisions = 0;
    let speedBoost = 0;
    let moneyEarned = 0;

    // Spawn new tourists/fans periodically
    if (currentTime - this.lastSpawnTime > this.SPAWN_INTERVAL) {
      this.spawnTourists(playerX, playerY);
      this.lastSpawnTime = currentTime;
    }

    // Update each tourist
    for (let i = this.tourists.length - 1; i >= 0; i--) {
      const tourist = this.tourists[i];

      // Calculate distance to player
      const dx = tourist.x - playerX;
      const dy = tourist.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Remove if too far from player
      if (distance > 1000 || Math.abs(dy) > 500) {
        tourist.sprite.destroy();
        this.tourists.splice(i, 1);
        continue;
      }

      // Fan behavior: cheer when player is nearby
      if (tourist.type === 'fan' && !tourist.hasReacted && distance < tourist.cheerRadius) {
        this.triggerFanReaction(tourist, playerX, playerY, isDoingTrick);
        tourist.hasReacted = true;

        // Give speed boost if doing a trick
        if (isDoingTrick) {
          speedBoost += this.FAN_SPEED_BOOST;
          moneyEarned += this.FAN_TIP_BASE * (1 + Math.random()); // Random tip bonus
        } else {
          moneyEarned += this.FAN_TIP_BASE * 0.5; // Smaller tip without trick
        }
      }

      // Dodge behavior when player gets close
      if (distance < 100 && !tourist.targetX) {
        const shouldDodge = Math.random() < tourist.dodgeChance;
        if (shouldDodge) {
          // Decide dodge direction (away from player)
          const dodgeLeft = dx > 0;
          tourist.direction = dodgeLeft ? -1 : 1;
          tourist.targetX = tourist.x + (tourist.direction * 50);

          // Animate dodge
          this.scene.tweens.add({
            targets: tourist.sprite,
            x: tourist.targetX,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
              tourist.targetX = undefined;
              tourist.direction = 0;
            },
          });
        }
      }

      // Check collision with player
      if (distance < this.TOURIST_SIZE + 16) {
        // Collision detected
        collisions++;
        this.handleCollision(tourist);
        tourist.sprite.destroy();
        this.tourists.splice(i, 1);
        continue;
      }

      // Idle movement (wandering)
      if (!tourist.targetX && Math.random() < 0.01) {
        tourist.direction = Math.random() < 0.5 ? -1 : 1;
        tourist.x += tourist.direction * tourist.speed;
        tourist.sprite.setX(tourist.x);
      }

      // Update sprite position
      tourist.sprite.setX(tourist.x);
      tourist.sprite.setY(tourist.y);
    }

    // Update cheer effects
    for (let i = this.cheerEffects.length - 1; i >= 0; i--) {
      const effect = this.cheerEffects[i];
      if (currentTime - effect.startTime > effect.duration) {
        effect.sprite.destroy();
        this.cheerEffects.splice(i, 1);
      }
    }

    return { collisions, speedBoost, moneyEarned };
  }

  /**
   * Spawn tourists and fans on the mountain
   */
  private spawnTourists(playerX: number, playerY: number): void {
    if (this.tourists.length >= this.MAX_TOURISTS) {
      return;
    }

    // Calculate spawn counts based on upgrades
    const crowdWeaverLevel = this.gameStateManager.getUpgrade('personal', 'crowdWeaver');
    const crowdHypemanLevel = this.gameStateManager.getUpgrade('personal', 'crowdHypeman');
    const foodStallsLevel = this.gameStateManager.getUpgrade('mountain', 'foodStalls');
    const scenicOverlooksLevel = this.gameStateManager.getUpgrade('mountain', 'scenicOverlooks');

    // More mountain upgrades = more tourists
    const touristCount = Math.floor(2 + (foodStallsLevel + scenicOverlooksLevel) * 0.5);

    // More crowd upgrades = more fans
    const fanCount = Math.floor(1 + (crowdWeaverLevel + crowdHypemanLevel) * 0.3);

    // Spawn tourists
    for (let i = 0; i < touristCount; i++) {
      this.spawnEntity('tourist', playerX, playerY, crowdWeaverLevel);
    }

    // Spawn fans
    for (let i = 0; i < fanCount; i++) {
      this.spawnEntity('fan', playerX, playerY, crowdWeaverLevel);
    }
  }

  /**
   * Spawn a single tourist or fan entity
   */
  private spawnEntity(type: 'tourist' | 'fan', playerX: number, playerY: number, crowdWeaverLevel: number): void {
    // Spawn ahead of player (downhill)
    const spawnX = playerX + (Math.random() - 0.5) * 400;
    const spawnY = playerY - this.MIN_SPAWN_DISTANCE - Math.random() * 200;

    const color = type === 'tourist'
      ? this.TOURIST_COLORS[Math.floor(Math.random() * this.TOURIST_COLORS.length)]
      : this.FAN_COLORS[Math.floor(Math.random() * this.FAN_COLORS.length)];

    // Create sprite
    const sprite = this.scene.add.rectangle(
      spawnX,
      spawnY,
      this.TOURIST_SIZE,
      this.TOURIST_SIZE,
      color
    );
    sprite.setStrokeStyle(2, 0x000000);

    // Add icon to differentiate
    const icon = type === 'fan' ? '⭐' : '🚶';
    this.scene.add.text(spawnX, spawnY - this.TOURIST_SIZE / 2 - 10, icon, {
      fontSize: '12px',
    }).setOrigin(0.5);

    // Calculate dodge chance (improved by Crowd Weaver upgrade)
    const baseDodge = type === 'tourist' ? this.BASE_DODGE_CHANCE_TOURIST : this.BASE_DODGE_CHANCE_FAN;
    const dodgeChance = Math.min(0.95, baseDodge + (crowdWeaverLevel * 0.1));

    const tourist: Tourist = {
      sprite,
      x: spawnX,
      y: spawnY,
      type,
      speed: 0.5 + Math.random() * 0.5,
      dodgeChance,
      cheerRadius: this.FAN_CHEER_RADIUS,
      hasReacted: false,
      direction: 0,
      color,
    };

    this.tourists.push(tourist);
  }

  /**
   * Trigger fan reaction (cheering, visual effects)
   */
  private triggerFanReaction(fan: Tourist, _playerX: number, _playerY: number, isDoingTrick: boolean): void {
    // Create cheer text
    const cheerTexts = ['🎉', '⭐', '🔥', '👏', '💯'];
    const cheerText = cheerTexts[Math.floor(Math.random() * cheerTexts.length)];

    const cheerSprite = this.scene.add.text(
      fan.x,
      fan.y - 30,
      cheerText,
      {
        fontSize: '24px',
        stroke: '#000000',
        strokeThickness: 2,
      }
    ).setOrigin(0.5);

    // Animate cheer
    this.scene.tweens.add({
      targets: cheerSprite,
      y: fan.y - 60,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
    });

    const effect: CheerEffect = {
      sprite: cheerSprite,
      duration: 1500,
      startTime: Date.now(),
    };

    this.cheerEffects.push(effect);

    // Create visual circle effect if doing trick
    if (isDoingTrick) {
      const circle = this.scene.add.circle(fan.x, fan.y, 30, fan.color, 0.3);
      this.scene.tweens.add({
        targets: circle,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => circle.destroy(),
      });
    }
  }

  /**
   * Handle collision with tourist/fan
   */
  private handleCollision(tourist: Tourist): void {
    // Visual feedback
    const explosionText = this.scene.add.text(
      tourist.x,
      tourist.y,
      tourist.type === 'fan' ? '😱' : '💥',
      {
        fontSize: '32px',
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setOrigin(0.5);

    this.scene.tweens.add({
      targets: explosionText,
      y: tourist.y - 40,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => explosionText.destroy(),
    });

    // Screen shake
    this.scene.cameras.main.shake(100, 0.005);
  }

  /**
   * Clear all tourists (for scene cleanup)
   */
  clearAll(): void {
    this.tourists.forEach(tourist => tourist.sprite.destroy());
    this.tourists = [];

    this.cheerEffects.forEach(effect => effect.sprite.destroy());
    this.cheerEffects = [];
  }

  /**
   * Get current tourist count
   */
  getTouristCount(): number {
    return this.tourists.filter(t => t.type === 'tourist').length;
  }

  /**
   * Get current fan count
   */
  getFanCount(): number {
    return this.tourists.filter(t => t.type === 'fan').length;
  }

  /**
   * Manually spawn a group of tourists at specific location
   */
  spawnGroupAt(x: number, y: number, count: number, type: 'tourist' | 'fan' = 'tourist'): void {
    const crowdWeaverLevel = this.gameStateManager.getUpgrade('personal', 'crowdWeaver');

    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 100;
      const offsetY = (Math.random() - 0.5) * 50;

      const color = type === 'tourist'
        ? this.TOURIST_COLORS[Math.floor(Math.random() * this.TOURIST_COLORS.length)]
        : this.FAN_COLORS[Math.floor(Math.random() * this.FAN_COLORS.length)];

      const sprite = this.scene.add.rectangle(
        x + offsetX,
        y + offsetY,
        this.TOURIST_SIZE,
        this.TOURIST_SIZE,
        color
      );
      sprite.setStrokeStyle(2, 0x000000);

      const baseDodge = type === 'tourist' ? this.BASE_DODGE_CHANCE_TOURIST : this.BASE_DODGE_CHANCE_FAN;
      const dodgeChance = Math.min(0.95, baseDodge + (crowdWeaverLevel * 0.1));

      const tourist: Tourist = {
        sprite,
        x: x + offsetX,
        y: y + offsetY,
        type,
        speed: 0.5 + Math.random() * 0.5,
        dodgeChance,
        cheerRadius: this.FAN_CHEER_RADIUS,
        hasReacted: false,
        direction: 0,
        color,
      };

      this.tourists.push(tourist);
    }
  }

  /**
   * Debug: Get all tourists for rendering info
   */
  getAllTourists(): Tourist[] {
    return this.tourists;
  }

  /**
   * Clean up the system
   */
  destroy(): void {
    this.clearAll();
  }
}
