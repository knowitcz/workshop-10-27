#!/usr/bin/env node
/**
 * Probe the MCP server without an agent.
 *
 *   node scripts/mcp-probe.mjs                          # list the tools
 *   node scripts/mcp-probe.mjs run_e2e_suite            # call one
 *   node scripts/mcp-probe.mjs run_single_test '{"name":"..."}'
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const toolName = process.argv[2];
const args = process.argv[3] ? JSON.parse(process.argv[3]) : {};

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['tsx', 'mcp/server.ts'],
  cwd: repo,
});
const client = new Client({ name: 'probe', version: '1.0.0' });
await client.connect(transport);

const { tools } = await client.listTools();
console.log('TOOLS: ' + tools.map((t) => t.name).join(', '));

if (toolName) {
  // A full suite run takes longer than the SDK's 60 s default request timeout.
  const res = await client.callTool(
    { name: toolName, arguments: args },
    undefined,
    { timeout: 15 * 60 * 1000 }
  );
  console.log('--- result ---');
  for (const c of res.content) console.log(c.text);
}

await client.close();
process.exit(0);
