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
| `list_tests` | every spec file and the full name of every test in it, without running anything |
| `run_e2e_suite` | counts, plus every failure's test name, spec file, assertion message and code frame |
| `run_test_file` | the same, for every test in one spec file |
| `check_environment` | dev server, Node/npm/Cypress versions, whether anything would make a run fail |

### Listing the tests

`list_tests` parses the spec files with the TypeScript compiler instead of
running Cypress, so it answers in well under a second. It takes an optional
`spec` (part of the file path) and `name` (part of the test name,
case-insensitive):

```
node scripts/mcp-probe.mjs list_tests '{"spec":"policy-list"}'
```

The names it returns are the full titles — `describe` blocks plus the test
title — exactly as a run reports them, so a test found here can be traced back
to the spec file it lives in, which is what `run_test_file` takes. A title built
at runtime (a template with `${…}`) cannot be read without running the file and
is left out.

### Running one spec file

`run_test_file` takes a spec path and runs every test in it:

```
node scripts/mcp-probe.mjs run_test_file '{"spec":"cypress/e2e/policy-list.cy.ts"}'
```

It is Cypress's own `--spec`, nothing more — no plugin, no custom `beforeEach`,
no `@cypress/grep` (which does not resolve against Cypress 13 without
`--legacy-peer-deps` anyway). The file is the unit of selection on purpose: it
needs no machinery, and it is already the difference between **6.8 s** for
`policy-list.cy.ts` and about **33 s** for the suite.

## A note on the dev server

The server reuses a dev server already running on :5173. If there is none it
starts one for the duration of the run via `npm run test:e2e`.
