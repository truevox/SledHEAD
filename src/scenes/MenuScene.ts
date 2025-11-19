import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

export class MenuScene extends Phaser.Scene {
  private gameStateManager: GameStateManager;
  private seedInputText: string = '';
  private seedInputBox?: Phaser.GameObjects.Text;
  private isInputActive: boolean = false;
  private skipTutorial: boolean = false;

  constructor() {
    super({ key: 'MenuScene' });
    this.gameStateManager = GameStateManager.getInstance();
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const state = this.gameStateManager.getState();

    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1e3a5f, 0x1e3a5f, 0x0d1b2a, 0x0d1b2a, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    const title = this.add.text(width / 2, 100, 'SledHEAD', {
      fontSize: '84px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#2c3e50',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 180, 'Mountain Sledding Management', {
      fontSize: '24px',
      color: '#ecf0f1',
    }).setOrigin(0.5);

    // Title animation
    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.03 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Mountain seed display
    const seedBox = this.add.graphics();
    seedBox.fillStyle(0x34495e, 0.9);
    seedBox.fillRoundedRect(width / 2 - 250, 240, 500, 100, 10);
    seedBox.lineStyle(3, 0x3498db, 1);
    seedBox.strokeRoundedRect(width / 2 - 250, 240, 500, 100, 10);

    this.add.text(width / 2, 260, 'Current Mountain Seed:', {
      fontSize: '18px',
      color: '#bdc3c7',
    }).setOrigin(0.5);

    const seedText = this.add.text(width / 2, 295, state.mountainSeed, {
      fontSize: '24px',
      color: '#3498db',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Custom seed input section
    const inputBoxBg = this.add.graphics();
    inputBoxBg.fillStyle(0x2c3e50, 0.9);
    inputBoxBg.fillRoundedRect(width / 2 - 200, 360, 400, 50, 8);
    inputBoxBg.lineStyle(2, 0x95a5a6, 1);
    inputBoxBg.strokeRoundedRect(width / 2 - 200, 360, 400, 50, 8);

    this.add.text(width / 2 - 180, 365, 'Custom Seed:', {
      fontSize: '16px',
      color: '#95a5a6',
    });

    this.seedInputBox = this.add.text(width / 2 - 180, 385, '', {
      fontSize: '18px',
      color: '#ecf0f1',
    });

    // Input hint
    const inputHint = this.add.text(width / 2, 420, 'Click here to enter custom seed, then press Enter', {
      fontSize: '14px',
      color: '#7f8c8d',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Make input interactive
    const inputZone = this.add.zone(width / 2 - 200, 360, 400, 50).setOrigin(0, 0);
    inputZone.setInteractive({ useHandCursor: true });

    // Skip Tutorial checkbox
    const checkboxY = 450;
    const checkboxSize = 20;
    const checkboxX = width / 2 - 80;

    // Checkbox background
    const checkboxBg = this.add.graphics();
    checkboxBg.fillStyle(0x2c3e50, 1);
    checkboxBg.fillRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
    checkboxBg.lineStyle(2, 0x95a5a6, 1);
    checkboxBg.strokeRect(checkboxX, checkboxY, checkboxSize, checkboxSize);

    // Checkmark (initially hidden)
    const checkmark = this.add.text(checkboxX + checkboxSize / 2, checkboxY + checkboxSize / 2, '✓', {
      fontSize: '16px',
      color: '#2ecc71',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    checkmark.setVisible(false);

    // Checkbox label
    this.add.text(checkboxX + checkboxSize + 10, checkboxY + 2, 'Skip Tutorial', {
      fontSize: '16px',
      color: '#ecf0f1',
    });

    // Make checkbox interactive
    const checkboxZone = this.add.zone(checkboxX, checkboxY, 150, checkboxSize).setOrigin(0, 0);
    checkboxZone.setInteractive({ useHandCursor: true });

    checkboxZone.on('pointerdown', () => {
      this.skipTutorial = !this.skipTutorial;
      checkmark.setVisible(this.skipTutorial);

      // Update checkbox appearance
      checkboxBg.clear();
      checkboxBg.fillStyle(this.skipTutorial ? 0x27ae60 : 0x2c3e50, 1);
      checkboxBg.fillRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
      checkboxBg.lineStyle(2, this.skipTutorial ? 0x2ecc71 : 0x95a5a6, 1);
      checkboxBg.strokeRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
    });

    inputZone.on('pointerdown', () => {
      this.isInputActive = true;
      inputBoxBg.clear();
      inputBoxBg.fillStyle(0x2c3e50, 0.9);
      inputBoxBg.fillRoundedRect(width / 2 - 200, 360, 400, 50, 8);
      inputBoxBg.lineStyle(3, 0x3498db, 1);
      inputBoxBg.strokeRoundedRect(width / 2 - 200, 360, 400, 50, 8);
      inputHint.setColor('#3498db');
    });

    // Keyboard input
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.isInputActive) {
        if (event.key === 'Enter') {
          if (this.seedInputText.trim()) {
            this.gameStateManager.setState({ mountainSeed: this.seedInputText.trim() });
            seedText.setText(this.seedInputText.trim());
            this.seedInputText = '';
            this.seedInputBox?.setText('');
          }
          this.isInputActive = false;
          inputBoxBg.clear();
          inputBoxBg.fillStyle(0x2c3e50, 0.9);
          inputBoxBg.fillRoundedRect(width / 2 - 200, 360, 400, 50, 8);
          inputBoxBg.lineStyle(2, 0x95a5a6, 1);
          inputBoxBg.strokeRoundedRect(width / 2 - 200, 360, 400, 50, 8);
          inputHint.setColor('#7f8c8d');
        } else if (event.key === 'Backspace') {
          this.seedInputText = this.seedInputText.slice(0, -1);
          this.seedInputBox?.setText(this.seedInputText);
        } else if (event.key.length === 1 && this.seedInputText.length < 20) {
          this.seedInputText += event.key;
          this.seedInputBox?.setText(this.seedInputText);
        }
      }
    });

    // Menu buttons
    const buttonY = 510;
    const buttonSpacing = 60;

    // Check if there's a saved game (not first time)
    const hasSavedGame = state.stats.totalRuns > 0;

    // New Game button
    this.createMenuButton(
      width / 2,
      buttonY,
      'New Game',
      0x27ae60,
      () => this.startNewGame()
    );

    // Continue button (only if saved game exists)
    if (hasSavedGame) {
      this.createMenuButton(
        width / 2,
        buttonY + buttonSpacing,
        'Continue',
        0x2980b9,
        () => this.continueGame()
      );
    }

    // Tutorial button
    this.createMenuButton(
      width / 2,
      buttonY + (hasSavedGame ? buttonSpacing * 2 : buttonSpacing),
      'Tutorial',
      0x8e44ad,
      () => this.startTutorial()
    );

    // Settings button
    this.createMenuButton(
      width / 2,
      buttonY + (hasSavedGame ? buttonSpacing * 3 : buttonSpacing * 2),
      'Settings',
      0x95a5a6,
      () => this.openSettings()
    );

    // Footer info
    this.add.text(width / 2, height - 30, 'v1.0.0 | Made with Phaser 3', {
      fontSize: '14px',
      color: '#7f8c8d',
    }).setOrigin(0.5);
  }

  private createMenuButton(
    x: number,
    y: number,
    text: string,
    color: number,
    callback: () => void
  ): void {
    const buttonWidth = 300;
    const buttonHeight = 50;

    const button = this.add.graphics();
    button.fillStyle(color, 1);
    button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Make interactive
    const zone = this.add.zone(x, y, buttonWidth, buttonHeight);
    zone.setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      button.clear();
      button.fillStyle(color, 0.8);
      button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
      button.lineStyle(3, 0xffffff, 0.5);
      button.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
      buttonText.setScale(1.05);
    });

    zone.on('pointerout', () => {
      button.clear();
      button.fillStyle(color, 1);
      button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
      buttonText.setScale(1);
    });

    zone.on('pointerdown', () => {
      buttonText.setScale(0.95);
    });

    zone.on('pointerup', () => {
      buttonText.setScale(1.05);
      callback();
    });
  }

  private startNewGame(): void {
    const state = this.gameStateManager.getState();

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Skip tutorial if checkbox is checked or already completed
      if (this.skipTutorial || state.tutorialComplete) {
        // Mark tutorial as complete if skipping
        if (this.skipTutorial) {
          this.gameStateManager.setState({ tutorialComplete: true });
        }
        this.scene.start('HouseScene');
      } else {
        this.scene.start('TutorialScene');
      }
    });
  }

  private continueGame(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('UphillScene');
    });
  }

  private startTutorial(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TutorialScene');
    });
  }

  private openSettings(): void {
    // TODO: Implement settings scene
    console.log('Settings not yet implemented');
  }
}
