#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
RUNNER="$("$ROOT/.opencode/validators/detect-runner.sh" "$ROOT")"

has_script() {
  local name="$1"
  node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['$name'] ? 0 : 1)" >/dev/null 2>&1
}

if [ "$RUNNER" = "pnpm" ]; then
  if has_script "test:e2e"; then pnpm -s test:e2e; elif has_script "e2e"; then pnpm -s e2e; else
    echo "No e2e script found." >&2
    exit 1
  fi
else
  if bun run e2e; then exit 0; fi
  echo "No e2e script found." >&2
  exit 1
fi
