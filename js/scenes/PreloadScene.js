class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
        this.ready = false;
    }

    preload() {
        // Set up loading bar
        this.setupLoadingBar();
        
        // Load assets with error handling
        this.loadAssets();
    }
    
    setupLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Loading box background
        this.add.rectangle(width / 2, height / 2, 320, 50, 0x222222);
        
        // Progress bar background
        this.add.rectangle(width / 2, height / 2, 300, 30, 0x666666);
        
        // Progress bar
        const progressBar = this.add.rectangle(width / 2 - 150, height / 2, 0, 30, 0xffffff);
        progressBar.setOrigin(0, 0.5);
        
        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Progress percentage
        const progressText = this.add.text(width / 2, height / 2 + 50, '0%', {
            font: '18px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Update progress bar
        this.load.on('progress', (value) => {
            progressBar.width = 300 * value;
            progressText.setText(parseInt(value * 100) + '%');
        });
        
        // Clean up when complete
        this.load.on('complete', () => {
            progressBar.destroy();
            loadingText.destroy();
            progressText.destroy();
            this.ready = true;
            this.startGame();
        });
    }
    
    loadAssets() {
        try {
            // Images
            this.load.image('player', 'assets/images/player-sled.png');
            this.load.image('player-upright', 'assets/images/player-upright.png');
            this.load.image('bear', 'assets/images/bear.png');
            this.load.image('bird', 'assets/images/bird.png');
            this.load.image('rock', 'assets/images/rock.png');
            this.load.image('tree', 'assets/images/tree.png');
            this.load.image('snowPile', 'assets/images/snow-pile.png');
            this.load.image('smallBranch', 'assets/images/small-branch.png');
            this.load.image('jumpRamp', 'assets/images/jump-ramp.png');
            this.load.image('mountain-bg', 'assets/images/mountain-bg.png');
            this.load.image('snow-texture', 'assets/images/snow-texture.png');
            this.load.image('cabin', 'assets/images/cabin.png');
            this.load.image('camera-frame', 'assets/images/camera-frame.png');
            this.load.image('title-logo', 'assets/images/title-logo.png');
            this.load.image('button', 'assets/images/button.png');
            this.load.image('upgrade-panel', 'assets/images/upgrade-panel.png');
            this.load.image('photo-flash', 'assets/images/photo-flash.png');
            
            // Spritesheets
            this.load.spritesheet('player-tricks', 'assets/images/player-tricks.png', {
                frameWidth: 64,
                frameHeight: 64
            });
            this.load.spritesheet('bear-walk', 'assets/images/bear-walk.png', {
                frameWidth: 64,
                frameHeight: 64
            });
            this.load.spritesheet('bird-fly', 'assets/images/bird-fly.png', {
                frameWidth: 32,
                frameHeight: 32
            });
            this.load.spritesheet('snow-particles', 'assets/images/snow-particles.png', {
                frameWidth: 16,
                frameHeight: 16
            });
            
            // Audio
            this.load.audio('title-music', 'assets/audio/title-music.mp3');
            this.load.audio('gameplay-music', 'assets/audio/gameplay-music.mp3');
            this.load.audio('jump-sound', 'assets/audio/jump.mp3');
            this.load.audio('crash-sound', 'assets/audio/crash.mp3');
            this.load.audio('trick-sound', 'assets/audio/trick.mp3');
            this.load.audio('camera-click', 'assets/audio/camera-click.mp3');
            this.load.audio('cash-sound', 'assets/audio/cash.mp3');
            this.load.audio('upgrade-sound', 'assets/audio/upgrade.mp3');
            this.load.audio('win-sound', 'assets/audio/win.mp3');
        } catch (error) {
            console.error('Error loading assets:', error);
        }
    }
    
    create() {
        this.createAnimations();
        if (this.ready) {
            this.startGame();
        }
    }
    
    createAnimations() {
        // Player animations
        this.anims.create({
            key: 'player-left-helicopter',
            frames: this.anims.generateFrameNumbers('player-tricks', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.anims.create({
            key: 'player-right-helicopter',
            frames: this.anims.generateFrameNumbers('player-tricks', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.anims.create({
            key: 'player-parachute',
            frames: this.anims.generateFrameNumbers('player-tricks', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: 0
        });
        
        // Animal animations
        this.anims.create({
            key: 'bear-walk',
            frames: this.anims.generateFrameNumbers('bear-walk', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'bird-fly',
            frames: this.anims.generateFrameNumbers('bird-fly', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        // Snow particle effects
        this.anims.create({
            key: 'snow-fall',
            frames: this.anims.generateFrameNumbers('snow-particles', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
    }
    
    startGame() {
        this.scene.start('MenuScene');
    }
}