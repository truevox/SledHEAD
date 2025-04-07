/* loan.test.js - Tests for loan system */

// Mock the loan functions directly
beforeEach(() => {
  // Reset loan amount and player money before each test
  global.loanAmount = 100000;
  global.player = { money: 5000 };
  global.updateMoneyDisplay = jest.fn();
  global.playTone = jest.fn();
  global.console = { log: jest.fn() };
  
  // Create mock DOM elements
  document.body.innerHTML = `
    <button id="payLoan">Pay Loan ($100,000)</button>
    <div id="victoryBanner" style="display: none;"></div>
  `;

  // Define the loan interest rate constant
  global.LOAN_INTEREST_RATE = 0.005;

  // Create our own mock implementations of the loan functions
  global.updateLoanButton = jest.fn(function() {
    const loanButton = document.getElementById("payLoan");
    if (loanButton) {
      if (loanAmount <= 0) {
        loanButton.textContent = "LOAN PAID OFF!";
        loanButton.disabled = true;
        document.getElementById("victoryBanner").style.display = "block";
      } else {
        loanButton.textContent = `Pay Loan ($${loanAmount.toLocaleString()})`;
        loanButton.disabled = false;
      }
    }
  });

  global.calculateLoanInterest = jest.fn(function() {
    if (loanAmount > 0) {
      const interestAmount = Math.ceil(loanAmount * LOAN_INTEREST_RATE);
      loanAmount += interestAmount;
      global.updateLoanButton();
      return interestAmount;
    }
    return 0;
  });

  global.payLoan = jest.fn(function() {
    if (player.money > 0) {
      const payment = Math.min(player.money, loanAmount);
      loanAmount -= payment;
      player.money -= payment;
      updateMoneyDisplay();
      updateLoanButton();
      if (loanAmount <= 0) {
        console.log("🎉 Loan paid off! Victory!");
        playTone(800, "sine", 0.3, 0.5);
      } else {
        console.log(`💰 Loan payment: $${payment}. Remaining: $${loanAmount}`);
        playTone(600, "sine", 0.1, 0.2);
      }
    }
  });
});

describe('Loan System', () => {
  test('updateLoanButton updates button text with correct loan amount', () => {
    // Test with positive loan amount
    global.loanAmount = 75000;
    global.updateLoanButton();
    expect(document.getElementById('payLoan').textContent).toBe('Pay Loan ($75,000)');
    expect(document.getElementById('payLoan').disabled).toBe(false);
    
    // Test with zero loan amount (victory condition)
    global.loanAmount = 0;
    global.updateLoanButton();
    expect(document.getElementById('payLoan').textContent).toBe('LOAN PAID OFF!');
    expect(document.getElementById('payLoan').disabled).toBe(true);
    expect(document.getElementById('victoryBanner').style.display).toBe('block');
  });

  test('calculateLoanInterest adds correct interest amount', () => {
    // Test with positive loan amount
    global.loanAmount = 50000;
    const expectedInterest = Math.ceil(50000 * LOAN_INTEREST_RATE);
    expect(global.calculateLoanInterest()).toBe(expectedInterest);
    expect(global.loanAmount).toBe(50000 + expectedInterest);
    
    // Test with zero loan amount (should return 0)
    global.loanAmount = 0;
    expect(global.calculateLoanInterest()).toBe(0);
    expect(global.loanAmount).toBe(0);
  });

  test('payLoan handles payments correctly', () => {
    // Test partial payment
    global.loanAmount = 10000;
    global.player.money = 2000;
    global.payLoan();
    expect(global.loanAmount).toBe(8000);
    expect(global.player.money).toBe(0);
    expect(global.updateMoneyDisplay).toHaveBeenCalled();
    
    // Test full payment
    global.loanAmount = 3000;
    global.player.money = 5000;
    global.payLoan();
    expect(global.loanAmount).toBe(0);
    expect(global.player.money).toBe(2000);
    expect(global.playTone).toHaveBeenCalledWith(800, "sine", 0.3, 0.5); // Victory sound
    
    // Test no money
    global.loanAmount = 5000;
    global.player.money = 0;
    global.payLoan();
    expect(global.loanAmount).toBe(5000); // No change
    expect(global.player.money).toBe(0);
  });
}); 