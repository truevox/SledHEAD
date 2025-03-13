class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, type);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // true makes it static
        
        // Obstacle properties
        this.type = type;
        this.isBreakable = ['snowPile', 'smallBranch'].includes(type);
        
        // Set size based on type
        this.setDisplaySize(this.getSize().width, this.getSize().height);
        
        // Custom collider size
        const colliderSize = this.getColliderSize();
        this.body.setSize(colliderSize.width, colliderSize.height);
        this.body.setOffset(colliderSize.offsetX, colliderSize.offsetY);
    }
    
    getSize() {
        switch (this.type) {
            case 'rock':
                return { width: 50, height: 40 };
            case 'tree':
                return { width: 60, height: 120 };
            case 'snowPile':
                return { width: 60, height: 30 };
            case 'smallBranch':
                return { width: 40, height: 15 };
            case 'jumpRamp':
                return { width: 80, height: 40 };
            default:
                return { width: 40, height: 40 };
        }
    }
    
    getColliderSize() {
        switch (this.type) {
            case 'rock':
                return { width: 40, height: 30, offsetX: 5, offsetY: 10 };
            case 'tree':
                return { width: 30, height: 110, offsetX: 15, offsetY: 10 };
            case 'snowPile':
                return { width: 55, height: 20, offsetX: 2, offsetY: 10 };
            case 'smallBranch':
                return { width: 35, height: 10, offsetX: 2, offsetY: 5 };
            case 'jumpRamp':
                return { width: 70, height: 30, offsetX: 5, offsetY: 10 };
            default:
                return { width: 35, height: 35, offsetX: 2, offsetY: 5 };
        }
    }
    
    handleCollision(player) {
        // Handle jump ramp - give player a boost
        if (this.type === 'jumpRamp') {
            player.setVelocityY(CONSTANTS.PLAYER_JUMP_VELOCITY * 1.5);
            player.isInAir = true;
            return false; // Not a crash collision
        }
        
        // All other obstacles cause a collision event
        return true;
    }
}