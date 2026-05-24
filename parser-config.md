# FlowTyme Parser Config

Fill this in before first run. The Notion parser reads these values
from the database (or use the Setup UI to set them).

## Notion Database

- **Database ID**: 365201f2eb5f800dac1e000c4f883260
- **Date property name**: `Date`

## Column 1 — Categories & Tasks

- How are category headers formatted?
  - [ ] `## Health` style heading
  - [ ] `### Health` style heading
  - [ ] Bold text paragraph
- Are tasks:
  - [ ] Checkboxes (to_do blocks) — only unchecked get imported
  - [ ] Bullet points (bulleted_list_item)
  - [ ] Numbered list (numbered_list_item)

> Parser will skip any checked items (already done) automatically.

## Column 2 — Chores

- Are chores checkboxes or bullet points? (same options as above)
- Estimated duration per chore: **15 minutes** (change in Setup UI)

## Column 3 — Day Partitions

List the heading names used in your Notion page and the time range each covers.
Parser matches these case-insensitively:

| Partition | Heading text in Notion | Start | End   |
|-----------|------------------------|-------|-------|
| morning   | e.g. `Morning`         | 06:00 | 12:00 |
| afternoon | e.g. `Afternoon`       | 12:00 | 17:00 |
| evening   | e.g. `Evening`         | 17:00 | 20:00 |
| night     | e.g. `Night`           | 20:00 | 23:00 |

Update times in Setup → Day partitions.

Items in Column 3 that match existing Apple Calendar events by name are
**ignored** (the calendar event is used as the busy slot instead).

## Category → Apple Calendar Mapping

Fill in the Setup UI (`/setup`). Example:

| Notion category  | Apple Calendar name |
|------------------|---------------------|
| Office Work      | Work                |
| Health           | Health              |
| Interview Prep   | Personal            |
| Side Hustle      | Side Hustle         |

## Default Durations

- Task: **60 min** (override per category in Setup)
- Chore: **15 min**

## iCloud Credentials

Set in `.env` (never commit):

```
ICLOUD_USERNAME=your-apple-id@icloud.com
ICLOUD_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

Generate app-specific password at: appleid.apple.com → Security → App-Specific Passwords
