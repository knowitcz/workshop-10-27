/**
 * calc.ts — core calculation of the renewal premium.
 *
 * Ported from the previous vanilla build (calc.js), which priced claims rather
 * than renewals. The region coefficient survives unchanged; the claims loading
 * replaces the old history malus, and the loyalty discount was added for the
 * renewal screens.
 */
import { CalcInput } from './types';

/** Maximum sum insured. The coverage slider expresses a percentage of this. */
export const INSURED_SUM = 400000;

/** The yearly premium before any adjustment, as a share of the sum insured. */
export const BASE_RATE = 0.05;

/** F1: Prague is priced in full; everywhere else is cheaper. */
export function regionCoefficient(region: string): number {
  return region === 'Prague' ? 1.0 : 0.95;
}

/** F3: add 15% to the premium per previous claim. */
export function claimsLoading(priorClaims: number): number {
  const n = Number(priorClaims) || 0;
  return 1 + 0.15 * n;
}

/** Five years or more with us earns 10% off. */
export function loyaltyDiscount(policyStart: Date): number {
  const today = new Date();
  const years =
    (today.getTime() - policyStart.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return years >= 5 ? 0.9 : 1.0;
}

/** The slider's percentage as an amount in CZK. */
export function coverageAmount(coverageLevel: number): number {
  return Math.round((INSURED_SUM * coverageLevel) / 100);
}

/**
 * Calculate the yearly renewal premium.
 * premium = coverage amount * BASE_RATE * region * claims * loyalty
 */
export function calculatePremium(input: CalcInput): number {
  const premium =
    coverageAmount(input.coverageLevel) *
    BASE_RATE *
    regionCoefficient(input.region) *
    claimsLoading(input.priorClaims) *
    loyaltyDiscount(input.policyStart);

  return Math.round(Math.max(0, premium));
}

export function formatCZK(amount: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
    .format(amount)
    .replace(/,/g, ' ') + ' CZK';
}
