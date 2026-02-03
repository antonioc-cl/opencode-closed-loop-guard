---
description: Generate objective research questions (no solutions). Saves to specs/<feature>/rq.md
argument-hint: "<topic> --feature <feature-name>"
allowed-tools: Read, Write, Glob, Grep, Bash(git status:*), Bash(ls:*), Bash(mkdir:*)
model: opus
---

# Research Questions (RPI Step 1)

Generate **objective questions only** for: **$ARGUMENTS**

## Parse Arguments

Extract from `$ARGUMENTS`:
- **topic**: the problem statement (everything before `--feature`)
- **feature**: the feature folder name (after `--feature`, kebab-case)

If `--feature` is not provided, derive it from the topic (kebab-case, max 3 words).

Example: `"add user authentication" --feature user-auth`
- topic = "add user authentication"
- feature = "user-auth"

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

1. Create folder: `specs/<feature>/`
2. Save as: `specs/<feature>/rq.md`

---

## Report

After saving, respond:

✅ Research questions created
Feature: `<feature>`
File: `specs/<feature>/rq.md`
Next: run `/research_from_questions --feature <feature>`
