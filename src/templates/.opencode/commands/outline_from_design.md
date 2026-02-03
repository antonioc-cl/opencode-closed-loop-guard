---
description: Create a short phase outline (reorderable) from design. Saves to specs/<feature>/outline.md
argument-hint: "--feature <feature-name>"
allowed-tools: Read, Write, Glob
model: haiku
---

# Outline From Design (RPI Step 4)

Create phase outline for feature: **$ARGUMENTS**

## Parse Arguments

Extract `--feature <name>` from `$ARGUMENTS`.

If not provided, ask the user for the feature name and stop.

---

## Load Design

Read the design file at: `specs/<feature>/design.md`

If the file doesn't exist, tell the user to run `/design_from_research` first.

---

## CRITICAL RULES
- Outline only: phases + ordering.
- No detailed steps, no tasks, no code.
- Must be short (ideally 5-12 lines).

---

## Output Format (MUST FOLLOW)

```md
# Outline: <topic>

## Phases (Ordered)
1. <phase 1>
2. <phase 2>
3. <phase 3>
...

## Ordering Rationale
- <why this order>

## "Done" for Outline
- [ ] Phases are minimal + reorderable
- [ ] No detailed tasks included
```

---

## Save

Save as: `specs/<feature>/outline.md`

---

## Report

After saving, respond:

✅ Outline created
Feature: `<feature>`
File: `specs/<feature>/outline.md`
Next: run `/plan_w_team --feature <feature>`
