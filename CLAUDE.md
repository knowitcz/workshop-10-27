# Policy renewal — workshop app

React + Vite + TypeScript front end for renewing insurance policies. No
backend — the policy list comes from `public/data/policies.json`.

## Commands

```
npm run dev              # app on http://localhost:5173
npm run test:unit        # Vitest — src/**/*.test.ts
npm run test:component   # Cypress component tests — cypress/components
npm run test:e2e         # Cypress e2e — starts the dev server itself
npx cypress run --e2e --spec cypress/e2e/<file>.cy.ts   # one spec, dev server already up
```

A change is done when the spec you touched passes **alone**, and then the
whole level it belongs to passes. Say which commands you ran.

## Layout

```
src/                 production code — not yours to change, see below
cypress/e2e/         journeys through the real app
cypress/components/  components mounted on their own
cypress/pages/       page objects
cypress/builders/    test data
cypress/support/     commands, named amounts
```

## Rules

- **Do not change production code under `src/`.** Two exceptions: adding a
  `data-cy` attribute to markup, and unit tests (`src/**/*.test.ts`). For
  anything else, stop and report what you would ask the developers for —
  what, why, and the smallest version of it.
- **If a test and the code disagree, stop and ask.** Do not decide which one
  is right, and do not quietly change either to match the other.
- **Ask before changing shared configuration** — `cypress.config.ts` (for
  example `testIsolation`), `cypress/support/e2e.ts`, shared commands. Say
  what else the change affects.
- **When you collapse duplicates that disagree, report the disagreement** —
  two copies of a constant with different values, two helpers that behave
  differently. Do not silently pick one.
