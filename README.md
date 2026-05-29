<div align="center">

<img src="client/public/favicon.svg" alt="FlowTyme" width="72" height="69" />

<pre align="center">
███████╗██╗      ██████╗ ██╗    ██╗████████╗██╗   ██╗███╗   ███╗███████╗
██╔════╝██║     ██╔═══██╗██║    ██║╚══██╔══╝╚██╗ ██╔╝████╗ ████║██╔════╝
█████╗  ██║     ██║   ██║██║ █╗ ██║   ██║    ╚████╔╝ ██╔████╔██║█████╗
██╔══╝  ██║     ██║   ██║██║███╗██║   ██║     ╚██╔╝  ██║╚██╔╝██║██╔══╝
██║     ███████╗╚██████╔╝╚███╔███╔╝   ██║      ██║   ██║ ╚═╝ ██║███████╗
╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝    ╚═╝      ╚═╝   ╚═╝     ╚═╝╚══════╝
</pre>

### Time Boxing Assistant

**Plugin-based time-boxing assistant. Any task source + any calendar → structured day, automatically.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-7c6af7)](https://akash-sharma-1.github.io/flowtyme/)

</div>

**Live landing page:** [https://akash-sharma-1.github.io/flowtyme/](https://akash-sharma-1.github.io/flowtyme/) (static marketing site; run the app locally for the full dashboard — see [Quick start](#quick-start)).

---

## What it does

FlowTyme reads your task sources and calendar, finds your free slots, and proposes a structured time-block schedule. Review proposals on a drag-and-drop calendar, accept or reject each block, then push the whole day to your calendar in one click.

Sources and calendar backends are **plugins** — swap or extend them via a single config file, no code changes needed.

```
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 1 — Source Plugins                    │
│                                                                 │
│   Notion daily page      Obsidian vault     any source...       │
│   (tasks, chores,        (via /generate-    (add with           │
│    time hints)            parser skill)      /generate-parser)  │
└──────────────────────────────┬──────────────────────────────────┘
                               │  SourceItem[]
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 3 — Core Engine                       │
│                                                                 │
│   Slot Finder  →  free-slot assignment (15-min grid, partitions)│
│                   conflict detection + DnD resolution UI        │
└──────────────────────────────┬──────────────────────────────────┘
                               │  ProposalItem[]
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LAYER 2 — Calendar Plugins                    │
│                                                                 │
│   iCloud CalDAV          Google Calendar    Outlook / any...    │
│   (VEVENT + VTODO)       (via /add-calendar-(add with           │
│                           plugin skill)     /add-calendar-      │
│                                             plugin)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 · Vite · TypeScript · Tailwind · react-big-calendar + DnD |
| Backend | Express · TypeScript · `js-yaml` |
| Database | MongoDB (config + proposals) |
| Source plugins | `@notionhq/client` (built-in) · any source via `/generate-parser` |
| Calendar plugins | `tsdav` + `ical.js` for iCloud (built-in) · any backend via `/add-calendar-plugin` |

---

## Quick start

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`)
- iCloud [app-specific password](https://appleid.apple.com) (Security → App-Specific Passwords)
- [Notion integration token](https://www.notion.so/my-integrations)

### Setup

```bash
# 1. Clone
git clone https://github.com/Akash-Sharma-1/flowtyme.git
cd flowtyme

# 2. Environment
cp .env.example server/.env
# Fill in server/.env — see variables section below

# 3. Install
cd server && npm install && cd ../client && npm install && cd ..

# 4. Configure plugins
# Edit plugins.yaml at repo root — set your Notion database ID
nano plugins.yaml

# 5. Run
# Terminal 1 — backend (port 3001)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment variables (`server/.env`)

```env
ICLOUD_USERNAME=your-apple-id@icloud.com
ICLOUD_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx    # app-specific password, NOT main iCloud password
NOTION_TOKEN=secret_xxxx
NOTION_DATABASE_ID=your-database-id        # also set in plugins.yaml
NOTION_DATE_PROPERTY=Date                  # Notion DB property name that holds the date
MONGODB_URI=mongodb://localhost:27017/flowtyme
PORT=3001
NODE_ENV=development
```

---

## Plugin architecture

All sources and calendar backends are declared in **`plugins.yaml`** at the repo root:

```yaml
sources:
  - id: notion-daily
    type: notion
    enabled: true
    config:
      databaseId: "your-database-id"
      dateProperty: "Date"

  # - id: obsidian-vault
  #   type: obsidian
  #   enabled: false
  #   config:
  #     vaultPath: "~/Documents/vault"

calendars:
  - id: icloud-primary
    type: icloud
    enabled: true
    config: {}

  # - id: google-work
  #   type: google
  #   enabled: false
  #   config: { clientId: "..." }
```

- **Enable multiple sources**: set `enabled: true` on several sources — their tasks merge before slot assignment.
- **Swap calendar backend**: disable `icloud`, enable `google` — no code changes.
- **Server reads `plugins.yaml` on startup**. Restart after editing.

### Extending with Claude Code skills

| Skill | What it does |
|-------|-------------|
| `/generate-parser` | Describe your data source in a config file → Claude generates a TypeScript `ISourcePlugin` adapter |
| `/add-calendar-plugin` | Name a calendar backend → Claude generates a TypeScript `ICalendarPlugin` adapter with auth setup guide |
| `/map-categories` | Auto-maps your source category labels to calendar names using available calendars |

```bash
# Example: add Obsidian as a second task source
# 1. Run in Claude Code:
/generate-parser

# 2. Describe your Obsidian daily note format when prompted
# 3. Claude writes server/src/plugins/sources/obsidian-source.ts
# 4. Add the stanza Claude shows to plugins.yaml
# 5. Restart server — Obsidian tasks now merge with Notion tasks
```

---

## First-time setup

1. Edit `plugins.yaml` — set `databaseId` for your Notion source
2. Open the **Setup** tab at [localhost:5173/setup](http://localhost:5173/setup)
3. Map source categories → calendar names (or run `/map-categories` in Claude Code)
4. Adjust day partition times (morning / afternoon / evening / night)
5. Save

---

## Daily flow

```
Dashboard → pick date → Generate Plan
    ↓
Proposals → drag events to resolve conflicts → toggle accept/reject
    ↓
Confirm → review push summary → Push to calendar
```

---

## Notion page structure (default source)

Parser expects a 3-column layout on each daily page:

| Column | Content | Behaviour |
|--------|---------|-----------|
| Col 1 | Tasks (with category headings) | Scheduled into free slots |
| Col 2 | Chores | Scheduled at 15 min default |
| Col 3 | Time hints / pre-assignments | Soft constraints for slot finder |

See [`parser-config.md`](parser-config.md) for the full spec.

---

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness check |
| GET | `/api/calendar/events?date=YYYY-MM-DD` | Today's events via active calendar plugin |
| GET | `/api/calendar/reminders?date=YYYY-MM-DD` | Today's reminders (iCloud VTODO) |
| GET | `/api/calendar/list` | All calendars from active calendar plugin |
| GET | `/api/notion/parse?date=YYYY-MM-DD` | Debug: parse Notion daily page directly |
| POST | `/api/slots/generate` | Full pipeline → proposals |
| GET | `/api/slots/:date` | Saved proposal for date |
| PATCH | `/api/slots/:id/items` | Update items after drag/toggle |
| POST | `/api/push/confirm/:proposalId` | Push accepted items via calendar plugin |
| GET/PUT | `/api/config` | Runtime config (durations, category mappings, partitions) |

---

## iCloud CalDAV notes

- Server: `caldav.icloud.com`
- Auth: Apple ID + **app-specific password** — not your main iCloud password
- Generate at [appleid.apple.com](https://appleid.apple.com) → Security → App-Specific Passwords
- Reminders lists appear as VTODO calendars alongside VEVENT calendars

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/): `feat(scope): description`
4. Open a PR against `main`

Bug reports and feature requests welcome via [Issues](../../issues).

---

## Roadmap

### Phase 1 — Local polish (current)

- [ ] Fix VTODO VALARM syntax in `caldav.ts:pushReminder` — malformed nested component blocks reminder push
- [ ] Skeleton loading state in Proposals page — calendar renders empty then jumps on slow CalDAV fetch
- [ ] Deeper Notion block recursion — nested toggles inside columns not parsed (one level deep today)
- [ ] Case-insensitive Col 3 event-name dedup — substring match can false-positive on partial title matches
- [ ] Per-category duration overrides in Setup UI — backend model supports it, UI doesn't expose it yet
- [ ] Graceful MongoDB startup — server crash-exits if `mongod` isn't running; add retry + clear error message

### Phase 2 — Cloud deployment

- [ ] Deploy frontend → Vercel (`VITE_API_URL` env var)
- [ ] Deploy backend → Render
- [ ] Swap MongoDB → Atlas (`MONGODB_URI` only change needed)
- [ ] JWT auth middleware — single-user token flow, no signup needed
- [ ] Encrypt iCloud credentials in MongoDB — remove `.env` dependency for credentials
- [ ] Cache iCloud calendar list in MongoDB — current O(n) CalDAV requests per generate is slow

### Phase 3 — Intelligence layer

- [ ] Google Calendar plugin — OAuth2 flow, push/fetch via Google Calendar API
- [ ] Outlook plugin — Microsoft Graph API, Azure app registration
- [ ] AI-assisted slot scoring — rank proposals by energy level + task depth instead of first-fit
- [ ] AI dedup across sources — Claude detects duplicate tasks when multiple sources are active
- [ ] Plugin health endpoint — `GET /api/plugins/status` showing each plugin's last-fetch state
- [ ] Hot-reload `plugins.yaml` — no server restart needed after editing
- [ ] Web UI for plugin management — toggle plugins on/off from Setup page
- [ ] Recurring task patterns — detect tasks that appear every day and auto-accept their usual slot
- [ ] Mobile-friendly UI — Proposals page is desktop-only; adapt for touch + smaller screens
- [ ] Calendar heat map on Dashboard — visualise how packed the day is before generating

---

<div align="center">

<img src="client/public/favicon.svg" alt="FlowTyme" width="32" height="31" />

Built for personal use. Open-sourced because others might want this too.

</div>
