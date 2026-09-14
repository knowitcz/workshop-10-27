import type { PolicyRecord } from '../../src/domain/types';

export const selectors = {
  title: '.banner h1',
  sectionLabel: '.section-label',
  header: 'thead th',
  row: '.policy-row',
  policyNo: '.polno',
  status: '.status',
  premium: '.amount',
  badge: '.badge',
  renewButton: 'button',
};

export class PolicyRow {
  row: Cypress.Chainable;

  constructor(index: number) {
    this.row = cy.get(selectors.row).eq(index);
  }

  policyNo() {
    return this.row.find(selectors.policyNo);
  }

  status() {
    return this.row.find(selectors.status);
  }

  premium() {
    return this.row.find(selectors.premium);
  }

  renewButton() {
    return this.row.find(selectors.renewButton);
  }
}

class PolicyListPage {
  selectors = selectors;

  open(policies?: PolicyRecord[]) {
    const response = policies ? { body: policies } : { fixture: 'policies.json' };
    cy.intercept('GET', '/data/policies.json', response).as('policies');
    cy.visit('/');
    cy.wait('@policies');
    cy.wait(2000);
    cy.get(selectors.row).should('have.length', 5);
  }

  row(index: number) {
    return new PolicyRow(index);
  }

  renew(index: number) {
    cy.get(selectors.row).eq(index).find(selectors.renewButton).click();
    cy.wait(1500);
  }

  verifyRowCount(count: number) {
    cy.get(selectors.row).should('have.length', count);
  }

  verifyStatus(index: number, status: string) {
    cy.get(selectors.row).eq(index).find(selectors.status).should('contain', status);
  }

  verifyPremium(index: number, premium: string) {
    cy.get(selectors.row).eq(index).find(selectors.premium).should('contain', premium);
  }
}

export default new PolicyListPage();
