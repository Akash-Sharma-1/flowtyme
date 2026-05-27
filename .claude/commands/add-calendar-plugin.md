# /add-calendar-plugin — Generate a calendar backend plugin

Reads the user's target calendar description and generates a complete `ICalendarPlugin`
TypeScript implementation that compiles and runs without further manual edits.

## Trigger

User wants to add a new calendar backend and says something like:
- "add Google Calendar"
- "add Outlook / Microsoft 365"
- "generate a calendar plugin for .ics export"
- "add a new calendar backend"

## What to collect from the user

1. **Calendar backend** — which service?
   - Google Calendar (needs OAuth2 + Google Calendar API)
   - Outlook / Microsoft 365 (needs Microsoft Graph API + Azure app registration)
   - Local `.ics` file export (no auth, import manually)
   - Other — describe the API or protocol

2. **Auth / credentials** — what env vars will hold the secrets?
   - Never put credentials in `plugins.yaml` — env vars only
   - e.g. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

3. **Feature scope** — which operations are needed?
   - Read events only (fetchEvents)
   - Push events (pushEvent)
   - Push reminders/todos (pushReminder)
   - List calendars (listCalendars)

4. **Existing credentials** — does the user already have API keys / OAuth tokens, or
   do they need setup guidance first?

## What to generate

Produce a single TypeScript file at:
```
server/src/plugins/calendars/<backend-name>-calendar.ts
```

The file must:
- Import `ICalendarPlugin`, `CalendarEvent`, `PushEventParams`, `PushReminderParams`,
  `CalendarMeta` from `../interfaces`
- Export a typed `<BackendName>CalendarConfig` interface with non-secret config fields
- Export a class `<BackendName>CalendarPlugin implements ICalendarPlugin`
- Read secrets from `process.env.*` (never from config)
- Implement all four `ICalendarPlugin` methods:
  - `fetchEvents(dateStr?)` → `CalendarEvent[]`
  - `pushEvent(params)` → `void`
  - `pushReminder(params)` → `void`
  - `listCalendars()` → `CalendarMeta[]`
- Return empty arrays / no-ops for unimplemented methods with a `console.warn` explaining why
- Handle errors with descriptive messages
- Use only existing dependencies from `server/package.json` OR explicitly ask before adding new ones

## After generating the file

1. **Show the `plugins.yaml` stanza** to add under `calendars:`:
```yaml
calendars:
  - id: <backend-name>
    type: <backend-name>
    enabled: true
    config:
      # (non-secret config fields here)
    # secrets: read from env vars (BACKEND_CLIENT_ID etc.)
```

2. **Show the switch-case line** to add in `server/src/plugins/registry.ts`
   inside the `instantiateCalendar()` function:
```typescript
case '<backend-name>':
  return new <BackendName>CalendarPlugin(entry.config as unknown as <BackendName>CalendarConfig);
```

3. **Show required env vars** to add to `server/.env`:
```
BACKEND_CLIENT_ID=...
BACKEND_CLIENT_SECRET=...
```

4. **Auth setup guidance** (if needed):
   - Google: link to Google Cloud Console OAuth2 setup, explain refresh token flow
   - Outlook: link to Azure portal app registration, explain Graph API scopes
   - Remind user to restart the dev server after editing `plugins.yaml`

## Reference files

- `server/src/plugins/interfaces.ts` — the ICalendarPlugin contract (read this first)
- `server/src/plugins/calendars/icloud-calendar.ts` — working example adapter
- `server/src/plugins/registry.ts` — where to add the switch-case
- `server/package.json` — available dependencies
