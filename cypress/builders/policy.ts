import type { PolicyRecord } from '../../src/domain/types';

/**
 * The five policies the app ships with. Kept here rather than in a fixture file
 * so that every test gets its own copy and nothing can leak between tests.
 */
const SEED: PolicyRecord[] = [
  {
    policyNo: 'POL-4821',
    policyholder: 'Jana Nováková',
    status: 'Expiring',
    premium: 12400,
    age: 22,
    country: 'CZ',
    region: 'Prague',
    priorClaims: 1,
    policyStartYearsAgo: 2,
    renewalInDays: 9,
  },
  {
    policyNo: 'POL-1002',
    policyholder: 'Petr Svoboda',
    status: 'Active',
    premium: 8150,
    age: 41,
    country: 'CZ',
    region: 'Brno',
    priorClaims: 0,
    policyStartYearsAgo: 7,
    renewalInDays: 120,
  },
  {
    policyNo: 'POL-2318',
    policyholder: 'Marie Dvořáková',
    status: 'Active',
    premium: 15900,
    age: 68,
    country: 'CZ',
    region: 'Ostrava',
    priorClaims: 2,
    policyStartYearsAgo: 11,
    renewalInDays: 210,
  },
  {
    policyNo: 'POL-5540',
    policyholder: 'Tomáš Černý',
    status: 'Renewed',
    premium: 9720,
    age: 35,
    country: 'CZ',
    region: 'Plzen',
    priorClaims: 0,
    policyStartYearsAgo: 3,
    renewalInDays: 305,
  },
  {
    policyNo: 'POL-7781',
    policyholder: 'Eva Horáková',
    status: 'Active',
    premium: 21300,
    age: 30,
    country: 'CZ',
    region: 'Prague',
    priorClaims: 3,
    policyStartYearsAgo: 6,
    renewalInDays: 64,
  },
];

/**
 * Policies are addressed by number, never by position. A test that cares about
 * the expiring policy says so; it does not encode the fact that the expiring
 * one currently happens to be first.
 */
export const EXPIRING_POLICY = 'POL-4821';
export const ACTIVE_POLICY = 'POL-1002';
export const SENIOR_POLICY = 'POL-2318';
export const RENEWED_POLICY = 'POL-5540';
export const MANY_CLAIMS_POLICY = 'POL-7781';

/** One policy, with whatever the test cares about overridden. */
export function aPolicy(overrides: Partial<PolicyRecord> = {}): PolicyRecord {
  return { ...SEED[0], ...overrides };
}

/**
 * The whole list. Pass overrides keyed by policy number — every call builds
 * fresh objects, so nothing a test does here can reach another test.
 *
 *   aPolicyList()                                  // the five defaults
 *   aPolicyList({ [EXPIRING_POLICY]: { policyStartYearsAgo: 11 } })
 */
export function aPolicyList(
  overrides: Record<string, Partial<PolicyRecord>> = {}
): PolicyRecord[] {
  return SEED.map((policy) => ({ ...policy, ...(overrides[policy.policyNo] || {}) }));
}
