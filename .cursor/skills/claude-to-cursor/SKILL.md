---
name: claude-to-cursor
description: Converts Claude Code project context (CLAUDE.md, .claude/commands) into Cursor artifacts (AGENTS.md, .cursor/rules/*.mdc, .cursor/skills). Use when migrating a Claude-built repo to Cursor, onboarding agents to an existing CLAUDE.md, or the user asks to materialize Claude context for Cursor agentic work.
disable-model-invocation: true
---

# Claude Code → Cursor context migration

Migrate **persistent agent context** from Claude Code into Cursor-native files. Do not delete `CLAUDE.md` unless the user asks — keep it as the deep reference; Cursor reads `AGENTS.md` and `.cursor/rules/`.

## Source inventory (read first)

| Path | What it contains | Cursor target |
|------|------------------|---------------|
| `CLAUDE.md` | Architecture, repo map, decisions, API table, known issues | `AGENTS.md` + scoped rules |
| `.claude/commands/*.md` | Slash-command runbooks (bash steps) | `.cursor/skills/<name>/SKILL.md` |
| `.claude/settings*.json` | Permission allowlists | **Do not migrate** (Cursor uses user rules / tool policy) |
| `README.md`, domain docs | Human onboarding | Link from `AGENTS.md`; do not duplicate |

```bash
# Discovery
test -f CLAUDE.md && wc -l CLAUDE.md
ls -la .claude/commands 2>/dev/null || echo "no commands"
find . -maxdepth 2 -name 'AGENTS.md' -o -path './.cursor/rules/*.mdc' 2>/dev/null
```

## Content classification

Sort every section of `CLAUDE.md` into one bucket:

| Bucket | Goes to | Examples |
|--------|---------|----------|
| **Navigate** | `AGENTS.md` | Repo tree, run commands, user flow, API route table, “where to change X” |
| **Invariant** | `alwaysApply` rule | Product decisions agents must not violate |
| **Scoped convention** | `globs` rule | Server routes, React pages, parser file gotchas |
| **Procedure** | Project skill | Start servers, test endpoint, commit flow |
| **Deep rationale** | Stay in `CLAUDE.md` or `docs/` | Long “why MERN not native” essays — link, don’t copy |
| **Secrets** | `.env.example` only | Never put tokens/passwords in rules or `AGENTS.md` |

**Rule of thumb:** `AGENTS.md` ≈ 60–120 lines of *actionable* context. Rules ≤ 50 lines each. Skills = step-by-step commands from `.claude/commands/`.

## Outputs to create

```
repo/
├── AGENTS.md                          # Cursor agent entry (required)
├── CLAUDE.md                          # Keep; add cross-link if missing
└── .cursor/
    ├── rules/
    │   ├── <project>-core.mdc         # alwaysApply: true
    │   ├── <area>-*.mdc               # globs-scoped
    └── skills/
        └── <workflow>/SKILL.md        # One per .claude/commands/*.md
```

Templates: [templates.md](templates.md)

## Step-by-step workflow

### 1. Draft `AGENTS.md`

Include only:

- One-paragraph **what this is**
- **Repo map** (dirs + key files, not every file)
- **Run locally** (copy exact commands from `CLAUDE.md` / `README.md`)
- **Core flow** (numbered pipeline: UI → API → services)
- **Domain invariants** (bullets agents must respect)
- **Pointers** to `parser-config.md`, `README.md`, full rationale in `CLAUDE.md`
- **Where to change things** (file → responsibility)

Omit from `AGENTS.md`: Phase 2 checklists, long tradeoff essays, known-issues backlog (unless user wants them in a `docs/` link).

### 2. Create `.cursor/rules/*.mdc`

Split by concern; one topic per file:

| Rule | `alwaysApply` | Typical `globs` |
|------|---------------|-----------------|
| `<project>-core.mdc` | `true` | — |
| `server-*.mdc` | `false` | `server/src/**/*.ts` |
| `client-*.mdc` | `false` | `client/src/**/*.{ts,tsx,css}` |
| Domain-specific | `false` | e.g. `**/notion-parser.ts`, `parser-config.md` |

Pull from `CLAUDE.md`:

- **Architecture decisions** → core rule if they constrain all edits; else scoped rule
- **Gotchas** (library quirks, CSS fights) → rule for the file pattern they affect
- **Commit style** → core rule or separate `commits.mdc` if lengthy

Frontmatter must include `description`. See [templates.md](templates.md).

### 3. Convert `.claude/commands/` → skills

For each `commands/<name>.md`:

1. Create `.cursor/skills/<name>/SKILL.md`
2. Frontmatter: `name` (lowercase-hyphen), `description` (third person + WHEN triggers), `disable-model-invocation: true`
3. Body: preserve bash blocks and step order verbatim when possible
4. Rename workflows that collide with git (`push.md` → skill `git-push` or document “git push” in description to avoid confusion with CalDAV push)

**Do not** migrate `/commit` permission rules into skills if the user already has global commit rules — dedupe.

### 4. Cross-link and dedupe

- Add to top of `CLAUDE.md` (if missing):
  ```markdown
  > Cursor agents: see [AGENTS.md](AGENTS.md) and `.cursor/rules/`.
  ```
- Add to `AGENTS.md`:
  ```markdown
  Full decision log and known issues: [CLAUDE.md](CLAUDE.md).
  ```
- Never duplicate README setup steps in three places — link once.

### 5. Verify

- [ ] `AGENTS.md` exists and is under ~150 lines
- [ ] At least one `alwaysApply` core rule
- [ ] Scoped rules use correct globs for monorepo layout
- [ ] Each `.claude/commands/*.md` has a skill counterpart (or explicit skip note)
- [ ] No secrets, DB IDs, or passwords in `alwaysApply` rules (ok in private `parser-config.md` only if already there)
- [ ] Rules are each ≤ 50 lines

## What not to migrate

- `.claude/settings.local.json` permission lists
- Session-only context from past chats
- Entire `CLAUDE.md` pasted into one giant rule (token waste + drift)

## Optional: team-shared copy

To version the migrator with a repo, copy this skill to `.cursor/skills/claude-to-cursor/` in the project. Personal copy stays at `~/.cursor/skills/claude-to-cursor/` for use on any repo.

## Example outcome

Reference implementation: FlowTyme — `AGENTS.md`, `.cursor/rules/flowtyme-core.mdc`, `server-services.mdc`, `client-ui.mdc`, `.cursor/skills/flowtyme-dev/SKILL.md` (from `CLAUDE.md` + `.claude/commands/run.md`, `generate-day.md`, `test-notion.md`).
