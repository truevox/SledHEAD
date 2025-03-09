import { GameState, TWEAK } from '../game.js';
import { UpgradeSystem } from '../mechanics/UpgradeSystem.js';

export class HouseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HouseScene' });
        this.upgradeSystem = new UpgradeSystem();
    }

    create() {
        const { width, height } = this.cameras.main;

        // Create scrollable upgrade menu container
        const upgradeMenu = this.add.container(0, 50);
        
        // Create two columns for upgrades
        this.createUpgradeColumn(upgradeMenu, 'Personal Upgrades', this.upgradeSystem.personalUpgrades, width * 0.25);
        this.createUpgradeColumn(upgradeMenu, 'Mountain Upgrades', this.upgradeSystem.mountainUpgrades, width * 0.75);

        // Add control buttons at the top
        const startButton = this.add.text(width/2, 25, 'Start Sled Run', {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#28a745',
            padding: { x: 15, y: 8 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        startButton.on('pointerdown', () => {
            this.scene.start('DownhillScene');
        });

        // Best time display
        this.add.text(width/2, height - 30, 'Best Time: N/A', {
            fontSize: '20px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Enable scene to receive input
        this.input.on('gameobjectdown', this.handleUpgradeClick, this);
    }

    createUpgradeColumn(container, title, upgrades, x) {
        const startY = 20;
        const spacing = 80;

        // Add column title
        container.add(this.add.text(x, startY, title, {
            fontSize: '28px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        // Add upgrade buttons
        Object.entries(upgrades).forEach(([key, upgrade], index) => {
            const y = startY + 50 + (spacing * index);
            
            // Create upgrade entry container
            const entry = this.add.container(x - 150, y);
            
            // Add button
            const button = this.add.text(0, 0, 
                `${this.formatUpgradeName(key)} (Lv ${upgrade.level}/${upgrade.maxLevel} - Cost: $${this.getUpgradeCost(upgrade)})`, {
                fontSize: '18px',
                fill: '#fff',
                backgroundColor: '#007bff',
                padding: { x: 10, y: 5 }
            })
            .setInteractive({ useHandCursor: true });

            // Add description
            const desc = this.add.text(0, 30, upgrade.description, {
                fontSize: '14px',
                fill: '#ccc',
                wordWrap: { width: 280 }
            });

            entry.add([button, desc]);
            container.add(entry);
        });
    }

    formatUpgradeName(name) {
        return name.replace(/([A-Z])/g, ' $1').trim();
    }

    getUpgradeCost(upgrade) {
        return Math.floor(100 * Math.pow(1.1, upgrade.level + 1));
    }

    handleUpgradeClick(pointer, gameObject) {
        // Handle upgrade button clicks
        // TODO: Implement upgrade purchase logic
    }
}