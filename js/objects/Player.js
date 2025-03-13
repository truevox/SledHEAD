class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // Add player to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Player properties
        this.health = CONSTANTS.MAX_PLAYER_HEALTH;
        this.money = CONSTANTS.INITIAL_MONEY;
        this.loanAmount = CONSTANTS.LOAN_AMOUNT;
        this.isInAir = false;
        this.direction = 'right';
        this.isSledding = false;
        this.isPerformingTrick = false;
        this.currentTrick = null;
        this.comboCount = 0;
        this.collisionCount = 0;
        this.maxCollisions = 3;
        
        // Photography props
        this.camera = {
            angle: 0,
            altitudeLine: 0,
            accuracy: 1.0, // Modified by upgrades
            photosCount: 0,
            photographedAnimals: {} // Track previously photographed animals
        };
        
        // Upgrades
        this.upgrades = {
            rocketSurgery: 0,
            optimalOptics: 0,
            sledDurability: 0,
            fancierFootwear: 0
        };
        
        // Physics properties
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        
        // Input handlers
        this.keys = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            e: Phaser.Input.Keyboard.KeyCodes.E
        });
    }
    
    update() {
        if (this.isSledding) {
            this.updateDownhillControls();
        } else {
            this.updateUphillControls();
        }
        
        // Check if player is in the air
        this.isInAir = !this.body.touching.down && !this.body.blocked.down;
        
        // Reset combo if landed
        if (!this.isInAir && this.comboCount > 0) {
            this.comboCount = 0;
        }
    }
    
    updateDownhillControls() {
        // Left/right steering during sledding
        if (this.keys.left.isDown) {
            this.setVelocityX(-CONSTANTS.PLAYER_SPEED - (this.upgrades.rocketSurgery * 10));
            this.direction = 'left';
        } else if (this.keys.right.isDown) {
            this.setVelocityX(CONSTANTS.PLAYER_SPEED + (this.upgrades.rocketSurgery * 10));
            this.direction = 'right';
        } else {
            this.setVelocityX(0);
        }
        
        // Jump with spacebar
        if (this.keys.space.isDown && !this.isInAir) {
            this.setVelocityY(CONSTANTS.PLAYER_JUMP_VELOCITY);
            this.isInAir = true;
        }
        
        // Perform tricks when in air
        if (this.isInAir && !this.isPerformingTrick) {
            if (this.keys.left.isDown && this.keys.up.isDown) {
                this.performTrick('LEFT_HELICOPTER');
            } else if (this.keys.right.isDown && this.keys.up.isDown) {
                this.performTrick('RIGHT_HELICOPTER');
            } else if (this.keys.down.isDown) {
                this.performTrick('AIR_BRAKE');
            } else if (this.keys.up.isDown) {
                this.performTrick('PARACHUTE');
            }
        }
    }
    
    updateUphillControls() {
        const speed = CONSTANTS.PLAYER_SPEED * (1 + this.upgrades.fancierFootwear * 0.1);
        
        // WASD Movement for uphill phase
        if (this.keys.w.isDown) {
            this.setVelocityY(-speed);
        } else if (this.keys.s.isDown) {
            this.setVelocityY(speed);
        } else {
            this.setVelocityY(0);
        }
        
        if (this.keys.a.isDown) {
            this.setVelocityX(-speed);
            this.direction = 'left';
        } else if (this.keys.d.isDown) {
            this.setVelocityX(speed);
            this.direction = 'right';
        } else {
            this.setVelocityX(0);
        }
        
        // Take a photo with spacebar
        if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
            this.takePhoto();
        }
        
        // Adjust camera angle
        if (this.keys.up.isDown) {
            this.camera.altitudeLine = Math.max(this.camera.altitudeLine - 2, -100);
        } else if (this.keys.down.isDown) {
            this.camera.altitudeLine = Math.min(this.camera.altitudeLine + 2, 100);
        }
        
        // Adjust camera horizontal angle
        if (this.keys.left.isDown) {
            this.camera.angle = Math.max(this.camera.angle - 2, -45);
        } else if (this.keys.right.isDown) {
            this.camera.angle = Math.min(this.camera.angle + 2, 45);
        }
    }
    
    performTrick(trickType) {
        if (this.isPerformingTrick) return;
        
        this.isPerformingTrick = true;
        this.currentTrick = trickType;
        this.comboCount++;
        
        // Calculate reward for this trick
        const reward = calculateTrickReward(trickType, this.comboCount - 1);
        this.money += reward;
        
        // Emit event that trick was performed (for UI updates)
        this.scene.events.emit('trickPerformed', {
            type: trickType,
            reward: reward,
            comboCount: this.comboCount
        });
        
        // Apply trick effects
        switch (trickType) {
            case 'LEFT_HELICOPTER':
                this.scene.tweens.add({
                    targets: this,
                    angle: -360,
                    duration: 1000,
                    onComplete: () => {
                        this.angle = 0;
                        this.isPerformingTrick = false;
                    }
                });
                break;
                
            case 'RIGHT_HELICOPTER':
                this.scene.tweens.add({
                    targets: this,
                    angle: 360,
                    duration: 1000,
                    onComplete: () => {
                        this.angle = 0;
                        this.isPerformingTrick = false;
                    }
                });
                break;
                
            case 'AIR_BRAKE':
                this.setVelocityY(this.body.velocity.y * 0.5);
                this.scene.time.delayedCall(500, () => {
                    this.isPerformingTrick = false;
                });
                break;
                
            case 'PARACHUTE':
                this.setVelocityY(this.body.velocity.y * 0.3);
                this.setGravityY(this.body.gravity.y * 0.3);
                this.scene.time.delayedCall(1500, () => {
                    this.setGravityY(CONSTANTS.GRAVITY_DOWNHILL);
                    this.isPerformingTrick = false;
                });
                break;
        }
    }
    
    takePhoto() {
        this.scene.events.emit('photoTaken', this.camera);
    }
    
    handleCollision(obstacle) {
        // Increase collision count
        this.collisionCount++;
        
        // Apply damage
        this.health -= CONSTANTS.COLLISION_DAMAGE;
        
        // Check if max collisions reached
        if (this.collisionCount >= this.maxCollisions + this.upgrades.sledDurability) {
            this.scene.events.emit('playerCrashed');
        }
        
        // Remove obstacle if it's breakable
        if (obstacle.isBreakable) {
            obstacle.destroy();
        }
        
        // Emit collision event for UI updates
        this.scene.events.emit('playerCollision', {
            health: this.health,
            collisionCount: this.collisionCount
        });
    }
    
    toggleSleddingMode(isSledding) {
        this.isSledding = isSledding;
        
        // Update physics for current mode
        if (isSledding) {
            this.setGravityY(CONSTANTS.GRAVITY_DOWNHILL);
        } else {
            this.setGravityY(CONSTANTS.GRAVITY_UPHILL);
        }
    }
    
    buyUpgrade(upgradeType) {
        const level = this.upgrades[upgradeType];
        const cost = CONSTANTS.UPGRADE_COSTS[upgradeType.toUpperCase()][level];
        
        if (this.money >= cost) {
            this.money -= cost;
            this.upgrades[upgradeType]++;
            
            // Apply upgrade effects
            this.applyUpgradeEffects(upgradeType);
            
            return true;
        }
        
        return false;
    }
    
    applyUpgradeEffects(upgradeType) {
        const level = this.upgrades[upgradeType];
        
        switch (upgradeType) {
            case 'rocketSurgery':
                // Applied in movement code
                break;
                
            case 'optimalOptics':
                this.camera.accuracy = 1 + (CONSTANTS.UPGRADE_EFFECTS.OPTIMAL_OPTICS[level - 1] / 100);
                break;
                
            case 'sledDurability':
                // Applied in collision handling
                break;
                
            case 'fancierFootwear':
                // Applied in movement code
                break;
        }
    }
    
    payLoan(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.loanAmount -= amount;
            
            // Check win condition
            if (this.loanAmount <= 0) {
                this.scene.events.emit('loanPaidOff');
            }
            
            return true;
        }
        
        return false;
    }
}