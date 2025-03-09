import { GameState } from '../game.js';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        // Create menu UI elements
        const { width, height } = this.cameras.main;

        // Title
        this.add.text(width/2, height/4, 'SledHEAD', {
            fontSize: '64px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Start Game Button
        const startButton = this.add.text(width/2, height/2, 'Start Sled Run', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#28a745',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        // Pay Loan Button
        const loanButton = this.add.text(width/2, height/2 + 60, 'Pay Loan ($100,000)', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#007bff',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        // Button hover effects
        this.setupButtonEffects(startButton);
        this.setupButtonEffects(loanButton);

        // Button click handlers
        startButton.on('pointerdown', () => {
            this.scene.start('DownhillScene');
        });

        loanButton.on('pointerdown', () => {
            // TODO: Implement loan payment logic
            console.log('Pay loan clicked');
        });
    }

    setupButtonEffects(button) {
        button.on('pointerover', () => {
            button.setScale(1.1);
        });

        button.on('pointerout', () => {
            button.setScale(1);
        });
    }
}