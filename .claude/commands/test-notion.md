# /test-notion — Test Notion parser against today's page

Hits the Notion API directly and prints what the parser sees: tasks by category, chores, and partition assignments.

## Steps

1. Check server is running:
```bash
curl -s http://localhost:3001/api/health
```
If not running, tell user to run `/run` first.

2. Call the parse endpoint for today:
```bash
curl -s "http://localhost:3001/api/notion/parse" | python3 -m json.tool
```

3. Display results clearly:
- List tasks grouped by category
- List chores
- Show partition assignments (Col 3 hints)
- Flag any tasks with partitionHint set

4. If error, check:
- Is NOTION_TOKEN set in server/.env?
- Is NOTION_DATABASE_ID correct? (should be 365201f2eb5f800dac1e000c4f883260)
- Does today's date have a page in the database?
- Is the date property named exactly `Date`?

Show the raw error from the API response to help debug.
