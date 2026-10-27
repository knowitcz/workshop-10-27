# Analysis — policy and renewal e2e specs

Scope: the five Cypress specs that cover the policy list and the renewal flow.

| Spec | Tests | Hard waits | Sleep (ms) |
|---|---|---|---|
| `cypress/e2e/policy-list.cy.ts` | 4 | 3 (+4 hidden) | 3 700 (+8 000) |
| `cypress/e2e/policy-navigation.cy.ts` | 2 | 2 (+4 hidden) | 2 500 (+7 000) |
| `cypress/e2e/renewal-journey.cy.ts` | 3 | 9 | 14 200 |
| `cypress/e2e/renewal-edge-cases.cy.ts` | 5 | 8 | 11 900 |
| `cypress/e2e/renewal-loyalty.cy.ts` | 4 | 6 | 9 500 |
| **Total** | **18** | **28 (+8)** | **≈ 56 800** |

"Hidden" waits are the ones inside `PolicyListPage.open()` (2 000 ms) and `PolicyListPage.renew()` (1 500 ms).

The calculator specs (`calculator-form`, `calculator-slider`) have already been
refactored onto the new support layer: `builders/policy.ts`, `support/amounts.ts`,
`support/commands.ts` and `pages/CalculatorPage.ts`. **None of the five specs
analysed here use that layer.** They still have their own copies of
helpers, selectors, fixtures and magic numbers. Most of the findings below go
away when these specs are moved onto what is already there.

All expected amounts in the specs were checked against `src/domain/calc.ts`
(`coverage × 5 % × region × (1 + 0.15·claims) × loyalty`). They are arithmetically
correct today. The problems are in how the tests reach those values.

---

## 1. Correctness: tests that pass for the wrong reason

### 1.1 Shared mutable fixture leaks between tests (`renewal-loyalty`, `renewal-edge-cases`)

Both specs load `policy.json` once in `before()` into a module-level `let policies`
and then **mutate it in place** (`policies[0].policyStartYearsAgo = 7`). Nothing
resets it, so each test inherits every change made by the tests before it.

- `renewal-loyalty.cy.ts:45` **`test4`** applies no override and expects
  `9 000 CZK` (loyalty discount). The fixture has `policyStartYearsAgo: 2`, which
  should give `10 000 CZK`. The test only passes because `over ten years` left
  the value at `11`. Run it alone (`it.only`) and it fails.
- `renewal-edge-cases.cy.ts:73` **`test3`** asserts `priorClaims` is `'3'` and
  that no notice is shown. Neither is true of the fixture (`priorClaims: 0`,
  `renewalInDays: 9`, which is expiring). Both values are left over from
  `previous claims` (claims = 3) and `a policy months away` (days = 200).
- Because of this, the order of `it` blocks is part of the test logic. Reordering,
  `.only`, `.skip` or retries all change the results.

The fix already exists: `aPolicyList({ [EXPIRING_POLICY]: { … } })` builds fresh
objects on every call. `cy.openCalculator(policyNo, overrides)` wraps the whole
setup.

### 1.2 Order-dependent state through `sessionStorage` (`renewal-journey`)

`cypress.config.ts` sets `testIsolation: false`, so `sessionStorage` survives
between tests in a spec. The app stores renewed policies there
(`src/state/renewals.ts`).

- `renewal-journey.cy.ts:70` **`INS-263`** expects `POL-1002` to be *Renewed*
  and its button disabled. In the fixture it is *Active*. The test passes only
  because `INS-260` renewed it first. On its own, or after a retry, it fails.
- On the other hand, every test that asserts *Active* status (`policy-list` `INS-214`)
  would break if a renewal test ever ran before it in the same spec.

