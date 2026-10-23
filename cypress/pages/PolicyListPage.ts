import type { PolicyRecord } from '../../src/domain/types';

/**
 * One row of the policy table.
 *
 * The constructor takes a **getter**, not a chainable. A stored
 * `Cypress.Chainable` is a one-shot: it resolves once and is not re-queried, so
 * two calls on the same instance would operate on a stale subject — and after
 * the row re-renders (a renewal changes the status and disables the button)
 * the stale subject is detached from the DOM. Calling `this.root()` runs a
 * fresh `cy.contains` every time. This is not a style preference.
 */
export class PolicyRow {
  constructor(private root: () => Cypress.Chainable) {}

  policyNo() {
    return this.root().find('[data-cy=policy-no]');
  }

  policyholder() {
    return this.root().find('[data-cy=policyholder]');
  }

  status() {
    return this.root().find('[data-cy=status]');
  }

  premium() {
    return this.root().find('[data-cy=premium]');
  }

  renewButton() {
    return this.root().find('[data-cy=renew]');
  }

  renew() {
    this.renewButton().click();
  }
}

export class PolicyListPage {
  visit(overrides: Record<string, Partial<PolicyRecord>> = {}) {
    cy.openPolicyList(overrides);
    return this;
  }

  /** Find a policy by its number. Never by position. */
  row(policyNo: string) {
    return new PolicyRow(() => cy.contains('[data-cy=policy-row]', policyNo));
  }

  rows() {
    return cy.get('[data-cy=policy-row]');
  }

  title() {
    return cy.get('[data-cy=app-title]');
  }

  sectionLabel() {
    return cy.get('[data-cy=section-label]');
  }

  columnHeaders() {
    return cy.get('thead th');
  }

  statuses() {
    return cy.get('[data-cy=status]');
  }
}

export const policyList = new PolicyListPage();
