# /generate-day — Run full pipeline for today

Fetches Notion + iCloud calendar, computes slot proposals, saves to DB, prints summary.
Equivalent to clicking "Generate Plan" in the Dashboard UI.

## Steps

1. Check server health:
```bash
curl -s http://localhost:3001/api/health
```

2. Run the full pipeline for today:
```bash
curl -s -X POST http://localhost:3001/api/slots/generate \
  -H "Content-Type: application/json" \
  -d "{}" | python3 -m json.tool
```

3. Parse and display the result:
- Count of tasks proposed
- Count of chores proposed
- Count of conflicts (hasConflict: true)
- List any conflicts with their titles and overlapping times

4. Print the proposal ID — user needs it to push later:
```
Proposal ID: <id>
Open http://localhost:5173/proposals to review
```

If errors, diagnose: Notion parse failure vs CalDAV failure vs slot-finder failure.
The error field in the response says which service failed.
