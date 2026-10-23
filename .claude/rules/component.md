---
paths:
  - "cypress/components/**/*.cy.tsx"
---

# Component tests

- **One behaviour per test**, one Act. If the name needs an "and", split it.
- **Mount only what the behaviour needs** — the component and its props, not
  the app around it. Pass callbacks as `cy.stub()` and assert on them.
- Props come from builders, not inline object literals repeated per test.
