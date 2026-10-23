import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { REPO_ROOT } from './suite.js';

export const SPEC_DIR = join(REPO_ROOT, 'cypress', 'e2e');

export interface DefinedTest {
  /** The test's own title, as written in `it('…')`. */
  title: string;
  /** The `describe` titles and the test title, joined — what mochawesome reports. */
  fullTitle: string;
  /** Set when the test is marked `.only` or `.skip` in the source. */
  modifier?: 'only' | 'skip';
}

export interface SpecFile {
  file: string;
  tests: DefinedTest[];
}

const SUITE_CALLS = new Set(['describe', 'context']);
const TEST_CALLS = new Set(['it', 'specify']);

/** `it`, `it.only`, `describe.skip`, … → the base name and the modifier, if any. */
function callName(expr: ts.Expression): { name: string; modifier?: 'only' | 'skip' } | null {
  if (ts.isIdentifier(expr)) return { name: expr.text };
  if (
    ts.isPropertyAccessExpression(expr) &&
    ts.isIdentifier(expr.expression) &&
    (expr.name.text === 'only' || expr.name.text === 'skip')
  ) {
    return { name: expr.expression.text, modifier: expr.name.text };
  }
  return null;
}

function titleOf(node: ts.CallExpression): string | null {
  const first = node.arguments[0];
  if (first && (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first))) {
    return first.text;
  }
  return null;
}

/**
 * Read the tests a spec file defines, without running it. The file is parsed,
 * not executed, so this takes milliseconds — but a title built at runtime
 * (a template with `${…}`, a variable) cannot be read and is skipped.
 */
export function testsInSpec(path: string): DefinedTest[] {
  const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
  const tests: DefinedTest[] = [];

  function visit(node: ts.Node, suites: string[]) {
    if (ts.isCallExpression(node)) {
      const call = callName(node.expression);
      const title = titleOf(node);
      if (call && title !== null) {
        if (SUITE_CALLS.has(call.name)) {
          node.arguments.slice(1).forEach((arg) => visit(arg, [...suites, title]));
          return;
        }
        if (TEST_CALLS.has(call.name)) {
          tests.push({
            title,
            fullTitle: [...suites, title].join(' '),
            ...(call.modifier ? { modifier: call.modifier } : {}),
          });
          return;
        }
      }
    }
    ts.forEachChild(node, (child) => visit(child, suites));
  }

  visit(source, []);
  return tests;
}

/** Every spec in `cypress/e2e`, with the tests it defines. */
export function listSpecs(): SpecFile[] {
  return readdirSync(SPEC_DIR)
    .filter((f) => f.endsWith('.cy.ts'))
    .sort()
    .map((f) => {
      const path = join(SPEC_DIR, f);
      return { file: relative(REPO_ROOT, path), tests: testsInSpec(path) };
    });
}
