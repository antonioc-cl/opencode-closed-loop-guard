# opencode-closed-loop-guard

A deterministic **closed-loop guard plugin** for OpenCode.

⚠️ Installing the package is not enough — you must also add it to OpenCode’s `plugin` list.

It enforces:

**Research → Plan → Implement → Validate → Repeat until green**

The RPI (Research-Plan-Implement) workflow ensures:
- Research before planning (gather facts, not opinions)
- Planning before coding (think before you act)
- Validation before completion (prove it works)

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
- 📋 RPI workflow commands (Research → Plan → Implement)
- 👥 Team agents (researcher, builder, validator)

---

## 📋 RPI Workflow (Research → Plan → Implement)

The plugin includes a structured workflow that enforces thinking before coding:

### Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `/research_questions` | Generate objective questions (no solutions) | `specs/rq-<topic>-<date>.md` |
| `/research_from_questions` | Answer questions with facts + evidence | `specs/research-<topic>-<date>.md` |
| `/design_from_research` | Propose options + tradeoffs | `specs/design-<topic>-<date>.md` |
| `/outline_from_design` | Create phase outline (reorderable) | `specs/outline-<topic>-<date>.md` |
| `/plan_w_team` | Create detailed implementation plan | `specs/plan-<slug>-<date>.md` |
| `/build_from_plan` | Execute plan with validation | Task completion |

### Agents

| Agent | Role | Tools |
|-------|------|-------|
| `researcher` | Read-only fact-finding. Questions → answers with evidence. | No write tools |
| `builder` | Implements code from plans. One task at a time. | All tools |
| `validator` | Read-only verification. Reports PASS/FAIL. | No write tools |

### Workflow Example

```bash
# Step 1: Generate questions about the problem
/research_questions "add user authentication"

# Step 2: Answer questions with codebase evidence
/research_from_questions specs/rq-user-auth-20260203.md

# Step 3: Design options and tradeoffs
/design_from_research specs/research-user-auth-20260203.md

# Step 4: Create phase outline
/outline_from_design specs/design-user-auth-20260203.md

# Step 5: Create implementation plan (references RPI artifacts)
/plan_w_team "add user authentication"

# Step 6: Execute with validation gate
/build_from_plan specs/plan-user-auth-20260203.md
```

For simple tasks, you can skip directly to `/plan_w_team` — the plan will note that RPI was skipped.

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

Run an interactive initializer that scaffolds the closed-loop kit:

```bash
npx opencode-closed-loop-guard init
# or
opencode-closed-loop-guard init
```

**Where to install?** You are asked first:

- **1. Global (~/.config/opencode)** [default] — Commands, validators, config, and specs are installed under `~/.config/opencode`. Patching `opencode.json` updates `~/.config/opencode/opencode.json`. No files are written to the current repo (except optional `.gitignore` append).
- **2. Current repo** — Same structure is written under the project root (`.opencode/`, `specs/`), and patching `opencode.json` updates the project’s `opencode.json`.

Then choose what to scaffold (multi-select):

- **Commands** — RPI workflow commands: `research_questions.md`, `research_from_questions.md`, `design_from_research.md`, `outline_from_design.md`, `plan_w_team.md`, `build_from_plan.md` (under install target)
- **Agents** — Team agents: `researcher.md`, `builder.md`, `validator.md` (under install target)
- **Project config** — `closed-loop-guard.json` (under install target)
- **Validators** — detect-runner, verify, lint, typecheck, unit, e2e, format (under install target)
- **Specs folder** — `specs/` (plan output directory, under install target)
- **Patch opencode.json** (optional) — add or merge the plugin into the install target's `opencode.json` (global or repo)
- **Append `.gitignore`** (optional) — add `.opencode/logs/` and `.opencode/state/` to the **current repo** (only relevant when using global install)

Use `--force` to overwrite existing files (creates `.bak.<timestamp>` backups). Non-TTY runs default to **global** install and scaffold commands, agents, config, validators, and specs only (no patch, no gitignore).

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

You should see `package/dist/index.js`, `package/dist/cli.js`, and `package/dist/templates/**` (including `.opencode/commands/*`, `.opencode/agents/team/*`, `.opencode/validators/*.sh`). After running `init` in a repo, `.opencode/validators/*.sh` are executable.

---

## License

MIT — see [LICENSE](LICENSE).
