# FlowTyme

Time-boxing assistant. Reads Notion dailies + iCloud calendar → proposes time slots → pushes to Apple Calendar/Reminders on accept.

## Quick start

### 1. Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`)
- iCloud app-specific password (appleid.apple.com → Security → App-Specific Passwords)
- Notion integration token + database ID

### 2. Environment

```bash
cp .env.example server/.env
# Edit server/.env with your credentials
```

### 3. Run

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open http://localhost:5173

## First-time setup

1. Go to **Setup** tab
2. Set Notion Database ID + date property name
3. Add category → Apple Calendar mappings
4. Adjust day partition times if needed
5. Save

## Daily flow

1. **Dashboard** → pick date → Generate Plan
2. **Proposals** → drag events, toggle accept/reject
3. **Confirm** → review summary → Push to iCloud

## Notion page structure

See `parser-config.md` for what the parser expects.

## iCloud CalDAV notes

- Server: `caldav.icloud.com`
- Auth: Apple ID + app-specific password (not your main iCloud password)
- Reminders lists appear as VTODO calendars
