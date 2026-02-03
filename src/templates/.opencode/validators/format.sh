#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
RUNNER="$("$ROOT/.opencode/validators/detect-runner.sh" "$ROOT")"

# Prefer biome if present
if [ -f "$ROOT/biome.json" ] || [ -f "$ROOT/biome.jsonc" ]; then
  if [ "$RUNNER" = "pnpm" ]; then pnpm -s format || true; else bun run format || true; fi
  exit 0
fi

# Otherwise try prettier if script exists
node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['format'] ? 0 : 1)" >/dev/null 2>&1 || exit 0
if [ "$RUNNER" = "pnpm" ]; then pnpm -s format; else bun run format; fi
