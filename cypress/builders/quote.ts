import { resolvePolicy } from '../../src/domain/renewal';
import type { Quote } from '../../src/domain/types';
import { aPolicy } from './policy';

/**
 * A quote as the calculator stores it: the expiring policy, no previous claims,
 * the default 50 % coverage, issued on `today`. Override what the test is about.
 */
export function aQuote(today: Date, overrides: Partial<Quote> = {}): Quote {
  const policy = resolvePolicy(aPolicy({ priorClaims: 0 }), today);
  return {
    policy,
    policyholderName: policy.policyholder,
    age: policy.age,
    country: policy.country,
    region: policy.region,
    priorClaims: 0,
    coverage: 50,
    premium: 10000, // 200 000 × 5 %, Prague, no claims, two years
    issuedAt: today,
    ...overrides,
  };
}
