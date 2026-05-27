# FlowTyme Parser Config

Fill this in before first run. The Notion parser reads these values
from the database (or use the Setup UI to set them).

## Notion Database

- **Database ID**: d2ef3b1dd85c4f2aa0536e7e865c874d
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

Col 3 is the scheduling hint column. Two things happen here:

**Partition headers** (heading blocks) — declare time windows for the day.
Parser matches heading text case-insensitively against known keywords:
`morning`/`am` → morning window | `afternoon`/`pm` → afternoon window
`evening` → evening window | `night` → night window

Any task listed under a partition heading gets a `partitionHint`. The slot
finder searches for a free slot *inside that window first*, falling back to
the next available time only if the window is fully busy.

| Partition | Keywords matched  | Default range | Configurable in |
|-----------|-------------------|---------------|-----------------|
| morning   | morning, am       | 06:00–12:00   | Setup UI        |
| afternoon | afternoon, pm     | 12:00–17:00   | Setup UI        |
| evening   | evening           | 17:00–20:00   | Setup UI        |
| night     | night             | 20:00–23:00   | Setup UI        |

**Pre-assigned items** — task titles under a partition heading are soft
scheduling hints. They do NOT create new events; they only guide slot
placement. If the title matches an existing Apple Calendar event by name,
it is silently skipped (avoids duplicates).

Example Col 3 layout in Notion:
```
### Morning
- flowtyme build

### Afternoon
- Trees study on GFG
- exercise core
- walking
```

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
