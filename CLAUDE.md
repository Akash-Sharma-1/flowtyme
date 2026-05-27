# FlowTyme — Project Context

## What this is
Plugin-based time-boxing assistant. Reads task sources (Notion, Obsidian, etc.) + calendar backends (iCloud, Google, Outlook) → computes free slots → proposes time blocks in UI → pushes to calendar on confirm. Sources and calendar backends are plugins declared in `plugins.yaml` — no code changes to swap them.

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
│       ├── plugins/                    # Plugin layer (Layer 1 + Layer 2)
│       │   ├── interfaces.ts           # ISourcePlugin, ICalendarPlugin, SourceItem, CalendarEvent
│       │   ├── registry.ts             # PluginRegistry — reads plugins.yaml, instantiates + merges
│       │   ├── sources/
│       │   │   └── notion-source.ts    # NotionSourcePlugin (wraps notion-parser.ts)
│       │   └── calendars/
│       │       └── icloud-calendar.ts  # ICloudCalendarPlugin (wraps caldav.ts)
│       ├── services/
│       │   ├── caldav.ts          # iCloud CalDAV read/write (tsdav + ical.js) — DO NOT MODIFY
│       │   ├── notion-parser.ts   # Notion block tree parser — DO NOT MODIFY
│       │   ├── slot-finder.ts     # Free-slot assignment engine (accepts SourceItem[])
│       │   └── category-mapper.ts # sourceCategory → calendarName + Config access
│       ├── routes/
│       │   ├── calendar.ts  # GET /api/calendar/events|reminders|list (via pluginRegistry)
│       │   ├── notion.ts    # GET /api/notion/parse (debug only, calls notion-parser directly)
│       │   ├── slots.ts     # POST /api/slots/generate, GET/PATCH /api/slots/:id (via pluginRegistry)
│       │   ├── push.ts      # POST /api/push/confirm/:proposalId (via pluginRegistry)
│       │   └── config.ts    # GET/PUT /api/config
│       ├── models/
│       │   ├── Proposal.ts  # Daily slot proposal with per-item state
│       │   └── Config.ts    # Category mappings, partitions, durations
│       └── index.ts         # Express entry, MongoDB connect
├── plugins.yaml             # Active plugin declarations — edit to add/swap sources/calendars
├── parser-config.md         # Notion structure spec (Notion DB ID set here)
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
NOTION_DATE_PROPERTY=Date                  # Notion DB property name holding the date
MONGODB_URI=mongodb://localhost:27017/flowtyme
PORT=3001
NODE_ENV=development
```

Note: `NOTION_DATABASE_ID` also lives in `plugins.yaml` under `sources[0].config.databaseId`. The `/api/notion/parse` debug route reads from `NOTION_DATABASE_ID` env var; the main pipeline reads from `plugins.yaml`.

---

## Architecture — 3 plugin layers

### Layer 1: Source plugins (`ISourcePlugin`)
Interface: `fetchItems(dateStr?) → Promise<SourceItem[]>`

`SourceItem` is the canonical task/chore type:
```typescript
interface SourceItem {
  title: string;
  type: 'task' | 'chore';
  category: string;           // e.g. "Health", "Office Work". Empty for chores.
  partitionHint?: string;     // morning | afternoon | evening | night
  preferredStartTime?: string; // HH:mm
}
```

Built-in: `NotionSourcePlugin` (wraps `notion-parser.ts` unchanged).
Multiple sources merge: `pluginRegistry.getSourceItems()` calls all enabled sources in parallel, flattens results.

### Layer 2: Calendar plugins (`ICalendarPlugin`)
Interface: `fetchEvents / pushEvent / pushReminder / listCalendars`

`CalendarEvent` matches existing caldav.ts output shape exactly:
```typescript
interface CalendarEvent {
  uid: string; title: string;
  startTime: Date; endTime: Date;
  calendarName: string; isAllDay: boolean;
}
```

Built-in: `ICloudCalendarPlugin` (wraps `caldav.ts` unchanged).
Routes use `pluginRegistry.getPrimaryCalendarPlugin()` — first enabled calendar plugin.

### Layer 3: Core engine (slot-finder + category-mapper)
`slot-finder.ts` input changed from `tasks: NotionTask[], chores: NotionChore[]` to `items: SourceItem[]`.
Logic unchanged — single loop over sorted items, branches on `item.type === 'task' | 'chore'`.

### Plugin wiring: `plugins.yaml`
```yaml
sources:
  - id: notion-daily
    type: notion           # → NotionSourcePlugin
    enabled: true
    config:
      databaseId: "..."
      dateProperty: "Date"

calendars:
  - id: icloud-primary
    type: icloud           # → ICloudCalendarPlugin
    enabled: true
    config: {}
