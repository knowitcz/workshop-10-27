import { offsetForFraction } from '../../src/components/CoverageSlider';
import type { PolicyRecord } from '../../src/domain/types';
import { aPolicyList } from '../builders/policy';

declare global {
  namespace Cypress {
    interface Chainable {
      /** Stub the policy list and land on it, ready to click. */
      openPolicyList(
        overrides?: Record<string, Partial<PolicyRecord>>
      ): Chainable<void>;

      /** Stub the policy list, then open the calculator for one policy. */
      openCalculator(
        policyNo: string,
        overrides?: Partial<PolicyRecord>
      ): Chainable<void>;

      /** Drag the coverage handle to a fraction of the track, 0.0 – 1.0. */
      setCoverage(fraction: number): Chainable<void>;

      /** Replace the contents of a numeric field. */
      typeAmount(selector: string, value: number | string): Chainable<void>;

      /** Assert an element contains some text. */
      expectText(selector: string, text: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('openPolicyList', (overrides = {}) => {
  cy.intercept('GET', '/data/policies.json', { body: aPolicyList(overrides) }).as('policies');
  cy.visit('/');
  cy.wait('@policies');
  cy.get('[data-cy=policy-row]').should('have.length', 5);
});

Cypress.Commands.add('openCalculator', (policyNo: string, overrides = {}) => {
  cy.openPolicyList({ [policyNo]: overrides });
  cy.contains('[data-cy=policy-row]', policyNo).find('[data-cy=renew]').click();
  cy.get('[data-cy=policyholder-name]').should('be.visible');
});

/**
 * The slider is pointer-driven, not an `<input type="range">`, so it takes a
 * real pointerdown / pointermove / pointerup with computed coordinates. It also
 * calls setPointerCapture, which has to be stubbed — Cypress dispatches events
 * the browser never associates with a live pointer.
 *
 * This is the command, not a way to skip the UI: it still drags the handle
 * through the browser. Setting coverage without the UI would be an app action —
 * a different tool, for setting a test up, never for the behaviour under test.
 */
Cypress.Commands.add('setCoverage', (fraction: number) => {
  cy.get('[data-cy=coverage-slider]').then(($el) => {
    const el = $el[0];
    el.setPointerCapture = () => {};
    el.hasPointerCapture = () => false;

    const rect = el.getBoundingClientRect();
    const x = rect.left + offsetForFraction(fraction);
    const y = rect.top + rect.height / 2;
    const at = { clientX: x, clientY: y, bubbles: true, pointerId: 1 };

    el.dispatchEvent(new PointerEvent('pointerdown', at));
    el.dispatchEvent(new PointerEvent('pointermove', at));
    el.dispatchEvent(new PointerEvent('pointerup', at));
  });
});

Cypress.Commands.add('typeAmount', (selector: string, value: number | string) => {
  cy.get(selector).clear();
  cy.get(selector).type(String(value));
});

Cypress.Commands.add('expectText', (selector: string, text: string) => {
  cy.get(selector).should('contain', text);
});