Either make each test set up its own state (visit with a clean session, or seed
`sessionStorage` explicitly in `INS-263`'s setup), or turn `testIsolation` back on.

### 1.3 Two fixtures for the same policies, with different data

`policies.json` and `policy.json` both describe the same five policies but
disagree: `POL-4821` has `priorClaims: 1` in one and `0` in the other.
`policy.json` also carries ~10 fields the app never reads (`iban`, `email`,
`phone`, `agent`, …). A reader of `renewal-loyalty` has no way to see that the
"10 000 CZK" baseline depends on the claims being 0 in *this particular* file.
The builder (`builders/policy.ts`) is meant to be the single source.
Delete `policy.json` once nothing uses it.

### 1.4 Slider width drift

`renewal-journey.cy.ts:1` and `renewal-edge-cases.cy.ts:1` hard-code
`SLIDER_W = 561`. The component uses `560` (`src/components/CoverageSlider.tsx`).
At 0.62 it still rounds to 62 %, so nobody noticed. Near a rounding edge it will
be off by one percent. `cy.setCoverage()` uses the exported
`offsetForFraction()` and has no copy of the width to drift.

### 1.5 Weak assertions

- `renewal-journey.cy.ts:47`: `.summary .row eq(2) should contain '0'`. Almost
  any number contains a `0`, so this cannot fail. Use `summaryClaims()` and an
  exact match.
- `should('contain', …)` is used for every amount. `'1 000 CZK'` would also match
  `'11 000 CZK'`. Exact text (`have.text`) or a value from `amounts.ts` is safer.
- `policy-navigation.cy.ts:24`: `cy.get('h4').should('not.exist')` asserts "no
  result shown" through an unrelated tag name. Use `calculator.premium()`.

---

## 2. Flakiness and speed: hard waits

There are 28 `cy.wait(<ms>)` calls in the specs, plus 2 more inside
`PolicyListPage`, adding up to roughly **57 seconds of sleeping across 18 tests**. None of
them are needed:

- `cy.wait('@policies')` already waits for the data. The `cy.wait(2000)` after it
  (in every `open`) adds nothing except time.
- Cypress already retries `should(...)` assertions, so `cy.wait(1500)` after
  clicking *Calculate premium* only hides a missing assertion on the state
  you're actually waiting for.
- Waits placed *before* assertions on static content (`policy-list.cy.ts:25,32,41`)
  are pure dead time.

The refactored `cy.openPolicyList` / `cy.openCalculator` have no hard waits.
That proves the specs don't need them.

---

## 3. Readability and intent

### 3.1 Names that say nothing

`test1`, `test3`, `test4`, `INS-217`, `INS-263`, `badges`, `premium column`.
A ticket number is useful *next to* a behaviour description, not instead of it.
Suggested renames:

| Current | Suggested |
|---|---|
| `test1` | shows each policy's number, holder and premium |
| `INS-214 statuses and buttons` | INS-214 a renewed policy cannot be renewed again |
| `INS-217` | INS-217 the calculator opens with no result and 50 % coverage |
| `INS-263` | INS-263 a renewed policy stays renewed on the list |
| `test3` | a chosen coverage level is priced with the policy's claims |
| `test4` | *(delete — duplicates `five years or more` once the leak is fixed)* |

### 3.2 Tests that mix several behaviours

- `policy-list` `test1` checks the title, section label, column count and two rows.
- `renewal-journey` `INS-260` covers list → prefill → calculate → summary → renew
  → list in one test, with 20+ assertions. That's fine as one smoke journey, but
  then the prefill and summary details should be removed from it (the calculator
  specs cover them) so a failure points at one thing.

### 3.3 No Given / When / Then structure

The calculator specs use `// Given / // When / // Then`. These don't, so setup,
action and assertion blur together (e.g. `test3` mixes setup asserts, slider
drag, wait, click, wait and three result checks).

### 3.4 Magic numbers with no derivation

`'14 500 CZK'`, `'17 980 CZK'`, `'8 550 CZK'`, `'11 160 CZK'`, `'9 000 CZK'` are
correct, but the reader has to reconstruct the formula to know why.
`support/amounts.ts` exists for exactly this. Add the missing constants there with their
arithmetic comment, e.g.

```ts
/** 200 000 × 5 % × 1.00 Prague × 1.45 three claims × 1.00 two years */
export const RENEWAL_PREMIUM_THREE_CLAIMS = '14 500 CZK';
/** 200 000 × 5 % × 0.95 Brno × 1.00 no claims × 0.90 seven years */
export const RENEWAL_PREMIUM_LOYAL_OUTSIDE_PRAGUE = '8 550 CZK';
```

---

## 4. Duplication and abstraction

| Duplicated thing | Where | Already exists as |
|---|---|---|
| `open(data)` (intercept, visit, wait, click row 0) | `renewal-loyalty`, `renewal-edge-cases`, `renewal-journey` `beforeEach` | `cy.openPolicyList`, `cy.openCalculator` |
| `drag(fraction)` with stubbed pointer capture | `renewal-journey`, `renewal-edge-cases` | `cy.setCoverage` / `calculator.setCoverage` |
| `SLIDER_W` constant | both renewal specs | `offsetForFraction` (component export) |
| CSS selectors (`input[name=…]`, `.policy-row`, `h4`, `.notice`, `.summary .row`) | all five | `data-cy` attributes + `CalculatorPage` |
| `cy.contains('button', 'Calculate premium')` | renewal specs | `calculator.calculate()` |

### 4.1 Rows addressed by position, not identity

Every list test uses `.eq(0)`, `.eq(1)`, `.eq(4)`, which encodes the fixture's
current order. `builders/policy.ts` names the roles (`EXPIRING_POLICY`,
`ACTIVE_POLICY`, `RENEWED_POLICY`, `MANY_CLAIMS_POLICY`), and
`cy.contains('[data-cy=policy-row]', policyNo)` finds a row by number.

### 4.2 `PolicyListPage` is half a page object

- It exposes `selectors` publicly, and specs reach around it
  (`cy.get(policyList.selectors.title)`, and even raw `cy.get('.policy-row')` at
  `policy-list.cy.ts:13`).
- It still uses CSS classes while `data-cy="policy-row"` / `data-cy="renew"` exist.
- `PolicyRow` stores a `cy.get(...)` chainable in its constructor and reuses it
  in every method. Cypress chainables are not meant to be stored. Calling two
  methods on the same `PolicyRow` instance chains the second `find` off the first
  one's subject. It works today only because every call site creates a new row.
  Prefer returning `cy.contains(row, policyNo)` fresh from each method.
- `verifyStatus` / `verifyPremium` put assertions in the page object while
  `row(i).status()` returns elements, so tests use two styles at once.
  `CalculatorPage` returns elements only. Pick that style and use it in both.
- `open()` and `renew()` contain the hidden 2 000 / 1 500 ms waits.
- It's a default-exported singleton, while `CalculatorPage` is a named export.

---

## 5. Coverage gaps the specs miss

### 5.1 The loyalty boundary is time-of-day dependent (likely app bug)

The specs test 2, 7 and 11 years. None of them test **exactly 5**, which is the only
interesting value. `loyaltyDiscount()` divides real milliseconds by
`365.25` days, while `addYears()` subtracts calendar years from the start of today.
Checked for 2026-10-27, `policyStartYearsAgo: 5`:

| Local time | Years computed | Discount |
|---|---|---|
| 00:00 | 4.99943 | **no** |
| 05:00 | 5.00000 | yes |
| 07:00 | 5.00023 | yes |

So a customer who has been with the company exactly five years gets the discount
or not depending on what time the quote is made. A boundary test (unit test in
`calc.test.ts` with a fixed clock, plus one e2e case using `cy.clock`) would have
caught this. `over ten years` tests no rule (there is no 10-year tier), so
it can be dropped.

### 5.2 Expiring window boundaries

`EXPIRING_WINDOW_DAYS = 14`. The specs test 3 and 200 days, plus the default 9.
Missing: 0 (renews today), 14 (last day in the window), 15 (first day out), and a
negative value (already past). These belong in `renewal.test.ts`, with one e2e
case for "notice shown" and one for "notice hidden".

### 5.3 No clock control

Every date in the app is relative to `new Date()`. None of these specs use
`cy.clock()`, so any date-boundary case is non-deterministic (see 5.1).

---

## 6. Suggested order of work

1. **Fix the leaks** (1.1, 1.2). Switch `renewal-loyalty` and `renewal-edge-cases`
   to `cy.openCalculator(EXPIRING_POLICY, { … })`. Make `INS-263` set up its own
   renewed state. Delete `test4`.
2. **Delete every numeric `cy.wait`**, including the ones in `PolicyListPage`.
3. **Move the specs onto `CalculatorPage` and `data-cy`**, and remove the local
   `open` / `drag` / `SLIDER_W` copies.
4. **Rework `PolicyListPage`**: address rows by policy number, no stored
   chainables, no exposed selectors, named export.
5. **Move amounts into `support/amounts.ts`** with their arithmetic, and use exact
   text matches.
6. **Rename tests** to describe behaviour (table in 3.1) and add Given / When / Then.
7. **Add boundary tests** for loyalty (5 years, fixed clock) and the expiring
   window, mostly as unit tests. Raise 5.1 as an app bug.
8. Delete `cypress/fixtures/policy.json` (and `policies.json` once
   `PolicyListPage.open` uses the builder).
