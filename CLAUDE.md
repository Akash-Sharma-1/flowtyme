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
│       └── types.ts         # Shared TS types (CalendarEvent, ProposalItem, AppConfig)
├── server/                  # Express + TypeScript backend
│   └── src/
│       ├── services/
│       │   ├── caldav.ts          # iCloud CalDAV read/write (tsdav + ical.js)
│       │   ├── notion-parser.ts   # Notion block tree parser
│       │   ├── slot-finder.ts     # Free-slot assignment engine
│       │   └── category-mapper.ts # Notion category → Apple Calendar name + Config access
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
├── parser-config.md         # User-facing Notion structure spec (DB ID already filled)
├── .env.example             # Required env vars template
├── CLAUDE.md                # This file
└── README.md
```

## Running locally

```bash
# Requires: Node 18+, MongoDB on localhost:27017

cd server && npm run dev   # port 3001
cd client && npm run dev   # port 5173
```

MongoDB must be running before server starts — it crash-exits on connection failure.

## Environment vars (server/.env)
```
ICLOUD_USERNAME=your-apple-id@icloud.com
ICLOUD_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx   # app-specific password, NOT main iCloud password
NOTION_TOKEN=secret_xxxx
NOTION_DATABASE_ID=365201f2eb5f800dac1e000c4f883260
MONGODB_URI=mongodb://localhost:27017/flowtyme
PORT=3001
NODE_ENV=development
```

---

## Architecture decisions and rationale

### Why MERN (not macOS native)
**Decision**: Web app (MERN) over Swift/SwiftUI native.
**Why**: User wanted cloud-hostable (Vercel/Render) from day one. Native would mean EventKit access but no web UI, no Phase 2 cloud path. MERN gives full stack JS, easy deploy, and still reaches iCloud via CalDAV.
**Tradeoff accepted**: CalDAV is more fragile than EventKit. App-specific password required instead of system permission dialog.

### Why iCloud CalDAV directly (not AppleScript/Shortcuts bridge)
**Decision**: `tsdav` library hitting `caldav.icloud.com` directly.
**Why**: User explicitly chose this over AppleScript or macOS Shortcuts bridge for cloud-readiness. AppleScript only works on local Mac; CalDAV works from any server.
**Gotcha**: iCloud CalDAV needs app-specific password (not main Apple ID password). Generate at appleid.apple.com → Security → App-Specific Passwords. `tsdav`'s `displayName` returns `string | Record<string, unknown>` — always coerce with `String()`.

### Why Phase 1 localhost-only, no auth
**Decision**: Phase 1 = localhost, `.env` for all secrets. No user login.
**Why**: MVP speed. Auth adds complexity before the core flow is proven. Credentials live in `.env`, never in DB.
**Phase 2 path**: Add JWT auth + encrypted credential storage in MongoDB, deploy to Render + Vercel, switch to MongoDB Atlas.

### Why MongoDB for config and proposals
**Decision**: Runtime config (category mappings, partitions, durations) and proposals stored in MongoDB.
**Why**: Config needs to be editable via the Setup UI without touching code. Proposals need to persist across page refreshes so user can come back mid-review. Both are naturally document-shaped.
**Alternative considered**: JSON config file. Rejected because it would need server restart to reload, and proposals-as-files would be messy.

### Notion page structure — visual columns, not DB properties
**Decision**: Parse the visual 3-column layout of each daily page using Blocks API.
**Why**: User's actual Notion page uses visual column layout blocks, not database properties for tasks/chores. The database has one row per day; opening that row's page shows the 3-column layout.
**Implementation detail**: Notion Blocks API doesn't auto-recurse. Must explicitly fetch children of `column_list`, then children of each `column`, then traverse content blocks inside. Three levels of async fetching.

### Col 3 parsing logic
**Decision**: Col 3 items that match existing Apple Calendar events by name are silently ignored. Col 3 pre-assignments are soft hints (constraints respected by slot finder, overridable by dragging in UI).
**Why**: Col 3 mixes "I want to do X in the morning" hints with references to existing calendar events (e.g. "Team standup 9am"). The latter already exists in CalDAV — importing them again would create duplicates. Name-match is imperfect but acceptable for MVP.

### Conflict resolution — always show UI, never auto-resolve
**Decision**: Slot finder flags conflicts and sends them to UI. User drags to resolve.
**Why**: User explicitly chose this. Auto-resolving would silently move tasks the user has opinions about. Showing all conflicts gives full control.
**Implementation**: `hasConflict: true` items still get a fallback slot (appended after last busy slot) so they appear on the calendar timeline, but `accepted` defaults to `false`. User must explicitly accept after resolving.

### Duration defaults
**Decision**: task = 60min, chore = 15min. Per-category overrides in Config.
**Why**: User specified these. Overrides allow e.g. "Deep Work = 90min" without changing defaults.
**Config field**: `durationOverrides: [{category, durationMinutes}]` array in Config model.

### Slot finder — 15-min granularity steps
**Decision**: Slot search steps in 15-min increments.
**Why**: Finer granularity = more options found. 15min is typical calendar grid unit. Coarser (30min) would miss gaps between short events.

### react-big-calendar + DnD for Proposals page
**Decision**: `react-big-calendar` with `withDragAndDrop` addon.
**Why**: Gives day-view timeline out of the box. DnD lets user visually move proposals to resolve conflicts. Existing events shown in muted style as background context.
**CSS note**: react-big-calendar ships its own CSS that fights Tailwind. All overrides live in `index.css` using `--color-*` CSS vars. Dark theme applied via var overrides, not Tailwind classes, because rbc injects class names we don't control.

### Category colors — static map, not from iCloud
**Decision**: `CATEGORY_COLORS` map in `Proposals.tsx` keyed by Notion category name.
**Why**: iCloud CalDAV doesn't reliably expose calendar color in the VEVENT/calendar metadata. Static map is predictable. User can see and adjust it.
**Known gap**: If user adds a new Notion category not in the map, it falls back to `#8888aa` (muted grey). Should eventually pull from Config.

