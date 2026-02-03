---
description: Generate objective research questions (no solutions). Saves to specs/rq-<topic>-<date>.md
argument-hint: "<topic / problem statement>"
allowed-tools: Read, Write, Glob, Grep, Bash(git status:*), Bash(ls:*)
model: opus
---

# Research Questions (RPI Step 1)

Generate **objective questions only** for: **$ARGUMENTS**

If no topic is provided, ask the user for it and stop.

---

## CRITICAL RULES
- Questions ONLY. No answers. No plans. No recommendations.
- Avoid bias: do not assume the solution.
- Prefer questions that can be answered by reading code, configs, or logs.

---

## Suggested Context (optional)
Branch + status:
!`git status -sb`

Top-level structure:
!`ls -la | head -50`

---

## Output Format (MUST FOLLOW)

```md
# Research Questions: <topic>

## Scope
<1-2 lines of what we are investigating>

## Questions

### A) Current Behavior
1. ...
2. ...

### B) Architecture & Boundaries
1. ...
2. ...

### C) Data & State
1. ...
2. ...

### D) Interfaces (APIs, Events, DB)
1. ...
2. ...

### E) Constraints (Perf, Security, DX)
1. ...
2. ...

### F) Unknowns / Missing Info
1. ...
2. ...

## "Done" for Research
- [ ] Each question is specific and answerable from repo evidence
- [ ] No solution bias introduced
```

---

## Save

Save as: `specs/rq-<kebab-topic>-<YYYYMMDD>.md`

---

## Report

After saving, respond:

✅ Research questions created
File: `specs/rq-...md`
Next: run `/research_from_questions specs/rq-...md`
