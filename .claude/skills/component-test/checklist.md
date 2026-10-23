# Component test — review checklist

- [ ] The file mounts **one** component; no app, router or screen around it.
- [ ] Everything the test controls goes in through props: data from a builder,
      callbacks as named stubs, the date as a fixed `TODAY`.
- [ ] No real clock, no network, no shared state left over from another test.
- [ ] Each test has one behaviour in its name and one Act; the name states a
      condition and an outcome.
- [ ] Assertions are on what the user sees (`data-cy`) or on a stub call —
      never on internal state.
- [ ] Expected text and amounts come from `cypress/support/amounts.ts`.
- [ ] Boundaries the component decides are covered at the cheapest level —
      a pure rule in a unit test, what the component shows for it here.
- [ ] Anything set up behind the component's back (storage, globals) is in
      `beforeEach`, the file is marked **TEMPORARY**, and the developer request
      that removes it is written down.
- [ ] The file passes alone and with `npm run test:component`.
