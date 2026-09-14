import calculator from '../pages/CalculatorPage';

describe('Coverage slider', () => {
  beforeEach(() => {
    // Given
    calculator.open();
  });

  it('shows the chosen coverage percentage after dragging the slider', () => {
    // When
    calculator.drag(0.62);

    // Then
    calculator.verifyCoverage('62 %');
  });

  it('converts coverage into an amount in crowns', () => {
    // When
    calculator.drag(0.62);

    // Then
    calculator.verifyCoverage('248 000 CZK');
  });

  it('moves the slider fill to the chosen percentage', () => {
    // When
    calculator.drag(0.62);

    // Then
    cy.get(calculator.selectors.fill).should('have.attr', 'style').and('contain', '62%');
  });

  it('sets coverage to 0 % at the left end of the slider', () => {
    // When
    calculator.drag(0);
    cy.wait(200);

    // Then
    calculator.verifyCoverage('0 %');
  });

  it('shows no coverage amount at the left end of the slider', () => {
    // When
    calculator.drag(0);
    cy.wait(200);

    // Then
    calculator.verifyCoverage('0 CZK');
  });

  it('sets coverage to 100 % at the right end of the slider', () => {
    // When
    calculator.drag(1);
    cy.wait(200);

    // Then
    calculator.verifyCoverage('100 %');
  });

  it('shows the full sum insured at 100 % coverage', () => {
    // When
    calculator.drag(1);
    cy.wait(200);

    // Then
    calculator.verifyCoverage('400 000 CZK');
  });

  it('clamps coverage at 100 % when dragged past the right edge', () => {
    // When
    calculator.drag(1.4);

    // Then
    calculator.verifyCoverage('100 %');
  });

  it('clamps coverage at 0 % when dragged past the left edge', () => {
    // When
    calculator.drag(-0.4);

    // Then
    calculator.verifyCoverage('0 %');
  });

  it('carries the chosen coverage percentage into the result', () => {
    // Given
    calculator.enterPriorClaims(0);
    calculator.drag(0.62);

    // When
    calculator.calculate();

    // Then
    cy.get(calculator.selectors.summaryRow).eq(1).should('contain', '62 %');
  });

  it('carries the coverage amount into the result', () => {
    // Given
    calculator.enterPriorClaims(0);
    calculator.drag(0.62);

    // When
    calculator.calculate();

    // Then
    cy.get(calculator.selectors.summaryRow).eq(1).should('contain', '248 000 CZK');
  });

  it('calculates the premium at the chosen 62 % coverage', () => {
    // Given
    calculator.enterPriorClaims(0);
    calculator.drag(0.62);

    // When
    calculator.calculate();

    // Then
    calculator.verifyPremium('12 400 CZK');
  });
});
