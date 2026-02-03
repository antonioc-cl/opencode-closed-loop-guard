import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function loadConfig(root: string) {
  const local = join(root, ".opencode", "closed-loop-guard.json");

  if (existsSync(local)) {
    return JSON.parse(readFileSync(local, "utf8"));
  }

  return {
    protectedBranches: ["main", "master"],
    maxCycles: 5,
    logDir: ".opencode/logs",
    e2e: {
      mode: "conditional",
      triggers: [],
    },
  };
}
