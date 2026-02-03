---
description: Execute a plan from specs/*.md. Stop on failure. Validate continuously. Do not claim done until gate passes.
argument-hint: "specs/plan-<slug>-<date>.md"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Build from Plan

Execute the plan at: **$ARGUMENTS**

If no path provided, look for the most recent plan in `specs/`.

---

## Workflow

### 1) Load Plan
Read the plan file and parse:
- tasks list + dependencies
- acceptance criteria per task
- verification strategy
- RPI inputs (research/design/outline)

### 2) Execute Tasks (dependency order)
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

### 3) Final Verification (must be green)
Run the plan's Verification Strategy.

**Do not claim completion** until you see validation is green.

If a guard enforces a gate:
- If it fails, fix issues and retry
- Repeat until green

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

Plan: [plan file]
Tasks: X/Y completed
Status: SUCCESS | PARTIAL | FAILED

Validation:
- [command] PASS/FAIL
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
