# /map-categories — Auto-map source categories to calendar names

Reads the active source plugins' output categories and the available calendar backends,
then infers sensible category→calendar mappings and writes them to the app config.

## Trigger

User wants category mappings set up or updated:
- "map my categories"
- "set up category mappings"
- "auto-map categories to calendars"

## Steps

### 1. Fetch source categories

```bash
curl -s "http://localhost:3001/api/notion/parse" | python3 -m json.tool
```

Extract all unique `category` values from `.tasks[]`. These are the source-native labels.

### 2. Fetch available calendar names

```bash
curl -s "http://localhost:3001/api/calendar/list" | python3 -m json.tool
```

Extract all `name` values where `type === 'calendar'`. These are push targets.

### 3. Infer mappings

For each unique source category:
- Match by name similarity (case-insensitive substring or fuzzy match)
- Clear match (e.g. "Health" → "Health"): assign confidently ✓
- Ambiguous (e.g. "Office Work" could be "Work" or "Personal"): show options, ask user

Present a table for user confirmation:
```
Source category    Suggested calendar    Confidence
Health             Health                ✓ high
Office Work        Work                  ? (pick: Work / Personal / Other)
Interview Prep     Personal              ? (pick: Personal / Work / Other)
```

### 4. Write confirmed mappings

```bash
curl -s -X PUT http://localhost:3001/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "categoryMappings": [
      { "sourceCategory": "Health", "calendarName": "Health" },
      { "sourceCategory": "Office Work", "calendarName": "Work" }
    ]
  }'
```

Fields use `sourceCategory` + `calendarName` (plugin-agnostic names, not old Notion-specific names).

### 5. Confirm

Show the saved mappings and remind the user they can edit them anytime in the Setup UI
at `http://localhost:5173/setup`.

## When to use this skill

- After first setup when category mappings are empty
- After adding a new data source that introduces new category labels
- After creating new calendars in iCloud/Google/etc.
- After running `/generate-parser` for a new source plugin
