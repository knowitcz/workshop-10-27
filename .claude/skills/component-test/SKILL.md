---
name: component-test
description: Write or review a Cypress component test in this repo — one React component mounted on its own in cypress/components, with props from builders. Use when a component needs tests, when a plan assigns behaviours to the component level, or when reviewing whether a component can be mounted at all.
---

# Component tests

A component test mounts **one component on its own** — no app, no routing, no
dev server — gives it props, and checks what it shows or which callback it
calls. It runs in milliseconds, so every behaviour that does not need the
journey belongs here rather than in e2e.

## Write one

1. Start from [template.cy.tsx](template.cy.tsx). The file goes in
   `cypress/components/<Component>.cy.tsx`.
2. Read the component's props. Everything the test controls goes in through
   them: data from a builder in `cypress/builders/` (add one if it is missing),
   callbacks as `cy.stub().as('name')`, and **the date as a prop** — never the
   real clock.
3. One behaviour per test, Given / When / Then. Assert on what the user sees
   (`data-cy` text, enabled / disabled) or on the stub being called — not on
   the component's internal state.
4. Expected strings and amounts come from `cypress/support/amounts.ts`.
5. Run the file alone:
   `npx cypress run --component --spec cypress/components/<Component>.cy.tsx`,
   then `npm run test:component`.

## When it cannot be mounted as it is

If the component reads something itself — storage, `fetch`, the clock, app
state — a prop cannot set it. Do not change the component. Instead:

1. Set up what it reads before mounting (for example write the storage key in
   the test) and clear it in `beforeEach`.
2. Mark the file **TEMPORARY** in its header and say why: the test is now
   coupled to the key and the stored shape, not only to the behaviour.
3. Ask the developers for the change that removes the setup: let the parent
   pass the value in as a prop, or inject the dependency. Put the request in
   the summary.

## Before calling it done

Go through [checklist.md](checklist.md).
