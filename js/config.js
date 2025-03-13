// Game configuration
function createGameConfig() {
    // Create canvas with willReadFrequently
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    return {
        type: Phaser.CANVAS,
        width: 1280,
        height: 720,
        parent: 'game-container',
        canvas: canvas,
        canvasStyle: {
            willReadFrequently: true,
            imageRendering: 'crisp-edges'
        },
        backgroundColor: '#000000',
        scene: [
            BootScene,
            PreloadScene,
            MenuScene,
            GameScene,
            UphillScene,
            DownhillScene,
            HouseScene,
            UIScene
        ],
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        render: {
            antialias: false,
            pixelArt: true,
            roundPixels: true,
            transparent: false,
            clearBeforeRender: true
        }
    };
}