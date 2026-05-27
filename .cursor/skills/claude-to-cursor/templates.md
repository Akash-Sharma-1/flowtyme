# Claude → Cursor templates

## AGENTS.md skeleton

```markdown
# <Project> — agent guide

<One paragraph: what it does>

## Repo map

- `<dir>/` — purpose
  - `key/file.ts` — responsibility

## Run locally

\`\`\`bash
# exact commands
\`\`\`

## Core flow

1. ...
2. ...

## Domain rules

- Invariant agents must not break
- See `<domain-doc>.md` for structure spec

## Where to change things

| Change | File |
|--------|------|
| ... | `path` |

## More context

- [CLAUDE.md](CLAUDE.md) — full decisions, known issues, API table
- [README.md](README.md) — human quick start
```

## Rule file (`.cursor/rules/<name>.mdc`)

### Always-apply core

```markdown
---
description: <Project> core invariants and pointers
alwaysApply: true
---

# <Project> core

<2-3 sentence summary>

## Non-negotiables

- ...

## Pointers

- `AGENTS.md`, `CLAUDE.md`, domain docs
```

### Scoped rule

```markdown
---
description: <Area> conventions for <project>
globs: server/src/**/*.ts
alwaysApply: false
---

# <Area> rules

- Boundary: routes thin, logic in services
- Gotcha: ...
```

Valid frontmatter fields: `description` (required), `globs` (string), `alwaysApply` (boolean).

## Skill file (`.cursor/skills/<name>/SKILL.md`)

```markdown
---
name: <lowercase-hyphen>
description: <Third person WHAT>. Use when <triggers matching .claude/commands intent>.
disable-model-invocation: true
---

# <Title from command file>

<Steps and bash blocks from .claude/commands/<name>.md>
```

## CLAUDE.md → artifact mapping cheat sheet

| CLAUDE.md section | Target |
|-------------------|--------|
| What this is / Repo structure | `AGENTS.md` |
| Running locally / Env vars (names only) | `AGENTS.md` + `.env.example` |
| Architecture decisions (short bullets) | `*-core.mdc` |
| Architecture decisions (long why) | Keep in `CLAUDE.md`, link |
| Known issues / Phase 2 | `CLAUDE.md` or `docs/backlog.md` |
| API reference | `AGENTS.md` table OR link to `CLAUDE.md` |
| User flow | `AGENTS.md` |
| Commit style | `*-core.mdc` or user rules |
| `.claude/commands/*` | `.cursor/skills/*/SKILL.md` |

## Globs patterns (monorepo)

| Stack | Example globs |
|-------|-----------------|
| Express API | `server/src/**/*.ts` |
| React client | `client/src/**/*.{ts,tsx,css}` |
| Python API | `api/**/*.py`, `src/**/*.py` |
| Single package | `src/**/*.ts` |
| Parser only | `**/notion-parser.ts`, `parser-config.md` |
