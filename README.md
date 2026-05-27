<div align="center">

```
███████╗██╗      ██████╗ ██╗    ██╗████████╗██╗   ██╗███╗   ███╗███████╗
██╔════╝██║     ██╔═══██╗██║    ██║╚══██╔══╝╚██╗ ██╔╝████╗ ████║██╔════╝
█████╗  ██║     ██║   ██║██║ █╗ ██║   ██║    ╚████╔╝ ██╔████╔██║█████╗  
██╔══╝  ██║     ██║   ██║██║███╗██║   ██║     ╚██╔╝  ██║╚██╔╝██║██╔══╝  
██║     ███████╗╚██████╔╝╚███╔███╔╝   ██║      ██║   ██║ ╚═╝ ██║███████╗
╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝    ╚═╝      ╚═╝   ╚═╝     ╚═╝╚══════╝
```

**Time-boxing assistant. Notion + iCloud → structured day, automatically.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Notion API](https://img.shields.io/badge/Notion-API-000000?logo=notion&logoColor=white)](https://developers.notion.com/)
[![iCloud CalDAV](https://img.shields.io/badge/iCloud-CalDAV-1D6FE4?logo=icloud&logoColor=white)](https://apple.com/icloud/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## What it does

FlowTyme reads your Notion daily page and iCloud calendar, finds your free slots, and proposes a structured time-block schedule. Review proposals on a drag-and-drop calendar, accept or reject each block, then push the whole day to Apple Calendar and Reminders in one click.

```
Notion daily page          iCloud CalDAV            FlowTyme
  ┌─────────────┐           ┌────────────┐          ┌──────────────┐
  │ Col 1: Tasks│           │ Events     │  ──────▶  │ Slot finder  │
  │ Col 2: Chores│   +      │ Reminders  │          │ (15-min grid)│
  │ Col 3: Hints│           └────────────┘          └──────┬───────┘
  └─────────────┘                                          │
                                                           ▼
                                                  ┌────────────────┐
                                                  │ Proposals UI   │
                                                  │ (DnD calendar) │
                                                  └──────┬─────────┘
                                                         │ confirm
                                                         ▼
                                                  Apple Calendar +
                                                  Reminders
```

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 · Vite · TypeScript · Tailwind · react-big-calendar |
| Backend | Express · TypeScript · tsdav · @notionhq/client |
| Database | MongoDB (config + proposals) |
| Integrations | Notion Blocks API · iCloud CalDAV |

---

## Quick start

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`)
- iCloud [app-specific password](https://appleid.apple.com) (Security → App-Specific Passwords)
- [Notion integration token](https://www.notion.so/my-integrations) + database ID

### Setup

```bash
# 1. Clone
git clone https://github.com/Akash-Sharma-1/flowtyme.git
cd flowtyme

# 2. Environment
cp .env.example server/.env
# Fill in server/.env with your credentials (see below)

# 3. Install
cd server && npm install && cd ../client && npm install && cd ..

# 4. Run
# Terminal 1 — backend (port 3001)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment variables (`server/.env`)

```env
ICLOUD_USERNAME=your-apple-id@icloud.com
ICLOUD_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
NOTION_TOKEN=secret_xxxx
NOTION_DATABASE_ID=your-database-id
MONGODB_URI=mongodb://localhost:27017/flowtyme
PORT=3001
NODE_ENV=development
```

---

## First-time setup

1. Open the **Setup** tab
2. Set your Notion Database ID + date property name
3. Map Notion categories → Apple Calendar names
4. Adjust day partition times (morning / afternoon / evening)
5. Save

---

## Daily flow

```
Dashboard → pick date → Generate Plan
    ↓
Proposals → drag events to resolve conflicts → toggle accept/reject
    ↓
Confirm → review push summary → Push to iCloud
```

---

## Notion page structure

Parser expects a 3-column layout on each daily page:

| Column | Content | Behaviour |
|--------|---------|-----------|
| Col 1 | Tasks (with category tags) | Scheduled into free slots |
| Col 2 | Chores | Scheduled at 15 min default |
| Col 3 | Time hints / pre-assignments | Soft constraints for slot finder |

See [`parser-config.md`](parser-config.md) for the full spec.

---

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness check |
| GET | `/api/calendar/events?date=YYYY-MM-DD` | Today's events from iCloud |
| GET | `/api/calendar/reminders?date=YYYY-MM-DD` | Today's reminders |
| GET | `/api/calendar/list` | All iCloud calendars |
| GET | `/api/notion/parse?date=YYYY-MM-DD` | Parse Notion daily page |
| POST | `/api/slots/generate` | Full pipeline → proposals |
| GET | `/api/slots/:date` | Saved proposal for date |
| PATCH | `/api/slots/:id/items` | Update items after drag/toggle |
| POST | `/api/push/confirm/:proposalId` | Push accepted items to iCloud |
| GET/PUT | `/api/config` | Runtime config |

---

## iCloud CalDAV notes

- Server: `caldav.icloud.com`
- Auth: Apple ID + **app-specific password** — not your main iCloud password
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

- [ ] Deploy React → Vercel
- [ ] Deploy Express → Render
- [ ] MongoDB → Atlas
- [ ] JWT auth + encrypted credential storage
- [ ] iCloud calendar list caching (reduce CalDAV requests)
- [ ] Per-category duration overrides in Setup UI
- [ ] Nested Notion toggle block support

---

<div align="center">

Built for personal use. Open-sourced because others might want this too.

</div>
