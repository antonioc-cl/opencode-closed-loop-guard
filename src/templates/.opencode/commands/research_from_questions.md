---
description: Answer research questions with verifiable facts only. Saves to specs/research-<topic>-<date>.md
argument-hint: "specs/rq-<topic>-<date>.md"
allowed-tools: Read, Glob, Grep, Write, Bash(git status:*), Bash(git diff:*)
model: sonnet
---

# Research From Questions (RPI Step 2)

Use the question file at: **$ARGUMENTS**

If no path is provided, ask the user for it and stop.

---

## CRITICAL RULES
- Facts only. No recommendations. No plan. No code changes.
- Every answer must include evidence:
  - file paths + symbols
  - command outputs if used
- If unknown: write "Unknown" and what you would need to know.

---

## Load Questions

Read the questions file at: `$ARGUMENTS`

---

## Output Format (MUST FOLLOW)

```md
# Research: <topic>

## Scope
<1-2 lines>

## Answers

### Q1: <question text>
**Answer**: <factual answer>
**Evidence**:
- File: <path> (symbol: <name>)
- Notes: <what this evidence shows>

### Q2: <question text>
...

## Key Findings (Facts)
- <fact 1>
- <fact 2>

## Unknowns / Gaps
- <gap 1> (why unknown)
- <gap 2>

## "Done" for Research
- [ ] All questions answered or marked Unknown
- [ ] Evidence attached for every answer
- [ ] No opinions or recommendations included
```

---

## Save

Save as: `specs/research-<kebab-topic>-<YYYYMMDD>.md`

---

## Report

After saving, respond:

✅ Research doc created
File: `specs/research-...md`
Next: run `/design_from_research specs/research-...md`
