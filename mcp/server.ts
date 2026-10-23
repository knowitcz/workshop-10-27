#!/usr/bin/env node
/**
 * MCP server for the workshop app.
 *
 * One tool: run the end-to-end suite and report the counts and, for every
 * failing test, what failed and where.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { runSuite } from './suite.js';

const server = new McpServer({
  name: 'policy-renewal-tests',
  version: '0.2.0',
});

function json(value: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
  };
}

server.registerTool(
  'run_e2e_suite',
  {
    title: 'Run the E2E suite',
    description:
      'Runs the whole Cypress end-to-end suite. Reports the counts and, for every failing test, its name, its spec file, the assertion message and the code frame.',
    inputSchema: {},
  },
  async () => {
    const run = await runSuite();

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

const transport = new StdioServerTransport();
await server.connect(transport);
