# Analysis — the e2e specs not yet refactored

Scope: the five specs the morning did not touch — `policy-list`,
`policy-navigation`, `renewal-journey`, `renewal-edge-cases`,
`renewal-loyalty` — and the page object they use, judged against the
morning's categories. Line numbers are as of `v1d-component`.

Verdicts: **fix** — rework in 2C · **rule** — write it down in 2B so the
agent applies it everywhere · **ask** — needs someone else's answer first.

## policy-list.cy.ts

| Category | Problem | Evidence | Verdict |
|---|---|---|---|
| Unclear names | `test1` checks the title, the section, the header and four cells at once | `policy-list.cy.ts:8-17` | fix |
| Unclear names | A ticket number instead of a behaviour: `INS-214 statuses and buttons` | `policy-list.cy.ts:19` | fix, rule |
| Selectors | Policies addressed by position: `row(0)`, `row(4)` — a reordered list breaks every test | `policy-list.cy.ts:12-16`, `:20-28` | fix, rule |
| Selectors | The page object's selector map is public and the spec uses it directly; class selectors, no `data-cy` | `policy-list.cy.ts:9-11`; `PolicyListPage.ts:3-13`, `:40` | fix, rule |
| Selectors | A raw selector that bypasses the page object altogether | `policy-list.cy.ts:13`, `:42` | fix |
| Selectors | `PolicyRow` stores a chainable in its constructor (`this.row = cy.get(...)`); every method chains off that one stored command. It works only because each test builds a new row per call | `PolicyListPage.ts:16-20` | fix |
| Selectors | Assertions inside the page object: `verifyStatus`, `verifyPremium`, `verifyRowCount` | `PolicyListPage.ts:60-70` | fix, rule |
| Waits | Fixed sleeps in the tests and in the page object (`open` sleeps 2 s, `renew` 1.5 s) | `policy-list.cy.ts:25`, `:32`, `:41`; `PolicyListPage.ts:47`, `:57` | fix, rule |
| Magic numbers | Bare amounts: `12 400`, `21 300`, `8 150`, `15 900`, `9 720 CZK` | `policy-list.cy.ts:14`, `:16`, `:33-35` | fix, rule |

## policy-navigation.cy.ts

| Category | Problem | Evidence | Verdict |
|---|---|---|---|
| Unclear names | One test opens the calculator, checks five fields *and* goes back: "…prefills, and you can go back" | `policy-navigation.cy.ts:9` | fix |
| Unclear names | `INS-217` — a ticket number, nothing about the behaviour | `policy-navigation.cy.ts:21` | fix, rule |
| Selectors | `.banner h1`, `input[name=…]`, `.link-back`, `.section-label` with `.eq()`, `h4` | `policy-navigation.cy.ts:10-16`, `:22-26` | fix, rule |
| Selectors | `renew(0)` — the policy by position | `policy-navigation.cy.ts:6` | fix |
| Waits | `cy.wait(1000)` and `cy.wait(1500)` around the Back click | `policy-navigation.cy.ts:15`, `:17` | fix |

## renewal-journey.cy.ts

| Category | Problem | Evidence | Verdict |
|---|---|---|---|
| Order dependence | `INS-263` expects POL-1002 to be Renewed — true only because the first test renewed it and `testIsolation` is `false` | `renewal-journey.cy.ts:70-72`; `cypress.config.ts:7` | fix, ask (config) |
| Selectors | No page object at all: `.policy-row` + `.eq(n)`, `.summary .row` + `.eq(n)`, `h4`, `cy.contains('button', …)` | `renewal-journey.cy.ts:27-54`, `:58-67` | fix, rule |
| Selectors | A third copy of the drag helper, with its own slider width | `renewal-journey.cy.ts:1`, `:12-24` | fix — `cy.setCoverage` exists |
| Waits | Nine fixed sleeps, 1–2 s each | `renewal-journey.cy.ts:8`, `:31`, `:39`, `:41`, `:51`, `:59`, `:62`, `:64`, `:73` | fix |
| Magic numbers | `8 550`, `11 160`, `200 000`, `248 000 CZK`, `50 %`, `62 %` | `renewal-journey.cy.ts:43-46`, `:65-67` | fix |
| Unclear names | `INS-260 …` and `INS-263` | `renewal-journey.cy.ts:26`, `:70` | fix |

## renewal-edge-cases.cy.ts

