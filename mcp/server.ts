#!/usr/bin/env node
/**
 * MCP server for the workshop app.
 *
 * Six tools: list the tests, run the whole suite, run one spec file, check
 * the environment, read the run history, and derive metrics from it.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { checkEnvironment } from './environment.js';
import { computeMetrics, listRuns, recordRun } from './history.js';
import { listSpecs } from './specs.js';
import { runSuite } from './suite.js';

const server = new McpServer({
  name: 'policy-renewal-tests',
  version: '1.0.0',
});

function json(value: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
  };
}

server.registerTool(
  'list_tests',
  {
    title: 'List the tests',
    description:
      'Lists every E2E spec file and the tests defined in it, without running anything. Each test is given by its full name (describe blocks + test title), alongside the spec file it lives in — pass that file to run_test_file.',
    inputSchema: {
      spec: z
        .string()
        .optional()
        .describe('Only spec files whose path contains this string, e.g. renewal'),
      name: z
        .string()
        .optional()
        .describe('Only tests whose full name contains this string, matched case-insensitively'),
    },
  },
  async ({ spec, name }) => {
    const needle = name?.toLowerCase();
    const specs = listSpecs()
      .filter((s) => !spec || s.file.includes(spec))
      .map((s) => ({
        file: s.file,
        tests: s.tests.filter((t) => !needle || t.fullTitle.toLowerCase().includes(needle)),
      }))
      .filter((s) => s.tests.length > 0 || !needle);

    return json({
      spec_files: specs.length,
      tests: specs.reduce((sum, s) => sum + s.tests.length, 0),
      specs: specs.map((s) => ({
        file: s.file,
        test_count: s.tests.length,
        tests: s.tests.map((t) => (t.modifier ? { test: t.fullTitle, marked: t.modifier } : t.fullTitle)),
      })),
    });
  }
);

server.registerTool(
  'run_e2e_suite',
  {
    title: 'Run the E2E suite',
    description:
      'Runs the whole Cypress end-to-end suite. Reports the counts and, for every failing test, its name, its spec file, the assertion message and the code frame.',
    inputSchema: {},
  },
  async () => {
    const startedAt = new Date();
    const run = await runSuite();
    recordRun(run, startedAt);

    return json({
      passed: run.passed,
      failed: run.failed,
      pending: run.pending,
      duration_ms: run.durationMs,
      failures: run.tests
        .filter((t) => t.state === 'failed')
        .map((t) => ({
          test: t.fullTitle,
          file: t.file,
          error: t.error,
          code_frame: t.codeFrame,
        })),
    });
  }
);

server.registerTool(
  'run_test_file',
  {
    title: 'Run one test file',
    description:
      'Runs every test in a single E2E spec file. Much faster than the whole suite when you are iterating on one failure. Use list_tests to find the spec file a test lives in.',
    inputSchema: {
      spec: z
        .string()
        .describe('Spec file path, e.g. cypress/e2e/renewal-journey.cy.ts'),
    },
  },
  async ({ spec }) => {
    const run = await runSuite({ spec });

    return json({
      spec,
      passed: run.passed,
      failed: run.failed,
      skipped: run.pending,
      duration_ms: run.durationMs,
      tests: run.tests.map((t) => ({
        test: t.fullTitle,
        file: t.file,
        state: t.state,
        duration_ms: t.durationMs,
        error: t.error,
        code_frame: t.codeFrame,
      })),
    });
  }
);

server.registerTool(
  'check_environment',
  {
    title: 'Check the environment',
    description:
      'Reports whether the dev server is up, whether dependencies and the Cypress binary are installed, and whether the Node version satisfies the project. Lists anything that would make a run fail.',
    inputSchema: {},
  },
  async () => json(await checkEnvironment())
);

server.registerTool(
  'get_run_history',
  {
    title: 'Get run history',
    description:
      'Returns previous suite runs, newest last: when each ran, how long it took, and how many tests passed and failed.',
    inputSchema: {
      limit: z.number().int().positive().optional().describe('How many runs to return (default 20)'),
      include_tests: z
        .boolean()
        .optional()
        .describe('Include each run’s per-test results (verbose)'),
    },
  },
  async ({ limit = 20, include_tests = false }) => {
    const runs = listRuns().slice(-limit);
    return json(
      runs.map((run) => ({
        id: run.id,
        started_at: run.startedAt,
        duration_ms: run.durationMs,
        passed: run.passed,
        failed: run.failed,
        pending: run.pending,
        ...(include_tests ? { tests: run.tests } : {}),
      }))
    );
  }
);

server.registerTool(
  'get_metrics',
  {
    title: 'Get suite metrics',
    description:
      'Derives metrics from the run history: which tests are flaky (have both passed and failed), which are slowest on average, and which fail most often.',
    inputSchema: {},
  },
  async () => json(computeMetrics(listRuns()))
);

const transport = new StdioServerTransport();
await server.connect(transport);
