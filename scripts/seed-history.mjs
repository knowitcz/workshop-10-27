#!/usr/bin/env node
/**
 * Generate a run history in mcp/history/, so that the history tools have
 * something interesting to show on a machine that has run the suite only once.
 *
 * Seeded from the mochawesome reports of your last e2e run (reports/mochawesome/,
 * written by every `cypress run`), so every test name and file is your own.
 * The format of the files it writes is described in mcp/history/README.md.
 *
 *   npm run test:e2e                 # once, if reports/mochawesome/ is empty
 *   node scripts/seed-history.mjs
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = join(repo, 'reports', 'mochawesome');
const dir = join(repo, 'mcp', 'history');

const reports = existsSync(reportDir)
  ? readdirSync(reportDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(reportDir, f), 'utf8')))
      .sort((a, b) => String(a.stats?.start).localeCompare(String(b.stats?.start)))
  : [];

// The reporter does not overwrite, so a test can appear in several runs — the
// latest one wins.
const byTest = new Map();
function collect(suite, file) {
  for (const t of suite?.tests ?? []) {
    if (!t.pending) byTest.set(`${file}\n${t.fullTitle}`, { fullTitle: t.fullTitle, file, durationMs: t.duration ?? 0 });
  }
  for (const child of suite?.suites ?? []) collect(child, file);
}
for (const report of reports) {
  for (const result of report?.results ?? []) collect(result, result.file ?? result.fullFile ?? 'unknown');
}
const seedTests = [...byTest.values()];

if (seedTests.length === 0) {
  console.error('No mochawesome report to seed from. Run the e2e suite once first: npm run test:e2e');
  process.exit(1);
}

// A deterministic PRNG, so regenerating gives the same history.
let state = 20260914;
const rnd = () => ((state = (state * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

/**
 * The story the history tells. The titles are the reference solution's; on a
 * suite with other names, the closest tests by pattern stand in for them.
 */
function pick(exact, pattern, count, exclude = []) {
  const candidates = seedTests.filter((t) => !exclude.includes(t.fullTitle));
  const found = candidates.filter((t) => exact.includes(t.fullTitle));
  if (found.length > 0) return found.map((t) => t.fullTitle);
  const matching = candidates.filter((t) => pattern.test(t.fullTitle));
  return (matching.length > 0 ? matching : candidates).slice(0, count).map((t) => t.fullTitle);
}

/** The one genuinely flaky test: a race on the slider readout. */
const [FLAKY] = pick(['Coverage slider carries the chosen coverage percentage into the result'], /slider|coverage/i, 1);

/** A real regression: the loyalty discount was briefly broken, then fixed. */
const REGRESSED = pick(
  [
    'Loyalty gives a 10 % loyalty discount on a policy held five years or more',
    'Loyalty gives no more than 10 % on a policy held over ten years',
    'Loyalty gives the loyalty discount also just past the five-year mark',
  ],
  /loyal/i,
  3,
  [FLAKY]
);
const REGRESSION_RUNS = [5, 6];

const RUNS = 14;
const start = new Date('2026-08-24T08:12:00Z');

mkdirSync(dir, { recursive: true });

for (let i = 0; i < RUNS; i += 1) {
  const startedAt = new Date(start.getTime() + i * 26 * 60 * 60 * 1000 + Math.floor(rnd() * 3600_000));
  const inRegression = REGRESSION_RUNS.includes(i);
  // The flaky test fails on runs 2, 8 and 11.
  const flakyFails = [2, 8, 11].includes(i);

  const tests = seedTests.map((t) => {
    let state = 'passed';
    let error;

    if (inRegression && REGRESSED.includes(t.fullTitle)) {
      state = 'failed';
      error =
        "AssertionError: Timed out retrying after 4000ms: expected '<h4>' to contain '9 000 CZK'";
    }
    if (flakyFails && t.fullTitle === FLAKY) {
      state = 'failed';
      error =
        "AssertionError: Timed out retrying after 4000ms: expected '<div>' to contain '62 %'";
    }

    // ±35% jitter on durations, so "slowest test" is stable but not identical.
    const durationMs = Math.max(1, Math.round(t.durationMs * (0.8 + rnd() * 0.55)));
    return { fullTitle: t.fullTitle, file: t.file, state, durationMs, ...(error ? { error } : {}) };
  });

  const passed = tests.filter((t) => t.state === 'passed').length;
  const failed = tests.filter((t) => t.state === 'failed').length;
  const id = startedAt.toISOString().replace(/[:.]/g, '-');

  writeFileSync(
    join(dir, `run-${id}.json`),
    JSON.stringify(
      {
        id,
        startedAt: startedAt.toISOString(),
        durationMs: tests.reduce((a, t) => a + t.durationMs, 0) + 9000 + Math.floor(rnd() * 6000),
        passed,
        failed,
        pending: 0,
        tests,
      },
      null,
      2
    )
  );
}

console.log(`Wrote ${RUNS} runs to mcp/history/ — flaky: "${FLAKY}", regressed: ${REGRESSED.length} test(s).`);
