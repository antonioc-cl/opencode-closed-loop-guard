# opencode-closed-loop-guard

A deterministic **closed-loop guard plugin** for OpenCode.

⚠️ Installing the package is not enough — you must also add it to OpenCode’s `plugin` list.

It enforces:

**Plan → Build → Validate → Repeat until green**

## Inspiration & Credits

This project is inspired by:

- **Claude Code Hooks** — the native hook-based control plane that enables deterministic, agentic coding workflows in Claude Code.  
  https://code.claude.com/docs/en/hooks

- **IndyDevDan's Agentic Workflows & Claude Code Hooks Mastery** — a rigorous, anti-hype approach to agentic engineering using planning meta-prompts, builder/validator roles, and self-validating closed loops.  
  https://github.com/disler/claude-code-hooks-mastery

The goal of this plugin is to bring the same **closed-loop philosophy** (plan → build → validate → block until green) into **OpenCode**, using its plugin event system.

---

## Features

- 🚧 Pre-tool guardrails (block dangerous commands)
- 🧪 Post-edit micro-validation
- ⛔ Stop gate (cannot finish until validation passes)
- 🔁 Automatic retry via prompt injection
- 📜 JSONL traceability logs

---

## 🔧 Supported Toolchains & Validation Strategy

`opencode-closed-loop-guard` is designed to work across **modern JavaScript/TypeScript monorepos** and does **not impose a single toolchain**.

Instead, it **detects and respects what your repository already uses**, aligning local validation with CI.

---

### ✅ Supported Package Managers

The plugin automatically detects the package manager:

| Package Manager | Detection                                                  |
| --------------- | ---------------------------------------------------------- |
| **bun**         | `packageManager: "bun@…"` in `package.json` or `bun.lockb` |
| **pnpm**        | fallback if bun is not detected                            |

---

### ✅ Supported Linters / Formatters

The plugin does **not** bundle linters.
It runs **your repo's own scripts** or standard commands.

| Tool         | Detection                                    |
| ------------ | -------------------------------------------- |
| **Biome**    | `biome.json` or `biome.jsonc` present        |
| **ESLint**   | `eslint.config.*` or `.eslintrc*` present    |
| **Prettier** | `prettier` config or `format` script present |

**Priority order**

1. Biome (if present)
2. ESLint / Prettier (via scripts)
3. No formatting step if none detected

---

### ✅ Type Checking

Type checking is performed via **existing repo scripts**:

| Script         | Used                             |
| -------------- | -------------------------------- |
| `typecheck`    | preferred                        |
| `tsc --noEmit` | fallback (if TypeScript project) |

---

### ✅ Testing Strategy

#### Unit Tests (default, always enforced)

| Repo Type | Command                                                                        |
| --------- | ------------------------------------------------------------------------------ |
| pnpm      | `pnpm -s verify` (preferred) → fallback to `lint + typecheck + test:unit/test` |
| bun       | `bun run lint && bun run typecheck && bun run test`                            |

This matches the philosophy:

> **"The gate should match CI."**

#### E2E Tests (optional / conditional)

E2E tests are **not run by default** to avoid flakiness and slow feedback loops.

They are executed **only if one of the following is true**:

- The plan explicitly requires E2E validation
- Touched files match configured critical patterns (auth, payments, routing, etc.)
- The user explicitly triggers E2E (via command or config)

Supported E2E runners (if present):

- `pnpm test:e2e` / `pnpm e2e`
- `bun run e2e`
- Playwright, Cucumber, etc. (via your scripts)

---

### ⚙️ Configuration Example

You can fine-tune behavior per project using:

```text
.opencode/closed-loop-guard.json
```

Example:

```json
{
  "protectedBranches": ["main", "master"],
  "maxCycles": 5,
  "logDir": ".opencode/logs",
  "e2e": {
    "mode": "conditional",
    "triggers": ["auth", "payment", "checkout", "router"]
  }
}
```

---

### 🧠 Design Philosophy

- **No duplicated CI logic**
  The plugin runs _your_ scripts, not its own opinionated pipeline.

- **No enforced tools**
  ESLint, Biome, Prettier, Vitest, Playwright, Cucumber — all are supported _if you already use them_.

- **Fast by default, strict when needed**
  Unit + static checks always gate completion.
  E2E is opt-in or context-driven.

---

### ❓ What if my repo uses something else?

If your repo has:

- different script names
- custom CI entrypoints
- non-JS tooling

👉 Add a `verify` script and the plugin will use it automatically.

Example:

```json
{
  "scripts": {
    "verify": "my-custom-validation-command"
  }
}
```

---

