import { describe, expect, it } from 'vitest';
import {
  calculatePremium,
  claimsLoading,
  coverageAmount,
  formatCZK,
  regionCoefficient,
} from './calc';

/** A policy start that is safely on one side of the loyalty boundary. */
function yearsAgo(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

function input(over) {
  return {
    customerName: 'Jana Nováková',
    age: 40,
    country: 'CZ',
    region: 'Prague',
    priorClaims: 0,
    coverageLevel: 50,
    policyStart: yearsAgo(2),
    ...over,
  };
}

describe('regionCoefficient', () => {
  it('prices Prague in full', () => {
    expect(regionCoefficient('Prague')).toBe(1.0);
  });

  it('is cheaper everywhere else', () => {
    expect(regionCoefficient('Brno')).toBe(0.95);
    expect(regionCoefficient('Ostrava')).toBe(0.95);
    expect(regionCoefficient('Other')).toBe(0.95);
  });
});

describe('claimsLoading', () => {
  it('is neutral with no previous claims', () => {
    expect(claimsLoading(0)).toBe(1);
  });

  it('adds 15% per previous claim', () => {
    expect(claimsLoading(1)).toBeCloseTo(1.15);
    expect(claimsLoading(2)).toBeCloseTo(1.3);
    expect(claimsLoading(3)).toBeCloseTo(1.45);
  });

  it('treats a missing count as none', () => {
    expect(claimsLoading(undefined)).toBe(1);
  });
});

describe('coverageAmount', () => {
  it('is nothing at 0%', () => {
    expect(coverageAmount(0)).toBe(0);
  });

  it('is the whole sum insured at 100%', () => {
    expect(coverageAmount(100)).toBe(400000);
  });

  it('is a proportion in between', () => {
    expect(coverageAmount(62)).toBe(248000);
    expect(coverageAmount(50)).toBe(200000);
  });
});

describe('calculatePremium', () => {
  it('charges 5% of the sum insured in Prague with no previous claims', () => {
    expect(calculatePremium(input({}))).toBe(10000);
  });

  it('applies the region reduction and the loyalty discount', () => {
    expect(
      calculatePremium(
        input({ region: 'Brno', policyStart: yearsAgo(10) })
      )
    ).toBe(8550);
  });

  it('stacks the region reduction, previous claims and the loyalty discount', () => {
    expect(
      calculatePremium(
        input({
          region: 'Ostrava',
          priorClaims: 2,
          policyStart: yearsAgo(11),
        })
      )
    ).toBe(11115);
  });

  it('adds to the premium for every previous claim', () => {
    expect(calculatePremium(input({ priorClaims: 1 }))).toBe(11500);
    expect(calculatePremium(input({ priorClaims: 3 }))).toBe(14500);
  });

  it('scales with the chosen coverage', () => {
    expect(calculatePremium(input({ coverageLevel: 1 }))).toBe(200);
  });

  it('is nothing at 0% coverage', () => {
    expect(calculatePremium(input({ coverageLevel: 0 }))).toBe(0);
  });

  it('charges the full rate on the whole sum insured at 100% coverage', () => {
    expect(calculatePremium(input({ coverageLevel: 100 }))).toBe(20000);
  });
});

describe('formatCZK', () => {
  it('groups thousands with a space', () => {
    expect(formatCZK(2310)).toBe('2 310 CZK');
    expect(formatCZK(248000)).toBe('248 000 CZK');
  });
});
