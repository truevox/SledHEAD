/* loan.js - Loan Management System */
import { player } from './player.js';

// Loan amount and management
let loanAmount = 100000;

// Function to update the loan payment button text
function updateLoanButton() {
    const payLoanBtn = document.getElementById("payLoan");
    if (payLoanBtn) {
        if (loanAmount <= 0) {
            payLoanBtn.textContent = "Loan Paid Off!";
            payLoanBtn.disabled = true;
            // Show victory banner
            document.getElementById("victoryBanner").style.display = "block";
            setTimeout(() => {
                document.getElementById("victoryBanner").style.display = "none";
            }, 5000);
        } else {
            payLoanBtn.textContent = `Pay Loan ($${loanAmount.toLocaleString()})`;
            payLoanBtn.disabled = player.money < 1000;
        }
    }
}

// Function to pay down the loan
function payLoan() {
    if (player.money >= 1000 && loanAmount > 0) {
        const paymentAmount = Math.min(1000, player.money, loanAmount);
        loanAmount -= paymentAmount;
        player.money -= paymentAmount;
        console.log(`Paid $${paymentAmount} toward loan. Remaining: $${loanAmount}`);
        updateLoanButton();
    }
}

// Export loan-related functions
export { updateLoanButton, payLoan, loanAmount };