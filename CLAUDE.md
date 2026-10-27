# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A clean-code workshop. The React app (policy list + renewal-premium calculator)
is the subject under test; the work is refactoring the Cypress suite, one
`step 1a`, `1b`, … commit at a time. No backend — the app fetches
`public/data/policies.json`.

## Commands

```
nvm use && npm ci
npm run dev              # Vite on :5173, strictPort
npm run test:unit        # Vitest, src/**/*.test.ts
npm run test:e2e         # starts the dev server, then runs Cypress e2e
npm run test:component   # Cypress component tests, own server
npx tsc                  # type-check (no lint script)
scripts/metrics.sh       # suite metrics: hard waits, selectors, LOC…
```

Single test:

```
npx vitest run src/domain/calc.test.ts -t "loyalty"
npx cypress run --e2e --spec cypress/e2e/renewal-loyalty.cy.ts   # dev server must be running
npx cypress run --component --spec cypress/components/CoverageSlider.cy.tsx
```

## Architecture

- Premium: `coverage% × 400 000 × 5 % × region × claims × loyalty`, rounded to CZK.
  Source of truth is `src/domain/calc.ts`.
- Fixture dates are offsets (`policyStartYearsAgo`, `renewalInDays`) resolved
  against today by `resolvePolicy()` in `src/domain/renewal.ts`.
- `App.tsx` switches screens on the `selected` policy number — no router.
  Renewed policies live in `sessionStorage`.
- The coverage slider is pointer-driven, not `<input type="range">`.

## Cypress suite

Conventions are in `.claude/rules/cypress-e2e.md` and
`.claude/rules/cypress-component.md`.

Migrated to the new support layer: `calculator-form`, `calculator-slider`, the
component test. Not yet: `policy-list`, `policy-navigation`, `renewal-journey`,
`renewal-edge-cases`, `renewal-loyalty` — read `docs/analysis-<spec>.md` before
refactoring one.