```

`PluginRegistry` at `server/src/plugins/registry.ts`:
- Reads `plugins.yaml` on first use (lazy-loaded, singleton `pluginRegistry`)
- `instantiateSource()` switch-case: add a `case 'obsidian': ...` here when adding new source type
- `instantiateCalendar()` switch-case: add `case 'google': ...` when adding new calendar type
- Secrets never in `plugins.yaml` — always env vars

---

## Architecture decisions and rationale

### Why MERN (not macOS native)
**Decision**: Web app (MERN) over Swift/SwiftUI native.
**Why**: Cloud-hostable (Vercel/Render) from day one. Native = EventKit access but no web UI, no Phase 2 cloud path. MERN gives full stack JS, easy deploy, still reaches iCloud via CalDAV.
**Tradeoff accepted**: CalDAV more fragile than EventKit. App-specific password required.

### Why plugin architecture (not Notion/iCloud hardcoded)
**Decision**: `ISourcePlugin` / `ICalendarPlugin` interfaces with config-driven wiring via `plugins.yaml`.
**Why**: User wanted to support Obsidian, Google Calendar, Outlook without rewiring the whole app. Plugin layer means swapping sources/calendars = edit one YAML file + restart. Core slot-finder logic unchanged.
**How Claude fits**: `/generate-parser` skill reads a user's config.md + sample data → generates TypeScript adapter code. Build-time generation (not runtime calls) so the adapter runs fast forever. `/add-calendar-plugin` does the same for calendar backends.
**Key constraint**: `notion-parser.ts` and `caldav.ts` are NOT modified. Plugin wrappers are thin adapters.

### Why iCloud CalDAV directly (not AppleScript/Shortcuts bridge)
**Decision**: `tsdav` library hitting `caldav.icloud.com` directly.
**Why**: AppleScript only works on local Mac; CalDAV works from any server.
**Gotcha**: iCloud CalDAV needs app-specific password. `tsdav`'s `displayName` returns `string | Record<string, unknown>` — always coerce with `String()`.

### Why Phase 1 localhost-only, no auth
**Decision**: Phase 1 = localhost, `.env` for all secrets. No user login.
**Why**: MVP speed. Credentials in `.env`, never in DB or `plugins.yaml`.
**Phase 2 path**: JWT auth + encrypted credential storage in MongoDB, deploy to Render + Vercel, MongoDB Atlas.

### Why MongoDB for config and proposals
**Decision**: Runtime config (category mappings, partitions, durations) and proposals in MongoDB.
**Why**: Config editable via Setup UI without touching code. Proposals persist across page refreshes.

### Notion page structure — visual columns, not DB properties
**Decision**: Parse the visual 3-column layout using Blocks API.
**Why**: User's Notion page uses visual column layout blocks, not database properties for tasks/chores.
**Implementation**: Notion Blocks API doesn't auto-recurse. Must fetch children of `column_list`, then each `column`, then content blocks inside. Three levels of async fetching.

### Col 3 parsing logic
**Decision**: Col 3 items matching existing Apple Calendar events by name are silently ignored. Pre-assignments are soft hints.
**Why**: Col 3 mixes scheduling hints with references to existing events. Name-match dedup prevents duplicates.

### Conflict resolution — always show UI, never auto-resolve
**Decision**: Slot finder flags conflicts, sends to UI. User drags to resolve.
**Why**: Auto-resolving silently moves tasks user has opinions about. `hasConflict: true` items get a fallback slot and `accepted: false`.

### Duration defaults
**Decision**: task = 60min, chore = 15min. Per-category overrides in Config.
**Config field**: `durationOverrides: [{category, durationMinutes}]`.

### Slot finder — 15-min granularity steps
**Decision**: Slot search steps in 15-min increments.
**Why**: 15min = standard calendar grid unit. Coarser (30min) misses gaps between short events.

### react-big-calendar + DnD for Proposals page
**Decision**: `react-big-calendar` with `withDragAndDrop` addon.
**Why**: Day-view timeline + DnD out of the box.
**CSS note**: rbc CSS fights Tailwind. All overrides in `index.css` using `--color-*` CSS vars. Dark theme via var overrides, not Tailwind classes.

### Category colors — static map, not from calendar backend
**Decision**: `CATEGORY_COLORS` map in `Proposals.tsx` keyed by source category name.
**Why**: CalDAV doesn't reliably expose calendar color. Static map is predictable.
**Known gap**: New categories not in map fall back to `#8888aa`. Should pull from Config.

### Config model fields — plugin-agnostic naming
**Decision**: `ICategoryMapping` uses `sourceCategory` + `calendarName` (not old `notionCategory` + `appleCalendarName`).
**Why**: The plugin architecture makes Notion/iCloud-specific field names wrong — any source maps to any calendar.
**Migration**: Existing MongoDB docs with old field names won't match. Single-user localhost app — re-enter mappings or add a startup migration in `getConfig()`.

### tsdav displayName type issue
`DAVCalendar.displayName` typed as `string | Record<string, unknown>` in tsdav. Always coerce: `String(cal.displayName || 'Unknown')`. Affects `caldav.ts` in three places.

---

## Known issues / next to fix

