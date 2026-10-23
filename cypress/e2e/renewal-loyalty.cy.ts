import { EXPIRING_POLICY } from '../builders/policy';
import { calculator } from '../pages/CalculatorPage';
import {
  RENEWAL_PREMIUM_LONG_STANDING,
  RENEWAL_PREMIUM_NO_CLAIMS,
} from '../support/amounts';

describe('Loyalty', () => {
  // The loyalty discount is what is under test, so everything else that moves
  // the premium is pinned: no previous claims, Prague.
  function openCalculatorFor(policyStartYearsAgo: number) {
    calculator.visit(EXPIRING_POLICY, { policyStartYearsAgo, priorClaims: 0 });
  }

  it('charges the full premium on a policy held under five years', () => {
    // Given
    openCalculatorFor(2);

    // When
    calculator.calculate();

    // Then
    calculator.premium().should('contain', RENEWAL_PREMIUM_NO_CLAIMS);
  });

  it('gives a 10 % loyalty discount on a policy held five years or more', () => {
    // Given
    openCalculatorFor(7);

    // When
    calculator.calculate();

    // Then
    calculator.premium().should('contain', RENEWAL_PREMIUM_LONG_STANDING);
  });

  it('gives no more than 10 % on a policy held over ten years', () => {
    // Given
    openCalculatorFor(11);

    // When
    calculator.calculate();

    // Then
    calculator.premium().should('contain', RENEWAL_PREMIUM_LONG_STANDING);
  });

  it('gives the loyalty discount also just past the five-year mark', () => {
    // Given
    // Not exactly five: the rule reads today's date itself, so the boundary
    // moves with the clock and cannot be pinned from a test.
    openCalculatorFor(6);

    // When
    calculator.calculate();

    // Then
    calculator.premium().should('contain', RENEWAL_PREMIUM_LONG_STANDING);
  });
});
