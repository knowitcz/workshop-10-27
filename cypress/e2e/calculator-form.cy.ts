import { aPolicyList, EXPIRING } from '../builders/policy';
import {
  DEFAULT_COVERAGE_PCT,
  MINIMAL_COVERAGE_FRACTION,
  RENEWAL_PREMIUM_AT_1_PCT,
  RENEWAL_PREMIUM_NO_CLAIMS,
  RENEWAL_PREMIUM_ONE_CLAIM,
} from '../support/amounts';
import calculator from '../pages/CalculatorPage';

describe('Calculator form', () => {
  beforeEach(() => {
    // Given
    calculator.open(EXPIRING, aPolicyList());
  });

  it('reports two errors on an empty form', () => {
    // Given
    cy.get(calculator.selectors.policyholderName).clear();
    cy.get(calculator.selectors.age).clear();

    // When
    calculator.calculate();

    // Then
    cy.get('.error').should('have.length', 2);
  });

  it('reports a missing policyholder name', () => {
    // Given
    cy.get(calculator.selectors.policyholderName).clear();
    cy.get(calculator.selectors.age).clear();

    // When
    calculator.calculate();

    // Then
    cy.get('.error').eq(0).should('contain', 'Policyholder name is required');
  });

  it('reports a missing age', () => {
    // Given
    cy.get(calculator.selectors.policyholderName).clear();
    cy.get(calculator.selectors.age).clear();

    // When
    calculator.calculate();

    // Then
    cy.get('.error').eq(1).should('contain', 'Age is required');
  });

  it('does not show a result when the form fails validation', () => {
    // Given
    cy.get(calculator.selectors.policyholderName).clear();
    cy.get(calculator.selectors.age).clear();

    // When
    calculator.calculate();

    // Then
    calculator.verifyNoResult();
  });

  it('calculates the premium for a policy with no previous claims', () => {
    // Given
    calculator.enterPriorClaims(0);

    // When
    calculator.calculate();

    // Then
    calculator.verifyPremium(RENEWAL_PREMIUM_NO_CLAIMS);
  });

  it('shows the policy number in the result', () => {
    // Given
    calculator.enterPriorClaims(0);

    // When
    calculator.calculate();

    // Then
    cy.get(calculator.selectors.summaryRow).eq(0).should('contain', 'POL-4821');
  });

  it('shows the number of previous claims in the result', () => {
    // Given
    calculator.enterPriorClaims(0);

    // When
    calculator.calculate();

    // Then
    cy.get(calculator.selectors.summaryRow).eq(2).should('contain', '0');
  });

  it('shows the locked-offer notice for a policy due for renewal', () => {
    // Given
    calculator.enterPriorClaims(0);

    // When
    calculator.calculate();

    // Then
    cy.expectText('.notice', 'The quote is locked for 7 days');
  });

  it('adds 15 % to the premium for one previous claim', () => {
    // When
    calculator.calculate();

    // Then
    calculator.verifyPremium(RENEWAL_PREMIUM_ONE_CLAIM);
  });

  it('hides the result after the form is reset', () => {
    // Given
    calculator.enterPriorClaims(0);
    calculator.calculate();
    calculator.verifyPremium(RENEWAL_PREMIUM_NO_CLAIMS);

    // When
    calculator.reset();

    // Then
    calculator.verifyNoResult();
  });

  it('restores the age from the policy after the form is reset', () => {
    // Given
    calculator.enterAge(30);

    // When
    calculator.reset();

    // Then
    cy.get(calculator.selectors.age).should('have.value', '22');
  });

  it('restores the previous claims from the policy after the form is reset', () => {
    // Given
    calculator.enterPriorClaims(0);

    // When
    calculator.reset();

    // Then
    cy.get(calculator.selectors.priorClaims).should('have.value', '1');
  });

  it('returns coverage to 50 % after the form is reset', () => {
    // Given
    calculator.drag(0.9);

    // When
    calculator.reset();

    // Then
    calculator.verifyCoverage(DEFAULT_COVERAGE_PCT);
  });

  it('scales the premium with the chosen coverage', () => {
    // Given
    calculator.enterPriorClaims(0);
    calculator.drag(MINIMAL_COVERAGE_FRACTION);

    // When
    calculator.calculate();

    // Then
    calculator.verifyPremium(RENEWAL_PREMIUM_AT_1_PCT);
  });
});
