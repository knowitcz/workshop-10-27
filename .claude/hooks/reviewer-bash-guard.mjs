// PreToolUse guard for the prod-reviewer subagent: the only shell command it may
// run is the read-only delivery-analysis script. Everything else is denied.
let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  const command = JSON.parse(input).tool_input?.command?.trim() ?? '';
  const allowed = /^node \.claude\/skills\/analyze-delivery\/scripts\/analyze-delivery\.mjs( --tests| [\w~^./-]+)?$/.test(command);
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: allowed ? 'allow' : 'deny',
      permissionDecisionReason: allowed ? 'the read-only analysis script' : 'prod-reviewer may only run the analyze-delivery script',
    },
  }));
});
