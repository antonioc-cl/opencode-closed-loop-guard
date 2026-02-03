---
description: Create a validated implementation plan (planning only) in specs/. Consumes RPI artifacts when available.
argument-hint: "<user prompt> | include refs: research/design/outline paths"
allowed-tools: Read, Write, Glob, Grep, Bash(git status:*), Bash(git diff:*), Bash(git log:*)
model: opus
---

# Plan with Team (RPI Step 5)

Create a validated implementation plan for: **$ARGUMENTS**

---

## CRITICAL: PLANNING ONLY

You must NOT:
- Write or edit code files
- Run commands that modify state
- Start implementation

You MUST:
- Analyze request
- Use RPI artifacts if available
- Create a detailed plan with tasks + acceptance criteria
- Save plan to `specs/`

---

## Recommended Inputs (RPI artifacts)

If available, include references in your plan:

- Research: `specs/research-*.md`
- Design: `specs/design-*.md`
- Outline: `specs/outline-*.md`

If they do NOT exist (small/simple task), explicitly state that RPI was skipped and why.

---

## Workflow

### 1) Context Gathering (read-only)
Read relevant files to understand:
- existing patterns and conventions
- dependencies and constraints

Repo status:
!`git status -sb`

Changed files:
!`git diff --name-only | head -200`

### 2) Plan Creation
Create a plan document with these REQUIRED sections:

```markdown
# Plan: [Title]

## Inputs
- User Prompt: [what was requested]
- Research Doc: [path or "skipped"]
- Design Doc: [path or "skipped"]
- Outline Doc: [path or "skipped"]

## Goal
[One sentence describing the outcome]

## Background
[Why this change is needed]

## Approach
[High-level strategy, consistent with design doc if present]

## Tasks

### Task 1: [Name]
- **Task ID**: [kebab-id]
- **Description**: [What to do]
- **Files**: [Files to modify/create]
- **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
- **Dependencies**: [Task IDs this depends on, or "none"]
- **Assigned To**: builder
- **Parallel**: true|false

### Task 2: [Name]
...

### Task N: Validate All
- **Task ID**: validate-all
- **Description**: Run the verification strategy and confirm acceptance criteria.
- **Assigned To**: validator
- **Parallel**: false

## Risks & Mitigations
- **Risk**: [Description]
  **Mitigation**: [How to handle]

## Verification Strategy
- [ ] Run repo verification gate (prefer `pnpm verify` or `bun lint/typecheck/test`)
- [ ] Unit tests pass
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] E2E: [skipped | conditional | required] + rationale

## Open Questions
- [Question 1]
- [Question 2]
```

### 3) Plan Validation (self-check before saving)

Before saving, verify:
- [ ] Inputs section included
- [ ] Goal is clear
- [ ] At least one task is defined
- [ ] Each task has acceptance criteria
- [ ] Verification strategy exists

### 4) Save Plan

Save to: `specs/plan-[slug]-[YYYYMMDD].md`

Example: `specs/plan-add-auth-20260203.md`

---

## Output

After creating the plan, summarize:

```
## Plan Created

File: specs/plan-[name].md
Tasks: [count] tasks defined
Ready for: Use /build_from_plan to execute

Task Summary:
1. [Task 1 name] (Task ID)
2. [Task 2 name] (Task ID)
...
```
