class DownhillScene extends Phaser.Scene {
    constructor() {
        super({key: 'DownhillScene'});
    }

    create() {
        // Get player reference from game scene
        this.player = this.game.player;
        // Store in scene for other objects to use
        this.scene.player = this.player;
        
        // Generate downhill terrain
        this.createTerrain();
        
        // Create obstacles
        this.createObstacles();
        
        // Setup physics
        this.setupPhysics();
        
        // Create jump ramps
        this.createJumpRamps();
        
        // Create finish line
        this.createFinishLine();
        
        // Add snow effects
        this.createSnowEffect();
        
        // Setup UI with current downhill phase
        this.events.emit('gamePhaseChanged', 'downhill');
        
        // Create combo text display
        this.comboText = this.add.text(
            this.cameras.main.width / 2,
            100,
            '',
            { fontSize: '32px', fill: '#ffff00', stroke: '#000000', strokeThickness: 6 }
        ).setOrigin(0.5).setScrollFactor(0).setAlpha(0);
        
        // Listen for trick events
        this.events.on('trickPerformed', this.onTrickPerformed, this);
    }
    
    createTerrain() {
        // Create mountain backdrop with parallax
        this.add.tileSprite(0, 0, CONSTANTS.MOUNTAIN_WIDTH, CONSTANTS.MOUNTAIN_HEIGHT, 'mountain-bg')
            .setOrigin(0, 0)
            .setScrollFactor(0.2);
        
        // Create downhill slope
        this.terrain = this.add.graphics();
        this.terrain.fillStyle(0xffffff, 1);
        
        // Create ground data for collision
        this.groundData = [];
        
        // Generate a downhill slope with some variation
        for (let x = 0; x < CONSTANTS.MOUNTAIN_WIDTH; x += 50) {
            // Create a general downward slope with small variations
            const progress = x / CONSTANTS.MOUNTAIN_WIDTH;
            // More height at the beginning, flattening toward the end
            const baseHeight = CONSTANTS.MOUNTAIN_HEIGHT * (1 - Math.pow(progress, 0.7)) * 0.8;
            // Add some small variation
            const variation = Math.sin(x / 300) * 50 + Math.sin(x / 100) * 20;
            
            const y = baseHeight + variation;
            this.groundData.push({ x, y });
        }
        
        // Draw terrain
        this.terrain.beginPath();
        this.terrain.moveTo(0, CONSTANTS.MOUNTAIN_HEIGHT);
        
        this.groundData.forEach(point => {
            this.terrain.lineTo(point.x, point.y);
        });
        
        this.terrain.lineTo(CONSTANTS.MOUNTAIN_WIDTH, CONSTANTS.MOUNTAIN_HEIGHT);
        this.terrain.closePath();
        this.terrain.fill();
        
        // Create ground physics for terrain
        this.ground = this.physics.add.staticGroup();
        
        // Generate ground platforms based on terrain data
        for (let i = 0; i < this.groundData.length - 1; i++) {
            const current = this.groundData[i];
            const next = this.groundData[i + 1];
            
            // Create invisible platform
            const platform = this.ground.create(
                (current.x + next.x) / 2,
                (current.y + next.y) / 2,
                'snow-texture'
            );
            
            // Calculate width based on distance
            const width = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));
            platform.displayWidth = width;
            platform.displayHeight = 10;
            
            // Calculate rotation angle
            const angle = Math.atan2(next.y - current.y, next.x - current.x);
            platform.rotation = angle;
            
