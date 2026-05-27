# /generate-parser — Generate a source plugin from a data source description

Reads the user's data source structure description and sample data, then generates
a complete `ISourcePlugin` TypeScript implementation that compiles and runs without
further manual edits.

## Trigger

User wants to add a new data source (e.g. Obsidian, plain markdown, a JSON/CSV export,
a custom API) and says something like:
- "add Obsidian as a source"
- "generate a parser for my markdown task file"
- "I want to import from Airtable"

## What to collect from the user

1. **Source description** — answer these questions (user can paste a config.md or describe inline):
   - What format is the data in? (Notion blocks, markdown file, CSV, JSON API, etc.)
   - What constitutes a "task" vs a "chore"?
   - How are categories/labels represented?
   - How is the date for a given day's items identified?
   - Are there scheduling hints (partition name or time hints)?

2. **Sample raw data** — paste raw content or provide a file path so Claude can infer field names.

## What to generate

Produce a single TypeScript file at:
```
server/src/plugins/sources/<source-name>-source.ts
```

The file must:
- Import `ISourcePlugin`, `SourceItem` from `../interfaces`
- Export a typed `<SourceName>SourceConfig` interface with all config fields
- Export a class `<SourceName>SourcePlugin implements ISourcePlugin`
- Accept a `config: <SourceName>SourceConfig` in the constructor
- Implement `fetchItems(dateStr?: string): Promise<SourceItem[]>`
- Map native "task" items → `type: 'task'` SourceItems with `category`, `partitionHint`, `preferredStartTime`
- Map native "chore/habit" items → `type: 'chore'` SourceItems
- Handle errors gracefully (throw with a descriptive message)
- Use only existing dependencies from `server/package.json` (no new installs without asking)

## After generating the file

1. **Show the `plugins.yaml` stanza** to add under `sources:`:
```yaml
sources:
  - id: <source-name>
    type: <source-name>
    enabled: true
    config:
      # (plugin-specific fields)
```

2. **Show the switch-case line** to add in `server/src/plugins/registry.ts`
   inside the `instantiateSource()` function:
```typescript
case '<source-name>':
  return new <SourceName>SourcePlugin(entry.config as unknown as <SourceName>SourceConfig);
```

3. **Remind the user** to restart the dev server after editing `plugins.yaml`.

## Reference files

- `server/src/plugins/interfaces.ts` — the ISourcePlugin contract (read this first)
- `server/src/plugins/sources/notion-source.ts` — working example adapter
- `server/src/plugins/registry.ts` — where to add the switch-case
- `server/package.json` — available dependencies
