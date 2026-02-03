import { execa } from "execa";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function detectRunner(root: string): "bun" | "pnpm" {
  const pkg = join(root, "package.json");

  if (existsSync(pkg)) {
    const json = JSON.parse(readFileSync(pkg, "utf8"));
    if (json.packageManager?.startsWith("bun@")) return "bun";
  }

  if (existsSync(join(root, "bun.lockb"))) return "bun";
  return "pnpm";
}

export async function runVerifyGate(root: string, runner: "bun" | "pnpm") {
  const cmd =
    runner === "bun"
      ? "bun run lint && bun run typecheck && bun run test"
      : "pnpm -s verify";

  try {
    const { stdout } = await execa(cmd, { cwd: root, shell: true });
    return { ok: true, command: cmd, output: stdout };
  } catch (e: any) {
    return {
      ok: false,
      command: cmd,
      output: e.stdout || e.stderr || e.message,
    };
  }
}
