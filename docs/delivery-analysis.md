# Delivery analysis — the confirmation screen

## The delivery

`dev: the confirmation screen` (`HEAD~1..HEAD` at the time of the delivery).
Renew becomes Continue; a new confirmation screen shows the quote and renews
the policy on Confirm; a quote can be confirmed for 7 days.

```
file | kind | blockers | imported by a test
src/App.tsx | other | new Date() | no
src/components/QuoteSummary.tsx | component | sessionStorage | no
src/domain/quote.ts | rule | — | yes
src/domain/types.ts | rule | — | yes
src/screens/Calculator.tsx | screen | sessionStorage | no
src/screens/Confirmation.tsx | screen | — | no
```

`--tests`: nothing — no test sets up internal state by hand yet.

## Behaviours

1. Calculate → **Continue** opens the confirmation screen with the quote just
   calculated (`Calculator.tsx` stores it, `QuoteSummary.tsx` reads it).
2. The confirmation shows name, age, country and region, policy number,
   coverage level and amount, previous claims and the premium.
3. An expiring policy shows the expiry notice on the confirmation as well.
4. A quote can be confirmed on the day it is issued and for 7 days after; the
   screen counts the days down, and on the last day says "until the end of
   today".
5. From day 8 the quote has expired: a notice, and Confirm is disabled.
6. **Confirm** renews the policy and returns to the list, where it shows as
   Renewed.
7. **Back** returns to the calculator without renewing anything.
8. Opening the confirmation with no quote shows "There is no quote to confirm".

## Plan

| Behaviour | Level | Why that level |
|---|---|---|
| 4, 5 — the 7-day lock and its boundaries | Unit | a rule in `src/domain/quote.ts` with inputs and an output |
| 2, 3 — what the summary shows | Component | one component, a given quote in, text out |
| 4, 5 — the countdown text, the expired notice, Confirm disabled | Component | what one component shows for a given quote and day |
| 8 — no quote | Component | one component, one input |
| 1 — the quote crosses from the calculator to the confirmation | E2E | data passing from one screen to the next |
| 6 — Confirm renews, the list shows Renewed | E2E | the end of the journey, across three screens |
| 7 — Back returns to the calculator | E2E | navigation between screens |

## Blockers

**`QuoteSummary` reads its quote from `sessionStorage` itself** (key
`renewalQuote`) and marks the policy renewed itself (key `renewedPolicies`). A
prop cannot give it a quote, so every component-level line above is blocked.

| Option | Who | Cost |
|---|---|---|
| 1. Pre-fill `sessionStorage` before mounting, clear it in `beforeEach` | testers, today | couples the test to both keys and the stored shape; breaks if the developers change either |
| 2. Inject a small quote store into `QuoteSummary` | developers | a new interface; the cleanest seam for tests, more code than this needs |
| 3. `Confirmation` reads the quote and passes it in as a prop | developers | a few lines moved; the component shows, the screen knows where quotes live |
| (Leave it to e2e) | testers | the expired quote cannot be produced in a journey — every quote it creates was issued today |

**Recommendation:** option 1 now, so the confirmation is covered this sprint —
mount the screen around `QuoteSummary` with the quote pre-filled, and mark the
test **temporary**. Ask for option 3 (request 1 below); once it lands, migrate
the test to mount `QuoteSummary` with a quote prop and drop the storage setup.

## Gaps in the delivered tests

- `quote.test.ts` covers day 0 and day 3 only. Missing: **day 7** (the last
  locked day — still valid, 0 days left) and **day 8** (the first day it has
  expired).
- No e2e test for the new screen, and the delivery broke the renew journey:
  Renew became Continue. `renewal-journey.cy.ts` is repaired with a raw
  `cy.get('[data-cy=confirm]').click()` — no page object for the screen yet.
- No component test for `QuoteSummary`.

## Requests to the developers

1. **Pass the quote to `QuoteSummary` as a prop.** Why: it is the only thing
   that keeps the component from being mounted with a test quote. Smallest
   version: `Confirmation` reads the stored quote and passes it down;
   `QuoteSummary` takes `quote: Quote | null`.
2. **Let the parent do the renewal.** Why: a summary that marks the policy
   renewed itself both shows and acts. Smallest version: `QuoteSummary` calls
   `onConfirmed(policyNo)`; `Confirmation` calls `markRenewed`.
