import { TWEAK } from '../game.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Initially create as a red rectangle (can be replaced with sprite later)
        super(scene, x, y, 'player');
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Player properties
        this.width = 20;
        this.height = 20;
        this.collisions = 0;
        this.money = TWEAK.starterCash;
        this.bestTime = Infinity;

        // Movement properties
        this.xVel = 0;
        this.isJumping = false;
        this.canJump = true;
        this.jumpTimer = 0;
        this.jumpDuration = 0;
        this.jumpHeightFactor = 1;
        this.hasReachedJumpPeak = false;

        // Trick system properties
        this.currentTrick = null;
        this.trickTimer = 0;
        this.trickRotation = 0;
        this.trickOffset = 0;
        this.lastTrick = null;
        this.trickChainCount = 0;
        this.trickCooldowns = {
            leftHelicopter: 0,
            rightHelicopter: 0,
            airBrake: 0,
            parachute: 0
        };

        // Configure physics body
        this.body.setSize(20, 20);
        this.body.setCollideWorldBounds(true);
    }

    update(cursors, keys) {
        // Handle horizontal movement
        if (keys.a.isDown) {
            this.xVel -= TWEAK.baseHorizontalAccel;
        }
        if (keys.d.isDown) {
            this.xVel += TWEAK.baseHorizontalAccel;
        }

        // Apply friction and clamp velocity
        this.xVel *= TWEAK.baseFriction;
        this.xVel = Phaser.Math.Clamp(this.xVel, -TWEAK.baseMaxXVel, TWEAK.baseMaxXVel);
        
        // Update position
        this.x += this.xVel;

        // Handle jumping
        if (keys.space.isDown && !this.isJumping && this.canJump) {
            this.startJump();
        }

        // Update jump if active
        if (this.isJumping) {
            this.updateJump();
        }

        // Handle trick inputs
        if (this.isJumping && !this.currentTrick) {
            if (cursors.left.isDown) {
                this.startTrick('leftHelicopter');
            } else if (cursors.right.isDown) {
                this.startTrick('rightHelicopter');
            } else if (cursors.up.isDown) {
                this.startTrick('airBrake');
            } else if (cursors.down.isDown) {
                this.startTrick('parachute');
            }
        }

        // Update active trick
        if (this.currentTrick) {
            this.updateTrick();
        }

        // Reset jump ability when space is released
        if (!keys.space.isDown) {
            this.canJump = true;
        }
    }

    startJump() {
        this.isJumping = true;
        this.canJump = false;
        this.jumpTimer = 0;
        this.jumpHeightFactor = 1;
        this.jumpDuration = TWEAK.jumpBaseAscent;
        this.hasReachedJumpPeak = false;

        // Emit jump start event for sound effects
        this.scene.events.emit('jumpStart');
    }

    updateJump() {
        this.jumpTimer += this.scene.game.loop.delta;
        const progress = this.jumpTimer / this.jumpDuration;

        if (!this.hasReachedJumpPeak && progress >= 0.5) {
            this.hasReachedJumpPeak = true;
            this.scene.events.emit('jumpPeak');
        }

        if (progress >= 1) {
            this.endJump();
        } else {
            // Calculate jump scale
            const scale = 1 + (TWEAK.jumpPeakScale - 1) * Math.sin(Math.PI * progress) * this.jumpHeightFactor;
            this.setScale(scale);
        }
    }

    endJump() {
        this.isJumping = false;
        this.jumpTimer = 0;
        this.hasReachedJumpPeak = false;
        this.currentTrick = null;
        this.trickTimer = 0;
        this.trickRotation = 0;
        this.trickOffset = 0;
        this.setScale(1);
        
        // Emit jump end event
        this.scene.events.emit('jumpEnd');
    }

    startTrick(trickName) {
        if (this.currentTrick) return;

        this.currentTrick = trickName;
        this.trickTimer = 0;
        this.trickRotation = 0;
        this.trickOffset = 0;

        // Calculate cooldown penalty
        const now = this.scene.time.now;
        const cooldownEnd = this.trickCooldowns[trickName] || 0;
        const timeLeft = Math.max(0, cooldownEnd - now);
        this.currentTrickValueMultiplier = timeLeft > 0 ?
            Math.max(0.1, 1 - (timeLeft / TWEAK._trickCooldown)) : 1;

        // Update cooldown timestamp
        this.trickCooldowns[trickName] = now + TWEAK._trickCooldown;

        // Emit trick start event
        this.scene.events.emit('trickStart', { trick: trickName });
    }

    updateTrick() {
        this.trickTimer += this.scene.game.loop.delta;
        const trickProgress = this.trickTimer / (TWEAK._trickBaseDuration * TWEAK._trickTimeMultiplier);

        // Update trick-specific animations
        switch (this.currentTrick) {
            case "leftHelicopter":
                this.trickRotation -= TWEAK._trickRotationSpeed * (this.scene.game.loop.delta / 1000);
                this.setRotation(this.trickRotation);
                break;
            case "rightHelicopter":
                this.trickRotation += TWEAK._trickRotationSpeed * (this.scene.game.loop.delta / 1000);
                this.setRotation(this.trickRotation);
                break;
            case "airBrake":
            case "parachute":
                this.trickOffset = TWEAK._trickOffsetDistance * Math.sin(Math.PI * trickProgress);
                // Visual offset handled in render
                break;
        }

        // Check for trick completion
        if (trickProgress >= 1) {
            this.completeTrick();
        }
    }

    completeTrick() {
        // Calculate money earned
        let trickMoney = TWEAK._trickMoneyBase;
        let chainBonus = 1;

        if (this.lastTrick && this.lastTrick !== this.currentTrick) {
            this.trickChainCount++;
            chainBonus = Math.pow(TWEAK._trickChainMultiplier, this.trickChainCount);
            trickMoney *= chainBonus;
        } else {
            this.trickChainCount = 0;
        }

        // Apply cooldown penalty
        trickMoney *= this.currentTrickValueMultiplier;
        const finalMoney = Math.floor(trickMoney);

        // Award money
        this.money += finalMoney;

        // Emit trick complete event
        this.scene.events.emit('trickComplete', {
            trick: this.currentTrick,
            money: finalMoney,
            chainBonus: chainBonus
        });

        // Reset trick state
        this.lastTrick = this.currentTrick;
        this.currentTrick = null;
        this.trickTimer = 0;
        this.trickRotation = 0;
        this.setRotation(0);
        this.trickOffset = 0;
    }

    handleCollision() {
        this.collisions++;
        this.body.velocity.y = -TWEAK.bounceImpulse;
        
        // Emit collision event
        this.scene.events.emit('playerCollision', { collisions: this.collisions });
    }
}