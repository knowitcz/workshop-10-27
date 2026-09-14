const SLIDER_W = 561;

let policies;

describe('Renewal edge cases', () => {
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

  function drag(fraction) {
    cy.get('.slider').then(($el) => {
      const el = $el[0];
      (el as any).setPointerCapture = () => {};
      (el as any).hasPointerCapture = () => false;
      const rect = el.getBoundingClientRect();
      const x = rect.left + fraction * SLIDER_W;
      const y = rect.top + rect.height / 2;
      el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
      el.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
      el.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    });
  }

  it('the list still renders with the full payload', () => {
    open(policies);
    cy.get('.link-back').click();
    cy.wait(1200);
    cy.get('.policy-row').eq(0).find('.polno').should('contain', 'POL-4821');
    cy.get('.policy-row').should('have.length', 5);
  });

  it('INS-271 expiring policy shows the notice', () => {
    policies[0].renewalInDays = 3;
    open(policies);
    cy.contains('button', 'Calculate premium').click();
    cy.wait(1500);
    cy.get('.notice').should('contain', 'expires in 3 days');
    cy.get('.notice').should('contain', 'locked for 7 days');
    cy.get('h4').should('contain', '10 000 CZK');
  });

  it('a policy months away has no notice', () => {
    policies[0].renewalInDays = 200;
    open(policies);
    cy.contains('button', 'Calculate premium').click();
    cy.wait(1500);
    cy.get('.notice').should('not.exist');
    cy.get('h4').should('contain', '10 000 CZK');
  });

  it('previous claims', () => {
    policies[0].priorClaims = 3;
    open(policies);
    cy.get('input[name="priorClaims"]').should('have.value', '3');
    cy.contains('button', 'Calculate premium').click();
    cy.wait(1500);
    cy.get('h4').should('contain', '14 500 CZK');
  });

  it('test3', () => {
    open(policies);
    cy.get('input[name="priorClaims"]').should('have.value', '3');
    drag(0.62);
    cy.wait(1200);
    cy.contains('button', 'Calculate premium').click();
    cy.wait(1500);
    cy.get('.summary .row').eq(1).should('contain', '248 000 CZK');
    cy.get('h4').should('contain', '17 980 CZK');
    cy.get('.notice').should('not.exist');
  });
});
