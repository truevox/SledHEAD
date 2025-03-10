// src/mechanics/LoanSystem.js
import { player } from '../gameplay/Player.js';
import { updateMoneyDisplay, playTone } from '../utils/UIUtils.js';

// Initial loan amount
let loanAmount = 100000;

/**
 * Updates the loan payment button text and state based on the current loan amount
 */
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
      // Never disable the button as long as there's a loan to pay
      loanButton.disabled = false;
    }
  }
}

/**
 * Processes a loan payment using the player's available money
 */
export function payLoan() {
  const timestamp = new Date().toISOString();
  
  if (player.money > 0) {
    const payment = Math.min(player.money, loanAmount);
    const previousLoan = loanAmount;
    loanAmount -= payment;
    player.money -= payment;
    const percentPaid = ((previousLoan - loanAmount) / previousLoan * 100).toFixed(1);
    
    updateMoneyDisplay();
    updateLoanButton();
    
    if (loanAmount <= 0) {
      console.log(`[${timestamp}] 🎉 LOAN PAID OFF: Final payment=$${payment.toLocaleString()}, Total debt cleared=$${previousLoan.toLocaleString()}, Remaining money=$${player.money.toLocaleString()}`);
      console.log(`[${timestamp}] 🏆 VICTORY: Player has successfully paid off the entire loan!`);
      playTone(800, "sine", 0.3, 0.5); // Victory sound
    } else {
      console.log(`[${timestamp}] 💰 LOAN PAYMENT: Amount=$${payment.toLocaleString()}, Remaining debt=$${loanAmount.toLocaleString()} (${percentPaid}% of payment), Player money=$${player.money.toLocaleString()}`);
      playTone(600, "sine", 0.1, 0.2); // Payment sound
    }
  } else {
    console.log(`[${timestamp}] ⚠️ LOAN PAYMENT FAILED: Insufficient funds (Player money=$${player.money.toLocaleString()}, Loan amount=$${loanAmount.toLocaleString()})`);
  }
}

/**
 * Returns the current loan amount
 */
export function getLoanAmount() {
  return loanAmount;
}

/**
 * Sets up the loan payment button and initializes the loan system
 */
export function initLoanSystem() {
  const loanButton = document.getElementById("payLoan");
  if (loanButton) {
    loanButton.addEventListener("click", payLoan);
    updateLoanButton();
  }
}
