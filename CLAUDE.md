# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A clean-code workshop. The React app (policy list + renewal-premium calculator) is
the subject under test; the real work happens in the **Cypress suite**, which is
being refactored step by step (commits `step 1a`, `1b`, … — keep that history
readable). There is no backend: the app fetches `public/data/policies.json`.

## Commands

```
nvm use && npm ci
npm run dev              # Vite on :5173 (strictPort — fails if the port is taken)
npm run build
npm run test:unit        # Vitest, src/**/*.test.ts (domain rules only)
npm run test:e2e         # starts dev server itself, then cypress run --e2e
npm run test:component   # Cypress component tests; own Vite server on a random port
npm run cy:open          # interactive; run `npm run dev` first
scripts/metrics.sh       # suite metrics (hard waits, selectors, data-cy count, LOC…)
```

Single tests:

```
npx vitest run src/domain/calc.test.ts -t "loyalty"
npx cypress run --e2e --spec cypress/e2e/renewal-loyalty.cy.ts   # needs `npm run dev` running
npx cypress run --component --spec cypress/components/CoverageSlider.cy.tsx
```

There is no lint script. TypeScript is non-strict (`strict: false`) and
`noEmit`; `npx tsc` type-checks both `src` and `cypress`.

## Premium rule

`premium = coverage% × 400 000 × 5 % × region × claims × loyalty`, rounded to whole CZK.
Region 1.00 Prague / 0.95 elsewhere; claims `1 + 0.15·n`; loyalty 0.90 if the
policy started ≥ 5 years ago. Age and country are displayed but unused.
Source of truth: `src/domain/calc.ts`. Expected figures in tests live in
`cypress/support/amounts.ts` with the arithmetic written next to each one.

## Architecture notes

- **Dates are relative.** `policies.json` stores `policyStartYearsAgo` /
  `renewalInDays`; `resolvePolicy()` (`src/domain/renewal.ts`) turns them into
  dates against "today" at load time, so fixtures never go stale. Note that
  `loyaltyDiscount()` reads `new Date()` itself rather than taking `today`.
- **Navigation is state, not routing.** `App.tsx` holds `selected` policy number;
  `null` shows `PolicyList`, otherwise `Calculator`. Renewed policies are tracked
  in `sessionStorage` (`src/state/renewals.ts`), which persists across tests
  because e2e runs with `testIsolation: false`.
- **The coverage slider is pointer-driven**, not `<input type="range">`. Tests drive
  it with synthetic pointer events and a stubbed `setPointerCapture`
  (`cy.setCoverage`). Track geometry (`SLIDER_W`, `offsetForFraction`) is exported
  from `src/components/CoverageSlider.tsx` and imported by tests — don't redeclare it.

## Cypress suite: two generations side by side

The **new support layer** (use it for anything you touch):

- `cypress/builders/policy.ts` — `aPolicy()` / `aPolicyList(overrides)` build fresh
  records per call; policies are addressed by number via named constants
  (`EXPIRING_POLICY`, `ACTIVE_POLICY`, …), never by row index.
- `cypress/support/commands.ts` — `openPolicyList`, `openCalculator`, `setCoverage`,
  … (stub via `cy.intercept`, wait on the alias, assert readiness).
- `cypress/pages/CalculatorPage.ts` — page object returning chainables; assertions
  stay in specs, not in pages.
- `data-cy` selectors in `src/`.
- Specs use `// Given / // When / // Then` comments.

Already migrated: `calculator-form`, `calculator-slider`, and the component test.
**Not yet migrated:** `policy-list`, `policy-navigation`, `renewal-journey`,
`renewal-edge-cases`, `renewal-loyalty` — these still use `cy.wait(ms)`, CSS/text
selectors, the shared mutable `cypress/fixtures/policy.json` loaded in `before()`,
and the old `cypress/pages/PolicyListPage.ts` (which hides hard waits in
`open()`/`renew()`). Some of their tests pass only because of order-dependent
fixture mutation.

`docs/analysis.md` and `docs/analysis-<spec>.md` hold the detailed findings for
those five specs; read the relevant one before refactoring a spec.

Mochawesome writes JSON reports to `reports/mochawesome/` (gitignored, not overwritten between runs).
