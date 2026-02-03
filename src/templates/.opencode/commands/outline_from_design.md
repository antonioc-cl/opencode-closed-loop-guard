---
description: Create a short phase outline (reorderable) from design. Saves to specs/outline-<topic>-<date>.md
argument-hint: "specs/design-<topic>-<date>.md"
allowed-tools: Read, Write, Glob
model: haiku
---

# Outline From Design (RPI Step 4)

Use the design doc at: **$ARGUMENTS**

If no path is provided, ask the user for it and stop.

---

## CRITICAL RULES
- Outline only: phases + ordering.
- No detailed steps, no tasks, no code.
- Must be short (ideally 5-12 lines).

---

## Load Design

Read the design file at: `$ARGUMENTS`

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

Save as: `specs/outline-<kebab-topic>-<YYYYMMDD>.md`

---

## Report

After saving, respond:

✅ Outline created
File: `specs/outline-...md`
Next: run `/plan_w_team "<your prompt>"` and include the outline/design/research docs as inputs.
