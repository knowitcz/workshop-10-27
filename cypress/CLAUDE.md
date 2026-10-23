# Cypress tests

Applies to every spec under `cypress/`, e2e and component alike. Rules for one
level only are in `.claude/rules/`.

## Running them

```
npm run test:e2e                                   # whole e2e suite
npm run test:component                             # whole component suite
npx cypress run --e2e --spec cypress/e2e/<file>.cy.ts               # one e2e spec
npx cypress run --component --spec cypress/components/<file>.cy.tsx # one component spec
```

## Every test

- The name states a condition and an outcome in plain English:
  `scales the premium with the chosen coverage`. No `test2`, no ticket numbers.
- Given / When / Then, separated by a blank line and a comment.
- **Reset any shared state before each test.** Never rely on what an earlier
  test left behind.

## Selectors and page objects

- `data-cy` selectors only — no classes, tags or `:nth-child`. Need a new one?
  Adding `data-cy` to markup is allowed; say so in the summary.
- A **page object** holds selectors: one method per element. No public
  selector map, no assertions, no waits. A row object takes a **getter**,
  never a stored chainable.
- A **command** holds a gesture — `cy.setCoverage(0.62)` still drags the real
  handle.

## Data

- Test data comes from builders in `cypress/builders/`, never from a shared
  fixture file. Override only what the test is about.
- Address policies **by number** (`EXPIRING_POLICY`), never by position in the
  list.
