/**
 * Interactive init: scaffold .opencode/commands, validators, config, specs, optional opencode.json and .gitignore.
 * Default install target: ~/.config/opencode (global). Optional: current repo.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GLOBAL_CONFIG_DIR = path.join(os.homedir(), ".config", "opencode");

/** OpenCode global config dir has same structure as .opencode, so contents go directly under it (no .opencode/ prefix). */
function relPathForBase(rel: string, baseDir: string): string {
  if (baseDir === GLOBAL_CONFIG_DIR && rel.startsWith(".opencode/")) {
    return rel.slice(".opencode/".length);
  }
  return rel;
}

function toDisplayPath(baseDir: string, rel: string): string {
  const effective = relPathForBase(rel, baseDir);
  if (baseDir === GLOBAL_CONFIG_DIR) {
    return path.join("~", ".config", "opencode", effective);
  }
  return path.join(baseDir, effective);
}

export type InitCategory =
  | "commands"
  | "agents"
  | "config"
  | "validators"
  | "specs"
  | "patchOpencode"
  | "gitignore";

const INIT_OPTIONS: { id: InitCategory; label: string; files: string[] }[] = [
  {
    id: "commands",
    label: "Commands (.opencode/commands/*)",
    files: [
      ".opencode/commands/research_questions.md",
      ".opencode/commands/research_from_questions.md",
      ".opencode/commands/design_from_research.md",
      ".opencode/commands/outline_from_design.md",
      ".opencode/commands/plan_w_team.md",
      ".opencode/commands/build_from_plan.md",
    ],
  },
  {
    id: "agents",
    label: "Agents (.opencode/agents/team/*)",
    files: [
      ".opencode/agents/team/researcher.md",
      ".opencode/agents/team/builder.md",
      ".opencode/agents/team/validator.md",
    ],
  },
  {
    id: "config",
    label: "Project config (.opencode/closed-loop-guard.json)",
    files: [".opencode/closed-loop-guard.json"],
  },
  {
    id: "validators",
    label: "Validators (.opencode/validators/*)",
    files: [
      ".opencode/validators/detect-runner.sh",
      ".opencode/validators/verify.sh",
      ".opencode/validators/lint.sh",
      ".opencode/validators/typecheck.sh",
      ".opencode/validators/unit.sh",
      ".opencode/validators/e2e.sh",
      ".opencode/validators/format.sh",
    ],
  },
  { id: "specs", label: "Specs folder (specs/)", files: ["specs/.gitkeep"] },
  {
    id: "patchOpencode",
    label: "Patch opencode.json (add plugin to install target) (optional)",
    files: [],
  },
  { id: "gitignore", label: "Append .gitignore entries (optional)", files: [] },
];

const DEFAULT_SELECTION: InitCategory[] = [
  "commands",
  "agents",
  "config",
  "validators",
  "specs",
];

function getTemplateDir(): string {
  return path.join(__dirname, "templates");
}

function isTTY(): boolean {
  return process.platform !== "win32" && process.stdin.isTTY === true;
}

