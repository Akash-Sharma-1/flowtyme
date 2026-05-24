# FlowTyme — Project Context

## What this is
Time-boxing assistant. Reads Notion daily page + iCloud calendar → computes free slots → proposes time blocks in UI → pushes to Apple Calendar/Reminders via CalDAV on confirm.

## Repo structure
```
flowtyme/
├── client/                  # React + Vite + TypeScript frontend
│   └── src/
│       ├── pages/           # Dashboard, Proposals, Confirm, Setup
│       ├── api.ts           # All fetch calls to server
│       └── types.ts         # Shared TS types
├── server/                  # Express + TypeScript backend
│   └── src/
│       ├── services/
│       │   ├── caldav.ts          # iCloud CalDAV read/write (tsdav + ical.js)
│       │   ├── notion-parser.ts   # Notion block tree parser
│       │   ├── slot-finder.ts     # Free-slot assignment engine
│       │   └── category-mapper.ts # Notion category → Apple Calendar name
│       ├── routes/
│       │   ├── calendar.ts  # GET /api/calendar/events|reminders|list
│       │   ├── notion.ts    # GET /api/notion/parse
│       │   ├── slots.ts     # POST /api/slots/generate, GET/PATCH /api/slots/:id
│       │   ├── push.ts      # POST /api/push/confirm/:proposalId
│       │   └── config.ts    # GET/PUT /api/config
│       ├── models/
│       │   ├── Proposal.ts  # Daily slot proposal with per-item state
│       │   └── Config.ts    # Category mappings, partitions, durations
│       └── index.ts         # Express entry, MongoDB connect
├── parser-config.md         # User-facing Notion structure spec
├── .env.example             # Required env vars template
└── README.md
```

## Running locally

```bash
# Requires: Node 18+, MongoDB running on localhost:27017

# Terminal 1 — backend (port 3001)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

MongoDB must be running. If not installed: `brew services start mongodb-community`.

## Environment vars (server/.env)
```
ICLOUD_USERNAME=your-apple-id@icloud.com
ICLOUD_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx   # app-specific, NOT iCloud password
NOTION_TOKEN=secret_xxxx
NOTION_DATABASE_ID=365201f2eb5f800dac1e000c4f883260
MONGODB_URI=mongodb://localhost:27017/flowtyme
PORT=3001
```

## Key architecture decisions

### iCloud bridge
Uses CalDAV protocol directly (`tsdav` library, `caldav.icloud.com`).
Auth = Apple ID + app-specific password (generate at appleid.apple.com).
VEVENT = calendar events, VTODO = Reminders.

### Notion page structure
Database where each row = one day. Each daily page has 3-column visual layout:
- **Col 1**: Category headers (H2/H3) → task list items below each
- **Col 2**: Chores list
- **Col 3**: Day partition headers (Morning/Afternoon/Evening/Night) → pre-assigned tasks

Parser walks `column_list → column → blocks` via Notion Blocks API (recursive).
Items in Col 3 that match existing calendar events are ignored (treated as existing busy slots).

### Slot finder logic
1. Build busy-time map from existing CalDAV events
2. Place Col 3 pre-assigned tasks in their partition window (hard constraint)
3. Assign remaining tasks: first available 1hr slot in partition or anywhere
4. Assign chores: first available 15min gap anywhere
5. Flag conflicts → sent to UI, user resolves by dragging

### Config (MongoDB)
Runtime config stored in `Config` collection (single document):
- `categoryMappings`: Notion category → Apple Calendar name
- `partitions`: morning/afternoon/evening/night time ranges
- `defaultTaskDurationMinutes`: 60
- `defaultChoreDurationMinutes`: 15
- `notionDatabaseId`, `notionDateProperty`

All editable in Setup UI at `/setup`.

### Proposal lifecycle
`Proposal` document stores daily proposals with status: `draft` → `pushed`.
Items have `accepted: bool`, `hasConflict: bool`. User toggles in Proposals UI.
On confirm, only `accepted: true` items get pushed to iCloud.

## User flow
1. `/` Dashboard → pick date → "Generate Plan" → calls `POST /api/slots/generate`
2. `/proposals` → drag events on calendar, toggle accept/reject per item
3. `/confirm` → review summary → push to iCloud Calendar + Reminders

## Phase 2 (not built yet)
- Deploy client → Vercel, server → Render
- Add user auth (JWT)
- MongoDB → Atlas
- Change `VITE_API_URL` from localhost to Render URL

## Commit style
Conventional Commits. No AI authorship in commits.
