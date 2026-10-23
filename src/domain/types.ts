export type PolicyStatus = 'Active' | 'Expiring' | 'Renewed';

/** A policy as it arrives from /data/policies.json. Dates are offsets, not
 *  absolute values — see resolvePolicy(). */
export interface PolicyRecord {
  policyNo: string;
  policyholder: string;
  status: PolicyStatus;
  premium: number;
  age: number;
  country: string;
  region: string;
  priorClaims: number;
  policyStartYearsAgo: number;
  renewalInDays: number;
}

/** A policy once the offsets have been turned into real dates. */
export interface Policy extends PolicyRecord {
  policyStart: Date;
  renewalDate: Date;
}

export interface CalcInput {
  customerName: string;
  age: number;
  country: string;
  region: string;
  priorClaims: number;
  coverageLevel: number;
  policyStart: Date;
}

/** What the calculator hands to the confirmation screen. */
export interface Quote {
  policy: Policy;
  policyholderName: string;
  age: number;
  country: string;
  region: string;
  priorClaims: number;
  coverage: number;
  premium: number;
  /** The day the quote was calculated. It can be confirmed for QUOTE_LOCK_DAYS. */
  issuedAt: Date;
}
