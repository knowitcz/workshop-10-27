import calculator from '../pages/CalculatorPage';

describe('Calculator form', () => {
  beforeEach(() => {
    calculator.open();
  });

  it('validation', () => {
    cy.get(calculator.selectors.policyholderName).clear();
    cy.get(calculator.selectors.age).clear();
    calculator.calculate();
    cy.get('.error').should('have.length', 2);
    cy.get('.error').eq(0).should('contain', 'Policyholder name is required');
    cy.get('.error').eq(1).should('contain', 'Age is required');
    calculator.verifyNoResult();
  });

  it('INS-231 calculates and shows the result', () => {
    calculator.enterPriorClaims(0);
    calculator.calculate();
    calculator.verifyPremium('10 000 CZK');
    cy.get(calculator.selectors.summaryRow).eq(0).should('contain', 'POL-4821');
    cy.get(calculator.selectors.summaryRow).eq(2).should('contain', '0');
    cy.expectText('.notice', 'The quote is locked for 7 days');
  });

  it('previous claims raise it', () => {
    calculator.calculate();
    calculator.verifyPremium('11 500 CZK');
  });

  it('test2', () => {
    calculator.enterPriorClaims(0);
    calculator.enterAge(30);
    calculator.calculate();
    calculator.verifyPremium('10 000 CZK');
    calculator.reset();
    calculator.verifyNoResult();
    cy.get(calculator.selectors.age).should('have.value', '22');
    cy.get(calculator.selectors.priorClaims).should('have.value', '1');
    calculator.verifyCoverage('50 %');
  });

  it('the coverage drives the premium', () => {
    calculator.enterPriorClaims(0);
    calculator.drag(0.01);
    calculator.calculate();
    calculator.verifyPremium('200 CZK');
  });
});
