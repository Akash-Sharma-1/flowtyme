# FlowTyme — agent guide

This repo is a time-boxing assistant. It reads a Notion “daily” page plus your iCloud calendar, computes free slots, proposes time blocks in a UI, and (on confirm) pushes accepted items to Apple Calendar and Reminders via CalDAV.

## Quick repo map

- `client/` — React + Vite + TypeScript frontend
  - `client/src/pages/` — `Dashboard`, `Proposals`, `Confirm`, `Setup`
  - `client/src/api.ts` — client-side API wrapper (prefer using this)
  - `client/src/types.ts` — shared TS types (`CalendarEvent`, `ProposalItem`, `AppConfig`)
- `server/` — Express + TypeScript backend
  - `server/src/index.ts` — Express entry, MongoDB connect
  - `server/src/routes/`
    - `calendar.ts` — `/api/calendar/*` read APIs
    - `notion.ts` — `/api/notion/parse`
    - `slots.ts` — `/api/slots/*` proposal generation + persistence
    - `push.ts` — `/api/push/confirm/:proposalId` writes to iCloud
    - `config.ts` — `/api/config` runtime config CRUD
  - `server/src/services/`
    - `caldav.ts` — iCloud CalDAV read/write (`tsdav` + `ical.js`)
    - `notion-parser.ts` — Notion Blocks API traversal + parsing
    - `slot-finder.ts` — free-slot assignment engine (15-min step)
    - `category-mapper.ts` — Notion category → Apple Calendar name (uses Config)
  - `server/src/models/` — `Proposal`, `Config` (MongoDB)

## Run locally

```bash
cd server && npm run dev   # http://localhost:3001
cd client && npm run dev   # http://localhost:5173
```

MongoDB must be running; the server currently exits if it cannot connect.

## Core flow (what calls what)

1. Setup (`/setup`) saves runtime config to MongoDB (`Config` model).
2. Dashboard “Generate Plan” calls `POST /api/slots/generate`.
3. Server pipeline: Notion parse + iCloud fetch → `slot-finder` → save `Proposal`.
4. Proposals page: day-view timeline with drag-and-drop; user resolves conflicts.
5. Confirm page: `POST /api/push/confirm/:proposalId` pushes accepted items to iCloud.

## Domain rules (important)

- Notion is parsed from the page’s **visual 3-column block layout**, not DB properties. The Blocks API does not recurse; children must be fetched explicitly.
- Column 3 items that match existing Apple Calendar events by name are ignored to avoid duplicates.
- Conflicts are never auto-resolved. Conflicting items are shown in UI and must be explicitly accepted after user edits.
- Default durations: tasks 60m, chores 15m; per-category overrides live in Config.

See `/Users/akash/Projects/flowtyme/parser-config.md` for the expected Notion structure.

## CalDAV gotchas

- iCloud CalDAV requires an app-specific password.
- `tsdav` types `DAVCalendar.displayName` as `string | Record<string, unknown>`; always coerce with `String(...)` before comparisons/returns.

## Where to change things

- Parser behavior: `server/src/services/notion-parser.ts` (+ `parser-config.md` for documentation)
- Scheduling/slot assignment: `server/src/services/slot-finder.ts`
- CalDAV fetch/write: `server/src/services/caldav.ts`
- UI drag/drop + styling: `client/src/pages/Proposals.tsx` and `client/src/index.css`

