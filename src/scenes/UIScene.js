import { Events } from '../game.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.moneyText = null;
        this.floatingTexts = [];
    }

    create() {
        // Create money display
        this.moneyText = this.add.text(
            this.cameras.main.width - 10, 
            10, 
            'Money: $200', 
            {
                fontSize: '24px',
                fill: '#FFD700',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(1, 0);

        // Listen for money changes
        this.game.events.on(Events.MONEY_CHANGED, this.handleMoneyChange, this);
        
        // Listen for collisions
        this.game.events.on(Events.COLLISION, this.handleCollision, this);
        
        // Listen for trick completions
        this.game.events.on(Events.TRICK_COMPLETED, this.handleTrickComplete, this);
    }

    update() {
        // Update and clean up floating texts
        this.floatingTexts = this.floatingTexts.filter(text => {
            text.update();
            return text.isAlive();
        });
    }

    handleMoneyChange({ amount, source = '' }) {
        // Update money display
        const currentScene = this.scene.get(this.scene.getActiveScene());
        const player = currentScene.player;
        
        this.moneyText.setText(`Money: $${player.money}`);
        
        // Add bounce effect
        this.moneyText.setScale(1.2);
        this.tweens.add({
            targets: this.moneyText,
            scale: 1,
            duration: 200,
            ease: 'Bounce.Out'
        });

        // Show floating text
        if (amount > 0) {
            this.addFloatingText('+$' + amount + (source ? ' ' + source : ''), 
                player.x, 
                player.y - 30
            );
        }
    }

    handleCollision() {
        // Flash screen red briefly
        const flash = this.add.rectangle(
            0, 0, 
            this.cameras.main.width,
            this.cameras.main.height,
            0xff0000
        ).setOrigin(0).setAlpha(0.3);

        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 100,
            onComplete: () => flash.destroy()
        });
    }

    handleTrickComplete({ trick, money, chainBonus }) {
        const currentScene = this.scene.get(this.scene.getActiveScene());
        const player = currentScene.player;

        // Show trick name and money earned
        this.addFloatingText(
            `${trick} +$${money}${chainBonus > 1 ? ' x' + chainBonus.toFixed(1) : ''}`,
            player.x,
            player.y - 50
        );
    }

    addFloatingText(text, x, y) {
        const floatingText = new FloatingText(this, x, y, text);
        this.floatingTexts.push(floatingText);
        return floatingText;
    }
}

class FloatingText {
    constructor(scene, x, y, text) {
        this.scene = scene;
        this.text = scene.add.text(x, y, text, {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.age = 0;
        this.lifetime = 1000; // 1 second

        // Add rising and fading animation
        scene.tweens.add({
            targets: this.text,
            y: y - 50,
            alpha: 0,
            duration: this.lifetime,
            ease: 'Cubic.Out',
            onComplete: () => this.text.destroy()
        });
    }

    update() {
        this.age += this.scene.game.loop.delta;
    }

    isAlive() {
        return this.age < this.lifetime;
    }
}