import { z } from "zod";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export const ConfigSchema = z.object({
  protectedBranches: z.array(z.string()).default(["main", "master", "production"]),
  /**
   * Glob-ish patterns. We don't implement full glob matching in the plugin
   * (to keep deps minimal). These are used for best-effort checks and logging.
   * Prefer blocking via bash patterns + OpenCode permission config.
   */
  protectedPaths: z.array(z.string()).default(["**/.env", "**/.env.*", "**/.git/**"]),

  /**
   * Regex strings (JS) tested against bash commands.
   * Example: ["rm\s+-rf\s+", "git\s+push\s+.*\s+(main|master)"]
   */
  blockBashRegex: z.array(z.string()).default([
    "\brm\s+-rf\b",
    "\bsudo\b",
    "\bchmod\b\s+777\b",
    "\bmkfs\b",
    "\bdd\b",
    "\bshutdown\b",
    "\breboot\b"
  ]),

  logDir: z.string().default(".opencode/logs"),
  stateDir: z.string().default(".opencode/state"),

  /** Stop-gate behavior */
  gate: z.object({
    maxCycles: z.number().int().min(1).max(50).default(5),
    e2eMode: z.enum(["never", "conditional", "always"]).default("conditional"),
    e2eTriggers: z.array(z.string()).default([
      "^apps/web/",
      "^apps/api/",
      "^src/auth/",
      "payment",
      "checkout"
    ])
  }).default({}),

  /** When true, run lint/typecheck after edits (fast feedback). */
  microValidate: z.boolean().default(true),

  /** When true, plugin injects a ✅ Gate passed message on success. */
  announcePass: z.boolean().default(true)
});

export type PluginConfig = z.infer<typeof ConfigSchema>;

export const loadConfig = (projectRoot: string): PluginConfig => {
  const configPath = join(projectRoot, ".opencode", "closed-loop-guard.json");
  const raw = existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : {};
  const cfg = ConfigSchema.parse(raw);

  // Ensure dirs exist
  mkdirSync(join(projectRoot, cfg.logDir), { recursive: true });
  mkdirSync(join(projectRoot, cfg.stateDir), { recursive: true });

  return cfg;
};
