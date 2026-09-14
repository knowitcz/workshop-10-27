import { aPolicyList, EXPIRING } from '../builders/policy';
import {
  CHOSEN_COVERAGE,
  CHOSEN_COVERAGE_PCT,
  FULL_COVERAGE,
  FULL_COVERAGE_PCT,
  NO_COVERAGE,
  NO_COVERAGE_PCT,
  RENEWAL_PREMIUM_CHOSEN_COVERAGE,
} from '../support/amounts';
import calculator from '../pages/CalculatorPage';

describe('Coverage slider', () => {
  beforeEach(() => {
    // Given
    calculator.open(EXPIRING, aPolicyList());
  });

  it('shows the chosen coverage percentage after dragging the slider', () => {
    // When
    calculator.drag(0.62);

    // Then
    calculator.verifyCoverage(CHOSEN_COVERAGE_PCT);
  });

  it('converts coverage into an amount in crowns', () => {
    // When
    calculator.drag(0.62);

    // Then
    calculator.verifyCoverage(CHOSEN_COVERAGE);
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
    calculator.verifyCoverage(NO_COVERAGE_PCT);
  });

  it('shows no coverage amount at the left end of the slider', () => {
    // When
    calculator.drag(0);
    cy.wait(200);

    // Then
    calculator.verifyCoverage(NO_COVERAGE);
  });

  it('sets coverage to 100 % at the right end of the slider', () => {
    // When
    calculator.drag(1);
    cy.wait(200);

    // Then
    calculator.verifyCoverage(FULL_COVERAGE_PCT);
  });

  it('shows the full sum insured at 100 % coverage', () => {
    // When
    calculator.drag(1);
    cy.wait(200);

    // Then
    calculator.verifyCoverage(FULL_COVERAGE);
  });

  it('clamps coverage at 100 % when dragged past the right edge', () => {
    // When
    calculator.drag(1.4);

    // Then
    calculator.verifyCoverage(FULL_COVERAGE_PCT);
  });

  it('clamps coverage at 0 % when dragged past the left edge', () => {
    // When
    calculator.drag(-0.4);

    // Then
    calculator.verifyCoverage(NO_COVERAGE_PCT);
  });

  it('carries the chosen coverage percentage into the result', () => {
    // Given
    calculator.enterPriorClaims(0);
    calculator.drag(0.62);

    // When
    calculator.calculate();

    // Then
    cy.get(calculator.selectors.summaryRow).eq(1).should('contain', CHOSEN_COVERAGE_PCT);
  });

  it('carries the coverage amount into the result', () => {
    // Given
    calculator.enterPriorClaims(0);
    calculator.drag(0.62);

    // When
    calculator.calculate();

    // Then
    cy.get(calculator.selectors.summaryRow).eq(1).should('contain', CHOSEN_COVERAGE);
  });

  it('calculates the premium at the chosen 62 % coverage', () => {
    // Given
    calculator.enterPriorClaims(0);
    calculator.drag(0.62);

    // When
    calculator.calculate();

    // Then
    calculator.verifyPremium(RENEWAL_PREMIUM_CHOSEN_COVERAGE);
  });
});
