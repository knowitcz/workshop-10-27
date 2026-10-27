---
paths:
  - "cypress/e2e/**/*.cy.ts"
  - "cypress/pages/**/*.ts"
  - "cypress/builders/**/*.ts"
  - "cypress/support/commands.ts"
  - "cypress/support/amounts.ts"
---

# Cypress e2e tests

- Build data with `aPolicy()` / `aPolicyList(overrides)` from `cypress/builders/policy.ts`. Never load or mutate `cypress/fixtures/policy.json` in `before()`.
- Address policies by number via the named constants (`EXPIRING_POLICY`, …), never by row index.
- Enter the app with `cy.openPolicyList()` / `cy.openCalculator()` or `calculator.visit()`; they stub `/data/policies.json` and wait on the alias.
- No `cy.wait(<ms>)`. Wait on intercept aliases or on a `.should()` assertion.
- Select with `[data-cy=…]` only. If an element lacks one, add it in `src/`.
- Page objects return chainables and perform actions; assertions stay in the spec.
- Expected amounts come from `cypress/support/amounts.ts`, each with its arithmetic in a comment. No magic numbers in specs.
- Each test must pass on its own (`it.only`) — `testIsolation: false` means sessionStorage and the page carry over between tests.
- Structure test bodies with `// Given`, `// When`, `// Then`.
