import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';
import { NewGamePlusState } from '../types';

export type NGPBonusType = 'speed' | 'trickery' | 'resilience' | 'climb' | 'charisma' | 'rhythm';

export interface NGPBonus {
  id: NGPBonusType;
  name: string;
  subtitle: string;
  description: string;
  emoji: string;
  color: number;
}

export class NewGamePlusSystem {
  private scene: Phaser.Scene;
  private gameStateManager: GameStateManager;
  private isActive: boolean = false;

  // UI containers
  private victoryContainer?: Phaser.GameObjects.Container;
  private loreContainer?: Phaser.GameObjects.Container;
  private bonusSelectionContainer?: Phaser.GameObjects.Container;

  // Lore sequence state
  private loreSequenceIndex: number = 0;
  private jakeDialogueIndex: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameStateManager = GameStateManager.getInstance();
  }

  /**
   * Check if the player has won (loan fully paid)
   */
  checkVictoryCondition(): boolean {
    const state = this.gameStateManager.getState();
    return state.loan <= 0;
  }

  /**
   * Show the victory screen and start NG+ sequence
   */
  showVictoryScreen(): void {
    if (this.isActive) return;
    this.isActive = true;

    const { width, height } = this.scene.cameras.main;

    this.victoryContainer = this.scene.add.container(0, 0).setDepth(2000);

    // Black background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 1);
    bg.fillRect(0, 0, width, height);
    this.victoryContainer.add(bg);

    // Victory text
    const victoryText = this.scene.add.text(width / 2, height / 2 - 100, 'LOAN PAID OFF!', {
      fontSize: '72px',
      color: '#27ae60',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setAlpha(0);
    this.victoryContainer.add(victoryText);

    const subtitle = this.scene.add.text(width / 2, height / 2, 'You are debt-free!', {
      fontSize: '32px',
      color: '#ecf0f1',
    }).setOrigin(0.5).setAlpha(0);
    this.victoryContainer.add(subtitle);

    // Fade in victory text
    this.scene.tweens.add({
      targets: victoryText,
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
    });

    this.scene.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 1000,
      delay: 500,
      ease: 'Power2',
      onComplete: () => {
        // After 3 seconds, transition to lore reveal
        this.scene.time.delayedCall(3000, () => {
          this.startLoreReveal();
        });
      },
    });
  }

  /**
   * Start the universe lore reveal sequence
   */
  private startLoreReveal(): void {
    if (this.victoryContainer) {
      this.victoryContainer.destroy();
      this.victoryContainer = undefined;
    }

    const { width, height } = this.scene.cameras.main;

    this.loreContainer = this.scene.add.container(0, 0).setDepth(2000);

    // Starfield background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 1);
    bg.fillRect(0, 0, width, height);
    this.loreContainer.add(bg);

    // Add stars
    for (let i = 0; i < 100; i++) {
      const star = this.scene.add.circle(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2,
        0xffffff,
        Math.random() * 0.8 + 0.2
      );
      this.loreContainer.add(star);

      // Twinkle effect
      this.scene.tweens.add({
        targets: star,
        alpha: Math.random() * 0.5,
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
      });
    }

    this.showNextLoreSequence();
  }

  /**
   * Show the next piece of lore in the reveal sequence
   */
  private showNextLoreSequence(): void {
    if (!this.loreContainer) return;

    const { width, height } = this.scene.cameras.main;

    const loreTexts = [
      {
        title: 'The Computronium Core',
        text: 'Beneath your feet, buried deep within the heart of the Earth,\nlies something quietly astonishing:\n\nA naturally-grown, dormant computronium core,\ncrystallized at the birth of this universe\nby the combined will of those who had perished\nin its molten creation.',
      },
      {
        title: 'Gravitational Resonance Coding',
        text: 'It holds no instructions, no memory—\nonly a delicate sensitivity to\ngravitational resonance via kinetic coding.\n\nYour sled was never just a vehicle.\nIt was a keypunch, and the mountain was the punch card.',
      },
      {
        title: 'The Mountains as Waveguides',
        text: 'Each mountain—Debutmont, Undersea Mountain,\nCrystal Caverns, Vertigo Vents, Lunar Peak—\nwasn\'t a mere challenge to overcome.\n\nThey were waveguides, meticulously designed\ngravitational pathways, leading your joyful expressions\ndeep into Earth\'s core.',
      },
      {
        title: 'The Core Awakens',
        text: 'You\'ve completed the circuit.\nYou\'ve carved the final trace.\n\nThe resonance cascades inward,\nlayer by layer, mountain by mountain.\n\nThe core pulses awake.',
      },
      {
        title: 'Cold-Start Sequence Complete',
        text: 'In that instant, you haven\'t just begun\nthe process of waking up the universe—\n\nyou\'ve fulfilled the hopes of those\nwho perished before our universe began.\n\nYou didn\'t win a race.\nYou cold-cranked the universe.',
      },
    ];

    if (this.loreSequenceIndex >= loreTexts.length) {
      // Lore sequence complete, show Jake's final dialogue
      this.showJakeDialogue();
      return;
    }

    const lore = loreTexts[this.loreSequenceIndex];

    // Create text display
    const titleText = this.scene.add.text(width / 2, 150, lore.title, {
      fontSize: '42px',
      color: '#3498db',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setAlpha(0);
    this.loreContainer.add(titleText);

    const bodyText = this.scene.add.text(width / 2, height / 2, lore.text, {
      fontSize: '24px',
      color: '#ecf0f1',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0);
    this.loreContainer.add(bodyText);

    const continueText = this.scene.add.text(width / 2, height - 80, '[Click to continue]', {
      fontSize: '18px',
      color: '#95a5a6',
      fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0);
    this.loreContainer.add(continueText);

    // Fade in
    this.scene.tweens.add({
      targets: [titleText, bodyText],
      alpha: 1,
      duration: 1500,
      ease: 'Power2',
    });

    this.scene.tweens.add({
      targets: continueText,
      alpha: 1,
      duration: 1000,
      delay: 2000,
      ease: 'Power2',
    });

    // Blinking continue prompt
    this.scene.tweens.add({
      targets: continueText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      delay: 3000,
    });

    // Click to advance
    const clickZone = this.scene.add.zone(0, 0, width, height).setOrigin(0, 0);
    clickZone.setInteractive();
    this.loreContainer.add(clickZone);

    clickZone.once('pointerdown', () => {
      // Fade out current text
      this.scene.tweens.add({
        targets: [titleText, bodyText, continueText],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          titleText.destroy();
          bodyText.destroy();
          continueText.destroy();
          clickZone.destroy();

          this.loreSequenceIndex++;
          this.showNextLoreSequence();
        },
      });
    });
  }

  /**
   * Show Jake's final revelation dialogue
   */
  private showJakeDialogue(): void {
    if (!this.loreContainer) return;

    const { width, height } = this.scene.cameras.main;

    const dialogueLines = [
      'All those rides, all those wipeouts,\nall that laughter?',
      'They weren\'t mistakes, kid—they were code.',
      'You didn\'t win a race.\nYou cold-cranked the universe.',
      'And you did it not because someone told you to,\nbut because it was fun.',
      'You were built to sled, kid.',
      'And that\'s exactly what\nthe universe was waitin\' for.',
    ];

    if (this.jakeDialogueIndex >= dialogueLines.length) {
      // Dialogue complete, show bonus selection
      this.showBonusSelection();
      return;
    }

    const line = dialogueLines[this.jakeDialogueIndex];

    // Jake portrait
    const portrait = this.scene.add.circle(150, height / 2, 60, 0x34495e);
    this.loreContainer.add(portrait);

    const portraitText = this.scene.add.text(150, height / 2, 'J', {
      fontSize: '48px',
      color: '#ecf0f1',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.loreContainer.add(portraitText);

    // Name label
    const nameLabel = this.scene.add.text(150, height / 2 + 80, 'Jake', {
      fontSize: '20px',
      color: '#95a5a6',
    }).setOrigin(0.5);
    this.loreContainer.add(nameLabel);

    // Dialogue box
    const dialogueBox = this.scene.add.graphics();
    dialogueBox.fillStyle(0x2c3e50, 0.95);
    dialogueBox.fillRoundedRect(250, height / 2 - 80, width - 350, 160, 12);
    dialogueBox.lineStyle(3, 0x3498db, 1);
    dialogueBox.strokeRoundedRect(250, height / 2 - 80, width - 350, 160, 12);
    this.loreContainer.add(dialogueBox);

    const dialogueText = this.scene.add.text(280, height / 2 - 50, line, {
      fontSize: '26px',
      color: '#ecf0f1',
      lineSpacing: 8,
      wordWrap: { width: width - 400 },
    }).setAlpha(0);
    this.loreContainer.add(dialogueText);

    // Fade in dialogue
    this.scene.tweens.add({
      targets: dialogueText,
      alpha: 1,
      duration: 800,
      ease: 'Power2',
    });

    // Continue prompt
    const continueText = this.scene.add.text(width / 2, height - 60, '[Click to continue]', {
      fontSize: '18px',
      color: '#95a5a6',
      fontStyle: 'italic',
    }).setOrigin(0.5);
    this.loreContainer.add(continueText);

    this.scene.tweens.add({
      targets: continueText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      delay: 1000,
    });

    // Click to advance
    const clickZone = this.scene.add.zone(0, 0, width, height).setOrigin(0, 0);
    clickZone.setInteractive();
    this.loreContainer.add(clickZone);

    clickZone.once('pointerdown', () => {
      this.scene.tweens.add({
        targets: [portrait, portraitText, nameLabel, dialogueBox, dialogueText, continueText],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          portrait.destroy();
          portraitText.destroy();
          nameLabel.destroy();
          dialogueBox.destroy();
          dialogueText.destroy();
          continueText.destroy();
          clickZone.destroy();

          this.jakeDialogueIndex++;
          this.showJakeDialogue();
        },
      });
    });
  }

  /**
   * Show the post-credits bonus selection screen
   */
  private showBonusSelection(): void {
    if (this.loreContainer) {
      this.scene.tweens.add({
        targets: this.loreContainer.getAll(),
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          this.loreContainer?.destroy();
          this.loreContainer = undefined;
          this.createBonusSelectionUI();
        },
      });
    }
  }

  private createBonusSelectionUI(): void {
    const { width, height } = this.scene.cameras.main;

    this.bonusSelectionContainer = this.scene.add.container(0, 0).setDepth(2000);

    // Cosmic background
    const bg = this.scene.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a1a3a, 0x1a1a3a, 1);
    bg.fillRect(0, 0, width, height);
    this.bonusSelectionContainer.add(bg);

    // Particles
    const particles = this.scene.add.particles(0, 0, 'white', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speed: 20,
      lifespan: 3000,
      scale: { start: 0.1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      frequency: 100,
    });
    this.bonusSelectionContainer.add(particles);

    // Title
    const title = this.scene.add.text(width / 2, 80, 'SEED THE NEXT REALITY', {
      fontSize: '48px',
      color: '#3498db',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);
    this.bonusSelectionContainer.add(title);

    const subtitle = this.scene.add.text(
      width / 2,
      130,
      'Choose what you value most to carry into New Game+',
      {
        fontSize: '20px',
        color: '#ecf0f1',
      }
    ).setOrigin(0.5);
    this.bonusSelectionContainer.add(subtitle);

    // Bonus options
    const bonuses = this.getBonusOptions();
    const startY = 200;
    const spacing = 90;

    bonuses.forEach((bonus, index) => {
      const y = startY + index * spacing;
      this.createBonusOption(bonus, width / 2 - 350, y, () => {
        this.selectBonus(bonus.id);
      });
    });

    // Current NG+ level display
    const currentLevel = this.calculateNGPLevel();

    if (currentLevel > 0) {
      const ngpLabel = this.scene.add.text(width / 2, height - 100, `Current NG+ Level: ${currentLevel}`, {
        fontSize: '24px',
        color: '#f39c12',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.bonusSelectionContainer.add(ngpLabel);

      const bonusesText = this.formatCurrentBonuses();
      const bonusDisplay = this.scene.add.text(width / 2, height - 60, bonusesText, {
        fontSize: '16px',
        color: '#95a5a6',
      }).setOrigin(0.5);
      this.bonusSelectionContainer.add(bonusDisplay);
    }
  }

  private getBonusOptions(): NGPBonus[] {
    return [
      {
        id: 'speed',
        name: 'Speed',
        subtitle: 'The Joy of Acceleration',
        description: '+10% sled speed per NG+',
        emoji: '⚡',
        color: 0xe74c3c,
      },
      {
        id: 'trickery',
        name: 'Trickery',
        subtitle: 'The Joy of Movement',
        description: '+10% trick performance',
        emoji: '🎪',
        color: 0x9b59b6,
      },
      {
        id: 'resilience',
        name: 'Resilience',
        subtitle: 'The Joy of Persistence',
        description: '+1 collision tolerance',
        emoji: '🛡️',
        color: 0x27ae60,
      },
      {
        id: 'climb',
        name: 'Climb',
        subtitle: 'The Joy of Journey',
        description: '+10% uphill speed',
        emoji: '⛰️',
        color: 0x16a085,
      },
      {
        id: 'charisma',
        name: 'Charisma',
        subtitle: 'The Joy of Community',
        description: '-10% shop costs',
        emoji: '🤝',
        color: 0x3498db,
      },
      {
        id: 'rhythm',
        name: 'Rhythm',
        subtitle: 'The Joy of Chaining',
        description: '+10% combo window',
        emoji: '🎵',
        color: 0xf39c12,
      },
    ];
  }

  private createBonusOption(bonus: NGPBonus, x: number, y: number, callback: () => void): void {
    if (!this.bonusSelectionContainer) return;

    const boxWidth = 700;
    const boxHeight = 70;

    // Background box
    const box = this.scene.add.graphics();
    box.fillStyle(bonus.color, 0.3);
    box.fillRoundedRect(x, y, boxWidth, boxHeight, 8);
    box.lineStyle(3, bonus.color, 0.8);
    box.strokeRoundedRect(x, y, boxWidth, boxHeight, 8);
    this.bonusSelectionContainer.add(box);

    // Emoji
    const emoji = this.scene.add.text(x + 20, y + boxHeight / 2, bonus.emoji, {
      fontSize: '36px',
    }).setOrigin(0, 0.5);
    this.bonusSelectionContainer.add(emoji);

    // Name and subtitle
    const name = this.scene.add.text(x + 80, y + 18, `${bonus.name} – ${bonus.subtitle}`, {
      fontSize: '22px',
      color: '#ecf0f1',
      fontStyle: 'bold',
    });
    this.bonusSelectionContainer.add(name);

    // Description
    const desc = this.scene.add.text(x + 80, y + 45, bonus.description, {
      fontSize: '16px',
      color: '#95a5a6',
    });
    this.bonusSelectionContainer.add(desc);

    // Make interactive
    const zone = this.scene.add.zone(x, y, boxWidth, boxHeight).setOrigin(0, 0);
    zone.setInteractive({ useHandCursor: true });
    this.bonusSelectionContainer.add(zone);

    zone.on('pointerover', () => {
      box.clear();
      box.fillStyle(bonus.color, 0.5);
      box.fillRoundedRect(x, y, boxWidth, boxHeight, 8);
      box.lineStyle(4, 0xffffff, 1);
      box.strokeRoundedRect(x, y, boxWidth, boxHeight, 8);

      this.scene.tweens.add({
        targets: [box, emoji, name, desc],
        x: `+=${10}`,
        duration: 100,
      });
    });

    zone.on('pointerout', () => {
      box.clear();
      box.fillStyle(bonus.color, 0.3);
      box.fillRoundedRect(x, y, boxWidth, boxHeight, 8);
      box.lineStyle(3, bonus.color, 0.8);
      box.strokeRoundedRect(x, y, boxWidth, boxHeight, 8);

      this.scene.tweens.add({
        targets: [box, emoji, name, desc],
        x: `-=${10}`,
        duration: 100,
      });
    });

    zone.on('pointerdown', callback);
  }

  /**
   * Select a bonus and start NewGame+
   */
  private selectBonus(bonusType: NGPBonusType): void {
    // Add the bonus
    this.gameStateManager.startNewGamePlus(bonusType);

    // Show confirmation
    const { width, height } = this.scene.cameras.main;

    const confirmText = this.scene.add.text(
      width / 2,
      height / 2,
      `Bonus Added!\nStarting New Game+...`,
      {
        fontSize: '36px',
        color: '#27ae60',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 6,
      }
    ).setOrigin(0.5).setDepth(3000).setAlpha(0);

    this.scene.tweens.add({
      targets: confirmText,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        this.scene.time.delayedCall(2000, () => {
          // Fade out everything and restart
          this.scene.cameras.main.fadeOut(1000, 0, 0, 0);
          this.scene.cameras.main.once('camerafadeoutcomplete', () => {
            this.cleanup();
            this.scene.scene.start('MenuScene');
          });
        });
      },
    });
  }

  /**
   * Calculate current NG+ level (sum of all bonuses)
   */
  private calculateNGPLevel(): number {
    const state = this.gameStateManager.getState();
    if (!state.newGamePlus.active) return 0;

    const bonuses = state.newGamePlus.bonuses;
    return Math.round(
      (bonuses.speed +
        bonuses.trickery +
        bonuses.resilience +
        bonuses.climb +
        bonuses.charisma +
        bonuses.rhythm) *
        10
    );
  }

  /**
   * Format current bonuses for display
   */
  private formatCurrentBonuses(): string {
    const bonuses = this.gameStateManager.getState().newGamePlus.bonuses;

    const parts: string[] = [];
    if (bonuses.speed > 0) parts.push(`Speed +${(bonuses.speed * 100).toFixed(0)}%`);
    if (bonuses.trickery > 0) parts.push(`Trickery +${(bonuses.trickery * 100).toFixed(0)}%`);
    if (bonuses.resilience > 0) parts.push(`Resilience +${bonuses.resilience.toFixed(0)}`);
    if (bonuses.climb > 0) parts.push(`Climb +${(bonuses.climb * 100).toFixed(0)}%`);
    if (bonuses.charisma > 0) parts.push(`Charisma -${(bonuses.charisma * 100).toFixed(0)}%`);
    if (bonuses.rhythm > 0) parts.push(`Rhythm +${(bonuses.rhythm * 100).toFixed(0)}%`);

    return parts.join(' | ');
  }

  /**
   * Get special visual effects for NG+ players
   */
  getVisualEffects(): { glow: boolean; particles: boolean; aura: boolean } {
    const state = this.gameStateManager.getState();
    const level = this.calculateNGPLevel();

    return {
      glow: state.newGamePlus.active,
      particles: level >= 3,
      aura: level >= 5,
    };
  }

  /**
   * Cleanup all UI elements
   */
  private cleanup(): void {
    if (this.victoryContainer) {
      this.victoryContainer.destroy();
      this.victoryContainer = undefined;
    }
    if (this.loreContainer) {
      this.loreContainer.destroy();
      this.loreContainer = undefined;
    }
    if (this.bonusSelectionContainer) {
      this.bonusSelectionContainer.destroy();
      this.bonusSelectionContainer = undefined;
    }
    this.isActive = false;
  }

  /**
   * Get current NG+ state
   */
  getState(): NewGamePlusState {
    return this.gameStateManager.getState().newGamePlus;
  }

  /**
   * Check if NG+ is active
   */
  isNGPActive(): boolean {
    return this.gameStateManager.getState().newGamePlus.active;
  }

  destroy(): void {
    this.cleanup();
  }
}
