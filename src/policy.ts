import type { PluginConfig } from "./lib/config.js";
import type { JsonRecord } from "./lib/types.js";
import { run } from "./validators/exec.js";
import { safeTruncate } from "./lib/logger.js";

export interface Decision {
  allow: boolean;
  reason?: string;
}

const getCommand = (args: JsonRecord): string | null => {
  const cmd = args["command"] ?? args["cmd"] ?? args["shell"] ?? args["input"];
  return typeof cmd === "string" ? cmd : null;
};

export const currentBranch = (cwd: string): string | null => {
  const res = run("git rev-parse --abbrev-ref HEAD", cwd);
  if (!res.ok) return null;
  return res.output.trim();
};

export const decideBash = (
  cfg: PluginConfig,
  cwd: string,
  args: JsonRecord
): Decision => {
  const command = getCommand(args);
  if (!command) return { allow: true };

  for (const pattern of cfg.blockBashRegex) {
    const re = new RegExp(pattern, "i");
    if (re.test(command)) {
      return {
        allow: false,
        reason: `Blocked bash by pattern /${pattern}/: ${safeTruncate(
          command,
          300
        )}`,
      };
    }
  }

  // Block git push to protected branches
  if (/\bgit\s+push\b/i.test(command)) {
    const branch = currentBranch(cwd);
    if (branch && cfg.protectedBranches.includes(branch)) {
      return {
        allow: false,
        reason: `Blocked git push on protected branch '${branch}'.`,
      };
    }
  }

  // Block git reset --hard unless explicitly allowed by user config
  if (/\bgit\s+reset\b/i.test(command) && /--hard/i.test(command)) {
    return {
      allow: false,
      reason: "Blocked: git reset --hard is not allowed.",
    };
  }

  return { allow: true };
};

export const decideTool = (
  cfg: PluginConfig,
  cwd: string,
  toolName: string,
  args: JsonRecord
): Decision => {
  // Best-effort: treat bash specially; others default allow
  if (toolName === "bash" || toolName.toLowerCase().includes("bash")) {
    return decideBash(cfg, cwd, args);
  }
  return { allow: true };
};
