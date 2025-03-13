class MenuScene extends Phaser.Scene {
    constructor() {
        super({key: 'MenuScene'});
    }

    create() {
        // Add background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'mountain-bg')
            .setScale(1.2);
        
        // Add title logo
        const logo = this.add.image(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 3, 
            'title-logo'
        ).setScale(0.8);
        
        // Add subtitle text
        const subtitle = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 3 + 100, 
            'Trick & Time Trial Racer | Adventure', 
            {fontSize: '24px', fill: '#ffffff', fontStyle: 'italic'}
        ).setOrigin(0.5);
        
        // Create menu buttons
        this.createButton(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2 + 50, 
            'Start Game', 
            () => {
                this.scene.start('GameScene');
            }
        );
        
        this.createButton(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2 + 120, 
            'How to Play', 
            () => {
                this.showInstructions();
            }
        );
        
        this.createButton(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2 + 190, 
            'Credits', 
            () => {
                this.showCredits();
            }
        );
        
        // Add snow particle effects
        this.createSnowEffect();
        
        // Play background music
        if (!this.sound.get('title-music')) {
            this.sound.add('title-music', { loop: true, volume: 0.5 }).play();
        }
        
        // Add a bounce animation to the logo
        this.tweens.add({
            targets: logo,
            y: logo.y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createButton(x, y, text, callback) {
        const button = this.add.image(x, y, 'button').setScale(0.6);
        
        const buttonText = this.add.text(x, y, text, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        button.setInteractive();
        
        button.on('pointerover', () => {
            button.setTint(0xcccccc);
        });
        
        button.on('pointerout', () => {
            button.clearTint();
        });
        
        button.on('pointerdown', () => {
            button.setTint(0x999999);
        });
        
        button.on('pointerup', () => {
            button.clearTint();
            callback();
        });
        
        return { button, buttonText };
    }
    
    showInstructions() {
        // Create a semi-transparent background
        const bg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width - 100,
            this.cameras.main.height - 100,
            0x000000,
            0.8
        );
        
        // Instructions text
        const title = this.add.text(
            this.cameras.main.width / 2,
            100,
            'How to Play',
            { fontSize: '32px', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        const instructions = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            'CONTROLS:\n\n' +
            'W/A/S/D: Move the player during the uphill phase\n' +
            'Arrow Keys: Adjust camera angle and altitude line / Control sled during downhill\n' +
            'SPACEBAR: Jump during downhill / Take a photo during uphill\n\n' +
            'TRICKS (during jumps):\n' +
            '- Left + Up: Left Helicopter\n' +
            '- Right + Up: Right Helicopter\n' +
            '- Down: Air Brake\n' +
            '- Up: Parachute\n\n' +
            'Your goal is to earn enough money to pay off your loan by performing tricks\n' +
            'and taking photos of wildlife.',
            { fontSize: '18px', fill: '#ffffff', align: 'center' }
        ).setOrigin(0.5);
        
        // Close button
        const closeButton = this.createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height - 80,
            'Close',
            () => {
                bg.destroy();
                title.destroy();
                instructions.destroy();
                closeButton.button.destroy();
                closeButton.buttonText.destroy();
            }
        );
    }
    
    showCredits() {
        // Create a semi-transparent background
        const bg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width - 100,
            this.cameras.main.height - 100,
            0x000000,
            0.8
        );
        
        // Credits text
        const title = this.add.text(
            this.cameras.main.width / 2,
            100,
            'Credits',
            { fontSize: '32px', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        const credits = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            'SledHEAD\n\n' +
            'Developed with Phaser 3\n\n' +
            'Based on the concept document for a trick & time trial racing\n' +
            'adventure game where you play as an aspiring sledding champion.\n\n' +
            'Thanks for playing!',
            { fontSize: '18px', fill: '#ffffff', align: 'center' }
        ).setOrigin(0.5);
        
        // Close button
        const closeButton = this.createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height - 80,
            'Close',
            () => {
                bg.destroy();
                title.destroy();
                credits.destroy();
                closeButton.button.destroy();
                closeButton.buttonText.destroy();
            }
        );
    }
    
    createSnowEffect() {
        // Create snow particles
        this.snowParticles = this.add.particles('snow-particles');
        
        this.snowEmitter = this.snowParticles.createEmitter({
            frame: { frames: [0, 1, 2, 3], cycle: true },
            x: { min: 0, max: this.cameras.main.width },
            y: -10,
            lifespan: 5000,
            speedY: { min: 20, max: 50 },
            speedX: { min: -5, max: 5 },
            scale: { start: 0.2, end: 0.1 },
            quantity: 2,
            blendMode: 'ADD',
            frequency: 50,
            rotate: { min: 0, max: 360 }
        });
    }
}