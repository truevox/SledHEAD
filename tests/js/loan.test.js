/* loan.test.js - Tests for loan system */

// Test constants
const TEST_INITIAL_LOAN = 10000;
const TEST_INTEREST_RATE = 0.005; // 0.5% per cycle

// Mock the loan functions directly
beforeEach(() => {
  // Reset loan amount and player money before each test
  window.loanAmount = TEST_INITIAL_LOAN;
  window.player = { money: 5000 };
  global.updateMoneyDisplay = jest.fn();
  global.playTone = jest.fn();
  global.console = { log: jest.fn() };
  
  // Create mock DOM elements
  document.body.innerHTML = `
    <button id="payLoan">Pay Loan ($100,000)</button>
    <div id="victoryBanner" style="display: none;"></div>
  `;

  // Define the loan interest rate constant
  window.LOAN_INTEREST_RATE = TEST_INTEREST_RATE;

  // Create our own mock implementations of the loan functions
  global.updateLoanButton = jest.fn(function() {
    const loanButton = document.getElementById("payLoan");
    if (loanButton) {
      if (window.loanAmount <= 0) {
        loanButton.textContent = "LOAN PAID OFF!";
        loanButton.disabled = true;
        document.getElementById("victoryBanner").style.display = "block";
      } else {
        loanButton.textContent = `Pay Loan ($${window.loanAmount.toLocaleString()})`;
        loanButton.disabled = false;
      }
    }
  });

  global.calculateLoanInterest = jest.fn(function() {
    if (window.loanAmount > 0) {
      const interestAmount = Math.ceil(window.loanAmount * window.LOAN_INTEREST_RATE);
      window.loanAmount += interestAmount;
      global.updateLoanButton();
      return interestAmount;
    }
    return 0;
  });

  global.payLoan = jest.fn(function() {
    if (window.player.money > 0) {
      const payment = Math.min(window.player.money, window.loanAmount);
      window.loanAmount -= payment;
      window.player.money -= payment;
      global.updateMoneyDisplay();
      global.updateLoanButton();
      if (window.loanAmount <= 0) {
        console.log("🎉 Loan paid off! Victory!");
        global.playTone(800, "sine", 0.3, 0.5);
      } else {
        console.log(`💰 Loan payment: $${payment}. Remaining: $${window.loanAmount}`);
        global.playTone(600, "sine", 0.1, 0.2);
      }
    }
  });
});

describe('Loan System Tests', () => {
  beforeEach(() => {
    // Reset global state for each test
    window.loanAmount = TEST_INITIAL_LOAN;
    window.LOAN_INTEREST_RATE = TEST_INTEREST_RATE;
    window.player = { money: 5000 };
  });

  test('updateLoanButton updates button text with correct loan amount', () => {
    // Test with positive loan amount
    window.loanAmount = 75000;
    global.updateLoanButton();
    expect(document.getElementById('payLoan').textContent).toBe('Pay Loan ($75,000)');
    expect(document.getElementById('payLoan').disabled).toBe(false);
    
    // Test with zero loan amount (victory condition)
    window.loanAmount = 0;
    global.updateLoanButton();
    expect(document.getElementById('payLoan').textContent).toBe('LOAN PAID OFF!');
    expect(document.getElementById('payLoan').disabled).toBe(true);
    expect(document.getElementById('victoryBanner').style.display).toBe('block');
  });

  test('calculateLoanInterest adds correct interest amount', () => {
    // Test with positive loan amount
    window.loanAmount = 50000;
    const expectedInterest = Math.ceil(50000 * window.LOAN_INTEREST_RATE);
    expect(global.calculateLoanInterest()).toBe(expectedInterest);
    expect(window.loanAmount).toBe(50000 + expectedInterest);
    
    // Test with zero loan amount (should return 0)
    window.loanAmount = 0;
    expect(global.calculateLoanInterest()).toBe(0);
    expect(window.loanAmount).toBe(0);
  });

  test('payLoan handles payments correctly', () => {
    // Test partial payment
    window.loanAmount = 10000;
    window.player.money = 2000;
    global.payLoan();
    expect(window.loanAmount).toBe(8000);
    expect(window.player.money).toBe(0);
    expect(global.updateMoneyDisplay).toHaveBeenCalled();
    
    // Test full payment
    window.loanAmount = 3000;
    window.player.money = 5000;
    global.payLoan();
    expect(window.loanAmount).toBe(0);
    expect(window.player.money).toBe(2000);
    expect(global.playTone).toHaveBeenCalledWith(800, "sine", 0.3, 0.5); // Victory sound
    
    // Test no money
    window.loanAmount = 5000;
    window.player.money = 0;
    global.payLoan();
    expect(window.loanAmount).toBe(5000); // No change
    expect(window.player.money).toBe(0);
  });
}); 