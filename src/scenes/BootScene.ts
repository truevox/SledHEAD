import Phaser from 'phaser';
import { ProceduralArt } from '../utils/ProceduralArt';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading text
    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Generating Assets...',
      {
        fontSize: '32px',
        color: '#ffffff',
      }
    ).setOrigin(0.5);

    // Loading progress bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 370, 800, 50);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x3498db, 1);
      progressBar.fillRect(250, 380, 780 * value, 30);
      loadingText.setText(`Generating Assets... ${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  create(): void {
    // Generate all procedural art
    ProceduralArt.generateAllAssets(this);

    // Add title screen elements
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    const title = this.add.text(
      this.cameras.main.width / 2,
      200,
      'SledHEAD',
      {
        fontSize: '96px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#2c3e50',
        strokeThickness: 8,
      }
    ).setOrigin(0.5);

    this.add.text(
      this.cameras.main.width / 2,
      300,
      'Sledding Adventure',
      {
        fontSize: '32px',
        color: '#ecf0f1',
      }
    ).setOrigin(0.5);

    this.add.text(
      this.cameras.main.width / 2,
      500,
      'Click or Press Any Key to Start',
      {
        fontSize: '24px',
        color: '#bdc3c7',
      }
    ).setOrigin(0.5);

    // Pulsing animation for title
    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.05 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Wait for user input to proceed
    this.input.once('pointerdown', () => this.startGame());
    this.input.keyboard?.once('keydown', () => this.startGame());
  }

  private startGame(): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }
}
