### Suggested opencode.json additions (optional)

Add plugin locally (project-only):

```json
{
  "plugin": ["opencode-closed-loop-guard"]
}
```

Recommended agents (optional):

- plan: read-only exploration, no write/edit
- build: full build, but still deny rm/sudo/chmod
