const SLIDER_W = 561;

describe('Renewal flow', () => {
  beforeEach(() => {
    cy.intercept('GET', '/data/policies.json', { fixture: 'policies.json' }).as('policies');
    cy.visit('/');
    cy.wait('@policies');
    cy.wait(2000);
    cy.get('.policy-row').should('have.length', 5);
  });

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

  it('INS-260 renews a policy from the list and lands back on the list', () => {
    cy.get('.policy-row').eq(1).find('.polno').should('contain', 'POL-1002');
    cy.get('.policy-row').eq(1).find('.status').should('contain', 'Active');
    cy.get('.policy-row').eq(1).find('button').should('not.be.disabled');
    cy.get('.policy-row').eq(1).find('button').click();
    cy.wait(1500);

    cy.get('.banner h1').should('contain', 'POL-1002');
    cy.get('input[name="policyholderName"]').should('have.value', 'Petr Svoboda');
    cy.get('input[name="age"]').should('have.value', '41');
    cy.get('select[name="region"]').should('have.value', 'Brno');
    cy.get('input[name="priorClaims"]').should('have.value', '0');

    cy.wait(1000);
    cy.contains('button', 'Calculate premium').click();
    cy.wait(2000);

    cy.get('h4').should('contain', '8 550 CZK');
    cy.get('.summary .row').eq(0).should('contain', 'POL-1002');
    cy.get('.summary .row').eq(1).should('contain', '50 %');
    cy.get('.summary .row').eq(1).should('contain', '200 000 CZK');
    cy.get('.summary .row').eq(2).should('contain', '0');
    cy.get('.notice').should('not.exist');

    cy.contains('button', 'Renew policy').click();
    cy.wait(2000);
    cy.get('.policy-row').should('have.length', 5);
    cy.get('.policy-row').eq(1).find('.status').should('contain', 'Renewed');
    cy.get('.policy-row').eq(1).find('button').should('be.disabled');
  });

  it('the coverage carries into the result', () => {
    cy.get('.policy-row').eq(4).find('button').click();
    cy.wait(1500);
    cy.typeAmount('input[name="priorClaims"]', 0);
    drag(0.62);
    cy.wait(1200);
    cy.contains('button', 'Calculate premium').click();
    cy.wait(1500);
    cy.get('.summary .row').eq(1).should('contain', '62 %');
    cy.get('.summary .row').eq(1).should('contain', '248 000 CZK');
    cy.get('h4').should('contain', '11 160 CZK');
  });

  it('INS-263', () => {
    cy.get('.policy-row').eq(1).find('.status').should('contain', 'Renewed');
    cy.get('.policy-row').eq(1).find('button').should('be.disabled');
    cy.wait(1500);
    cy.get('.policy-row').eq(3).find('button').should('be.disabled');
    cy.get('.policy-row').eq(0).find('button').should('not.be.disabled');
  });
});
