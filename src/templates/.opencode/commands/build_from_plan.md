---
description: Execute a plan from specs/<feature>/plan.md. Stop on failure. Validate continuously.
argument-hint: "--feature <feature-name>"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Build from Plan

Execute the plan for feature: **$ARGUMENTS**

## Parse Arguments

Extract `--feature <name>` from `$ARGUMENTS`.

If not provided, ask the user for the feature name and stop.

---

## Load Plan

Read the plan file at: `specs/<feature>/plan.md`

If the file doesn't exist, tell the user to run `/plan_w_team` first.

Parse:
- tasks list + dependencies
- acceptance criteria per task
- verification strategy

---

## Workflow

### Execute Tasks (dependency order)
For each task:

#### a) Pre-check
- Verify dependencies complete
- Read relevant files

#### b) Implement (minimal)
- Make minimal changes
- Follow existing patterns
- One task at a time

#### c) Verify (fast loop)
After changes run:
- format (if configured)
- lint
- typecheck
- unit tests (if relevant)

#### d) Validate Acceptance Criteria
- Mark PASS/FAIL for each criterion
- If FAIL: fix before proceeding

### Final Verification (must be green)
Run the plan's Verification Strategy.

**Do not claim completion** until validation is green.

---

## Output Format

For each task:

```
## Task [N]: [Name] (Task ID: <id>)

### Implementation
- [file]: [change summary]

### Verification
- Format: PASS/FAIL (or SKIP)
- Lint: PASS/FAIL
- Typecheck: PASS/FAIL
- Unit: PASS/FAIL

### Acceptance Criteria
- [x] Criterion 1
- [x] Criterion 2
- [ ] Criterion 3 (BLOCKED: reason)

### Status: COMPLETE | BLOCKED
```

Final summary:

```
## Build Summary

Feature: <feature>
Plan: specs/<feature>/plan.md
Tasks: X/Y completed
Status: SUCCESS | PARTIAL | FAILED

Validation:
- [command] PASS/FAIL

Remaining Issues:
- [issue if any]
```

---

## Rules

1) Stop on failure (do not proceed to dependent tasks)
2) No skipping acceptance criteria
3) Verify after every change
4) Report honestly
5) Do not declare "done" unless validation is green