## 🔌 Enabling the Plugin in OpenCode

### Important

This plugin **does not modify OpenCode’s configuration automatically**.  
For security and transparency, **plugin registration is always explicit** and controlled by the user.

After installing the package, you must **tell OpenCode to load it** using **one of the methods below**.

---

### Option 1 — Global Plugin (Recommended)

This enables the closed-loop guard for **all projects**.

1. Install the plugin (if not already installed):

```bash
npm install -g opencode-closed-loop-guard
```

2. Edit your global OpenCode config:

```bash
~/.config/opencode/opencode.json
```

3. Add the plugin to the `plugin` array:

```json
{
  "plugin": [
    "opencode-antigravity-auth@1.4.3",
    "opencode-closed-loop-guard@0.1.0"
  ]
}
```

4. Restart OpenCode.

✅ The plugin will now run for every OpenCode session.

---

### Option 2 — Project-Local Plugin (No Global Config Change)

This enables the plugin **only for a single repository**.

1. Install the plugin in the project:

```bash
npm install --save-dev opencode-closed-loop-guard
```

2. Create or edit:

```bash
<project-root>/opencode.json
```

3. Register the plugin:

```json
{
  "plugin": ["opencode-closed-loop-guard"]
}
```

4. Restart OpenCode in that project.

✅ The plugin will run only when OpenCode is executed inside this repo.

---

### Option 3 — Plugin Directory (Advanced / No npm)

If you prefer not to use npm, OpenCode also supports loading plugins from a directory.

1. Copy the compiled plugin entrypoint (`dist/index.js`) into:

```bash
~/.config/opencode/plugins/opencode-closed-loop-guard/
```

2. Restart OpenCode.

⚠️ This method skips npm versioning and updates.  
It’s useful for experimentation, but **npm is recommended** for long-term use.

---

## 🛠️ Scaffolding with `init`

Run an interactive initializer that optionally scaffolds the closed-loop kit into the current repo:

```bash
npx opencode-closed-loop-guard init
# or
opencode-closed-loop-guard init
```

You can choose what to scaffold (multi-select):

- **Commands** — `.opencode/commands/plan_w_team.md`, `.opencode/commands/build_from_plan.md`
- **Project config** — `.opencode/closed-loop-guard.json`
- **Validators** — `.opencode/validators/*` (detect-runner, verify, lint, typecheck, unit, e2e, format)
- **Specs folder** — `specs/` (plan output directory)
- **Patch repo `opencode.json`** (optional) — add or merge the plugin into the project’s `opencode.json`
- **Append `.gitignore`** (optional) — add `.opencode/logs/` and `.opencode/state/`

Use `--force` to overwrite existing files (creates `.bak.<timestamp>` backups). Non-TTY runs default to scaffolding commands, config, validators, and specs only (no patch, no gitignore).

The plugin must still be registered in global `~/.config/opencode/opencode.json` unless you choose to patch the project’s `opencode.json` during init.

---

## 📁 Plugin Configuration (Optional)

The plugin reads an **optional project-level config file**:

```bash
<project-root>/.opencode/closed-loop-guard.json
```

Example:

```json
{
  "protectedBranches": ["main", "master"],
  "maxCycles": 5,
  "logDir": ".opencode/logs",
  "e2e": {
    "mode": "conditional",
    "triggers": ["auth", "payment", "checkout"]
  }
}
```

If this file is missing, **safe defaults are used**.

---

## 📜 Logs & Traceability

At runtime, the plugin creates:

```bash
<project-root>/.opencode/logs/
```

Containing JSONL logs for:

- pre-tool decisions
- post-tool results
- validation output
- stop-gate decisions

These files are **append-only** and safe to ignore in git.

---

## 🔐 Why the Plugin Does Not Self-Install

This plugin intentionally **does not edit OpenCode’s config files**.

Reasons:

- Prevents silent persistence
- Keeps plugin activation auditable
- Matches OpenCode’s security model

Installation is always:

> **install package → explicitly enable plugin**

### Verify the published package

After publishing, confirm the tarball includes `dist/` and templates:

```bash
npm view opencode-closed-loop-guard@latest version
npm view opencode-closed-loop-guard@latest main
npm view opencode-closed-loop-guard@latest files
npm pack opencode-closed-loop-guard@latest
tar -tf opencode-closed-loop-guard-*.tgz | head -80
```

You should see `package/dist/index.js`, `package/dist/cli.js`, and `package/dist/templates/**` (including `.opencode/commands/*`, `.opencode/validators/*.sh`). After running `init` in a repo, `.opencode/validators/*.sh` are executable.

---

## License

MIT — see [LICENSE](LICENSE).
