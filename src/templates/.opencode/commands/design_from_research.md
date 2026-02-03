---
description: Produce design options + tradeoffs from a research doc. Saves to specs/<feature>/design.md
argument-hint: "--feature <feature-name>"
allowed-tools: Read, Write, Glob
model: opus
---

# Design From Research (RPI Step 3)

Create design options for feature: **$ARGUMENTS**

## Parse Arguments

Extract `--feature <name>` from `$ARGUMENTS`.

If not provided, ask the user for the feature name and stop.

---

## Load Research

Read the research file at: `specs/<feature>/research.md`

If the file doesn't exist, tell the user to run `/research_from_questions` first.

---

## CRITICAL RULES
- No implementation steps. No task list. No code.
- You may propose options and recommend one with reasoning.
- You must remain consistent with the research doc facts.
- If research is insufficient, request more research questions.

---

## Output Format (MUST FOLLOW)

```md
# Design: <topic>

## Goal
<1-2 lines>

## Constraints (from research)
- <constraint 1>
- <constraint 2>

## Options

### Option A: <name>
**Approach**: <description>
**Pros**:
- ...
**Cons**:
- ...
**Risks**:
- ...
**Operational Notes**:
- ...

### Option B: <name>
...

## Recommendation
- Chosen option: <A|B|C>
- Why: <reasoning>
- What could go wrong: <top risks>
- How we'll validate: <high-level validation idea>

## Open Questions
- <questions to resolve before planning>

## "Done" for Design
- [ ] Options compared
- [ ] Recommendation made (or explicitly deferred)
- [ ] No step-by-step tasks included
```

---

## Save

Save as: `specs/<feature>/design.md`

---

## Report

After saving, respond:

✅ Design doc created
Feature: `<feature>`
File: `specs/<feature>/design.md`
Next: run `/outline_from_design --feature <feature>`
