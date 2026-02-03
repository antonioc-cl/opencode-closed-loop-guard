---
description: Create a validated implementation plan (planning only). Saves to specs/<feature>/plan.md
argument-hint: "<prompt> --feature <feature-name>"
allowed-tools: Read, Write, Glob, Grep, Bash(git status:*), Bash(git diff:*), Bash(git log:*)
model: opus
---

# Plan with Team (RPI Step 5)

Create implementation plan for: **$ARGUMENTS**

## Parse Arguments

Extract from `$ARGUMENTS`:
- **prompt**: the user's request (everything before `--feature`)
- **feature**: the feature folder name (after `--feature`)

If `--feature` is not provided, ask the user for it and stop.

---

## CRITICAL: PLANNING ONLY

You must NOT:
- Write or edit code files
- Run commands that modify state
- Start implementation

You MUST:
- Analyze request
- Load RPI artifacts from `specs/<feature>/`
- Create a detailed plan with tasks + acceptance criteria
- Save plan to `specs/<feature>/plan.md`

---

## Load RPI Artifacts

Read from `specs/<feature>/`:
- `rq.md` (research questions)
- `research.md` (research answers)
- `design.md` (design options)
- `outline.md` (phase outline)

If any are missing, note which ones and proceed with available context.

---

## Workflow

### 1) Context Gathering (read-only)
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
- Feature: [feature name]
- RPI Artifacts: [list which files were loaded]

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
- [ ] Run repo verification gate
- [ ] Unit tests pass
- [ ] Typecheck passes
- [ ] Lint passes

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

---

## Save

Save to: `specs/<feature>/plan.md`

---

## Report

After creating the plan, respond:

✅ Plan created
Feature: `<feature>`
File: `specs/<feature>/plan.md`
Tasks: [count] tasks defined
Next: run `/build_from_plan --feature <feature>`
