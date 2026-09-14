/**
 * renewal.ts — the rules around when a policy is close enough to its renewal
 * date to matter, and how long a quote stays valid once it has been produced.
 */
import { Policy, PolicyRecord } from './types';

/** A policy this close to its renewal date counts as expiring. */
export const EXPIRING_WINDOW_DAYS = 14;

/** Once a quote has been calculated it holds for this long. */
export const QUOTE_LOCK_DAYS = 7;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysUntil(date: Date, today: Date): number {
  return Math.round(
    (startOfDay(date).getTime() - startOfDay(today).getTime()) / MS_PER_DAY
  );
}

export function isExpiring(renewalDate: Date, today: Date): boolean {
  const days = daysUntil(renewalDate, today);
  return days >= 0 && days <= EXPIRING_WINDOW_DAYS;
}

export function quoteLockedUntil(today: Date): Date {
  const until = startOfDay(today);
  until.setDate(until.getDate() + QUOTE_LOCK_DAYS);
  return until;
}

export function addDays(today: Date, days: number): Date {
  const d = startOfDay(today);
  d.setDate(d.getDate() + days);
  return d;
}

export function addYears(today: Date, years: number): Date {
  const d = startOfDay(today);
  d.setFullYear(d.getFullYear() - years);
  return d;
}

/** Turn the offsets stored in policies.json into real dates against today. */
export function resolvePolicy(record: PolicyRecord, today: Date): Policy {
  return {
    ...record,
    policyStart: addYears(today, record.policyStartYearsAgo),
    renewalDate: addDays(today, record.renewalInDays),
  };
}
