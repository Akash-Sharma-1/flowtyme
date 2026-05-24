---
name: flowtyme-dev
description: Runs FlowTyme locally and exercises core endpoints. Use when the user asks to start dev servers, check MongoDB, test the Notion parser, generate a day plan, or debug /api/health, /api/notion/parse, or /api/slots/generate.
disable-model-invocation: true
---

# FlowTyme dev workflows

## Start dev servers (MongoDB + server + client)

1. Check MongoDB:
```bash
pgrep -x mongod > /dev/null && echo "MongoDB running" || echo "MongoDB NOT running — start with: brew services start mongodb-community"
```

2. Check `server/.env` exists:
```bash
test -f server/.env && echo ".env found" || echo "MISSING server/.env — copy from .env.example and fill credentials"
```

3. Start backend and verify health:
```bash
cd server && npm run dev &
sleep 3
curl -s http://localhost:3001/api/health
```

4. Start frontend:
```bash
cd client && npm run dev
```

## Test Notion parser (today)

1. Ensure server is running:
```bash
curl -s http://localhost:3001/api/health
```

2. Parse:
```bash
curl -s "http://localhost:3001/api/notion/parse" | python3 -m json.tool
```

If it errors, check `NOTION_TOKEN`, `NOTION_DATABASE_ID`, and the date property name (`Date`) in `server/.env`.

## Generate plan (full pipeline, today)

1. Ensure server is running:
```bash
curl -s http://localhost:3001/api/health
```

2. Run:
```bash
curl -s -X POST http://localhost:3001/api/slots/generate \
  -H "Content-Type: application/json" \
  -d "{}" | python3 -m json.tool
```

When reviewing output: count proposed tasks/chores, and list items with `hasConflict: true` plus their overlap.

