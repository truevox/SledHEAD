export class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.mountainHeight = 200000; // Same as original
        this.obstacles = scene.physics.add.staticGroup();
        this.generateTerrain();
    }

    generateTerrain() {
        const obstacleCount = 4000; // Same as original

        // Create obstacles
        for (let i = 0; i < obstacleCount; i++) {
            const x = Math.random() * (this.scene.game.config.width - 70) + 10;
            const y = Math.random() * this.mountainHeight;
            const width = 30 + Math.random() * 40;
            const height = 10 + Math.random() * 20;

            // Create rectangle obstacle
            const obstacle = this.scene.add.rectangle(x, y, width, height, 0x808080);
            this.obstacles.add(obstacle);

            // Configure physics body
            obstacle.body.setSize(width, height);
            obstacle.body.updateFromGameObject();
        }

        // Sort obstacles by Y position for proper rendering
        this.obstacles.getChildren().sort((a, b) => a.y - b.y);
    }

    // Get visible obstacles based on camera position
    getVisibleObstacles() {
        const camera = this.scene.cameras.main;
        const visibleBottom = camera.scrollY + camera.height + 50;
        const visibleTop = camera.scrollY - 50;

        return this.obstacles.getChildren().filter(obstacle => 
            obstacle.y >= visibleTop && obstacle.y <= visibleBottom
        );
    }

    // Method to check if a point is within bounds
    isInBounds(x, y) {
        return x >= 0 && 
               x <= this.scene.game.config.width && 
               y >= 0 && 
               y <= this.mountainHeight;
    }
}