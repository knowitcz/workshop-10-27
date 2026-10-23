// Read-only: lists what a delivery changed under src/ and what would make it hard to test.
//   node .claude/skills/analyze-delivery/scripts/analyze-delivery.mjs [range]   (default HEAD~1..HEAD)
//   node .claude/skills/analyze-delivery/scripts/analyze-delivery.mjs --tests   (scan the tests instead)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean);
const tests = git('ls-files', '--', 'cypress/*.cy.ts', 'cypress/*.cy.tsx', 'src/*.test.ts');
const BLOCKERS = { sessionStorage: /sessionStorage/, localStorage: /localStorage/, fetch: /\bfetch\(/, 'new Date()': /new Date\(\)/, window: /\bwindow\./ };

if (process.argv[2] === '--tests') {
  console.log('test file | line | coupling to production internals');
  for (const file of tests)
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (/(session|local)Storage\.setItem/.test(line)) console.log(`${file} | ${i + 1} | pre-fills storage: ${line.trim()}`);
    });
} else {
  const changed = git('diff', '--name-only', process.argv[2] ?? 'HEAD~1..HEAD', '--', 'src')
    .filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) && existsSync(f));
  console.log('file | kind | blockers | imported by a test');
  for (const file of changed) {
    const kind = file.includes('/screens/') ? 'screen' : file.includes('/components/') ? 'component' : file.includes('/domain/') ? 'rule' : 'other';
    const source = readFileSync(file, 'utf8');
    const blockers = Object.keys(BLOCKERS).filter((name) => BLOCKERS[name].test(source));
    const module = file.split('/').pop().replace(/\.tsx?$/, '');
    const tested = tests.some((t) => new RegExp(`from ['"][^'"]*/${module}['"]`).test(readFileSync(t, 'utf8')));
    console.log(`${file} | ${kind} | ${blockers.join(', ') || '—'} | ${tested ? 'yes' : 'no'}`);
  }
}
