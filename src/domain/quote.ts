/**
 * quote.ts — whether a calculated quote can still be confirmed.
 *
 * A quote is locked for QUOTE_LOCK_DAYS from the day it was issued. The last
 * locked day still counts: a quote issued on the 1st can be confirmed up to and
 * including the 8th.
 */
import { daysUntil, quoteLockedUntil } from './renewal';

/** Whole days left before the lock runs out; 0 on the last day it holds. */
export function quoteDaysLeft(issuedAt: Date, today: Date): number {
  return daysUntil(quoteLockedUntil(issuedAt), today);
}

/** Can a quote issued on `issuedAt` still be confirmed on `today`? */
export function isQuoteValid(issuedAt: Date, today: Date): boolean {
  return quoteDaysLeft(issuedAt, today) >= 0;
}
