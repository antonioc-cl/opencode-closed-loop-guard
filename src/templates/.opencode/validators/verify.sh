#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
RUNNER="$("$ROOT/.opencode/validators/detect-runner.sh" "$ROOT")"

# Prefer repo-defined scripts if they exist
has_script() {
  local name="$1"
  node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['$name'] ? 0 : 1)" >/dev/null 2>&1
}

if [ "$RUNNER" = "pnpm" ]; then
  if has_script "verify"; then
    pnpm -s verify
    exit 0
  fi
  if has_script "verify:direct"; then
    pnpm -s verify:direct
    exit 0
  fi

  # fallback chain
  if has_script "lint"; then pnpm -s lint; fi
  if has_script "typecheck"; then pnpm -s typecheck; fi
  if has_script "test:unit"; then pnpm -s test:unit; elif has_script "test"; then pnpm -s test; fi
  exit 0
fi

# bun runner
# Expected scripts: lint, typecheck, test
bun run lint
bun run typecheck
bun run test
