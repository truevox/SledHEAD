// Main entry point for SledHEAD game
document.addEventListener('DOMContentLoaded', async function() {
    // Configure canvas context before anything else
    configureCanvasContext();
    
    // Create and configure the game container
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
        console.error('Game container element not found!');
        return;
    }

    // Create and configure canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    
    // Apply canvas styles
    canvas.style.imageRendering = 'pixelated';
    canvas.style.imageRendering = 'crisp-edges';
    canvas.style.imageRendering = '-webkit-optimize-contrast';
    
    // Create context with willReadFrequently
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Wait for any pending operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Create game configuration
    const config = createGameConfig();
    config.canvas = canvas;
    
    // Create game instance
    const game = new Phaser.Game(config);
    
    // Add event emitter
    game.events = new Phaser.Events.EventEmitter();
    
    // Fix for AudioContext
    function resumeAudio() {
        if (game.sound?.context?.state === 'suspended') {
            game.sound.context.resume().catch(console.error);
        }
    }
    
    // Add event listeners for audio
    const userInteractions = ['click', 'touchstart', 'keydown'];
    userInteractions.forEach(event => {
        document.addEventListener(event, function audioUnlockHandler() {
            resumeAudio();
            userInteractions.forEach(ev => {
                document.removeEventListener(ev, audioUnlockHandler);
            });
        }, { once: true });
    });
    
    // Handle browser resize
    function resizeGame() {
        if (!gameContainer || !game.canvas) return;
        
        const containerWidth = gameContainer.clientWidth || window.innerWidth;
        const containerHeight = gameContainer.clientHeight || window.innerHeight;
        const aspectRatio = config.width / config.height;
        
        let newWidth = containerWidth;
        let newHeight = containerWidth / aspectRatio;
        
        if (newHeight > containerHeight) {
            newHeight = containerHeight;
            newWidth = containerHeight * aspectRatio;
        }
        
        game.canvas.style.width = newWidth + 'px';
        game.canvas.style.height = newHeight + 'px';
    }
    
    // Set up resize handler
    window.addEventListener('resize', resizeGame);
    
    // Initial resize once game is ready
    game.events.once('ready', resizeGame);
});