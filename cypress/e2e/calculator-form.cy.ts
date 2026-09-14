import { EXPIRING_POLICY } from '../builders/policy';
import { calculator } from '../pages/CalculatorPage';
import {
  DEFAULT_COVERAGE_PCT,
  MINIMAL_COVERAGE_FRACTION,
  RENEWAL_PREMIUM_AT_1_PCT,
  RENEWAL_PREMIUM_NO_CLAIMS,
  RENEWAL_PREMIUM_ONE_CLAIM,
} from '../support/amounts';

describe('Calculator form', () => {
  beforeEach(() => {
    // Given
    calculator.visit(EXPIRING_POLICY);
  });

  it('reports two errors on an empty form', () => {
    // Given
    calculator.policyholderName().clear();
    calculator.age().clear();

    // When
    calculator.calculate();

    // Then
    calculator.errors().should('have.length', 2);
  });

  it('reports a missing policyholder name', () => {
    // Given
    calculator.policyholderName().clear();
    calculator.age().clear();

    // When
    calculator.calculate();

    // Then
    calculator.errors().eq(0).should('contain', 'Policyholder name is required');
  });

  it('reports a missing age', () => {
    // Given
    calculator.policyholderName().clear();
    calculator.age().clear();

    // When
    calculator.calculate();

    // Then
    calculator.errors().eq(1).should('contain', 'Age is required');
  });

  it('does not show a result when the form fails validation', () => {
    // Given
    calculator.policyholderName().clear();
    calculator.age().clear();

    // When
    calculator.calculate();

    // Then
    calculator.premium().should('not.exist');
  });

  it('calculates the premium for a policy with no previous claims', () => {
    // Given
    calculator.enterPriorClaims(0);

    // When
    calculator.calculate();

    // Then
    calculator.premium().should('contain', RENEWAL_PREMIUM_NO_CLAIMS);
  });

  it('shows the policy number in the result', () => {
    // Given
    calculator.enterPriorClaims(0);

    // When
    calculator.calculate();

    // Then
    calculator.summaryPolicy().should('contain', 'POL-4821');
  });

  it('shows the number of previous claims in the result', () => {
    // Given
    calculator.enterPriorClaims(0);

    // When
    calculator.calculate();

    // Then
    calculator.summaryClaims().should('contain', '0');
  });

  it('shows the locked-offer notice for a policy due for renewal', () => {
    // Given
    calculator.enterPriorClaims(0);

    // When
    calculator.calculate();

    // Then
    calculator.notice().should('contain', 'The quote is locked for 7 days');
  });

  it('adds 15 % to the premium for one previous claim', () => {
    // When
    calculator.calculate();

    // Then
    calculator.premium().should('contain', RENEWAL_PREMIUM_ONE_CLAIM);
  });

  it('hides the result after the form is reset', () => {
    // Given
    calculator.enterPriorClaims(0);
    calculator.calculate();
    calculator.premium().should('contain', RENEWAL_PREMIUM_NO_CLAIMS);

    // When
    calculator.reset();

    // Then
    calculator.premium().should('not.exist');
  });

  it('restores the age from the policy after the form is reset', () => {
    // Given
    calculator.enterAge(30);

    // When
    calculator.reset();

    // Then
    calculator.age().should('have.value', '22');
  });

  it('restores the previous claims from the policy after the form is reset', () => {
    // Given
    calculator.enterPriorClaims(0);

    // When
    calculator.reset();

    // Then
    calculator.priorClaims().should('have.value', '1');
  });

  it('returns coverage to 50 % after the form is reset', () => {
    // Given
    calculator.setCoverage(0.9);

    // When
    calculator.reset();

    // Then
    calculator.coverageReadout().should('contain', DEFAULT_COVERAGE_PCT);
  });

  it('scales the premium with the chosen coverage', () => {
    // Given
    calculator.enterPriorClaims(0);
    calculator.setCoverage(MINIMAL_COVERAGE_FRACTION);

    // When
    calculator.calculate();

    // Then
    calculator.premium().should('contain', RENEWAL_PREMIUM_AT_1_PCT);
  });
});
