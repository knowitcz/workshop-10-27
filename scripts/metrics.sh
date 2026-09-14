#!/usr/bin/env bash
# Suite metrics for FACILITATOR.md. Run from the repo root.
cd "$(dirname "$0")/.."
count() { grep -rhoE "$1" "${@:2}" 2>/dev/null | wc -l | tr -d ' '; }
echo "spec files:        $(ls cypress/e2e/*.cy.ts 2>/dev/null | wc -l | tr -d ' ')"
echo "tests (it):        $(count "^\s*it(\.only)?\(" cypress/e2e)"
echo "cy.wait(number):   $(count 'cy\.wait\([0-9]+\)' cypress/e2e cypress/support cypress/pages cypress/tasks)"
echo "  inside pages:    $(count 'cy\.wait\([0-9]+\)' cypress/pages)"
echo "cy.wait(alias):    $(count "cy\.wait\('@" cypress)"
echo "SLIDER_W decls:    $(count 'const SLIDER_W' cypress src)"
echo "data-cy in src:    $(count 'data-cy' src index.html)"
echo "unit tests:        $(count "^\s*it\(" src)"
echo "e2e LOC:           $(cat cypress/e2e/*.cy.ts 2>/dev/null | wc -l | tr -d ' ')"
echo "page selectors read in specs: $(count '\.selectors\.' cypress/e2e)"
echo "assertions in pages:          $(count "\.should\(" cypress/pages)"
echo -n "unique selectors in specs: "
grep -rhoE "(cy\.get|cy\.contains)\('[^']+'" cypress/e2e 2>/dev/null \
  | sed -E "s/.*\('//" | sort -u | wc -l | tr -d ' '
