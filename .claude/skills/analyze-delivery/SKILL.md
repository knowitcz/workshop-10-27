---
name: analyze-delivery
description: Analyze a delivery from the developers — a commit or range that adds or changes production code under src/ — and decide what to test at which level (unit, component, e2e), how to get past anything that blocks the cheapest level, and what to ask the developers for. Use when new code arrives and the tests have not caught up, or when asked to review whether a change is testable.
---

# Analyze a delivery

Read only. Change no file except the report.

## 1. Run the script first

```
node .claude/skills/analyze-delivery/scripts/analyze-delivery.mjs [range]
```

The range defaults to the last commit. Run it with the delivery checked out.
It prints every changed file under `src/`: its kind (screen, component,
rule), the **blockers** it found — anything the code reaches for itself
instead of being given — and whether any unit or component test imports it.
E2E coverage does not show in that column; check `cypress/e2e/` yourself.

`--tests` scans the test files instead and lists every place a test sets up
the app's internal state by hand. That is coupling: the test breaks when that
internal format changes, even if the behaviour does not.

Trust the table for what it found. Your job is what it cannot judge.

## 2. Read the change

`git show --stat <range>`, then every changed file under `src/`. For each,
one line per **behaviour**: what the user can now see or do, and which rule
decides it. Note the tests that came with the delivery and what they miss —
boundaries above all: the last valid day, the first invalid one, an empty
value.

## 3. Decide the level — one line per behaviour

| Level | Use it for |
|---|---|
| Unit (Vitest) | a rule in `src/domain/` with inputs and an output; every boundary |
| Component (`cypress/components`) | what one component shows or does for a given input, mounted on its own |
| E2E (`cypress/e2e`) | the journey: screens joined together, data passing from one to the next |

**This team's preference:** the cheapest level that can show the behaviour.
E2E only for the journey; what one component shows for a given input is a
component test, not another e2e test.

## 4. A blocker in the way — choose how to get past it

When a blocker keeps a behaviour from its cheapest level, weigh all three and
say which one you recommend, and why:

1. **Work around it in the test** — set up what the code reads before
   mounting, and clean it up in `beforeEach`. Testers can do it alone, today.
   It couples the test to the internal key and shape, so mark the test
   **temporary** and file the request that removes it.
2. **Inject the dependency** — the component gets a small interface (for
   example `load` / `save`) the test can replace. A change to production code.
3. **Let the parent pass the value in** — the component takes it as a prop;
   the screen above it does the reading. A change to production code.

2 and 3 are requests to the developers, never something to do yourself.
Falling back to e2e only is also an option — say what it costs.

## 5. What to ask the developers for

For every blocker you work around or leave: what to change, why, and the
smallest version of it.

## 6. Report

Write `docs/delivery-analysis.md`:

1. **The delivery** — range, files, the script's table as it printed it.
2. **Behaviours** — one line each.
3. **Plan** — `| Behaviour | Level | Why that level |`.
4. **Blockers** — each one, the three options weighed, the recommendation.
5. **Gaps in the delivered tests.**
6. **Requests to the developers** — what, why, smallest version.
