# MCP server

A Model Context Protocol server that lets an agent run this repository's test
suite.

## Running it

```
npm run mcp
```

It speaks MCP over stdio, so there is nothing useful to see when you run it by
hand. To poke at it without an agent:

```
node scripts/mcp-probe.mjs                 # list the tools
node scripts/mcp-probe.mjs run_e2e_suite   # call one
```

## Wiring it to a client

```json
{
  "mcpServers": {
    "policy-renewal-tests": {
      "command": "npx",
      "args": ["tsx", "mcp/server.ts"],
      "cwd": "/absolute/path/to/this/repo"
    }
  }
}
```

## Tools

| Tool | What it returns |
|---|---|
| `run_e2e_suite` | how many tests passed, how many failed, how long it took |

## A note on the dev server

The server reuses a dev server already running on :5173. If there is none it
starts one for the duration of the run via `npm run test:e2e`.
