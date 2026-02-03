# opencode-closed-loop-guard

A deterministic **closed-loop guard plugin** for OpenCode.

It enforces:

**Plan → Build → Validate → Repeat until green**

## Inspiration & Credits

This project is inspired by:

- **Claude Code Hooks** — the native hook-based control plane that enables deterministic, agentic coding workflows in Claude Code.  
  https://code.claude.com/docs/en/hooks

- **Disler’s Agentic Workflows & Claude Code Hooks Mastery** — a rigorous, anti-hype approach to agentic engineering using planning meta-prompts, builder/validator roles, and self-validating closed loops.  
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

## Installation

```bash
npm install -g opencode-closed-loop-guard
```

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