function question(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

/** Returns install base directory: ~/.config/opencode (default) or cwd. */
async function promptInstallTarget(): Promise<string> {
  if (!isTTY()) {
    return GLOBAL_CONFIG_DIR;
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  process.stdout.write("Where to install?\n");
  process.stdout.write("  1. Global (~/.config/opencode) [default]\n");
  process.stdout.write("  2. Current repo (.)\n");
  const raw = await question(rl, "Choice (1 or 2): ");
  rl.close();
  const choice = raw.trim() || "1";
  return choice === "2" ? process.cwd() : GLOBAL_CONFIG_DIR;
}

async function promptSelection(_force: boolean): Promise<InitCategory[]> {
  if (!isTTY()) {
    return [...DEFAULT_SELECTION];
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  process.stdout.write("Which items to scaffold?\n");
  for (let i = 0; i < INIT_OPTIONS.length; i++) {
    process.stdout.write(`  ${i + 1}. ${INIT_OPTIONS[i].label}\n`);
  }
  process.stdout.write(
    "Enter comma-separated numbers (e.g. 1,2,3,4,5,6). Default: 1,2,3,4,5\n"
  );
  const raw = await question(rl, "Selection: ");
  rl.close();

  if (!raw) {
    return [...DEFAULT_SELECTION];
  }
  const indices = new Set(
    raw
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => n >= 1 && n <= INIT_OPTIONS.length)
  );
  return Array.from(indices).map((i) => INIT_OPTIONS[i - 1].id);
}

function collectFilesToWrite(
  templateDir: string,
  baseDir: string,
  selected: InitCategory[],
  force: boolean
): {
  toCreate: string[];
  toSkip: string[];
  toOverwrite: string[];
  patchOpencode: boolean;
  appendGitignore: boolean;
} {
  const toCreate: string[] = [];
  const toSkip: string[] = [];
  const toOverwrite: string[] = [];
  let patchOpencode = false;
  let appendGitignore = false;

  for (const cat of selected) {
    if (cat === "patchOpencode") {
      patchOpencode = true;
      const p = path.join(baseDir, "opencode.json");
      if (fs.existsSync(p)) toOverwrite.push("opencode.json (merge)");
      else toCreate.push("opencode.json");
      continue;
    }
    if (cat === "gitignore") {
      appendGitignore = true;
      toCreate.push(".gitignore (append)");
      continue;
    }
    const opt = INIT_OPTIONS.find((o) => o.id === cat);
    if (!opt || opt.files.length === 0) continue;
    for (const rel of opt.files) {
      const destRel = relPathForBase(rel, baseDir);
      const dest = path.join(baseDir, destRel);
      const src = path.join(templateDir, rel);
      if (!fs.existsSync(src)) continue;
      if (fs.existsSync(dest)) {
        if (force) toOverwrite.push(rel);
        else toSkip.push(rel);
      } else {
        toCreate.push(rel);
      }
    }
  }

  return { toCreate, toSkip, toOverwrite, patchOpencode, appendGitignore };
}

async function confirmWrite(
  toCreate: string[],
  toSkip: string[],
  toOverwrite: string[],
  baseDir: string
): Promise<boolean> {
  if (toCreate.length > 0) {
    process.stdout.write("Will create:\n");
    for (const f of toCreate)
      process.stdout.write(`  + ${toDisplayPath(baseDir, f)}\n`);
  }
  if (toOverwrite.length > 0) {
    process.stdout.write("Will overwrite (--force):\n");
    for (const f of toOverwrite)
      process.stdout.write(`  ~ ${toDisplayPath(baseDir, f)}\n`);
  }
  if (toSkip.length > 0) {
    process.stdout.write("Will skip (already exist):\n");
    for (const f of toSkip)
      process.stdout.write(`  - ${toDisplayPath(baseDir, f)}\n`);
  }
  if (toCreate.length === 0 && toOverwrite.length === 0) {
    process.stdout.write("Nothing to write.\n");
    return false;
  }

  if (!isTTY()) {
    return true;
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await question(rl, "Proceed? (y/N): ");
  rl.close();
  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}

function copyFile(
  templateDir: string,
  baseDir: string,
  rel: string,
  force: boolean
): void {
  const src = path.join(templateDir, rel);
  const destRel = relPathForBase(rel, baseDir);
  const dest = path.join(baseDir, destRel);
  if (!fs.existsSync(src)) return;
  if (fs.existsSync(dest) && !force) return;
  if (fs.existsSync(dest) && force) {
    const bak = `${dest}.bak.${Date.now()}`;
    fs.copyFileSync(dest, bak);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function applyPatchOpencode(baseDir: string): void {
  const p = path.join(baseDir, "opencode.json");
  let obj: { plugin?: string[] } = {};
  if (fs.existsSync(p)) {
    const raw = fs.readFileSync(p, "utf-8");
    try {
      obj = JSON.parse(raw) as { plugin?: string[] };
    } catch {
      obj = {};
    }
  }
  if (!Array.isArray(obj.plugin)) obj.plugin = [];
  if (!obj.plugin.includes("opencode-closed-loop-guard")) {
    obj.plugin.push("opencode-closed-loop-guard");
  }
  fs.mkdirSync(path.dirname(p) === "." ? p : path.dirname(p), {
    recursive: true,
  });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

function applyAppendGitignore(templateDir: string, cwd: string): void {
  const appendPath = path.join(templateDir, "gitignore.append.txt");
  const gitignorePath = path.join(cwd, ".gitignore");
  const content = fs.existsSync(appendPath)
    ? fs.readFileSync(appendPath, "utf-8")
    : "";
  const existing = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, "utf-8")
    : "";
  const sep = existing && !existing.endsWith("\n") ? "\n" : "";
  fs.writeFileSync(gitignorePath, existing + sep + content);
}

function chmodValidators(baseDir: string): void {
  const validatorsRel =
    baseDir === GLOBAL_CONFIG_DIR ? "validators" : ".opencode/validators";
  const validatorsDir = path.join(baseDir, validatorsRel);
  if (!fs.existsSync(validatorsDir)) return;
  for (const name of fs.readdirSync(validatorsDir)) {
    if (name.endsWith(".sh")) {
      const filePath = path.join(validatorsDir, name);
      fs.chmodSync(filePath, 0o755);
    }
  }
}

export async function runInit(opts: { force: boolean }): Promise<void> {
  const templateDir = getTemplateDir();
  if (!fs.existsSync(templateDir)) {
    process.stderr.write(
      "Templates not found. Run from installed package (e.g. npx opencode-closed-loop-guard init).\n"
    );
    process.exit(1);
  }

  const baseDir = await promptInstallTarget();
  const selected = await promptSelection(opts.force);
  const { toCreate, toSkip, toOverwrite, patchOpencode, appendGitignore } =
    collectFilesToWrite(templateDir, baseDir, selected, opts.force);

  const ok = await confirmWrite(toCreate, toSkip, toOverwrite, baseDir);
  if (!ok) {
    process.exit(0);
  }

  const cwd = process.cwd();
  for (const cat of selected) {
    if (cat === "patchOpencode" && patchOpencode) {
      applyPatchOpencode(baseDir);
      continue;
    }
    if (cat === "gitignore" && appendGitignore) {
      applyAppendGitignore(templateDir, cwd);
      continue;
    }
    const opt = INIT_OPTIONS.find((o) => o.id === cat);
    if (!opt) continue;
    for (const rel of opt.files) {
      copyFile(templateDir, baseDir, rel, opts.force);
    }
  }

  chmodValidators(baseDir);

  process.stdout.write("\nNext steps:\n");
  process.stdout.write(
    '  /plan_w_team "<user prompt>" "<orchestration prompt (optional)>"\n'
  );
  process.stdout.write("  /build_from_plan specs/<file>.md\n");
  const logsDir =
    baseDir === GLOBAL_CONFIG_DIR
      ? "~/.config/opencode/logs"
      : ".opencode/logs";
  process.stdout.write(`  Logs: ${logsDir}\n`);
}
