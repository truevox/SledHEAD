import { Events, GameState } from '../game';

// Loan system
let loanAmount = 100000; // Initial loan amount

export function updateLoanButton() {
    const loanButton = document.getElementById("payLoan");
    if (loanButton) {
        if (loanAmount <= 0) {
            loanButton.textContent = "LOAN PAID OFF!";
            loanButton.disabled = true;
            // Show victory banner
            document.getElementById("victoryBanner").style.display = "block";
        } else {
            loanButton.textContent = `Pay Loan ($${loanAmount.toLocaleString()})`;
            loanButton.disabled = false;
        }
    }
}

export function payLoan(player) {
    if (player.money > 0) {
        const payment = Math.min(player.money, loanAmount);
        loanAmount -= payment;
        player.money -= payment;
        updateLoanButton();
        if (loanAmount <= 0) {
            console.log("🎉 Loan paid off! Victory!");
            window.playTone(800, "sine", 0.3, 0.5); // Victory sound
        } else {
            console.log(`💰 Loan payment: $${payment}. Remaining: $${loanAmount}`);
            window.playTone(600, "sine", 0.1, 0.2); // Payment sound
        }
    }
}

// Initialize UI event listeners
export function initializeUI(game) {
    // Start game button
    document.getElementById("startGame").addEventListener("click", () => {
        console.log("Start button clicked - transitioning to DownhillScene");
        window.unlockAudioContext();
        window.playStartGameSound();
        game.scene.stop('HouseScene');
        game.scene.start('DownhillScene');
        document.getElementById("upgrade-menu").style.display = "none";
        document.getElementById("game-screen").style.display = "block";
    });

    // Pay loan button
    document.getElementById("payLoan").addEventListener("click", () => {
        const currentScene = game.scene.getScene('HouseScene');
        if (currentScene && currentScene.player) {
            payLoan(currentScene.player);
        }
    });

    // Initialize loan button state
    updateLoanButton();
}