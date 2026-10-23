export class ConfirmationPage {
  heading() {
    return cy.get('[data-cy=confirmation-title]');
  }

  card() {
    return cy.get('[data-cy=confirmation]');
  }

  policyholderName() {
    return cy.get('[data-cy=confirm-name]');
  }

  age() {
    return cy.get('[data-cy=confirm-age]');
  }

  region() {
    return cy.get('[data-cy=confirm-region]');
  }

  policyNo() {
    return cy.get('[data-cy=confirm-policy]');
  }

  coverage() {
    return cy.get('[data-cy=confirm-coverage]');
  }

  priorClaims() {
    return cy.get('[data-cy=confirm-claims]');
  }

  premium() {
    return cy.get('[data-cy=confirm-premium]');
  }

  notice() {
    return cy.get('[data-cy=confirm-notice]');
  }

  /** How long the quote can still be confirmed — shown while it is valid. */
  validity() {
    return cy.get('[data-cy=quote-validity]');
  }

  /** Shown instead of the validity line once the 7-day lock has run out. */
  expiredNotice() {
    return cy.get('[data-cy=quote-expired]');
  }

  /** Shown when there is no stored quote to confirm. */
  noQuote() {
    return cy.get('[data-cy=no-quote]');
  }

  confirmButton() {
    return cy.get('[data-cy=confirm]');
  }

  confirm() {
    cy.get('[data-cy=confirm]').click();
    return this;
  }

  back() {
    cy.get('[data-cy=confirm-back]').click();
    return this;
  }
}

export const confirmation = new ConfirmationPage();
