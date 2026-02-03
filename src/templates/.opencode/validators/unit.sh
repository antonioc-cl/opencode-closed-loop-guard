#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
RUNNER="$("$ROOT/.opencode/validators/detect-runner.sh" "$ROOT")"

has_script() {
  local name="$1"
  node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['$name'] ? 0 : 1)" >/dev/null 2>&1
}

if [ "$RUNNER" = "pnpm" ]; then
  if has_script "test:unit"; then pnpm -s test:unit; else pnpm -s test; fi
else
  bun run test
fi