| Category | Problem | Evidence | Verdict |
|---|---|---|---|
| Order dependence | One `policies` array loaded once in `before()` and mutated by each test; `test3` passes only because `previous claims` set `priorClaims = 3` before it | `renewal-edge-cases.cy.ts:3-10`, `:46`, `:56`, `:65`, `:75` | fix, rule |
| Selectors | Raw selectors, the policy by position inside `open()` | `renewal-edge-cases.cy.ts:17-20`, `:41-82` | fix |
| Selectors | Another copy of the drag helper and `SLIDER_W` | `renewal-edge-cases.cy.ts:1`, `:23-35` | fix |
| Waits | `cy.wait(2000)` / `1500` / `1200` in `open()` and after each click | `renewal-edge-cases.cy.ts:16`, `:19`, `:40`, `:49`, `:59`, `:69`, `:77`, `:79` | fix |
| Magic numbers | `10 000`, `14 500`, `17 980`, `248 000 CZK`, `3 days`, `7 days` | `renewal-edge-cases.cy.ts:50-52`, `:61`, `:70`, `:80-81` | fix |
| Unclear names | `test3`, `previous claims`, `INS-271 …` | `renewal-edge-cases.cy.ts:45`, `:64`, `:73` | fix |
| Data | The fat fixture `policy.json`: 20 fields per policy, half of them never read by the app (agent, branch, email, phone, IBAN, …) | `cypress/fixtures/policy.json` | fix — builders exist since 1B |

## renewal-loyalty.cy.ts

| Category | Problem | Evidence | Verdict |
|---|---|---|---|
| Order dependence | `test4` has no setup of its own: it expects the 11-year start that `over ten years` left in the shared array | `renewal-loyalty.cy.ts:37-50` | fix |
| Selectors | Raw selectors, the policy by position | `renewal-loyalty.cy.ts:15-18`, `:24-49` | fix |
| Waits | `cy.wait(2000)`, `1500` in `open()` and after each Calculate | `renewal-loyalty.cy.ts:14`, `:17`, `:25`, `:33`, `:41`, `:48` | fix |
| Magic numbers | `10 000` and `9 000 CZK` — the loyalty discount is the whole point of the spec and it is not written down anywhere | `renewal-loyalty.cy.ts:26`, `:34`, `:42`, `:49` | fix |
| Unclear names | `INS-284 under five years`, `test4` | `renewal-loyalty.cy.ts:21`, `:45` | fix |

## What the e2e specs cannot reach — coverage at a lower level

| Category | Problem | Evidence | Verdict |
|---|---|---|---|
| Missing boundary | The expiring notice is checked at 3 days and 200 days only. The 14-day window itself — 13, 14, 15 days — and a renewal date that is today or already past have no test at any level; the unit tests stop at 60 and 3 days | `renewal-edge-cases.cy.ts:46`, `:56`; `src/domain/renewal.test.ts:22-30` | fix in 2C — as unit tests in `src/domain/renewal.test.ts`: the rule (`isExpiring`, `daysUntil` in `src/domain/renewal.ts:19-28`) is pure, and an e2e test per day would boot the app five times |

## Across all five — candidates for rules

- Selectors by `data-cy` only; no public selector maps; no assertions in page
  objects.
- No `cy.wait(<number>)`; wait on an alias or a retrying assertion.
- Every expected amount from `cypress/support/amounts.ts`, with its arithmetic.
- Policies addressed by number, never by position.
- Every test passes when run alone; no data shared or mutated between tests.
- Names state a condition and an outcome; no ticket numbers, no `testN`.

## Things that look wrong in the app or the data — questions, not fixes

1. **Slider width: 560 or 561?** `CoverageSlider.tsx:5` exports
   `SLIDER_W = 560` and `styles.css:166` draws a 560 px track; both renewal
   specs hard-code `561` (`renewal-journey.cy.ts:1`,
   `renewal-edge-cases.cy.ts:1`). The drag lands one pixel off. Which one is
   right — and should the specs import it instead of copying it?
2. **`testIsolation: false`** (`cypress.config.ts:7`) affects every spec.
   Turning it on fixes the order dependence above but is a suite-wide change.
   Who decides?
3. **The fixture disagrees with the data.** `cypress/fixtures/policy.json`
   gives POL-4821 no previous claims; `public/data/policies.json` gives it one.
   The edge-case expectations (`10 000 CZK`) are built on the fixture. Which
   is the case we mean to test?
4. **A discount nobody can see.** POL-1002 quotes `8 550 CZK`
   (`renewal-journey.cy.ts:43`) — 10 % loyalty discount included — but the
   page shows neither the discount nor the policy start date. Is that the
   intended design?
5. **Personal data in a test fixture.** `policy.json` carries e-mail, phone
   and IBAN fields. Even if invented, should they be in the repository?
