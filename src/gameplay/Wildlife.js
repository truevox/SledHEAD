import { TWEAK } from '../game.js';

export class Wildlife {
    constructor(scene) {
        this.scene = scene;
        this.activeAnimal = null;
        this.lastPhotoTime = 0;
        this.spawnTimer = null;

        // Start spawning animals
        this.scheduleNextSpawn();
    }

    scheduleNextSpawn() {
        const delay = Math.random() * (TWEAK.maxSpawnTime - TWEAK.minSpawnTime) + TWEAK.minSpawnTime;
        this.spawnTimer = this.scene.time.delayedCall(delay, () => this.spawnAnimal(), [], this);
    }

    spawnAnimal() {
        if (this.activeAnimal) return;

        // Determine animal type and properties
        const type = Math.random() < 0.5 ? "bear" : "bird";
        const isBear = (type === "bear");
        
        // Calculate spawn position
        const gameWidth = this.scene.game.config.width;
        const spawnX = (gameWidth * 0.1) + (Math.random() * gameWidth * 0.9);
        const spawnY = this.scene.player.y - (this.scene.game.config.height / 2);

        // Create animal sprite/graphics
        const width = isBear ? 40 : 20;
        const height = isBear ? 40 : 20;
        const color = isBear ? 0x000000 : 0x800080;

        const animal = this.scene.add.rectangle(spawnX, spawnY, width, height, color);
        this.scene.physics.add.existing(animal, true);

        // Set up animal properties
        this.activeAnimal = {
            sprite: animal,
            type: type,
            altitude: isBear ? 20 : 80,
            state: "sitting",
            hasBeenPhotographed: false,
            idleTime: Math.random() * (TWEAK.maxIdleTime - TWEAK.minIdleTime) + TWEAK.minIdleTime,
            speed: Math.random() * (TWEAK.maxMoveSpeed - TWEAK.minMoveSpeed) + TWEAK.minMoveSpeed,
            fleeAngleActual: 0
        };

        // Set up fleeing timer
        this.scene.time.delayedCall(
            this.activeAnimal.idleTime,
            () => this.startFleeing(),
            [],
            this
        );

        // Log spawn for debugging
        console.log(`[Spawn] ${type} at (${spawnX.toFixed(2)}, ${spawnY.toFixed(2)})`);    }

    startFleeing() {
        if (!this.activeAnimal) return;
        
        this.activeAnimal.state = "fleeing";
        
        // Calculate flee angle based on spawn position
        let baseAngle;
        const halfWidth = this.scene.game.config.width / 2;
        
        if (this.activeAnimal.sprite.x > halfWidth) {
            baseAngle = Math.random() * (170 - 135) + 135;
        } else {
            baseAngle = Math.random() * (55 - 20) + 20;
        }
        
        let angleOffset = Math.random() * TWEAK.fleeAngle;
        this.activeAnimal.fleeAngleActual = baseAngle + (Math.random() < 0.5 ? -angleOffset : angleOffset);
    }

    update() {
        if (!this.activeAnimal) return;

        if (this.activeAnimal.state === "fleeing") {
            // Log fleeing start (once)
            if (!this.activeAnimal.fleeingLogOnce) {
                console.log('🦁 Animal fleeing - Type: ' + this.activeAnimal.type + ', Angle: ' + this.activeAnimal.fleeAngleActual.toFixed(2) + '°');
                this.activeAnimal.fleeingLogOnce = true;
            }

            // Update position
            const rad = this.activeAnimal.fleeAngleActual * Math.PI / 180;
            this.activeAnimal.sprite.x += Math.cos(rad) * this.activeAnimal.speed * 0.5;
            this.activeAnimal.sprite.y += Math.sin(rad) * this.activeAnimal.speed * 0.5;

            // Check if animal should despawn
            if (this.isOffscreen()) {
                this.despawnAnimal();
            }
        }
    }

