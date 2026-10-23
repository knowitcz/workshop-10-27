import { ACTIVE_POLICY, EXPIRING_POLICY, MANY_CLAIMS_POLICY, RENEWED_POLICY, SENIOR_POLICY } from '../builders/policy';
import { policyList } from '../pages/PolicyListPage';
import {
  PREMIUM_ACTIVE,
  PREMIUM_ALREADY_RENEWED,
  PREMIUM_EXPIRING,
  PREMIUM_MANY_CLAIMS,
  PREMIUM_SENIOR,
} from '../support/amounts';

describe('Policy list', () => {
  beforeEach(() => {
    // Given
    policyList.visit();
  });

  it('shows the application name in the header', () => {
    // Then
    policyList.title().should('contain', 'Policy Renewal');
  });

  it('shows the policy list section', () => {
    // Then
    policyList.sectionLabel().should('contain', 'Policies');
  });

  it('shows a table with five columns', () => {
    // Then
    policyList.columnHeaders().should('have.length', 5);
  });

  it('shows the number of the policy due for renewal', () => {
    // Then
    policyList.row(EXPIRING_POLICY).policyNo().should('contain', 'POL-4821');
  });

  it('shows the policyholder name for a policy due for renewal', () => {
    // Then
    policyList.row(EXPIRING_POLICY).policyholder().should('contain', 'Jana Nováková');
  });

  it('shows the premium for a policy due for renewal', () => {
    // Then
    policyList.row(EXPIRING_POLICY).premium().should('contain', PREMIUM_EXPIRING);
  });

  it('shows the number of the policy with three claims', () => {
    // Then
    policyList.row(MANY_CLAIMS_POLICY).policyNo().should('contain', 'POL-7781');
  });

  it('shows the premium for a policy with three claims', () => {
    // Then
    policyList.row(MANY_CLAIMS_POLICY).premium().should('contain', PREMIUM_MANY_CLAIMS);
  });

  it('shows the Expiring status for a policy due for renewal', () => {
    // Then
    policyList.row(EXPIRING_POLICY).status().should('contain', 'Expiring');
  });

  it('shows the Active status for an active policy', () => {
    // Then
    policyList.row(ACTIVE_POLICY).status().should('contain', 'Active');
  });

  it('shows the Renewed status for an already renewed policy', () => {
    // Then
    policyList.row(RENEWED_POLICY).status().should('contain', 'Renewed');
  });

  it('disables the Renew button for an already renewed policy', () => {
    // Then
    policyList.row(RENEWED_POLICY).renewButton().should('be.disabled');
  });

  it('enables the Renew button for a policy due for renewal', () => {
    // Then
    policyList.row(EXPIRING_POLICY).renewButton().should('not.be.disabled');
  });

  it('enables the Renew button for an active policy', () => {
    // Then
    policyList.row(ACTIVE_POLICY).renewButton().should('not.be.disabled');
  });

  it('formats the premium with a space between thousands', () => {
    // Then
    policyList.row(ACTIVE_POLICY).premium().should('contain', PREMIUM_ACTIVE);
    policyList.row(SENIOR_POLICY).premium().should('contain', PREMIUM_SENIOR);
    policyList.row(RENEWED_POLICY).premium().should('contain', PREMIUM_ALREADY_RENEWED);
  });

  it('marks a policy due for renewal with the expiring badge', () => {
    // Then
    policyList.row(EXPIRING_POLICY).status().should('have.class', 'expiring');
  });

  it('marks a renewed policy with the renewed badge', () => {
    // Then
    policyList.row(RENEWED_POLICY).status().should('have.class', 'renewed');
  });

  it('shows a status badge for every policy', () => {
    // Then
    policyList.statuses().should('have.length', 5);
  });
});
