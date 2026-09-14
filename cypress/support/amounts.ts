/**
 * Expected figures, with the arithmetic that produces them.
 *
 *   premium = coverage amount × 5 % × region × claims × loyalty
 *
 * Coefficients: Prague 1.00 / elsewhere 0.95 · 1 + 0.15 per previous claim ·
 * five years or more → 0.90.
 */

/** Total sum insured. The coverage slider is a percentage of this. */
export const INSURED_SUM = 400000;

// ---------- coverage ----------
export const DEFAULT_COVERAGE_PCT = '50 %';
export const DEFAULT_COVERAGE = '200 000 CZK'; //  50% of 400 000
export const CHOSEN_COVERAGE_PCT = '62 %';
export const CHOSEN_COVERAGE = '248 000 CZK'; //  62% of 400 000
export const FULL_COVERAGE_PCT = '100 %';
export const FULL_COVERAGE = '400 000 CZK'; // 100% of 400 000
export const NO_COVERAGE_PCT = '0 %';
export const NO_COVERAGE = '0 CZK'; //   0% of 400 000

// ---------- expected renewal premiums ----------
/** 200 000 × 5 % × 1.00 Prague × 1.00 no claims × 1.00 two years */
export const RENEWAL_PREMIUM_NO_CLAIMS = '10 000 CZK';

/** 200 000 × 5 % × 1.00 Prague × 1.15 one claim × 1.00 two years */
export const RENEWAL_PREMIUM_ONE_CLAIM = '11 500 CZK';

/** 248 000 × 5 % × 1.00 Prague × 1.00 no claims × 1.00 two years */
export const RENEWAL_PREMIUM_CHOSEN_COVERAGE = '12 400 CZK';

/** 4 000 (1% of 400 000) × 5 % × 1.00 Prague × 1.00 no claims × 1.00 two years */
export const RENEWAL_PREMIUM_AT_1_PCT = '200 CZK';
export const MINIMAL_COVERAGE_FRACTION = 0.01;
