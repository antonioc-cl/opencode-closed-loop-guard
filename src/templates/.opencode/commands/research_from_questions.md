---
description: Answer research questions with verifiable facts only. Saves to specs/<feature>/research.md
argument-hint: "--feature <feature-name>"
allowed-tools: Read, Glob, Grep, Write, Bash(git status:*), Bash(git diff:*)
model: sonnet
---

# Research From Questions (RPI Step 2)

Answer research questions for feature: **$ARGUMENTS**

## Parse Arguments

Extract `--feature <name>` from `$ARGUMENTS`.

If not provided, ask the user for the feature name and stop.

---

## Load Questions

Read the questions file at: `specs/<feature>/rq.md`

If the file doesn't exist, tell the user to run `/research_questions` first.

---

## CRITICAL RULES
- Facts only. No recommendations. No plan. No code changes.
- Every answer must include evidence:
  - file paths + symbols
  - command outputs if used
- If unknown: write "Unknown" and what you would need to know.

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

Save as: `specs/<feature>/research.md`

---

## Report

After saving, respond:

✅ Research doc created
Feature: `<feature>`
File: `specs/<feature>/research.md`
Next: run `/design_from_research --feature <feature>`
