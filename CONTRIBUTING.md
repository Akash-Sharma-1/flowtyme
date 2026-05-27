# Contributing to FlowTyme

## Prerequisites

- Node 18+
- MongoDB on `localhost:27017` (or skip — server falls back to in-memory)
- iCloud app-specific password (not main Apple ID password)
- Notion integration token + database ID

## Setup

```bash
cp server/.env.example server/.env
# fill in ICLOUD_USERNAME, ICLOUD_APP_PASSWORD, NOTION_TOKEN, NOTION_DATABASE_ID

cd server && npm install && npm run dev   # port 3001
cd client && npm install && npm run dev   # port 5173
```

## Repo layout

```
client/src/
  pages/      Dashboard, Proposals, Confirm, Setup
  api.ts      all fetch calls (import type from types.ts — Vite 8 rolldown requirement)
  types.ts    shared TS interfaces

server/src/
  services/   caldav, notion-parser, slot-finder, category-mapper
  routes/     calendar, notion, slots, push, config
  models/     Proposal, Config
```

## Commit style

Conventional Commits. No AI authorship lines.

```
feat(slot-finder): respect col3 pre-assignments as hard constraints
fix(caldav): coerce displayName with String() to handle tsdav union type
chore(deps): bump mongoose to 8.5
```

Types: `feat` `fix` `chore` `docs` `refactor`

## Key constraints

- **`import type`** for all TS interface imports in client — Vite 8 (rolldown) errors on value-importing type-only exports.
- **CalDAV `displayName`** is `string | Record<string, unknown>` — always `String(cal.displayName)`.
- **No auto-resolve** for slot conflicts — flag `hasConflict: true`, let user drag.
- **No auth in Phase 1** — credentials in `.env` only, never in DB.
- **Slot step** is 15 min — don't increase, it will miss gaps.

## Known issues (check before filing a bug)

- VTODO reminder push has malformed VALARM — reminders don't work yet.
- Col 3 name-match is case-sensitive substring — false positives possible.
- No iCloud calendar list cache — slow for users with many calendars.

## Testing

No test suite yet. Manually verify the full flow:

1. `POST /api/slots/generate?date=YYYY-MM-DD` returns proposal
2. Proposals page renders calendar with draggable events
3. Confirm page pushes accepted items to iCloud

## Pull requests

- One concern per PR.
- Include repro steps or a before/after screenshot for UI changes.
- Update `CLAUDE.md` if you change architecture decisions or add known issues.
