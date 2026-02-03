import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Runner = "bun" | "pnpm";

export interface PackageJsonScripts {
  scripts: Record<string, string>;
  packageManager?: string;
}

export const readPackageJson = (cwd: string): PackageJsonScripts | null => {
  const p = join(cwd, "package.json");
  if (!existsSync(p)) return null;
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as { scripts?: Record<string, string>; packageManager?: string };
    return { scripts: raw.scripts ?? {}, packageManager: raw.packageManager };
  } catch {
    return null;
  }
};

export const detectRunner = (cwd: string): Runner => {
  const pkg = readPackageJson(cwd);
  if (pkg?.packageManager?.startsWith("bun@")) return "bun";
  if (existsSync(join(cwd, "bun.lockb"))) return "bun";
  return "pnpm";
};

export const hasScript = (cwd: string, name: string): boolean => {
  const pkg = readPackageJson(cwd);
  return !!pkg?.scripts?.[name];
};

export const listScripts = (cwd: string): string[] => {
  const pkg = readPackageJson(cwd);
  return Object.keys(pkg?.scripts ?? {});
};
