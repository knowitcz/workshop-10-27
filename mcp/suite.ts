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

/** Run the suite, reusing an already-running dev server when there is one. */
export async function runSuite(spec?: string): Promise<SuiteCounts> {
  clearReports();

  const args = spec ? ['cypress', 'run', '--e2e', '--spec', spec] : ['cypress', 'run', '--e2e'];
  const started = Date.now();

  if (await devServerIsUp()) {
    await run('npx', args);
  } else {
    await run('npm', ['run', spec ? 'cy:run' : 'test:e2e']);
  }

  const durationMs = Date.now() - started;
  const reports = readReports();

  let passed = 0;
  let failed = 0;
  for (const report of reports) {
    passed += report?.stats?.passes ?? 0;
    failed += report?.stats?.failures ?? 0;
  }

  return { passed, failed, durationMs };
}
