#!/usr/bin/env node
/**
 * MCP server for the workshop app — first version.
 *
 * Exactly one tool: run the end-to-end suite and say how many tests passed and
 * failed. That is all it says.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { runSuite } from './suite.js';

const server = new McpServer({
  name: 'policy-renewal-tests',
  version: '0.1.0',
});

server.registerTool(
  'run_e2e_suite',
  {
    title: 'Run the E2E suite',
    description:
      'Runs the Cypress end-to-end suite for the policy renewal app and reports how many tests passed, how many failed, and how long it took.',
    inputSchema: {},
  },
  async () => {
    const { passed, failed, durationMs } = await runSuite();

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              passed,
              failed,
              duration_ms: durationMs,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
