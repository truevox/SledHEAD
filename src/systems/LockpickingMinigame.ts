import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

interface Pin {
  position: number; // 0-100
  height: number; // Current height
  targetHeight: number; // Sweet spot
  tolerance: number; // How forgiving the sweet spot is
  isSet: boolean; // Is pin in correct position
  sprite?: Phaser.GameObjects.Rectangle;
  targetSprite?: Phaser.GameObjects.Rectangle;
}

interface Lock {
  difficulty: number; // 1-5
  pins: Pin[];
  timeLimit: number;
  rewards: LockReward[];
}

interface LockReward {
  type: 'money' | 'lore' | 'shortcut' | 'upgrade_item';
  value: number | string;
  name: string;
}

export class LockpickingMinigame {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private active: boolean = false;

  // Lock state
  private currentLock?: Lock;
  private currentPinIndex: number = 0;
  private tension: number = 0; // 0-100
  private pickPosition: number = 0; // 0-100
  private timeRemaining: number = 0;
  private picksRemaining: number = 3;
  private lockOpened: boolean = false;

  // Input
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private shiftKey?: Phaser.Input.Keyboard.Key;

  // UI
  private uiContainer?: Phaser.GameObjects.Container;
  private lockGraphics?: Phaser.GameObjects.Graphics;
  private tensionBar?: Phaser.GameObjects.Graphics;
  private pickSprite?: Phaser.GameObjects.Graphics;
  private timerText?: Phaser.GameObjects.Text;
  private picksText?: Phaser.GameObjects.Text;
  private feedbackText?: Phaser.GameObjects.Text;
  private instructionsText?: Phaser.GameObjects.Text;
  private pinContainer?: Phaser.GameObjects.Container;

