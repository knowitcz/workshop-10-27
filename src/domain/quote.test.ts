import { describe, expect, it } from 'vitest';
import { isQuoteValid, quoteDaysLeft } from './quote';
import { addDays } from './renewal';

const ISSUED = new Date(2025, 4, 12);

describe('quoteDaysLeft', () => {
  it('is the whole lock on the day the quote is issued', () => {
    expect(quoteDaysLeft(ISSUED, ISSUED)).toBe(7);
  });

  it('counts down as the days pass', () => {
    expect(quoteDaysLeft(ISSUED, addDays(ISSUED, 3))).toBe(4);
  });
});

describe('isQuoteValid', () => {
  it('is valid on the day it is issued', () => {
    expect(isQuoteValid(ISSUED, ISSUED)).toBe(true);
  });

  it('is valid a few days later', () => {
    expect(isQuoteValid(ISSUED, addDays(ISSUED, 3))).toBe(true);
  });
});