            // Make platform invisible but keep physics
            platform.alpha = 0;
        }
    }
    
    createObstacles() {
        // Create obstacle group
        this.obstacles = this.physics.add.group();
        
        // Define obstacle types
        const obstacleTypes = ['rock', 'tree', 'snowPile', 'smallBranch'];
        
        // Place obstacles along the terrain
        for (let i = 200; i < CONSTANTS.MOUNTAIN_WIDTH - 500; i += Phaser.Math.Between(100, 300)) {
            // Find ground height at this X position
            const groundPoint = this.findGroundAtX(i);
            
            if (groundPoint) {
                // Choose random obstacle type
                const obstacleType = Phaser.Utils.Array.GetRandom(obstacleTypes);
                
                // Create the obstacle
                const obstacle = new Obstacle(this, i, groundPoint.y - 20, obstacleType);
                this.obstacles.add(obstacle);
            }
        }
    }
    
    createJumpRamps() {
        // Create jump ramps
        for (let i = 300; i < CONSTANTS.MOUNTAIN_WIDTH - 500; i += Phaser.Math.Between(500, 1000)) {
            // Find ground height at this X position
            const groundPoint = this.findGroundAtX(i);
            
            if (groundPoint) {
                // Create jump ramp
                const ramp = new Obstacle(this, i, groundPoint.y - 15, 'jumpRamp');
                this.obstacles.add(ramp);
            }
        }
    }
    
    setupPhysics() {
        // Add collision between player and ground
        this.physics.add.collider(this.player, this.ground);
        
        // Add collision between player and obstacles
        this.physics.add.collider(this.player, this.obstacles, this.handleObstacleCollision, null, this);
    }
    
    handleObstacleCollision(player, obstacle) {
        // Check if the collision should be handled as a crash
        if (obstacle.handleCollision(player)) {
            // Handle collision as crash
            player.handleCollision(obstacle);
            
            // Play crash sound
            this.sound.play('crash-sound');
            
            // Update game statistics
            this.game.gameData.playerState.stats.collisions++;
        }
    }
    
    createFinishLine() {
        // Create a finish line at the bottom right of the map
        const finishX = CONSTANTS.MOUNTAIN_WIDTH - 300;
        const finishY = CONSTANTS.MOUNTAIN_HEIGHT - 100;
        
        // Create a visual indicator for finish
        const finishLine = this.add.rectangle(finishX, finishY, 100, 400, 0xff0000);
        
        // Create a collider zone for the finish line
        this.finishZone = this.add.zone(finishX, finishY, 100, 400);
        this.physics.world.enable(this.finishZone);
        
        // When player crosses finish line, transition back to uphill phase
        this.physics.add.overlap(this.player, this.finishZone, () => {
            // Transition to the house scene after finishing the downhill phase
            this.scene.get('GameScene').events.emit('transitionToHouse');
        });
    }
    
    createSnowEffect() {
        // Create snow particles that follow camera
        this.snowParticles = this.add.particles('snow-particles');
        
        this.snowEmitter = this.snowParticles.createEmitter({
            frame: { frames: [0, 1, 2, 3], cycle: true },
            x: { min: -100, max: this.cameras.main.width + 100 },
            y: -100,
            lifespan: 5000,
            speedY: { min: 50, max: 150 },
            speedX: { min: -50, max: 0 }, // Blow to the left to emphasize speed
            scale: { start: 0.3, end: 0.1 },
            quantity: 4,
            frequency: 50,
            rotate: { min: 0, max: 360 },
            follow: this.cameras.main
        });
    }
    
    onTrickPerformed(trickData) {
        // Play trick sound
        this.sound.play('trick-sound');
        
        // Update game statistics
        this.game.gameData.playerState.stats.tricksPerformed++;
        
        // Display trick info
        this.showTrickInfo(trickData.type, trickData.reward, trickData.comboCount);
    }
    
    showTrickInfo(trickType, reward, comboCount) {
        // Format trick name from constant name
        const trickName = trickType.split('_').map(word => 
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
        
        // Create display text
        let displayText = `${trickName}! +${reward}$`;
        if (comboCount > 1) {
            displayText += `\nCombo x${comboCount}!`;
        }
        
        // Update and show combo text
        this.comboText.setText(displayText);
        this.comboText.setAlpha(1);
        
        // Fade out after a delay
        this.tweens.killTweensOf(this.comboText);
        this.tweens.add({
            targets: this.comboText,
            alpha: 0,
            delay: 1500,
            duration: 500
        });
        
        // Create floating reward text
        const rewardText = this.add.text(
            this.player.x, 
            this.player.y - 50, 
            '+' + reward + '$', 
            { fontSize: '20px', fill: '#ffff00', stroke: '#000000', strokeThickness: 4 }
        ).setOrigin(0.5);
        
        // Animate floating text
        this.tweens.add({
            targets: rewardText,
            y: rewardText.y - 100,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                rewardText.destroy();
            }
        });
    }
    
    findGroundAtX(x) {
        // Find the ground height at a given X position
        for (let i = 0; i < this.groundData.length - 1; i++) {
            if (this.groundData[i].x <= x && this.groundData[i + 1].x >= x) {
                // Interpolate between points
                const point1 = this.groundData[i];
                const point2 = this.groundData[i + 1];
                
                // Linear interpolation
                const ratio = (x - point1.x) / (point2.x - point1.x);
                const y = point1.y + ratio * (point2.y - point1.y);
                
                return { x, y };
            }
        }
        
        return null;
    }
    
    update() {
        // Check for jumps
        if (this.player.body.velocity.y < 0 && this.player.body.touching.down) {
            this.sound.play('jump-sound');
            this.game.gameData.playerState.stats.jumps++;
        }
    }
}