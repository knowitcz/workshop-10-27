---
paths:
  - "cypress/components/**/*.cy.tsx"
  - "cypress/support/component.tsx"
---

# Cypress component tests

- Mount the component directly with `cy.mount(...)`; no `cy.visit`, no app, no network.
- Wrap controlled components in a small local `Harness` that holds state, and pass a `cy.stub()` as the callback to assert on.
- Import geometry and bounds (`offsetForFraction`, `SLIDER_MIN`, `SLIDER_MAX`) from the component — never redeclare them.
- The slider needs real pointer events and a stubbed `setPointerCapture` (see `cy.setCoverage` in `cypress/support/commands.ts`).
- Select with `[data-cy=…]`; no `cy.wait(<ms>)`.
- One component behaviour per `it`; flows across screens belong in e2e.
