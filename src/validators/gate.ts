import type { Runner } from "./detect.js";
import { hasScript, listScripts } from "./detect.js";
import { cmd, chain } from "./commands.js";
import { run, type ExecResult } from "./exec.js";

export interface GateOptions {
  runner: Runner;
  cwd: string;
  e2eMode: "never" | "conditional" | "always";
  touchedFiles: string[];
  e2eTriggers: RegExp[];
}

export interface GateResult extends ExecResult {
  stage: "verify" | "fallback" | "e2e";
  ranE2E: boolean;
  scriptsSeen: string[];
}

const shouldRunE2E = (opt: GateOptions): boolean => {
  if (opt.e2eMode === "always") return true;
  if (opt.e2eMode === "never") return false;

  // conditional: run if touched files match triggers AND an e2e script exists
  const hasE2E = hasScript(opt.cwd, "e2e") || hasScript(opt.cwd, "test:e2e");
  if (!hasE2E) return false;

  return opt.touchedFiles.some((f) => opt.e2eTriggers.some((re) => re.test(f)));
};

export const runGate = (opt: GateOptions): GateResult => {
  const scriptsSeen = listScripts(opt.cwd);

  // Prefer a single 'verify' script if present
  if (hasScript(opt.cwd, "verify")) {
    const res = run(cmd(opt.runner, "verify"), opt.cwd);
    const needE2E = res.ok && shouldRunE2E(opt);
    if (!needE2E) {
      return { ...res, stage: "verify", ranE2E: false, scriptsSeen };
    }
    const e2eRes = run(
      hasScript(opt.cwd, "e2e")
        ? cmd(opt.runner, "e2e")
        : cmd(opt.runner, "test:e2e"),
      opt.cwd
    );
    return { ...e2eRes, stage: "e2e", ranE2E: true, scriptsSeen };
  }

  // Fallback chains (matches your agreed policy)
  const base =
    opt.runner === "bun"
      ? chain([
          cmd(opt.runner, "lint"),
          cmd(opt.runner, "typecheck"),
          cmd(opt.runner, "test"),
        ])
      : chain([
          hasScript(opt.cwd, "lint") ? cmd(opt.runner, "lint") : "pnpm -s lint",
          hasScript(opt.cwd, "typecheck")
            ? cmd(opt.runner, "typecheck")
            : "pnpm -s typecheck",
          hasScript(opt.cwd, "test:unit")
            ? cmd(opt.runner, "test:unit")
            : hasScript(opt.cwd, "test")
            ? cmd(opt.runner, "test")
            : "pnpm -s test",
        ]);

  const res = run(base, opt.cwd);
  const needE2E = res.ok && shouldRunE2E(opt);
  if (!needE2E) {
    return { ...res, stage: "fallback", ranE2E: false, scriptsSeen };
  }

  const e2eRes = run(
    hasScript(opt.cwd, "e2e")
      ? cmd(opt.runner, "e2e")
      : cmd(opt.runner, "test:e2e"),
    opt.cwd
  );
  return { ...e2eRes, stage: "e2e", ranE2E: true, scriptsSeen };
};