    isOffscreen() {
        if (!this.activeAnimal) return false;
        
        const sprite = this.activeAnimal.sprite;
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;
        
        return (
            sprite.x < -100 ||
            sprite.x > width + 100 ||
            sprite.y > this.scene.player.y + 1000
        );
    }

    despawnAnimal() {
        if (!this.activeAnimal) return;
        
        console.log('Animal moved off screen - removed');
        this.activeAnimal.sprite.destroy();
        this.activeAnimal = null;
        
        // Schedule next spawn
        this.scheduleNextSpawn();
    }

    canTakePhoto() {
        if (!this.activeAnimal) return false;
        
        const now = this.scene.time.now;
        if (now - this.lastPhotoTime < TWEAK.photoCooldown) return false;
        
        return this.isAnimalInView();
    }

    isAnimalInView() {
        if (!this.activeAnimal) return false;

        const camera = this.scene.gameCamera;
        const povAngle = camera.getPOVAngle();
        const cameraAngle = camera.getAngle();
        
        const leftLimit = cameraAngle - povAngle / 2;
        const rightLimit = cameraAngle + povAngle / 2;
        
        const dx = this.activeAnimal.sprite.x - this.scene.player.x;
        const dy = this.activeAnimal.sprite.y - this.scene.player.y;
        let angleToAnimal = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angleToAnimal < 0) angleToAnimal += 360;
        
        return angleToAnimal >= leftLimit && angleToAnimal <= rightLimit;
    }

    evaluatePhoto() {
        if (!this.canTakePhoto()) return { success: false };

        this.lastPhotoTime = this.scene.time.now;
        const camera = this.scene.gameCamera;
        
        // Calculate photo value
        let baseValue = TWEAK.basePhotoValue;
        
        // Altitude match bonus
        const diffAlt = Math.abs(camera.getAltitudeLine() - this.activeAnimal.altitude);
        const altitudeMatchBonus = diffAlt > 50 ? 1 : 
            1 + (TWEAK.altitudeMatchMultiplier - 1) * Math.exp(-diffAlt / 15);
        
        // Center bonus
        const dx = this.activeAnimal.sprite.x - this.scene.player.x;
        const dy = this.activeAnimal.sprite.y - this.scene.player.y;
        const angleToAnimal = Math.atan2(dy, dx) * (180 / Math.PI);
        const diffAngle = Math.abs(angleToAnimal - camera.getAngle());
        
        const povAngle = camera.getPOVAngle();
        const sweetSpotPercentage = 0.10 + (this.scene.player.upgrades?.optimalOptics * 0.01 || 0);
        const sweetSpotAngle = povAngle * sweetSpotPercentage;
        
        let centerBonus = 1;
        if (diffAngle <= sweetSpotAngle) {
            centerBonus = TWEAK.centerPOVMultiplier;
        } else if (diffAngle < povAngle / 2) {
            const factor = (diffAngle - sweetSpotAngle) / (povAngle / 2 - sweetSpotAngle);
            centerBonus = 1 + (TWEAK.centerPOVMultiplier - 1) * Math.exp(-factor * 3);
        }
        
        // Movement and type bonuses
        const movementBonus = this.activeAnimal.state !== "sitting" ? TWEAK.movingAnimalMultiplier : 1;
        const animalTypeMultiplier = this.activeAnimal.type === "bear" ? TWEAK.bearMultiplier : TWEAK.birdMultiplier;
        const repeatPenalty = this.activeAnimal.hasBeenPhotographed ? TWEAK.repeatPhotoPenalty : 1;
        
        // Calculate final value
        const totalValue = Math.floor(
            baseValue * altitudeMatchBonus * centerBonus * 
            movementBonus * animalTypeMultiplier * repeatPenalty
        );
        
        // Mark animal as photographed
        this.activeAnimal.hasBeenPhotographed = true;
        
        return {
            success: true,
            value: totalValue,
            animalType: this.activeAnimal.type,
            bonuses: {
                altitude: altitudeMatchBonus,
                center: centerBonus,
                movement: movementBonus,
                type: animalTypeMultiplier,
                repeat: repeatPenalty
            }
        };
    }
}