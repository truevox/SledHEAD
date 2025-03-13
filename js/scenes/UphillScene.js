class UphillScene extends Phaser.Scene {
    constructor() {
        super({key: 'UphillScene'});
    }

    create() {
        // Get player reference from game scene
        this.player = this.game.player;
        // Store reference to player in this scene for other objects
        this.scene.player = this.player;
        
        // Generate mountain terrain
        this.createTerrain();
        
        // Create animal group
        this.animals = this.physics.add.group();
        
        // Setup animal spawning timer
        this.animalSpawnTimer = this.time.addEvent({
            delay: 5000,
            callback: this.spawnRandomAnimal,
            callbackScope: this,
            loop: true
        });
        
        // Add physics collisions
        this.setupPhysics();
        
        // Setup camera interface for photography
        this.createCameraInterface();
        
        // Handle photo taking event
        this.events.on('photoTaken', this.processPhotoTaken, this);
        
        // Setup controls
        this.setupControls();
        
        // Add snow effects
        this.createSnowEffect();
        
        // Setup UI with current uphill phase
        this.events.emit('gamePhaseChanged', 'uphill');
        
        // Add cabin/house area at the bottom of the mountain
        this.createHouseArea();
    }
    
    createTerrain() {
        // Create backdrop
        this.add.tileSprite(0, 0, CONSTANTS.MOUNTAIN_WIDTH, CONSTANTS.MOUNTAIN_HEIGHT, 'mountain-bg')
            .setOrigin(0, 0)
            .setScrollFactor(0.2);
        
        // Create mountain terrain using our util function
        this.terrain = generateTerrain(CONSTANTS.MOUNTAIN_WIDTH, CONSTANTS.MOUNTAIN_HEIGHT, this);
        
        // Create ground physics for terrain
        this.ground = this.physics.add.staticGroup();
        
        // Generate ground platforms based on terrain data
        for (let i = 0; i < this.terrain.groundData.length - 1; i++) {
            const current = this.terrain.groundData[i];
            const next = this.terrain.groundData[i + 1];
            
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
        
        // Add tinted gradient areas to represent altitude
        this.createAltitudeGradient();
    }
    
    createAltitudeGradient() {
        // Divide the mountain into sections with different tints
        // to provide a visual guide for altitude
        const gradientSections = 10;
        const sectionHeight = CONSTANTS.MOUNTAIN_HEIGHT / gradientSections;
        
        for (let i = 0; i < gradientSections; i++) {
            // Calculate tint color (lighter at higher altitudes)
            // Start with darker blue at bottom, transition to lighter white/blue at top
            const tintFactor = i / gradientSections; // 0 at bottom, 1 at top
            const r = Math.floor(150 + 105 * tintFactor); // 150-255
            const g = Math.floor(180 + 75 * tintFactor);  // 180-255
            const b = Math.floor(200 + 55 * tintFactor);  // 200-255
            const tint = (r << 16) | (g << 8) | b;
            
            // Create a semi-transparent rectangle for this section
            const section = this.add.rectangle(
                CONSTANTS.MOUNTAIN_WIDTH / 2,
                sectionHeight * i,
                CONSTANTS.MOUNTAIN_WIDTH,
                sectionHeight,
                tint,
                0.2
            );
            section.setOrigin(0.5, 0);
        }
    }
    
    setupPhysics() {
        // Add collision between player and ground
        this.physics.add.collider(this.player, this.ground);
        
        // Make animals collide with ground
        this.physics.add.collider(this.animals, this.ground);
    }
    
    createCameraInterface() {
        // Create camera interface elements that follow the player
        this.cameraOverlay = this.add.image(0, 0, 'camera-frame')
            .setOrigin(0.5)
            .setAlpha(0)
            .setScrollFactor(0);
        
        // Create altitude line (adjustable with arrow keys)
        this.altitudeLine = this.add.graphics()
            .setScrollFactor(0);
            
        // Update camera overlay in the update method
    }
    
    createSnowEffect() {
        // Create snow particles
        this.snowParticles = this.add.particles('snow-particles');
        
        this.snowEmitter = this.snowParticles.createEmitter({
            frame: { frames: [0, 1, 2, 3], cycle: true },
            x: { min: -100, max: CONSTANTS.MOUNTAIN_WIDTH + 100 },
            y: -100,
            lifespan: 10000,
            speedY: { min: 20, max: 60 },
            speedX: { min: -30, max: 30 },
            scale: { start: 0.3, end: 0.1 },
            quantity: 2,
            frequency: 200,
            rotate: { min: 0, max: 360 }
        });
    }
    
    createHouseArea() {
        // Add the house/cabin at the bottom of the mountain
        this.cabin = this.add.image(400, CONSTANTS.MOUNTAIN_HEIGHT - 200, 'cabin');
        
        // Create house entry point
        this.houseZone = this.add.zone(400, CONSTANTS.MOUNTAIN_HEIGHT - 200, 150, 150);
        this.physics.world.enable(this.houseZone);
        
        // When player overlaps with house zone, switch to house scene
        this.physics.add.overlap(this.player, this.houseZone, () => {
            if (Phaser.Input.Keyboard.JustDown(this.player.keys.e)) {
                this.scene.get('GameScene').events.emit('transitionToHouse');
            }
        });
        
        // Add a hint text over the house
        this.hintText = this.add.text(400, CONSTANTS.MOUNTAIN_HEIGHT - 280, 'Press E to enter', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }
    
    spawnRandomAnimal() {
        // Random chance to spawn an animal
        if (Math.random() > CONSTANTS.ANIMAL_SPAWN_CHANCE) return;
        
        // Choose a random animal type
        const animalType = Phaser.Utils.Array.GetRandom(CONSTANTS.ANIMAL_TYPES);
        
        // Get random position within camera view but away from player
        const playerX = this.player.x;
        const playerY = this.player.y;
        
        // Calculate spawn position (200-500 pixels from player)
        let spawnX, spawnY;
        const spawnDistance = Phaser.Math.Between(200, 500);
        const spawnAngle = Phaser.Math.Between(0, 360) * Math.PI / 180;
        
        spawnX = playerX + Math.cos(spawnAngle) * spawnDistance;
        spawnY = playerY + Math.sin(spawnAngle) * spawnDistance;
        
        // Keep spawn within world bounds
        spawnX = Phaser.Math.Clamp(spawnX, 50, CONSTANTS.MOUNTAIN_WIDTH - 50);
        spawnY = Phaser.Math.Clamp(spawnY, 50, CONSTANTS.MOUNTAIN_HEIGHT - 50);
        
        // Create the animal
        const animal = new Animal(this, spawnX, spawnY, animalType);
        this.animals.add(animal);
    }
    
    processPhotoTaken(camera) {
        // Camera flash effect
        this.cameraFlash();
        
        // Check for animals in frame
        const photoResult = this.checkAnimalInPhoto(camera);
        
        if (photoResult.success) {
            // Calculate photo score based on centering, altitude match and movement
            const centeringFactor = 1 - (photoResult.centeringDistance / 300); // 0-1, 1 is perfectly centered
            const altitudeMatchFactor = 1 - (Math.abs(photoResult.altitudeDistance) / 100); // 0-1, 1 is perfect match
            
            // Calculate reward
            const reward = calculatePhotoScore(
                centeringFactor,
                altitudeMatchFactor,
                photoResult.animal.isMoving,
                photoResult.animal.photographCount
            );
            
            // Add money to player
            this.player.money += reward;
            
            // Update photographed animal
            photoResult.animal.photographed();
            
            // Play sound
            this.sound.play('camera-click');
            
            // Display reward
            this.displayPhotoReward(reward, photoResult.animal.x, photoResult.animal.y);
            
            // Increment photo stats
            this.game.gameData.playerState.stats.photosCount++;
            
            // Add animal to player's photographed list
            this.player.camera.photographedAnimals[photoResult.animal.id] = (this.player.camera.photographedAnimals[photoResult.animal.id] || 0) + 1;
        } else {
            // Play camera click without reward
            this.sound.play('camera-click');
        }
        
        // Update photos count
        this.player.camera.photosCount++;
    }
    
    checkAnimalInPhoto(camera) {
        // Default result
        const result = {
            success: false,
            animal: null,
            centeringDistance: 0,
            altitudeDistance: 0
        };
        
        // Camera attributes
        const cameraX = this.player.x;
        const cameraY = this.player.y;
        const cameraAngle = camera.angle;
        const altitudeLine = camera.altitudeLine;
        const cameraAccuracy = camera.accuracy;
        
        // Calculate camera view area
        const viewAngle = 45 * (Math.PI / 180); // 45 degrees in radians
        const viewDistance = 500 * cameraAccuracy;
        
        // Check each animal if it's in view
        let closestAnimal = null;
        let closestDistance = viewDistance;
        
        this.animals.getChildren().forEach(animal => {
            // Calculate relative position to player
            const relativeX = animal.x - cameraX;
            const relativeY = animal.y - cameraY;
            
            // Calculate distance
            const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
            
            if (distance <= viewDistance) {
                // Calculate angle of animal from player's perspective
                let animalAngle = Math.atan2(relativeY, relativeX) * (180 / Math.PI);
                
                // Normalize angle to -180 to 180
                if (animalAngle < -180) animalAngle += 360;
                if (animalAngle > 180) animalAngle -= 360;
                
                // Calculate angle difference
                const angleDifference = Math.abs(animalAngle - cameraAngle);
                
                // Calculate altitude difference
                const animalAltitude = animal.y;
                const targetAltitude = cameraY + altitudeLine;
                const altitudeDifference = Math.abs(animalAltitude - targetAltitude);
                
                // Check if animal is in camera view (angle within view range and closest)
                if (angleDifference <= viewAngle && distance < closestDistance) {
                    closestAnimal = animal;
                    closestDistance = distance;
                    result.centeringDistance = angleDifference;
                    result.altitudeDistance = animalAltitude - targetAltitude;
                }
            }
        });
        
        // If we found an animal in view
        if (closestAnimal) {
            result.success = true;
            result.animal = closestAnimal;
        }
        
        return result;
    }
    
    displayPhotoReward(amount, x, y) {
        // Create floating text showing reward
        const rewardText = this.add.text(x, y - 50, '+' + formatMoney(amount), {
            fontSize: '20px',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Animate it floating upwards and fading
        this.tweens.add({
            targets: rewardText,
            y: y - 100,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                rewardText.destroy();
            }
        });
    }
    
    cameraFlash() {
        // Create flash effect when taking a photo
        const flash = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'photo-flash'
        ).setScrollFactor(0);
        
        // Make flash cover the whole screen
        flash.displayWidth = this.cameras.main.width;
        flash.displayHeight = this.cameras.main.height;
        
        // Flash animation
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                flash.destroy();
            }
        });
    }
    
    setupControls() {
        // E key for manual testing to spawn an animal
        this.input.keyboard.on('keydown-E', () => {
            // Only spawn if not near house (to avoid conflict with house entry)
            const distanceToHouse = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.houseZone.x, this.houseZone.y
            );
            
            if (distanceToHouse > 200) {
                this.spawnRandomAnimal();
            }
        });
    }
    
    update() {
        // Update animals
        this.animals.getChildren().forEach(animal => {
            animal.update();
        });
        
        // Update camera interface when active
        if (this.player.keys.space.isDown) {
            this.cameraOverlay.setAlpha(1);
            
            // Draw altitude line
            this.altitudeLine.clear();
            this.altitudeLine.lineStyle(2, 0xffff00, 0.8);
            this.altitudeLine.beginPath();
            
            const lineY = this.cameras.main.height / 2 + this.player.camera.altitudeLine;
            this.altitudeLine.moveTo(0, lineY);
            this.altitudeLine.lineTo(this.cameras.main.width, lineY);
            this.altitudeLine.strokePath();
            
            // Rotate camera frame based on angle
            this.cameraOverlay.angle = this.player.camera.angle;
        } else {
            this.cameraOverlay.setAlpha(0);
            this.altitudeLine.clear();
        }
        
        // Toggle house hint text visibility based on proximity
        const distanceToHouse = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.houseZone.x, this.houseZone.y
        );
        
        if (distanceToHouse < 200) {
            this.hintText.setVisible(true);
        } else {
            this.hintText.setVisible(false);
        }
        
        // Check if player is at bottom of mountain and should transition to downhill
        if (this.player.y >= CONSTANTS.MOUNTAIN_HEIGHT - 300 && 
            this.player.x >= CONSTANTS.MOUNTAIN_WIDTH - 200) {
            this.scene.get('GameScene').events.emit('transitionToDownhill');
        }
    }
}