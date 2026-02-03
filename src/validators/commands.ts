import type { Runner } from "./detect.js";

export const cmd = (runner: Runner, script: string): string =>
  runner === "bun" ? `bun run ${script}` : `pnpm -s ${script}`;

export const chain = (cmds: string[]): string => cmds.join(" && ");
