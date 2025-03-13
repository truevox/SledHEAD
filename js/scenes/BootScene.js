class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    init() {
        // Configure canvas context with willReadFrequently
        const canvas = this.game.canvas;
        if (canvas) {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            // Force a context reset
            const imageData = ctx.getImageData(0, 0, canvas.width || 1, canvas.height || 1);
            ctx.putImageData(imageData, 0, 0);
        }
    }

    preload() {
        // Load minimum assets needed for loading screen
        this.load.image('loading-background', 'assets/images/loading-background.png');
    }

    create() {
        // Add simple loading background
        const bg = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'loading-background'
        ).setOrigin(0.5);

        // Scale background to fit screen if needed
        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        // Move to PreloadScene after a short delay to ensure canvas is ready
        this.time.delayedCall(100, () => {
            this.scene.start('PreloadScene');
        });
    }
}