import { GameState, TWEAK, Events } from '../game.js';
import { Player } from '../gameplay/Player.js';
import { Terrain } from '../gameplay/Terrain.js';

export class DownhillScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DownhillScene' });
        this.startTime = null;
        this.terrain = null;
        this.player = null;
    }

    create() {
        // Initialize game objects
        this.terrain = new Terrain(this);
        this.player = new Player(this, this.cameras.main.centerX, 0);
        
        // Set up physics
        this.physics.add.collider(this.player, this.terrain.obstacles, this.handleCollision, null, this);
        
        // Configure camera to follow player
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setDeadzone(100, 200);
        
        // Start time tracking
        this.startTime = this.time.now;
        
        // Set up keyboard inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            a: 'A',
            d: 'D',
            space: 'SPACE'
        });
        
        // Create UI scene overlay
        this.scene.launch('UIScene');
    }

    update() {
        // Handle player movement
        this.player.update(this.cursors, this.keys);
        
        // Check win condition (reaching bottom of mountain)
        if (this.player.y >= this.terrain.mountainHeight) {
            const time = (this.time.now - this.startTime) / 1000;
            this.events.emit(Events.STATE_CHANGED, GameState.UPHILL, { time });
            this.scene.start('UphillScene');
        }
    }

    handleCollision(player, obstacle) {
        // Emit collision event for UI and other systems
        this.events.emit(Events.COLLISION, { player, obstacle });
        
        // Handle collision effects
        player.handleCollision();
        
        // Remove obstacle
        obstacle.destroy();
        
        // Check if max collisions reached
        if (player.collisions >= TWEAK.getMaxCollisions()) {
            this.scene.start('HouseScene');
        }
    }
}