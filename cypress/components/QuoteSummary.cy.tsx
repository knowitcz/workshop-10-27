import { addDays } from '../../src/domain/renewal';
import type { Quote } from '../../src/domain/types';
import QuoteSummary from '../../src/components/QuoteSummary';
import { aQuote } from '../builders/quote';
import {
  EXPIRING_POLICYHOLDER,
  NO_QUOTE,
  QUOTE_EXPIRED,
  QUOTE_LOCK_NOTICE,
  QUOTE_VALID_LAST_DAY,
  QUOTE_VALID_ON_ISSUE,
  RENEWAL_PREMIUM_NO_CLAIMS,
} from '../support/amounts';

/**
 * The quote summary on its own — the part of the confirmation screen that shows
 * the quote and confirms it. It gets the quote as a prop and tells its parent
 * when the user confirms; the screen above it does the renewal.
 */
const TODAY = new Date(2025, 4, 12);

function mountWithQuote(quote: Quote | null) {
  const onConfirmed = cy.stub().as('onConfirmed');
  cy.mount(<QuoteSummary quote={quote} today={TODAY} onConfirmed={onConfirmed} />);
}

describe('QuoteSummary', () => {
  it('shows the policyholder name from the quote', () => {
    // Given
    mountWithQuote(aQuote(TODAY));

    // Then
    cy.get('[data-cy=confirm-name]').should('contain', EXPIRING_POLICYHOLDER);
  });

  it('shows the renewal premium from the quote', () => {
    // Given
    mountWithQuote(aQuote(TODAY));

    // Then
    cy.get('[data-cy=confirm-premium]').should('contain', RENEWAL_PREMIUM_NO_CLAIMS);
  });

  it('says a quote issued today can be confirmed for the whole lock', () => {
    // Given
    mountWithQuote(aQuote(TODAY));

    // Then
    cy.get('[data-cy=quote-validity]').should('contain', QUOTE_VALID_ON_ISSUE);
  });

  it('still lets a quote be confirmed on the last locked day', () => {
    // Given
    mountWithQuote(aQuote(TODAY, { issuedAt: addDays(TODAY, -7) }));

    // Then
    cy.get('[data-cy=quote-validity]').should('contain', QUOTE_VALID_LAST_DAY);
    cy.get('[data-cy=confirm]').should('not.be.disabled');
  });

  it('refuses a quote the day after the lock runs out', () => {
    // Given
    mountWithQuote(aQuote(TODAY, { issuedAt: addDays(TODAY, -8) }));

    // Then
    cy.get('[data-cy=quote-expired]').should('contain', QUOTE_EXPIRED);
    cy.get('[data-cy=confirm]').should('be.disabled');
  });

  it('says there is nothing to confirm when there is no quote', () => {
    // Given
    mountWithQuote(null);

    // Then
    cy.get('[data-cy=no-quote]').should('contain', NO_QUOTE);
  });

  it('shows the locked-offer notice for a policy due for renewal', () => {
    // Given
    mountWithQuote(aQuote(TODAY));

    // Then
    cy.get('[data-cy=confirm-notice]').should('contain', QUOTE_LOCK_NOTICE);
  });

  it('tells the parent when the quote is confirmed', () => {
    // Given
    mountWithQuote(aQuote(TODAY));

    // When
    cy.get('[data-cy=confirm]').click();

    // Then
    cy.get('@onConfirmed').should('have.been.calledOnce');
  });

  it('confirms nothing until the user clicks Confirm', () => {
    // Given
    mountWithQuote(aQuote(TODAY));

    // Then
    cy.get('[data-cy=confirm]').should('be.visible');
    cy.get('@onConfirmed').should('not.have.been.called');
  });
});