### tsdav displayName type issue
The `DAVCalendar.displayName` property is typed as `string | Record<string, unknown>` in tsdav's type definitions. Always coerce: `String(cal.displayName || 'Unknown')`. This affects `caldav.ts` in three places: event push target find, reminder push target find, `listCalendars()` return.

---

## Known issues / next to fix

2. **Notion recursive block fetch**: Currently fetches one level deep per column. If user has nested toggles inside column, content inside them won't be parsed. Need deeper recursion for toggle blocks.
3. **Col 3 name-match for calendar events**: Case-sensitive substring match. Could false-positive if a task name partially matches a calendar event title.
4. **No loading state in Proposals page**: If CalDAV fetch is slow, calendar renders empty then jumps. Add skeleton.
5. **iCloud CalDAV rate limiting**: Fetching all calendars then all objects for each is O(n) requests. For users with many calendars this will be slow. Cache calendar list in MongoDB.
6. **VTODO reminder push**: The `VALARM:TRIGGER:-PT0M` syntax in `caldav.ts:pushReminder` is malformed — VALARM needs to be a full nested component, not a single property line. Fix before testing reminders.

---

## API reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness check |
| GET | `/api/calendar/events?date=YYYY-MM-DD` | Today's VEVENT from all iCloud calendars |
| GET | `/api/calendar/reminders?date=YYYY-MM-DD` | Today's VTODO from Reminders |
| GET | `/api/calendar/list` | All iCloud calendars + reminder lists |
| GET | `/api/notion/parse?date=YYYY-MM-DD` | Parse Notion daily page |
| POST | `/api/slots/generate` | Full pipeline: Notion + CalDAV → slot proposals |
| GET | `/api/slots/:date` | Get saved proposal for date |
| PATCH | `/api/slots/:id/items` | Update proposal items (after drag/toggle) |
| POST | `/api/push/confirm/:proposalId` | Push accepted items to iCloud |
| GET | `/api/config` | Get runtime config |
| PUT | `/api/config` | Save runtime config |

---

## User flow
1. **Setup** (`/setup`): Set Notion DB ID, category→calendar mappings, partition times. One-time.
2. **Dashboard** (`/`): Pick date → Generate Plan → calls `POST /api/slots/generate`. Shows stat cards.
3. **Proposals** (`/proposals`): Day-view calendar with DnD. Drag to move, click sidebar to toggle accept/reject. Conflicts shown in red.
4. **Confirm** (`/confirm`): Summary of what pushes where. Set Reminders list name. Push button.

---

## Phase 2 checklist (not built)
- [ ] Deploy React → Vercel (`VITE_API_URL` env var)
- [ ] Deploy Express → Render
- [ ] MongoDB → Atlas (swap `MONGODB_URI`)
- [ ] Add JWT auth middleware
- [ ] Encrypt iCloud credentials in DB (not just .env)
- [ ] Cache iCloud calendar list to reduce CalDAV requests
- [ ] Add per-category duration overrides to Setup UI

---

## Commit style
Conventional Commits format. No AI authorship. No `Co-Authored-By` lines.
Format: `type(scope): short description` — types: feat, fix, chore, docs, refactor.
