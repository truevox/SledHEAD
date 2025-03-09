import { config } from './game.js';

// Initialize audio context for sound effects
let audioCtx;

// Ensure Web Audio API is unlocked
window.unlockAudioContext = function() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
};

// Sound effect utility
window.playTone = function(frequency = 440, type = "sine", duration = 0.5, volume = 0.3) {
    window.unlockAudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
};

// Sound effects
window.playStartGameSound = () => window.playTone(440, "triangle", 0.5);
window.playCrashSound = () => {
    window.unlockAudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
};
window.playRockHitSound = () => window.playTone(200, "square", 0.2);
window.playMoneyGainSound = () => window.playTone(1000, "sine", 0.15, 0.2);
window.playTrickCompleteSound = () => window.playTone(600, "sine", 0.1, 0.2);

// Create game instance
const game = new Phaser.Game(config);

// Initialize UI and add button handlers
document.getElementById("startGame").addEventListener("click", () => {
    console.log("Start button clicked - transitioning to DownhillScene");
    window.unlockAudioContext();
    window.playStartGameSound();
    game.scene.start('DownhillScene');
    document.getElementById("upgrade-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
});

// Handle loan payment
document.getElementById("payLoan").addEventListener("click", () => {
    const currentScene = game.scene.getScene('HouseScene');
    if (currentScene && currentScene.player) {
        const payment = Math.min(currentScene.player.money, 100000);
        currentScene.player.money -= payment;
        // Update money display
        document.getElementById("moneyText").textContent = `Money: $${currentScene.player.money}`;
        // Add bounce effect
        document.getElementById("moneyText").classList.add("money-increase");
        setTimeout(() => {
            document.getElementById("moneyText").classList.remove("money-increase");
        }, 200);
    }
});