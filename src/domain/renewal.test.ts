import { describe, expect, it } from 'vitest';
import {
  addDays,
  daysUntil,
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

describe('isExpiring', () => {
  it('is false for a policy months away', () => {
    expect(isExpiring(addDays(TODAY, 60), TODAY)).toBe(false);
  });

  it('is true for a policy a few days away', () => {
    expect(isExpiring(addDays(TODAY, 3), TODAY)).toBe(true);
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
