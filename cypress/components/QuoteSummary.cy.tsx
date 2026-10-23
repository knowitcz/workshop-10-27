import { addDays } from '../../src/domain/renewal';
import type { Quote } from '../../src/domain/types';
import Confirmation from '../../src/screens/Confirmation';
import { aQuote } from '../builders/quote';
import {
  EXPIRING_POLICYHOLDER,
  NO_QUOTE,
  QUOTE_EXPIRED,
  QUOTE_VALID_LAST_DAY,
  QUOTE_VALID_ON_ISSUE,
  RENEWAL_PREMIUM_NO_CLAIMS,
} from '../support/amounts';

/**
 * TEMPORARY — these tests pre-fill sessionStorage because QuoteSummary reads the
 * quote from there itself. Migrate them once the developers pass the quote in
 * as a prop (request 1 in docs/delivery-analysis.md): mount QuoteSummary on its
 * own with a quote, and drop the storage setup.
 *
 * The quote summary — the part of the confirmation screen that shows the quote
 * and confirms it. QuoteSummary cannot be mounted as it is: its props are clean
 * (today and a callback), but it reads the quote from sessionStorage under
 * 'renewalQuote' itself, and on Confirm it marks the policy renewed under
 * 'renewedPolicies' and removes the quote. These tests write the quote into
 * storage, mount the screen around QuoteSummary, and read storage afterwards.
 * That is the cheapest way past the wall and the only one a tester can take
 * alone, but it couples every test here to both storage keys and to the stored
 * shape, for reads and for writes.
 *
 * Why the screen and not QuoteSummary itself: the test pre-fills what the
 * feature reads, wherever in the feature it is read. If the developers move the
 * read up into the screen, these tests keep passing until they are migrated.
 */
const TODAY = new Date(2025, 4, 12);
const QUOTE_KEY = 'renewalQuote';
const RENEWED_KEY = 'renewedPolicies';

function mountWithQuote(quote: Quote | null) {
  if (quote) sessionStorage.setItem(QUOTE_KEY, JSON.stringify(quote));
  const onDone = cy.stub().as('onDone');
  cy.mount(<Confirmation today={TODAY} onDone={onDone} onBack={cy.stub()} />);
}

describe('QuoteSummary', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('shows the policyholder name from the stored quote', () => {
    // Given
    mountWithQuote(aQuote(TODAY));

    // Then
    cy.get('[data-cy=confirm-name]').should('contain', EXPIRING_POLICYHOLDER);
  });

  it('shows the renewal premium from the stored quote', () => {
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

  it('says there is nothing to confirm when no quote is stored', () => {
    // Given
    mountWithQuote(null);

    // Then
    cy.get('[data-cy=no-quote]').should('contain', NO_QUOTE);
  });

  it('marks the policy renewed when the quote is confirmed', () => {
    // Given
    mountWithQuote(aQuote(TODAY));

    // When
    cy.get('[data-cy=confirm]').click();

    // Then
    cy.wrap(null).should(() => {
      expect(JSON.parse(sessionStorage.getItem(RENEWED_KEY))).to.deep.equal(['POL-4821']);
    });
  });

  it('finishes and drops the stored quote after confirming', () => {
    // Given
    mountWithQuote(aQuote(TODAY));

    // When
    cy.get('[data-cy=confirm]').click();

    // Then
    cy.get('@onDone').should('have.been.calledOnce');
    cy.wrap(null).should(() => {
      expect(sessionStorage.getItem(QUOTE_KEY)).to.equal(null);
    });
  });

  it('renews nothing until the quote is confirmed', () => {
    // Given
    mountWithQuote(aQuote(TODAY));

    // Then
    cy.get('[data-cy=confirm]').should('be.visible');
    cy.get('@onDone').should('not.have.been.called');
    cy.wrap(null).should(() => {
      expect(sessionStorage.getItem(RENEWED_KEY)).to.equal(null);
    });
  });
});
