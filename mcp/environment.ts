import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BASE_URL, REPO_ROOT, devServerIsUp } from './suite.js';

function version(command: string, args: string[]): string {
  try {
    return execFileSync(command, args, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'not available';
  }
}

export interface Environment {
  devServer: { url: string; running: boolean };
  node: { running: string; required: string; satisfied: boolean };
  npm: string;
  cypress: string;
  dependenciesInstalled: boolean;
  cypressBinaryInstalled: boolean;
  problems: string[];
}

export async function checkEnvironment(): Promise<Environment> {
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
  const required = pkg.engines?.node ?? '*';
  const running = process.version;
  const major = Number(running.replace('v', '').split('.')[0]);
  const requiredMajor = Number(String(required).replace(/[^0-9.]/g, '').split('.')[0]);
  const satisfied = Number.isNaN(requiredMajor) ? true : major >= requiredMajor;

  const cypressPkg = join(REPO_ROOT, 'node_modules', 'cypress', 'package.json');
  const dependenciesInstalled = existsSync(cypressPkg);
  const cypressVersion = dependenciesInstalled
    ? JSON.parse(readFileSync(cypressPkg, 'utf8')).version
    : 'not installed';
  let cypressBinaryInstalled = false;
  try {
    execFileSync('npx', ['cypress', 'verify'], { cwd: REPO_ROOT, stdio: 'ignore' });
    cypressBinaryInstalled = true;
  } catch {
    cypressBinaryInstalled = false;
  }

  const running_ = await devServerIsUp();

  const problems: string[] = [];
  if (!dependenciesInstalled) problems.push('node_modules is missing — run `npm ci`.');
  if (!cypressBinaryInstalled)
    problems.push('The Cypress binary is not installed — run `npx cypress install`.');
  if (!satisfied) problems.push(`Node ${running} does not satisfy engines.node ${required}.`);
  if (!running_)
    problems.push(
      `No dev server on ${BASE_URL}. The suite will start one itself, which makes each run slower.`
    );

  return {
    devServer: { url: BASE_URL, running: running_ },
    node: { running, required, satisfied },
    npm: version('npm', ['--version']),
    cypress: cypressVersion,
    dependenciesInstalled,
    cypressBinaryInstalled,
    problems,
  };
}
