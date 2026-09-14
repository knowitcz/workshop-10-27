import calculator from '../pages/CalculatorPage';

describe('Coverage slider', () => {
  beforeEach(() => {
    calculator.open();
  });

  it('INS-238 moves and reports the amount', () => {
    calculator.drag(0.62);
    calculator.verifyCoverage('62 %');
    calculator.verifyCoverage('248 000 CZK');
    cy.get(calculator.selectors.fill).should('have.attr', 'style').and('contain', '62%');
  });

  it('goes to the ends', () => {
    calculator.drag(0);
    cy.wait(200);
    calculator.verifyCoverage('0 %');
    calculator.verifyCoverage('0 CZK');
    calculator.drag(1);
    cy.wait(200);
    calculator.verifyCoverage('100 %');
    calculator.verifyCoverage('400 000 CZK');
  });

  it('clamps past the ends', () => {
    calculator.drag(1.4);
    calculator.verifyCoverage('100 %');
    calculator.drag(-0.4);
    calculator.verifyCoverage('0 %');
  });

  it('feeds the calculation', () => {
    calculator.enterPriorClaims(0);
    calculator.drag(0.62);
    calculator.calculate();
    cy.get(calculator.selectors.summaryRow).eq(1).should('contain', '62 %');
    cy.get(calculator.selectors.summaryRow).eq(1).should('contain', '248 000 CZK');
    calculator.verifyPremium('12 400 CZK');
  });
});
