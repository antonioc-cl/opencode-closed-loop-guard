#!/usr/bin/env node
/**
 * CLI for opencode-closed-loop-guard.
 * - npx opencode-closed-loop-guard init — interactive scaffold of .opencode/commands, validators, config, specs
 */
import { runInit } from "./init.js";

const USAGE = `Usage: opencode-closed-loop-guard init [--force]
       opencode-closed-loop-guard --help

  init        Interactively scaffold:
              - RPI workflow commands (research_questions, design_from_research, etc.)
              - Team agents (researcher, builder, validator)
              - Validators (lint, typecheck, unit, e2e, verify)
              - Config (.opencode/closed-loop-guard.json)
              - Specs folder (specs/)

              Optionally patch opencode.json and append .gitignore.
              Non-TTY: scaffolds commands, agents, config, validators, specs.

  --force     Overwrite existing files (backup as .bak.<timestamp>).
  -h, --help  Show this help.
`;

function main(): void {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    process.stdout.write(USAGE);
    process.exit(0);
  }

  if (args[0] !== "init") {
    process.stderr.write(USAGE);
    process.exit(1);
  }

  const force = args.includes("--force");

  runInit({ force })
    .then(() => {
      process.exit(0);
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`init failed: ${message}\n`);
      process.exit(1);
    });
}

main();
