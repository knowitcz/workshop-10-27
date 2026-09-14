# Policy renewal — workshop app

A small policy renewal front end: a list of policies, and a calculator that
works out the renewal premium for the one you pick.

## Running it

```
nvm use
npm ci
npm run dev
```

The app is served on <http://localhost:5173>. There is no backend — the policy
list is fetched from `public/data/policies.json`.

## How the renewal premium is calculated

```
premium = coverage × 5 % × region × claims × loyalty
```

| Factor | Value |
|---|---|
| `coverage` | coverage level % × 400 000 CZK (50 % → 200 000 CZK) — the sum insured |
| `5 %` | the base yearly rate, as a share of the sum insured |
| `region` | 1.00 in Prague, 0.95 in any other region |
| `claims` | 1 + 0.15 × previous claims (one claim → 1.15, three → 1.45) |
| `loyalty` | 0.90 if the policy started five or more years ago, otherwise 1.00 |

The result is rounded to whole crowns. Age and country are shown on the form
but do not affect the premium.

## Tests

```
npm run test:unit    # Vitest, the domain rules
npm run test:e2e     # Cypress end-to-end tests; starts the dev server itself
npm run cy:open      # Cypress in a browser, interactive (run npm run dev first)
```

## Layout

```
src/domain/      the calculation and the renewal-date rules
src/screens/     policy list, calculator
src/components/  the coverage slider
src/state/       which policies have been renewed this session
public/data/     the policy list
```
