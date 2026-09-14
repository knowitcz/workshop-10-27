import policyList from './PolicyListPage';

const SLIDER_W = 560;

class CalculatorPage {
  selectors = {
    policyholderName: 'input[name="policyholderName"]',
    age: 'input[name="age"]',
    priorClaims: 'input[name="priorClaims"]',
    slider: '.slider',
    fill: '.fill',
    coverage: '.field-label .value',
    premium: 'h4',
    summaryRow: '.summary .row',
    error: '.error',
    notice: '.notice',
  };

  open(index = 0) {
    policyList.open();
    policyList.renew(index);
    cy.get(this.selectors.policyholderName).should('be.visible');
  }

  enterAge(age) {
    cy.typeAmount(this.selectors.age, age);
  }

  enterPriorClaims(count) {
    cy.typeAmount(this.selectors.priorClaims, count);
  }

  calculate() {
    cy.contains('button', 'Calculate premium').click();
    cy.wait(1500);
  }

  reset() {
    cy.contains('button', 'Reset').click();
    cy.wait(1500);
  }

  drag(fraction) {
    cy.get(this.selectors.slider).then(($el) => {
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
    cy.wait(1000);
  }

  verifyPremium(amount) {
    cy.get(this.selectors.premium).should('contain', amount);
  }

  verifyNoResult() {
    cy.get(this.selectors.premium).should('not.exist');
  }

  verifyCoverage(text) {
    cy.get(this.selectors.coverage).should('contain', text);
  }
}

export default new CalculatorPage();
