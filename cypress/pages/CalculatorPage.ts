import type { PolicyRecord } from '../../src/domain/types';

export class CalculatorPage {
  /** Open the calculator for one policy, optionally changing that policy. */
  visit(policyNo: string, overrides: Partial<PolicyRecord> = {}) {
    cy.openCalculator(policyNo, overrides);
    return this;
  }

  // ---------- fields ----------
  heading() {
    return cy.get('[data-cy=calculator-title]');
  }

  policyholderName() {
    return cy.get('[data-cy=policyholder-name]');
  }

  age() {
    return cy.get('[data-cy=age]');
  }

  region() {
    return cy.get('[data-cy=region]');
  }

  priorClaims() {
    return cy.get('[data-cy=prior-claims]');
  }

  sectionLabels() {
    return cy.get('[data-cy=section-label]');
  }

  // ---------- coverage ----------
  coverageReadout() {
    return cy.get('[data-cy=coverage-value]');
  }

  coverageFill() {
    return cy.get('[data-cy=coverage-fill]');
  }

  slider() {
    return cy.get('[data-cy=coverage-slider]');
  }

  setCoverage(fraction: number) {
    cy.setCoverage(fraction);
    return this;
  }

  // ---------- actions ----------
  enterAge(age: number | string) {
    cy.typeAmount('[data-cy=age]', age);
    return this;
  }

  enterPriorClaims(count: number | string) {
    cy.typeAmount('[data-cy=prior-claims]', count);
    return this;
  }

  clearPolicyholderName() {
    this.policyholderName().clear();
    return this;
  }

  calculate() {
    cy.get('[data-cy=calculate]').click();
    return this;
  }

  reset() {
    cy.get('[data-cy=reset]').click();
    return this;
  }

  continueToConfirmation() {
    cy.get('[data-cy=continue]').click();
    return this;
  }

  back() {
    cy.get('[data-cy=back]').click();
    return this;
  }

  // ---------- results ----------
  premium() {
    return cy.get('[data-cy=premium]');
  }

  notice() {
    return cy.get('[data-cy=notice]');
  }

  errors() {
    return cy.get('[data-cy=error]');
  }

  summaryPolicy() {
    return cy.get('[data-cy=summary-policy]');
  }

  summaryCoverage() {
    return cy.get('[data-cy=summary-coverage]');
  }

  summaryClaims() {
    return cy.get('[data-cy=summary-claims]');
  }
}

export const calculator = new CalculatorPage();
