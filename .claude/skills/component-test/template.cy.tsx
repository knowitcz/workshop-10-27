// Reference component test. Copy to cypress/components/<Component>.cy.tsx —
// the import paths below are written for that folder.
import Component from '../../src/components/Component';
import { aThing } from '../builders/thing';
import { EXPECTED_TEXT } from '../support/amounts';

/**
 * <Component> on its own — what it shows for a given input, and what it tells
 * its parent. One line on anything unusual about mounting it.
 */
const TODAY = new Date(2025, 4, 12);

function mount(thing = aThing()) {
  const onDone = cy.stub().as('onDone');
  cy.mount(<Component thing={thing} today={TODAY} onDone={onDone} />);
}

describe('Component', () => {
  it('shows the name it is given', () => {
    // Given
    mount(aThing({ name: 'Jana Nováková' }));

    // Then
    cy.get('[data-cy=thing-name]').should('contain', 'Jana Nováková');
  });

  it('tells the parent when the user is done', () => {
    // Given
    mount();

    // When
    cy.get('[data-cy=done]').click();

    // Then
    cy.get('@onDone').should('have.been.calledOnce');
  });

  it('disables Done once the thing has expired', () => {
    // Given
    mount(aThing({ expiresAt: TODAY }));

    // Then
    cy.get('[data-cy=done]').should('be.disabled');
    cy.get('[data-cy=expired]').should('contain', EXPECTED_TEXT);
  });
});
