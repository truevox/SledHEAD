class Animal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, type);
        
        // Add the animal to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Animal properties
        this.type = type;
        this.isMoving = false;
        this.moveTimer = null;
        this.fleeTimer = null;
        this.id = Date.now() + Math.floor(Math.random() * 1000); // Unique identifier for each animal
        this.photographCount = 0;
        this.altitude = y; // Track altitude for photo scoring
        
        // Set physics properties
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        
        // Start animal behavior
        this.startBehavior();
    }
    
    startBehavior() {
        // Random movement pattern
        this.moveTimer = this.scene.time.addEvent({
            delay: Phaser.Math.Between(2000, 5000),
            callback: this.randomMove,
            callbackScope: this,
            loop: true
        });
    }
    
    randomMove() {
        // 50% chance to move or stay still
        if (Math.random() > 0.5) {
            this.isMoving = true;
            
            // Random direction and speed
            const direction = Math.random() > 0.5 ? 1 : -1;
            const speed = CONSTANTS.ANIMAL_SPEEDS[this.type] || 50;
            
            // Set velocity
            this.setVelocityX(direction * speed);
            
            // Flip sprite based on direction
            this.flipX = direction < 0;
            
            // Stop moving after a random time
            this.scene.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
                this.setVelocityX(0);
                this.isMoving = false;
            });
        } else {
            this.setVelocityX(0);
            this.isMoving = false;
        }
    }
    
    flee() {
        // Animal runs away after being photographed
        this.isMoving = true;
        
        // Determine flee direction (away from player)
        const player = this.scene.player;
        const fleeDirection = player.x > this.x ? -1 : 1;
        const fleeSpeed = (CONSTANTS.ANIMAL_SPEEDS[this.type] || 50) * 1.5;
        
        // Set velocity
        this.setVelocityX(fleeDirection * fleeSpeed);
        
        // Flip sprite based on direction
        this.flipX = fleeDirection < 0;
        
        // Remove existing flee timer if any
        if (this.fleeTimer) {
            this.fleeTimer.remove();
        }
        
        // Destroy animal after fleeing
        this.fleeTimer = this.scene.time.delayedCall(3000, () => {
            this.destroy();
        });
    }
    
    photographed() {
        // Increment photo count
        this.photographCount++;
        
        // After 2 photos, animal will flee
        if (this.photographCount >= 2) {
            this.flee();
        }
    }
    
    update() {
        // Make sure animal stays within bounds
        if (this.x <= 0 || this.x >= this.scene.physics.world.bounds.width) {
            this.setVelocityX(-this.body.velocity.x);
            this.flipX = !this.flipX;
        }
    }
}