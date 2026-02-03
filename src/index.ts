import { loadConfig } from "./lib/config.js";
import {
  createJsonlLogger,
  logPaths,
  nowIso,
  safeTruncate,
} from "./lib/logger.js";
import {
  addTouchedFiles,
  clearTouchedFiles,
  loadState,
  saveState,
} from "./lib/state.js";
import type {
  HookHandler,
  JsonRecord,
  OpenCodeContext,
  OpenCodePlugin,
} from "./lib/types.js";
import { decideTool } from "./policy.js";
import { detectRunner } from "./validators/detect.js";
import { run } from "./validators/exec.js";
import { runGate } from "./validators/gate.js";

type AnyEvent = Record<string, unknown>;

const asRecord = (v: unknown): JsonRecord =>
  v && typeof v === "object" ? (v as JsonRecord) : {};

const getTool = (event: AnyEvent): string => {
  const tool = event["tool"];
  if (typeof tool === "string") return tool;
  const t2 = asRecord(event["input"])["tool"];
  return typeof t2 === "string" ? t2 : "unknown";
};

const getArgs = (event: AnyEvent): JsonRecord => {
  const args = event["args"] ?? asRecord(event["input"])["args"];
  return asRecord(args);
};

const touchedFilesFromGit = (cwd: string): string[] => {
  const res = run("git diff --name-only", cwd);
  if (!res.ok) return [];
  return res.output
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean);
};

export default function closedLoopGuard(ctx: OpenCodeContext): OpenCodePlugin {
  const cfg = loadConfig(ctx.project.root);
  const state = loadState(ctx.project.root, cfg.stateDir);

  const paths = logPaths(ctx.project.root, cfg.logDir);
  const logEvents = createJsonlLogger(paths.events);
  const logPre = createJsonlLogger(paths.toolPre);
  const logPost = createJsonlLogger(paths.toolPost);
  const logVal = createJsonlLogger(paths.validation);
  const logStop = createJsonlLogger(paths.stopGate);

  const log = (msg: string) => {
    try {
      ctx.client.app.log(`[closed-loop] ${msg}`);
    } catch {
      // ignore
    }
  };

  const persist = () => saveState(ctx.project.root, cfg.stateDir, state);

  log(`loaded (runId=${state.runId})`);

  const hooks: Record<string, HookHandler> = {
    "tool.execute.before": async (_c, event) => {
      const e = event as AnyEvent;
      const tool = getTool(e);
      const args = getArgs(e);

      const t0 = Date.now();
      const decision = decideTool(cfg, ctx.project.root, tool, args);

      logPre.write({
        ts: nowIso(),
        run_id: state.runId,
        cycle_id: state.cycleId,
        event: "tool.execute.before",
        tool,
        decision,
        args,
      });

      if (!decision.allow) {
        logEvents.write({
          ts: nowIso(),
          run_id: state.runId,
          cycle_id: state.cycleId,
          event: "blocked",
          tool,
          reason: decision.reason,
          duration_ms: Date.now() - t0,
        });

        // Best effort: OpenCode supports abort via output.abort; if present, set it.
        const output = asRecord(e["output"]);
        if (output && typeof output === "object") {
          output["abort"] = decision.reason ?? "Blocked by closed-loop policy";
        }

        throw new Error(decision.reason ?? "Blocked by closed-loop policy");
      }
    },

    "tool.execute.after": async (_c, event) => {
      const e = event as AnyEvent;
      const tool = getTool(e);
      const args = getArgs(e);

      // Track touched files after any tool execution. If git isn't available, no-op.
      const touched = touchedFilesFromGit(ctx.project.root);
      if (touched.length > 0) addTouchedFiles(state, touched);

      logPost.write({
        ts: nowIso(),
        run_id: state.runId,
        cycle_id: state.cycleId,
        event: "tool.execute.after",
        tool,
        args,
        touched_files: touched,
      });

      persist();
    },

    "session.idle": async () => {
      const runner = detectRunner(ctx.project.root);
      const e2eTriggers = cfg.gate.e2eTriggers.map(
        (s: string) => new RegExp(s, "i")
      );

      // If nothing changed since last green, don't run gate (keeps idle clean).
      if (state.touchedFiles.length === 0 && state.lastGateOk) {
        return;
      }

      logStop.write({
        ts: nowIso(),
        run_id: state.runId,
        cycle_id: state.cycleId,
        event: "stop_gate.start",
        runner,
        touched_files: state.touchedFiles,
      });

      const res = runGate({
        runner,
        cwd: ctx.project.root,
        e2eMode: cfg.gate.e2eMode,
        touchedFiles: state.touchedFiles,
        e2eTriggers,
      });

      logVal.write({
        ts: nowIso(),
        run_id: state.runId,
        cycle_id: state.cycleId,
        event: "validation",
        ok: res.ok,
        stage: res.stage,
        ran_e2e: res.ranE2E,
        command: res.command,
        output: safeTruncate(res.output, 6000),
        scripts_seen: res.scriptsSeen,
      });

      if (res.ok) {
        state.lastGateOk = true;
        state.lastGateAt = nowIso();
        state.cycleId = 0;
        clearTouchedFiles(state);
        persist();

        logStop.write({
          ts: nowIso(),
          run_id: state.runId,
          cycle_id: state.cycleId,
          event: "stop_gate.pass",
          stage: res.stage,
          ran_e2e: res.ranE2E,
        });

        log("✅ gate passed");
        return;
      }

      // Gate failed: increase cycle counter and force continuation.
      state.lastGateOk = false;
      state.cycleId += 1;
      persist();

      logStop.write({
        ts: nowIso(),
        run_id: state.runId,
        cycle_id: state.cycleId,
        event: "stop_gate.fail",
        stage: res.stage,
        command: res.command,
      });

      if (state.cycleId > cfg.gate.maxCycles) {
        // Stop auto-looping after N cycles; ask user.
        const msg =
          `❌ Validation gate keeps failing after ${cfg.gate.maxCycles} attempts.\n\n` +
          `Last command: ${res.command}\n\n` +
          `Please review the error and decide next steps:\n\n` +
          safeTruncate(res.output, 2000);

        await ctx.client.session.prompt({ parts: [{ text: msg }] });
        return;
      }

      const fixMsg =
        `❌ Validation gate failed (attempt ${state.cycleId}/${cfg.gate.maxCycles}).\n\n` +
        `Command:\n${res.command}\n\n` +
        `Errors:\n${safeTruncate(res.output, 2000)}\n\n` +
        `Rules:\n- Fix the failures.\n- Re-run the correct validation command(s).\n- Do NOT claim completion until the gate passes.\n`;

      await ctx.client.session.prompt({ parts: [{ text: fixMsg }] });
    },
  };

  return {
    name: "opencode-closed-loop-guard",
    hooks,
  };
}
