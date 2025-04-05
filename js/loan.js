/* loan.js - Loan Management & Victory Condition */

// Loan System
var loanAmount = 100000; // Initial loan amount

// Loan interest parameters
const LOAN_INTEREST_RATE = 0.005; // 5% interest rate per house re-entry

function updateLoanButton() {
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

// Function to calculate and apply loan interest when entering the house
function calculateLoanInterest() {
  if (loanAmount > 0) {
    // Calculate interest amount based on current loan
    const interestAmount = Math.ceil(loanAmount * LOAN_INTEREST_RATE);
    loanAmount += interestAmount;
    
    // Update the UI to show new loan amount
    updateLoanButton();
    
    // Return the interest amount for logging
    return interestAmount;
  }
  return 0;
}

function payLoan() {
  if (player.money > 0) {
    const payment = Math.min(player.money, loanAmount);
    loanAmount -= payment;
    player.money -= payment;
    updateMoneyDisplay(); // This function should update the on-screen money (see below)
    updateLoanButton();
    if (loanAmount <= 0) {
      console.log("🎉 Loan paid off! Victory!");
      playTone(800, "sine", 0.3, 0.5); // Victory sound
    } else {
      console.log(`💰 Loan payment: $${payment}. Remaining: $${loanAmount}`);
      playTone(600, "sine", 0.1, 0.2); // Payment sound
    }
  }
}