// Main Phaser Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Initialize the game
const game = new Phaser.Game(config);

// Current game state and globals
let player;
let keysDown = {};
let currentState = 'HOUSE'; // Will be converted to Phaser scenes

function preload() {
    // Load any initial assets
    // For now, we'll use simple shapes until we add proper sprites
}

function create() {
    // Set up the game world
    player = this.add.rectangle(400, 300, 20, 20, 0xFF0000);
    this.physics.add.existing(player);
    
    // Set up input handling
    this.input.keyboard.on('keydown', function(event) {
        keysDown[event.key] = true;
    });
    this.input.keyboard.on('keyup', function(event) {
        delete keysDown[event.key];
    });
}

function update() {
    // We'll gradually move game logic here from the original game.js
    // For now, just handle basic movement
    if (keysDown['a']) { player.x -= 5; }
    if (keysDown['d']) { player.x += 5; }
    if (keysDown[' '] && player.body.touching.down) {
        player.body.setVelocityY(-400);
    }
}