import { EXPIRING_POLICY } from '../builders/policy';
import { calculator } from '../pages/CalculatorPage';
import { confirmation } from '../pages/ConfirmationPage';
import { policyList } from '../pages/PolicyListPage';
import {
  DEFAULT_COVERAGE,
  DEFAULT_COVERAGE_PCT,
  EXPIRING_IN_DAYS,
  EXPIRING_POLICYHOLDER,
  QUOTE_LOCK_NOTICE,
  QUOTE_VALID_ON_ISSUE,
  RENEWAL_PREMIUM_NO_CLAIMS,
} from '../support/amounts';

/**
 * The confirmation screen through the real journey. What the screen shows for a
 * given stored quote — including an expired one, which this journey cannot
 * produce — is covered faster in cypress/components/QuoteSummary.cy.tsx.
 */

describe('Confirmation screen', () => {
  function reviewExpiringPolicy() {
    calculator.visit(EXPIRING_POLICY, { renewalInDays: EXPIRING_IN_DAYS });
    calculator.enterPriorClaims(0);
    calculator.calculate();
    calculator.continueToConfirmation();
  }

  it('shows the renewal confirmation heading', () => {
    // Given
    reviewExpiringPolicy();

    // Then
    confirmation.heading().should('contain', 'Confirm renewal');
  });

  it('shows the policyholder name on the confirmation', () => {
    // Given
    reviewExpiringPolicy();

    // Then
    confirmation.policyholderName().should('contain', EXPIRING_POLICYHOLDER);
  });

  it('shows the policyholder age on the confirmation', () => {
    // Given
    reviewExpiringPolicy();

    // Then
    confirmation.age().should('contain', '22');
  });

  it('shows the country and region on the confirmation', () => {
    // Given
    reviewExpiringPolicy();

    // Then
    confirmation.region().should('contain', 'Czech Republic — Prague');
  });

  it('shows the policy number on the confirmation', () => {
    // Given
    reviewExpiringPolicy();

    // Then
    confirmation.policyNo().should('contain', 'POL-4821');
  });

  it('shows the chosen coverage percentage on the confirmation', () => {
    // Given
    reviewExpiringPolicy();

    // Then
    confirmation.coverage().should('contain', DEFAULT_COVERAGE_PCT);
  });

  it('shows the coverage amount on the confirmation', () => {
    // Given
    reviewExpiringPolicy();

    // Then
    confirmation.coverage().should('contain', DEFAULT_COVERAGE);
  });

  it('shows the renewal premium on the confirmation', () => {
    // Given
    reviewExpiringPolicy();

    // Then
    confirmation.premium().should('contain', RENEWAL_PREMIUM_NO_CLAIMS);
  });

  it('shows the locked-offer notice for a policy due for renewal', () => {
    // Given
    reviewExpiringPolicy();

    // Then
    confirmation.notice().should('contain', QUOTE_LOCK_NOTICE);
  });

  it('says the quote can be confirmed for the whole 7-day lock', () => {
    // Given
    reviewExpiringPolicy();

    // Then
    confirmation.validity().should('contain', QUOTE_VALID_ON_ISSUE);
  });

  it('returns to the calculator after clicking Back', () => {
    // Given
    reviewExpiringPolicy();

    // When
    confirmation.back();

    // Then
    calculator.heading().should('contain', 'POL-4821');
  });

  it('does not complete the renewal until the user confirms it', () => {
    // Given
    reviewExpiringPolicy();
    confirmation.back();

    // When
    calculator.back();

    // Then
    policyList.row(EXPIRING_POLICY).status().should('contain', 'Expiring');
  });

  it('renews the policy after confirmation', () => {
    // Given
    reviewExpiringPolicy();

    // When
    confirmation.confirm();

    // Then
    policyList.row(EXPIRING_POLICY).status().should('contain', 'Renewed');
  });
});
