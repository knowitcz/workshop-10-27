import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT, SuiteRun, TestResult } from './suite.js';

export const HISTORY_DIR = join(REPO_ROOT, 'mcp', 'history');

export interface RunRecord {
  id: string;
  startedAt: string;
  durationMs: number;
  passed: number;
  failed: number;
  pending: number;
  tests: Array<Pick<TestResult, 'fullTitle' | 'file' | 'state' | 'durationMs'> & { error?: string }>;
}

export function listRuns(): RunRecord[] {
  if (!existsSync(HISTORY_DIR)) return [];
  return readdirSync(HISTORY_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(HISTORY_DIR, f), 'utf8')) as RunRecord;
      } catch {
        return null;
      }
    })
    .filter((r): r is RunRecord => r !== null)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}

export function recordRun(run: SuiteRun, startedAt: Date): RunRecord {
  mkdirSync(HISTORY_DIR, { recursive: true });
  const id = startedAt.toISOString().replace(/[:.]/g, '-');
  const record: RunRecord = {
    id,
    startedAt: startedAt.toISOString(),
    durationMs: run.durationMs,
    passed: run.passed,
    failed: run.failed,
    pending: run.pending,
    tests: run.tests.map((t) => ({
      fullTitle: t.fullTitle,
      file: t.file,
      state: t.state,
      durationMs: t.durationMs,
      error: t.error,
    })),
  };
  writeFileSync(join(HISTORY_DIR, `run-${id}.json`), JSON.stringify(record, null, 2));
  return record;
}

export interface Metrics {
  runs: number;
  firstRun: string | null;
  lastRun: string | null;
  averageDurationMs: number;
  flaky: Array<{ fullTitle: string; file: string; passed: number; failed: number }>;
  regressed: Array<{
    fullTitle: string;
    file: string;
    failedRuns: number;
    firstFailure: string;
    lastFailure: string;
    stillFailing: boolean;
  }>;
  slowest: Array<{ fullTitle: string; file: string; averageDurationMs: number }>;
  mostFailed: Array<{ fullTitle: string; file: string; failures: number; runs: number }>;
}

export function computeMetrics(runs: RunRecord[]): Metrics {
  const byTest = new Map<
    string,
    {
      file: string;
      passed: number;
      failed: number;
      durations: number[];
      /** Run index of every failure, in chronological order. */
      failedAt: number[];
    }
  >();

  runs.forEach((run, runIndex) => {
    for (const test of run.tests) {
      if (test.state === 'pending') continue;
      const entry = byTest.get(test.fullTitle) ?? {
        file: test.file,
        passed: 0,
        failed: 0,
        durations: [],
        failedAt: [],
      };
      if (test.state === 'passed') {
        entry.passed += 1;
      } else {
        entry.failed += 1;
        entry.failedAt.push(runIndex);
      }
      entry.durations.push(test.durationMs);
      byTest.set(test.fullTitle, entry);
    }
  });

  /**
   * A test that failed in one unbroken stretch of runs regressed — something
   * broke, then someone fixed it. A test whose failures are scattered across
   * the history is flaky. Counting both as "flaky" hides the difference, and
   * they call for opposite responses: find the commit, or find the race.
   */
  const isContiguous = (indexes: number[]) =>
    indexes.length > 0 && indexes[indexes.length - 1] - indexes[0] === indexes.length - 1;

  const average = (xs: number[]) =>
    xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;

  const entries = [...byTest.entries()];

  return {
    runs: runs.length,
    firstRun: runs[0]?.startedAt ?? null,
    lastRun: runs[runs.length - 1]?.startedAt ?? null,
    averageDurationMs: average(runs.map((r) => r.durationMs)),

    flaky: entries
      .filter(([, e]) => e.passed > 0 && e.failed > 0 && !isContiguous(e.failedAt))
      .map(([fullTitle, e]) => ({
        fullTitle,
        file: e.file,
        passed: e.passed,
        failed: e.failed,
      }))
      .sort((a, b) => b.failed - a.failed),

    regressed: entries
      .filter(([, e]) => e.failed > 0 && isContiguous(e.failedAt))
      .map(([fullTitle, e]) => ({
        fullTitle,
        file: e.file,
        failedRuns: e.failed,
        firstFailure: runs[e.failedAt[0]].startedAt,
        lastFailure: runs[e.failedAt[e.failedAt.length - 1]].startedAt,
        stillFailing: e.failedAt[e.failedAt.length - 1] === runs.length - 1,
      }))
      .sort((a, b) => b.failedRuns - a.failedRuns),

    slowest: entries
      .map(([fullTitle, e]) => ({
        fullTitle,
        file: e.file,
        averageDurationMs: average(e.durations),
      }))
      .sort((a, b) => b.averageDurationMs - a.averageDurationMs)
      .slice(0, 10),

    mostFailed: entries
      .filter(([, e]) => e.failed > 0)
      .map(([fullTitle, e]) => ({
        fullTitle,
        file: e.file,
        failures: e.failed,
        runs: e.passed + e.failed,
      }))
      .sort((a, b) => b.failures - a.failures)
      .slice(0, 10),
  };
}
