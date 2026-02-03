import { execSync } from "node:child_process";

export interface ExecResult {
  ok: boolean;
  command: string;
  output: string;
  code?: number;
}

export const run = (cmd: string, cwd: string): ExecResult => {
  try {
    const out = execSync(cmd, { cwd, stdio: "pipe", env: process.env }).toString("utf8");
    return { ok: true, command: cmd, output: out };
  } catch (e: unknown) {
    const err = e as { stdout?: Buffer; stderr?: Buffer; status?: number; message?: string };
    const output =
      (err.stdout?.toString("utf8") ?? "") +
      (err.stderr?.toString("utf8") ?? "") +
      (err.message ?? "");
    return { ok: false, command: cmd, output, code: err.status };
  }
};
