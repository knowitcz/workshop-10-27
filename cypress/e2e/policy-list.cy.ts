import policyList from '../pages/PolicyListPage';

describe('Policy list', () => {
  beforeEach(() => {
    policyList.open();
  });

  it('test1', () => {
    cy.get(policyList.selectors.title).should('contain', 'Policy Renewal');
    cy.get(policyList.selectors.sectionLabel).should('contain', 'Policies');
    cy.get(policyList.selectors.header).should('have.length', 5);
    policyList.row(0).policyNo().should('contain', 'POL-4821');
    cy.get('.policy-row').eq(0).should('contain', 'Jana Nováková');
    policyList.row(0).premium().should('contain', '12 400 CZK');
    policyList.row(4).policyNo().should('contain', 'POL-7781');
    policyList.row(4).premium().should('contain', '21 300 CZK');
  });

  it('INS-214 statuses and buttons', () => {
    policyList.verifyStatus(0, 'Expiring');
    policyList.verifyStatus(1, 'Active');
    policyList.verifyStatus(2, 'Active');
    policyList.verifyStatus(3, 'Renewed');
    policyList.verifyStatus(4, 'Active');
    cy.wait(1500);
    policyList.row(3).renewButton().should('be.disabled');
    policyList.row(0).renewButton().should('not.be.disabled');
    policyList.row(1).renewButton().should('not.be.disabled');
  });

  it('premium column', () => {
    cy.wait(1000);
    policyList.verifyPremium(1, '8 150 CZK');
    policyList.verifyPremium(2, '15 900 CZK');
    policyList.verifyPremium(3, '9 720 CZK');
  });

  it('badges', () => {
    policyList.row(0).status().should('have.class', 'expiring');
    policyList.row(3).status().should('have.class', 'renewed');
    cy.wait(1200);
    cy.get('.badge').should('have.length', 5);
  });
});
