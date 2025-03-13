class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'GameScene'});
    }

    create() {
        // Set current game state
        this.gameState = 'uphill'; // Possible states: uphill, downhill, house
        
        // Initialize player
        this.createPlayer();
        
        // Start with uphill scene
        this.scene.launch('UphillScene');
        this.scene.launch('UIScene');
        
        // Set up event listeners between scenes
        this.setupEventListeners();
        
        // Play game music
        if (!this.sound.get('gameplay-music')) {
            this.gameMusic = this.sound.add('gameplay-music', { loop: true, volume: 0.3 });
            this.gameMusic.play();
        }
    }
    
    createPlayer() {
        // Create player with initial position
        this.player = new Player(this, 100, 500);
        
        // Set player to uphill mode initially
        this.player.toggleSleddingMode(false);
        
        // Make this player accessible in other scenes
        this.game.player = this.player;
        
        // Set up camera to follow player
        this.cameras.main.startFollow(this.player, true, CONSTANTS.CAMERA_FOLLOW_SPEED, CONSTANTS.CAMERA_FOLLOW_SPEED);
        
        // Set appropriate world bounds for the game
        this.physics.world.setBounds(0, 0, CONSTANTS.MOUNTAIN_WIDTH, CONSTANTS.MOUNTAIN_HEIGHT);
        this.cameras.main.setBounds(0, 0, CONSTANTS.MOUNTAIN_WIDTH, CONSTANTS.MOUNTAIN_HEIGHT);
    }
    
    setupEventListeners() {
        // Listen for phase transition events
        this.events.on('transitionToDownhill', this.switchToDownhill, this);
        this.events.on('transitionToUphill', this.switchToUphill, this);
        this.events.on('transitionToHouse', this.switchToHouse, this);
        
        // Listen for game state events
        this.events.on('playerCrashed', this.handlePlayerCrash, this);
        this.events.on('loanPaidOff', this.handleVictory, this);
    }
    
    switchToDownhill() {
        // Stop uphill scene
        this.scene.stop('UphillScene');
        
        // Start downhill scene
        this.scene.launch('DownhillScene');
        
        // Update player's mode
        this.player.toggleSleddingMode(true);
        
        // Update game state
        this.gameState = 'downhill';
        
        // Broadcast state change to UI
        this.events.emit('gameStateChanged', this.gameState);
    }
    
    switchToUphill() {
        // Stop downhill scene
        this.scene.stop('DownhillScene');
        
        // Start uphill scene
        this.scene.launch('UphillScene');
        
        // Update player's mode
        this.player.toggleSleddingMode(false);
        
        // Update game state
        this.gameState = 'uphill';
        
        // Broadcast state change to UI
        this.events.emit('gameStateChanged', this.gameState);
    }
    
    switchToHouse() {
        // Stop current gameplay scene
        if (this.gameState === 'uphill') {
            this.scene.stop('UphillScene');
        } else if (this.gameState === 'downhill') {
            this.scene.stop('DownhillScene');
        }
        
        // Start house scene for upgrades and loan payments
        this.scene.launch('HouseScene');
        
        // Update game state
        this.gameState = 'house';
        
        // Broadcast state change to UI
        this.events.emit('gameStateChanged', this.gameState);
    }
    
    handlePlayerCrash() {
        // Play crash sound
        this.sound.play('crash-sound');
        
        // Pause game momentarily
        this.physics.pause();
        this.time.delayedCall(1500, () => {
            // Resume physics after delay
            this.physics.resume();
            
            // Reset player state for next run
            this.player.collisionCount = 0;
            
            // Transition back to house or appropriate starting point
            this.switchToHouse();
        });
    }
    
    handleVictory() {
        // Play win sound
        this.sound.play('win-sound');
        
        // Display victory screen
        this.showVictoryScreen();
    }
    
    showVictoryScreen() {
        // Create victory overlay
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.8
        ).setScrollFactor(0);
        
        // Victory text
        const victoryText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            'Victory!\nYou paid off your loan and became a sledding champion!',
            { fontSize: '32px', fill: '#ffffff', align: 'center' }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // Display stats
        const stats = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            `Photos Taken: ${this.game.gameData.playerState.stats.photosCount}\n` +
            `Tricks Performed: ${this.game.gameData.playerState.stats.tricksPerformed}\n` +
            `Collisions: ${this.game.gameData.playerState.stats.collisions}\n` +
            `Jumps: ${this.game.gameData.playerState.stats.jumps}`,
            { fontSize: '24px', fill: '#ffffff', align: 'center' }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // Return to menu button
        const returnButton = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 200,
            'button'
        ).setInteractive().setScrollFactor(0);
        
        const returnText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 200,
            'Return to Menu',
            { fontSize: '24px', fill: '#ffffff' }
        ).setOrigin(0.5).setScrollFactor(0);
        
        returnButton.on('pointerup', () => {
            this.scene.start('MenuScene');
            this.scene.stop('UIScene');
            this.scene.stop('HouseScene');
            this.scene.stop('UphillScene');
            this.scene.stop('DownhillScene');
            this.scene.stop('GameScene');
        });
    }
    
    update() {
        // Update player controls and state
        if (this.player) {
            this.player.update();
        }
    }
}