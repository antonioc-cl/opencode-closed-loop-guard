#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
RUNNER="$("$ROOT/.opencode/validators/detect-runner.sh" "$ROOT")"

if [ "$RUNNER" = "pnpm" ]; then
  pnpm -s lint
else
  bun run lint
fi
