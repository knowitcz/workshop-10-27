---
paths:
  - "cypress/e2e/**/*.cy.ts"
  - "cypress/pages/**/*.ts"
---

# End-to-end specs

- **No fixed waits.** Never `cy.wait(<number>)` — wait on an alias
  (`cy.wait('@policies')`) or a retrying assertion.
- **Every amount from `cypress/support/amounts.ts`**, as a named constant with
  the arithmetic that produces it in a comment. No bare `'11 500 CZK'` in a
  spec.
- **Every test passes when run alone** — check it with `.only` or `--spec`.
  Build the data the test needs in the test.
- Keep e2e tests for the journey: screens joined together, data passing from
  one to the next. Each one boots the whole app.
