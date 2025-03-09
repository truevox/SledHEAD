import { GameState, TWEAK, Events } from '../game.js';
import { Wildlife } from '../gameplay/Wildlife.js';
import { Player } from '../gameplay/Player.js';
import { Camera } from '../rendering/Camera.js';

export class UphillScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UphillScene' });
        this.player = null;
        this.wildlife = null;
        this.gameCamera = null;
    }

    create() {
        // Create player at bottom of mountain
        this.player = new Player(this, this.cameras.main.centerX, this.game.config.height);
        
        // Initialize wildlife system
        this.wildlife = new Wildlife(this);
        
        // Create camera system for wildlife photography
        this.gameCamera = new Camera(this);
        
        // Set up keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            w: 'W',
            a: 'A',
            s: 'S',
            d: 'D',
            space: 'SPACE'
        });

        // Configure uphill movement physics
        this.player.body.setGravity(0);
        
        // Set up UI overlay
        this.scene.launch('UIScene');
        
        // Listen for photo attempts
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.wildlife.canTakePhoto()) {
                this.takePhoto();
            }
        });
    }

    update() {
        // Update player movement
        const speed = TWEAK.baseUpSpeed + 
            (this.player.upgrades.fancierFootwear * TWEAK.fancierFootwearUpSpeedPerLevel);

        if (this.keys.w.isDown) { 
            this.player.y -= speed;
        }
        if (this.keys.s.isDown) { 
            this.player.y += speed;
        }
        if (this.keys.a.isDown) { 
            this.player.x -= speed;
        }
        if (this.keys.d.isDown) { 
            this.player.x += speed;
        }

        // Update camera angle for wildlife photography
        if (this.cursors.left.isDown) {
            this.gameCamera.adjustAngle(-2);
        }
        if (this.cursors.right.isDown) {
            this.gameCamera.adjustAngle(2);
        }
        if (this.cursors.up.isDown) {
            this.gameCamera.adjustAltitudeLine(-2);
        }
        if (this.cursors.down.isDown) {
            this.gameCamera.adjustAltitudeLine(2);
        }

        // Update wildlife system
        this.wildlife.update();

        // Check if player reached top of mountain
        if (this.player.y <= 0) {
            this.scene.start('HouseScene');
        }
    }

    takePhoto() {
        const photoResult = this.wildlife.evaluatePhoto(
            this.gameCamera.getAngle(),
            this.gameCamera.getAltitudeLine()
        );

        if (photoResult.success) {
            // Award money based on photo quality
            this.player.money += photoResult.value;
            
            // Show floating text with photo value
            this.events.emit(Events.MONEY_CHANGED, {
                amount: photoResult.value,
                source: `📸 ${photoResult.animalType}`
            });
        }
    }
}