  // Audio feedback
  private clickSoundTimer: number = 0;
  private vibrateIntensity: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameStateManager.getInstance();
  }

  start(difficulty: number = 1): void {
    this.active = true;
    this.lockOpened = false;
    this.currentPinIndex = 0;
    this.tension = 0;
    this.pickPosition = 50;
    this.picksRemaining = 3;

    this.currentLock = this.generateLock(difficulty);
    this.timeRemaining = this.currentLock.timeLimit;

    this.setupInput();
    this.createUI();
  }

  private setupInput(): void {
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    this.spaceKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  }

  private generateLock(difficulty: number): Lock {
    const numPins = Math.min(2 + difficulty, 6);
    const pins: Pin[] = [];

    for (let i = 0; i < numPins; i++) {
      const pin: Pin = {
        position: (i + 1) * (100 / (numPins + 1)),
        height: 0,
        targetHeight: Phaser.Math.Between(30, 70),
        tolerance: Math.max(5, 15 - difficulty * 2),
        isSet: false,
      };
      pins.push(pin);
    }

    // Generate rewards based on difficulty
    const rewards: LockReward[] = [];
    const moneyReward = difficulty * 100 * Phaser.Math.Between(1, 3);
    rewards.push({ type: 'money', value: moneyReward, name: `$${moneyReward}` });

    if (Math.random() < 0.3) {
      rewards.push({
        type: 'lore',
        value: `lore_item_${Date.now()}`,
        name: 'Journal Entry'
      });
    }

    if (difficulty >= 3 && Math.random() < 0.5) {
      rewards.push({
        type: 'shortcut',
        value: 'building_shortcut',
        name: 'Building Access'
      });
    }

    return {
      difficulty,
      pins,
      timeLimit: Math.max(15000, 30000 - difficulty * 3000),
      rewards,
    };
  }

  private createUI(): void {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    this.uiContainer = this.scene.add.container(0, 0).setDepth(1000);

    // Background
    const bg = this.scene.add.rectangle(centerX, centerY, 600, 500, 0x222222, 0.9);
    this.uiContainer.add(bg);

    // Title
    const title = this.scene.add.text(centerX, centerY - 220, 'LOCKPICKING', {
      fontSize: '32px',
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 4,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.uiContainer.add(title);

    // Lock graphics
    this.lockGraphics = this.scene.add.graphics().setDepth(1001);
    this.drawLock();

    // Tension bar
    this.tensionBar = this.scene.add.graphics().setDepth(1002);

    // Pick sprite
    this.pickSprite = this.scene.add.graphics().setDepth(1003);

    // Pin container
    this.pinContainer = this.scene.add.container(0, 0).setDepth(1002);
    this.uiContainer.add(this.pinContainer);
    this.createPinVisuals();

    // Timer
    this.timerText = this.scene.add.text(centerX - 250, centerY - 180, '', {
      fontSize: '24px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(1004);
    this.uiContainer.add(this.timerText);

    // Picks remaining
    this.picksText = this.scene.add.text(centerX + 250, centerY - 180, '', {
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(1004);
    this.uiContainer.add(this.picksText);

    // Feedback text
    this.feedbackText = this.scene.add.text(centerX, centerY + 180, '', {
      fontSize: '28px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 4,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1004);
    this.uiContainer.add(this.feedbackText);

    // Instructions
    this.instructionsText = this.scene.add.text(centerX, centerY + 220,
      'SHIFT: Apply Tension | UP/DOWN: Move Pick | SPACE: Set Pin | ESC: Exit', {
      fontSize: '16px',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1004);
    this.uiContainer.add(this.instructionsText);

    this.updatePicksText();
  }

  private drawLock(): void {
    if (!this.lockGraphics) return;

    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    this.lockGraphics.clear();

    // Lock body
    this.lockGraphics.lineStyle(3, 0x888888, 1);
    this.lockGraphics.fillStyle(0x444444, 1);
    this.lockGraphics.fillRoundedRect(centerX - 200, centerY - 100, 400, 200, 10);
    this.lockGraphics.strokeRoundedRect(centerX - 200, centerY - 100, 400, 200, 10);

    // Keyhole
    this.lockGraphics.fillStyle(0x000000, 1);
    this.lockGraphics.fillCircle(centerX, centerY + 50, 15);
    this.lockGraphics.fillRect(centerX - 5, centerY + 50, 10, 30);

    // Pin slots
    if (this.currentLock) {
      for (const pin of this.currentLock.pins) {
        const x = centerX - 200 + (pin.position / 100) * 400;
        this.lockGraphics.lineStyle(2, 0x666666, 1);
        this.lockGraphics.strokeRect(x - 10, centerY - 90, 20, 80);
      }
    }
  }

  private createPinVisuals(): void {
    if (!this.currentLock || !this.pinContainer) return;

    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    for (const pin of this.currentLock.pins) {
      const x = centerX - 200 + (pin.position / 100) * 400;

      // Target indicator (sweet spot)
      const targetY = centerY - 90 + (1 - pin.targetHeight / 100) * 80;
      const target = this.scene.add.rectangle(x, targetY, 20, 3, 0x00ff00, 0.5);
      pin.targetSprite = target;
      this.pinContainer.add(target);

      // Pin itself
      const pinY = centerY - 10;
      const pinRect = this.scene.add.rectangle(x, pinY, 18, 60, 0xcccccc, 1);
      pin.sprite = pinRect;
      this.pinContainer.add(pinRect);
    }
  }

  private updatePinVisuals(): void {
    if (!this.currentLock) return;

    const centerY = this.scene.cameras.main.height / 2;

    for (let i = 0; i < this.currentLock.pins.length; i++) {
      const pin = this.currentLock.pins[i];
      if (!pin.sprite) continue;

      // Update pin position
      const pinY = centerY - 10 - (pin.height / 100) * 70;
      pin.sprite.setY(pinY);

      // Color based on status
      if (pin.isSet) {
        pin.sprite.setFillStyle(0x00ff00, 1);
      } else if (i === this.currentPinIndex) {
        pin.sprite.setFillStyle(0xffff00, 1);
      } else {
        pin.sprite.setFillStyle(0xcccccc, 1);
      }
    }
  }

  private updateTensionBar(): void {
    if (!this.tensionBar) return;

    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    this.tensionBar.clear();

    // Tension bar background
    this.tensionBar.fillStyle(0x333333, 1);
    this.tensionBar.fillRect(centerX - 250, centerY + 120, 500, 20);

    // Tension level
    const tensionColor = this.getTensionColor();
    this.tensionBar.fillStyle(tensionColor, 1);
    this.tensionBar.fillRect(centerX - 250, centerY + 120, (this.tension / 100) * 500, 20);

    // Border
    this.tensionBar.lineStyle(2, 0x888888, 1);
    this.tensionBar.strokeRect(centerX - 250, centerY + 120, 500, 20);
  }

  private getTensionColor(): number {
    if (this.tension < 30) return 0x666666;
    if (this.tension < 60) return 0xffaa00;
    if (this.tension < 90) return 0xff6600;
    return 0xff0000;
  }

  private updatePickSprite(): void {
    if (!this.pickSprite || !this.currentLock) return;

    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    this.pickSprite.clear();

    // Draw pick tool
    const currentPin = this.currentLock.pins[this.currentPinIndex];
    if (currentPin) {
      const x = centerX - 200 + (currentPin.position / 100) * 400;
      const y = centerY - 10 - (this.pickPosition / 100) * 70;

      this.pickSprite.lineStyle(3, 0xff0000, 1);
      this.pickSprite.beginPath();
      this.pickSprite.moveTo(x, centerY + 50);
      this.pickSprite.lineTo(x, y);
      this.pickSprite.strokePath();

      // Pick tip
      this.pickSprite.fillStyle(0xff0000, 1);
      this.pickSprite.fillCircle(x, y, 4);

      // Add vibration if close to sweet spot
      if (this.vibrateIntensity > 0) {
        const offsetX = (Math.random() - 0.5) * this.vibrateIntensity;
        const offsetY = (Math.random() - 0.5) * this.vibrateIntensity;
        this.pickSprite.setPosition(offsetX, offsetY);
      } else {
        this.pickSprite.setPosition(0, 0);
      }
    }
  }

  private handleInput(delta: number): void {
    if (!this.cursors || !this.currentLock || this.lockOpened) return;

    const currentPin = this.currentLock.pins[this.currentPinIndex];
    if (!currentPin) return;

    // Apply tension with SHIFT
    if (this.shiftKey?.isDown) {
      this.tension = Math.min(100, this.tension + delta * 0.05);
    } else {
      this.tension = Math.max(0, this.tension - delta * 0.1);
    }

    // Move pick up/down
    if (this.cursors.up?.isDown && !currentPin.isSet) {
      this.pickPosition = Math.min(100, this.pickPosition + delta * 0.1);
    }
    if (this.cursors.down?.isDown && !currentPin.isSet) {
      this.pickPosition = Math.max(0, this.pickPosition - delta * 0.1);
    }

    // Update pin height based on tension
    if (this.tension > 20 && !currentPin.isSet) {
      currentPin.height = this.pickPosition * (this.tension / 100);
    } else if (!currentPin.isSet) {
      currentPin.height = Math.max(0, currentPin.height - delta * 0.05);
    }

    // Check if in sweet spot
    const heightDiff = Math.abs(currentPin.height - currentPin.targetHeight);
    if (heightDiff <= currentPin.tolerance && this.tension > 50) {
      this.vibrateIntensity = 5;
      this.clickSoundTimer += delta;
      if (this.clickSoundTimer > 200) {
        this.clickSoundTimer = 0;
        // Play click sound here
      }
    } else {
      this.vibrateIntensity = 0;
    }

    // Set pin with SPACE
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey!)) {
      this.trySetPin();
    }
  }

  private trySetPin(): void {
    if (!this.currentLock) return;

    const currentPin = this.currentLock.pins[this.currentPinIndex];
    if (!currentPin || currentPin.isSet) return;

    const heightDiff = Math.abs(currentPin.height - currentPin.targetHeight);

    if (heightDiff <= currentPin.tolerance && this.tension > 50) {
      // Success!
      currentPin.isSet = true;
      this.showFeedback('Pin Set! ✓', 0x00ff00);
      this.vibrateIntensity = 0;

      // Move to next pin
      this.currentPinIndex++;
      this.pickPosition = 50;

      if (this.currentPinIndex >= this.currentLock.pins.length) {
        this.openLock();
      }
    } else {
      // Failed - break pick
      this.breakPick();
    }
  }

  private breakPick(): void {
    this.picksRemaining--;
    this.updatePicksText();
    this.showFeedback('Pick Broken! 💔', 0xff0000);

    // Reset current pin
    if (this.currentLock) {
      const currentPin = this.currentLock.pins[this.currentPinIndex];
      if (currentPin) {
        currentPin.height = 0;
      }
    }

    this.pickPosition = 50;
    this.tension = 0;

    // Screen shake
    this.scene.cameras.main.shake(200, 0.01);

    if (this.picksRemaining <= 0) {
      this.failLock();
    }
  }

  private openLock(): void {
    this.lockOpened = true;
    this.showFeedback('LOCK OPENED! 🔓', 0x00ff00);

    // Award rewards
    if (this.currentLock) {
      for (const reward of this.currentLock.rewards) {
        this.awardReward(reward);
      }
    }

    // Visual celebration
    this.scene.cameras.main.flash(500, 0, 255, 0);

    // Auto-close after delay
    this.scene.time.delayedCall(2000, () => {
      this.stop();
    });
  }

  private failLock(): void {
    this.showFeedback('FAILED! No picks left 😞', 0xff0000);
    this.scene.cameras.main.shake(500, 0.02);

    this.scene.time.delayedCall(2000, () => {
      this.stop();
    });
  }

  private awardReward(reward: LockReward): void {
    switch (reward.type) {
      case 'money':
        if (typeof reward.value === 'number') {
          this.gameState.addMoney(reward.value);
          this.showFeedback(`+$${reward.value}`, 0xffff00);
        }
        break;

      case 'lore':
        // Store lore item
        console.log(`Lore item unlocked: ${reward.name}`);
        break;

      case 'shortcut':
        // Unlock shortcut
        console.log(`Shortcut unlocked: ${reward.name}`);
        break;

      case 'upgrade_item':
        console.log(`Upgrade item found: ${reward.name}`);
        break;
    }
  }

  private showFeedback(text: string, color: number): void {
    if (!this.feedbackText) return;

    this.feedbackText.setText(text);
    this.feedbackText.setColor(`#${color.toString(16).padStart(6, '0')}`);
    this.feedbackText.setAlpha(1);

    this.scene.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
    });
  }

  private updatePicksText(): void {
    if (!this.picksText) return;

    const picksEmoji = '🔧'.repeat(this.picksRemaining);
    this.picksText.setText(`Picks: ${picksEmoji}`);
  }

  private updateTimer(delta: number): void {
    if (this.lockOpened) return;

    this.timeRemaining -= delta;

    if (this.timeRemaining <= 0) {
      this.failLock();
      return;
    }

    if (this.timerText) {
      const seconds = Math.ceil(this.timeRemaining / 1000);
      const color = seconds <= 5 ? '#ff0000' : seconds <= 10 ? '#ffaa00' : '#00ff00';
      this.timerText.setText(`Time: ${seconds}s`);
      this.timerText.setColor(color);
    }
  }

  update(_time: number, delta: number): void {
    if (!this.active) return;

    this.handleInput(delta);
    this.updateTimer(delta);
    this.updatePinVisuals();
    this.updateTensionBar();
    this.updatePickSprite();
  }

  stop(): void {
    this.active = false;

    // Cleanup
    this.uiContainer?.destroy();
    this.lockGraphics?.destroy();
    this.tensionBar?.destroy();
    this.pickSprite?.destroy();
    this.pinContainer?.destroy();

    this.currentLock = undefined;
  }

  isActive(): boolean {
    return this.active;
  }

  wasSuccessful(): boolean {
    return this.lockOpened;
  }

  destroy(): void {
    this.stop();
  }
}
