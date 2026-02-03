#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"

if [ -f "$ROOT/package.json" ]; then
  if grep -q '"packageManager"[[:space:]]*:[[:space:]]*"bun@' "$ROOT/package.json"; then
    echo "bun"
    exit 0
  fi
fi

if [ -f "$ROOT/bun.lockb" ]; then
  echo "bun"
  exit 0
fi

echo "pnpm"
