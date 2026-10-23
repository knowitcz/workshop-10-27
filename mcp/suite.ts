import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const REPORT_DIR = join(REPO_ROOT, 'reports', 'mochawesome');
export const BASE_URL = 'http://localhost:5173';

export interface SuiteCounts {
  passed: number;
  failed: number;
  durationMs: number;
}

export interface TestResult {
  title: string;
  fullTitle: string;
  file: string;
  state: 'passed' | 'failed' | 'pending';
  durationMs: number;
  error?: string;
  codeFrame?: string;
}

export interface SuiteRun extends SuiteCounts {
  pending: number;
  tests: TestResult[];
}

/** Is the dev server already up? */
export async function devServerIsUp(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(BASE_URL, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

function run(command: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: REPO_ROOT,
      // stdout must stay clean: the MCP protocol owns it.
      stdio: ['ignore', 'ignore', 'ignore'],
      env: { ...process.env, NO_COLOR: '1' },
    });
    child.on('close', (code) => resolve(code ?? 1));
    child.on('error', () => resolve(1));
  });
}

export function clearReports(): void {
  if (existsSync(REPORT_DIR)) {
    rmSync(REPORT_DIR, { recursive: true, force: true });
  }
  mkdirSync(REPORT_DIR, { recursive: true });
}

/** Every mochawesome JSON file the last run produced. */
export function readReports(): any[] {
  if (!existsSync(REPORT_DIR)) return [];
  return readdirSync(REPORT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(REPORT_DIR, f), 'utf8'));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/** Walk a mochawesome suite tree and collect every test in it. */
function collectTests(suite: any, file: string, into: TestResult[]): void {
  for (const test of suite?.tests ?? []) {
    into.push({
      title: test.title,
      fullTitle: test.fullTitle,
      file,
      state: test.pending ? 'pending' : test.state === 'passed' ? 'passed' : 'failed',
      durationMs: test.duration ?? 0,
      error: test.err?.message || undefined,
      codeFrame: test.err?.estack || undefined,
    });
  }
  for (const child of suite?.suites ?? []) {
    collectTests(child, file, into);
  }
}

export function testsFromReports(reports: any[]): TestResult[] {
  const tests: TestResult[] = [];
  for (const report of reports) {
    for (const result of report?.results ?? []) {
      const file = result.file ?? result.fullFile ?? 'unknown';
      collectTests(result, file, tests);
    }
  }
  return tests;
}

export interface RunOptions {
  spec?: string;
  /** Substring of the test name, matched case-insensitively. */
}

/** Run the suite, reusing an already-running dev server when there is one. */
export async function runSuite(options: RunOptions = {}): Promise<SuiteRun> {
  clearReports();

  const { spec } = options;
  const started = Date.now();

  const cypressArgs = ['cypress', 'run', '--e2e'];
  if (spec) cypressArgs.push('--spec', spec);

  if (await devServerIsUp()) {
    await run('npx', cypressArgs);
  } else {
    await run('npx', [
      'start-server-and-test',
      'dev',
      BASE_URL,
      `npx ${cypressArgs.join(' ')}`,
    ]);
  }

  const durationMs = Date.now() - started;
  const reports = readReports();
  const tests = testsFromReports(reports);

  return {
    passed: tests.filter((t) => t.state === 'passed').length,
    failed: tests.filter((t) => t.state === 'failed').length,
    pending: tests.filter((t) => t.state === 'pending').length,
    durationMs,
    tests,
  };
}
