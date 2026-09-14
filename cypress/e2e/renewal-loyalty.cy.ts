let policies;

describe('Loyalty', () => {
  before(() => {
    cy.fixture('policy.json').then((data) => {
      policies = data;
    });
  });

  function open(data) {
    cy.intercept('GET', '/data/policies.json', { body: data }).as('policies');
    cy.visit('/');
    cy.wait('@policies');
    cy.wait(2000);
    cy.get('.policy-row').should('have.length', 5);
    cy.get('.policy-row').eq(0).find('button').click();
    cy.wait(1500);
    cy.get('input[name="policyholderName"]').should('be.visible');
  }

  it('INS-284 under five years', () => {
    policies[0].policyStartYearsAgo = 2;
    open(policies);
    cy.contains('button', 'Calculate premium').click();
    cy.wait(1500);
    cy.get('h4').should('contain', '10 000 CZK');
  });

  it('five years or more', () => {
    policies[0].policyStartYearsAgo = 7;
    open(policies);
    cy.contains('button', 'Calculate premium').click();
    cy.wait(1500);
    cy.get('h4').should('contain', '9 000 CZK');
  });

  it('over ten years', () => {
    policies[0].policyStartYearsAgo = 11;
    open(policies);
    cy.contains('button', 'Calculate premium').click();
    cy.wait(1500);
    cy.get('h4').should('contain', '9 000 CZK');
  });

  it('test4', () => {
    open(policies);
    cy.contains('button', 'Calculate premium').click();
    cy.wait(1500);
    cy.get('h4').should('contain', '9 000 CZK');
  });
});
