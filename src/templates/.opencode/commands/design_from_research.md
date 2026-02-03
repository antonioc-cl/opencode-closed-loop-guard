---
description: Produce design options + tradeoffs from a research doc. Saves to specs/design-<topic>-<date>.md
argument-hint: "specs/research-<topic>-<date>.md"
allowed-tools: Read, Write, Glob
model: opus
---

# Design From Research (RPI Step 3)

Use the research doc at: **$ARGUMENTS**

If no path is provided, ask the user for it and stop.

---

## CRITICAL RULES
- No implementation steps. No task list. No code.
- You may propose options and recommend one with reasoning.
- You must remain consistent with the research doc facts.
- If research is insufficient, request more research questions.

---

## Load Research

Read the research file at: `$ARGUMENTS`

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

Save as: `specs/design-<kebab-topic>-<YYYYMMDD>.md`

---

## Report

After saving, respond:

✅ Design doc created
File: `specs/design-...md`
Next: run `/outline_from_design specs/design-...md`
