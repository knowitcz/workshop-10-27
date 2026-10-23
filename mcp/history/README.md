# Run history

One JSON file per e2e run, named `run-<id>.json`. This folder is ignored by git;
the history belongs to the machine that ran the suite.

## Seeding

```
rm -rf reports/mochawesome && npm run test:e2e   # one clean run of your suite
node scripts/seed-history.mjs                    # 14 runs from it, in this folder
```

The script reads the mochawesome reports of that run, so the test names and
files are your own. The history it writes tells a story worth finding:

- one **flaky** test, failing in 3 of the 14 runs, no pattern
- one **regression** — up to three tests failing in two consecutive runs, then
  fixed
- stable durations with some jitter, so "slowest test" means something

## Format

```ts
interface RunRecord {
  id: string;          // startedAt with ':' and '.' replaced by '-'
  startedAt: string;   // ISO 8601
  durationMs: number;
  passed: number;
  failed: number;
  pending: number;
  tests: Array<{
    fullTitle: string;
    file: string;      // e.g. cypress/e2e/policy-list.cy.ts
    state: 'passed' | 'failed' | 'pending';
    durationMs: number;
    error?: string;    // failed tests only
  }>;
}
```

A run your MCP server records should be written in the same format, so the
seeded runs and the real ones read the same.
