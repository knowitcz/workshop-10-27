import { describe, expect, it } from 'vitest';
import {
  addDays,
  daysUntil,
  EXPIRING_WINDOW_DAYS,
  isExpiring,
  quoteLockedUntil,
  resolvePolicy,
} from './renewal';

const TODAY = new Date(2025, 4, 12);

describe('daysUntil', () => {
  it('is nothing for today', () => {
    expect(daysUntil(TODAY, TODAY)).toBe(0);
  });

  it('counts the days to a future date', () => {
    expect(daysUntil(addDays(TODAY, 30), TODAY)).toBe(30);
  });
});

describe('daysUntil, around today', () => {
  it('is negative for a date already past', () => {
    expect(daysUntil(addDays(TODAY, -1), TODAY)).toBe(-1);
  });

  it('ignores the time of day', () => {
    const laterToday = new Date(2025, 4, 12, 23, 30);
    expect(daysUntil(laterToday, TODAY)).toBe(0);
  });
});

describe('isExpiring', () => {
  it('is false for a policy months away', () => {
    expect(isExpiring(addDays(TODAY, 60), TODAY)).toBe(false);
  });

  it('is true for a policy a few days away', () => {
    expect(isExpiring(addDays(TODAY, 3), TODAY)).toBe(true);
  });

  it('is true for a policy renewing today', () => {
    expect(isExpiring(TODAY, TODAY)).toBe(true);
  });

  it('is false for a policy whose renewal date has passed', () => {
    expect(isExpiring(addDays(TODAY, -1), TODAY)).toBe(false);
  });
});

describe('isExpiring, at the 14-day boundary', () => {
  it('uses a fourteen-day window', () => {
    expect(EXPIRING_WINDOW_DAYS).toBe(14);
  });

  it('is true the day before the window closes', () => {
    expect(isExpiring(addDays(TODAY, 13), TODAY)).toBe(true);
  });

  it('is true on the last day inside the window', () => {
    expect(isExpiring(addDays(TODAY, 14), TODAY)).toBe(true);
  });

  it('is false on the first day outside the window', () => {
    expect(isExpiring(addDays(TODAY, 15), TODAY)).toBe(false);
  });
});

describe('quoteLockedUntil', () => {
  it('holds the quote for a week', () => {
    expect(quoteLockedUntil(TODAY)).toEqual(new Date(2025, 4, 19));
  });
});

describe('resolvePolicy', () => {
  it('turns the stored offsets into dates', () => {
    const policy = resolvePolicy(
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
      TODAY
    );

    expect(policy.renewalDate).toEqual(new Date(2025, 4, 21));
    expect(policy.policyStart).toEqual(new Date(2023, 4, 12));
  });
});