1. **Notion recursive block fetch**: One level deep per column. Nested toggles inside columns not parsed. Need deeper recursion for toggle blocks.
2. **Col 3 name-match for calendar events**: Case-sensitive substring match. Can false-positive on partial title match.
3. **No loading state in Proposals page**: CalDAV fetch slow → calendar renders empty then jumps. Add skeleton.
4. **iCloud CalDAV rate limiting**: O(n) requests per generate. For many calendars = slow. Cache calendar list in MongoDB.
5. **VTODO reminder push**: `VALARM:TRIGGER:-PT0M` syntax in `caldav.ts:pushReminder` is malformed — VALARM needs full nested component. Fix before testing reminders.
6. **Config migration**: Old MongoDB Config docs use `notionCategory` / `appleCalendarName` field names. New code uses `sourceCategory` / `calendarName`. Existing users need to re-enter mappings or add startup migration.
7. **`plugins.yaml` path resolution**: Registry searches multiple candidate paths for `plugins.yaml`. Works for `ts-node` dev and compiled `dist/`. Verify path resolves correctly if changing run location.

---

## API reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness check |
| GET | `/api/calendar/events?date=YYYY-MM-DD` | Today's VEVENT via active calendar plugin |
| GET | `/api/calendar/reminders?date=YYYY-MM-DD` | Today's VTODO (iCloud direct, not plugin) |
| GET | `/api/calendar/list` | All calendars via active calendar plugin |
| GET | `/api/notion/parse?date=YYYY-MM-DD` | Debug: parse Notion (direct, reads NOTION_DATABASE_ID env) |
| POST | `/api/slots/generate` | Full pipeline: all source plugins + calendar plugin → proposals |
| GET | `/api/slots/:date` | Get saved proposal for date |
| PATCH | `/api/slots/:id/items` | Update proposal items (after drag/toggle) |
| POST | `/api/push/confirm/:proposalId` | Push accepted items via calendar plugin |
| GET | `/api/config` | Get runtime config |
| PUT | `/api/config` | Save runtime config |

---

## User flow
1. **Setup** (`/setup`): Map source categories → calendar names, set partition times. Plugin config (DB IDs etc.) lives in `plugins.yaml`.
2. **Dashboard** (`/`): Pick date → Generate Plan → calls `POST /api/slots/generate`. Shows stat cards.
3. **Proposals** (`/proposals`): Day-view calendar with DnD. Drag to move, click sidebar to toggle accept/reject. Conflicts shown in red.
4. **Confirm** (`/confirm`): Summary of what pushes where. Set Reminders list name. Push button.

---

## Claude Code skills (`.claude/commands/`)

| Skill | File | Purpose |
|-------|------|---------|
| `/generate-day` | `generate-day.md` | Run full pipeline for today |
| `/test-notion` | `test-notion.md` | Test Notion parser against today's page |
| `/generate-parser` | `generate-parser.md` | Config.md + sample data → TypeScript ISourcePlugin adapter |
| `/add-calendar-plugin` | `add-calendar-plugin.md` | Name a calendar backend → TypeScript ICalendarPlugin adapter + auth guide |
| `/map-categories` | `map-categories.md` | Auto-map source categories to available calendar names |
| `/run` | `run.md` | Start both dev servers |
| `/commit` | `commit.md` | Commit changes |
| `/push` | `push.md` | Git push current branch |

---

## Adding a new source plugin (reference)

1. Run `/generate-parser` in Claude Code — or manually:
   - Create `server/src/plugins/sources/<name>-source.ts` implementing `ISourcePlugin`
   - Export `<Name>SourceConfig` interface + `<Name>SourcePlugin` class
   - Add `case '<name>':` to `instantiateSource()` in `registry.ts`
2. Add stanza to `plugins.yaml` under `sources:`
3. Restart server

## Adding a new calendar plugin (reference)

1. Run `/add-calendar-plugin` in Claude Code — or manually:
   - Create `server/src/plugins/calendars/<name>-calendar.ts` implementing `ICalendarPlugin`
   - Add `case '<name>':` to `instantiateCalendar()` in `registry.ts`
2. Add stanza to `plugins.yaml` under `calendars:`
3. Restart server

---

## Phase 2 checklist (not built)
- [ ] Deploy React → Vercel (`VITE_API_URL` env var)
- [ ] Deploy Express → Render
- [ ] MongoDB → Atlas (swap `MONGODB_URI`)
- [ ] Add JWT auth middleware
- [ ] Encrypt iCloud credentials in DB (not just .env)
- [ ] Cache iCloud calendar list to reduce CalDAV requests
- [ ] Add per-category duration overrides to Setup UI
- [ ] Google Calendar plugin (`/add-calendar-plugin`)
- [ ] Outlook plugin (`/add-calendar-plugin`)
- [ ] Hot-reload `plugins.yaml` (fs.watch, registry.reset())
- [ ] Plugin health endpoint `GET /api/plugins/status`

---

## Commit style
Conventional Commits format. No AI authorship. No `Co-Authored-By` lines.
Format: `type(scope): short description` — types: feat, fix, chore, docs, refactor.
