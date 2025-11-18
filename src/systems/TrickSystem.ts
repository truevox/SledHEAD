import Phaser from 'phaser';
import { Trick, TRICKS } from '../types';

interface TrickFeedback {
  name: string;
  emoji: string;
  value: number;
  multiplier: number;
}

export class TrickSystem {
  private scene: Phaser.Scene;
  private inputQueue: string[] = [];
  private maxQueueSize: number = 2;
  private lastInputTime: number = 0;
  private inputTimeout: number = 1000; // ms between inputs before queue resets

  // Combo system
  private comboCount: number = 0;
  private comboMultiplier: number = 1;
  private maxComboMultiplier: number = 5;
  private lastTrickTime: number = 0;
  private comboTimeout: number = 2000; // ms to maintain combo

  // Visual feedback
  private feedbackText?: Phaser.GameObjects.Text;
  private comboText?: Phaser.GameObjects.Text;

  // Trick tracking
  private currentTrick?: Trick;
  private trickInProgress: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupFeedbackDisplay();
  }

  private setupFeedbackDisplay(): void {
    // Create text objects for visual feedback
    this.feedbackText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      200,
      '',
      {
        fontSize: '48px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 6,
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(1000);

    this.comboText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      260,
      '',
      {
        fontSize: '32px',
        color: '#FF6B6B',
        stroke: '#000000',
        strokeThickness: 4,
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(1000);
  }

  /**
   * Add an input to the queue (called when arrow key is pressed during jump)
   */
  addInput(direction: string): void {
    const currentTime = Date.now();

    // Reset queue if too much time has passed
    if (currentTime - this.lastInputTime > this.inputTimeout) {
      this.inputQueue = [];
    }

    this.lastInputTime = currentTime;
    this.inputQueue.push(direction);

    // Keep queue at max size
    if (this.inputQueue.length > this.maxQueueSize) {
      this.inputQueue.shift();
    }

    // Try to match trick after each input
    this.tryMatchTrick();
  }

  /**
   * Try to match the current input queue against known tricks
   */
  private tryMatchTrick(): Trick | null {
    if (this.inputQueue.length < 2) {
      return null;
    }

    // Look for a matching trick
    for (const trick of TRICKS) {
      if (this.matchesInput(trick.input, this.inputQueue)) {
        this.currentTrick = trick;
        this.trickInProgress = true;
        this.showTrickFeedback(trick, false);
        return trick;
      }
    }

    return null;
  }

  /**
   * Check if input sequence matches trick requirement
   */
  private matchesInput(trickInput: string[], queueInput: string[]): boolean {
    if (trickInput.length !== queueInput.length) {
      return false;
    }

    for (let i = 0; i < trickInput.length; i++) {
      if (trickInput[i] !== queueInput[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Complete the current trick (called when landing successfully)
   */
  completeTrick(): TrickFeedback | null {
    if (!this.currentTrick) {
      return null;
    }

    const currentTime = Date.now();

    // Check if we're maintaining combo
    if (currentTime - this.lastTrickTime < this.comboTimeout) {
      this.comboCount++;
      this.comboMultiplier = Math.min(
        this.maxComboMultiplier,
        1 + (this.comboCount * 0.5)
      );
    } else {
      // Combo broken, reset
      this.comboCount = 1;
      this.comboMultiplier = 1;
    }

    this.lastTrickTime = currentTime;

    const feedback: TrickFeedback = {
      name: this.currentTrick.name,
      emoji: this.currentTrick.emoji,
      value: this.currentTrick.value,
      multiplier: this.comboMultiplier,
    };

    this.showTrickFeedback(this.currentTrick, true);
    this.updateComboDisplay();

    // Reset trick state
    this.currentTrick = undefined;
    this.trickInProgress = false;
    this.inputQueue = [];

    return feedback;
  }

  /**
   * Fail the current trick (called when crashing)
   */
  failTrick(): void {
    if (this.currentTrick) {
      this.showFailFeedback();
    }

    // Reset everything
    this.currentTrick = undefined;
    this.trickInProgress = false;
    this.inputQueue = [];
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.lastTrickTime = 0;
    this.updateComboDisplay();
  }

  /**
   * Reset the trick system
   */
  reset(): void {
    this.inputQueue = [];
    this.currentTrick = undefined;
    this.trickInProgress = false;
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.lastTrickTime = 0;
    this.lastInputTime = 0;

    if (this.feedbackText) {
      this.feedbackText.setText('');
    }
    if (this.comboText) {
      this.comboText.setText('');
    }
  }

  /**
   * Show visual feedback for trick
   */
  private showTrickFeedback(trick: Trick, completed: boolean): void {
    if (!this.feedbackText) return;

    const text = completed
      ? `${trick.emoji} ${trick.name}! +$${Math.floor(trick.value * this.comboMultiplier)}`
      : `${trick.emoji} ${trick.name}`;

    this.feedbackText.setText(text);
    this.feedbackText.setAlpha(1);

    // Animate the text
    this.scene.tweens.add({
      targets: this.feedbackText,
      y: this.feedbackText.y - 50,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        if (this.feedbackText) {
          this.feedbackText.y += 50; // Reset position
        }
      }
    });
  }

  /**
   * Show failure feedback
   */
  private showFailFeedback(): void {
    if (!this.feedbackText) return;

    this.feedbackText.setText('💥 FAILED!');
    this.feedbackText.setColor('#FF0000');
    this.feedbackText.setAlpha(1);

    this.scene.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        if (this.feedbackText) {
          this.feedbackText.setColor('#FFD700');
        }
      }
    });
  }

  /**
   * Update combo display
   */
  private updateComboDisplay(): void {
    if (!this.comboText) return;

    if (this.comboCount > 1) {
      this.comboText.setText(`COMBO x${this.comboMultiplier.toFixed(1)}`);
      this.comboText.setAlpha(1);

      // Pulse effect
      this.scene.tweens.add({
        targets: this.comboText,
        scale: { from: 1.2, to: 1 },
        duration: 300,
        ease: 'Back.easeOut',
      });
    } else {
      this.comboText.setText('');
    }
  }

  /**
   * Check if combo should expire
   */
  update(): void {
    const currentTime = Date.now();

    // Check for combo timeout
    if (this.comboCount > 0 && currentTime - this.lastTrickTime > this.comboTimeout) {
      this.comboCount = 0;
      this.comboMultiplier = 1;
      if (this.comboText) {
        this.scene.tweens.add({
          targets: this.comboText,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            if (this.comboText) {
              this.comboText.setText('');
            }
          }
        });
      }
    }
  }

  /**
   * Get current trick in progress
   */
  getCurrentTrick(): Trick | undefined {
    return this.currentTrick;
  }

  /**
   * Check if a trick is in progress
   */
  isTrickInProgress(): boolean {
    return this.trickInProgress;
  }

  /**
   * Get current combo multiplier
   */
  getComboMultiplier(): number {
    return this.comboMultiplier;
  }

  /**
   * Get combo count
   */
  getComboCount(): number {
    return this.comboCount;
  }

  /**
   * Destroy the trick system
   */
  destroy(): void {
    if (this.feedbackText) {
      this.feedbackText.destroy();
    }
    if (this.comboText) {
      this.comboText.destroy();
    }
  }
}
