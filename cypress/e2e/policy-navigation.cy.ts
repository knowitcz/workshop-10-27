import policyList from '../pages/PolicyListPage';

describe('Navigating to the calculator', () => {
  beforeEach(() => {
    policyList.open();
    policyList.renew(0);
  });

  it('opens the calculator and prefills, and you can go back', () => {
    cy.get('.banner h1').should('contain', 'POL-4821');
    cy.get('input[name="policyholderName"]').should('have.value', 'Jana Nováková');
    cy.get('input[name="age"]').should('have.value', '22');
    cy.get('select[name="region"]').should('have.value', 'Prague');
    cy.get('input[name="priorClaims"]').should('have.value', '1');
    cy.wait(1000);
    cy.get('.link-back').click();
    cy.wait(1500);
    policyList.verifyRowCount(5);
  });

  it('INS-217', () => {
    cy.get('.section-label').eq(0).should('contain', 'Policyholder');
    cy.get('.section-label').eq(1).should('contain', 'Renewal details');
    cy.get('h4').should('not.exist');
    cy.get('.slider').should('be.visible');
    cy.get('.field-label .value').should('contain', '50 %');
  });
});
