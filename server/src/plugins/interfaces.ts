// ─── Shared canonical types ──────────────────────────────────────────────────

/** A schedulable item produced by any source plugin. */
export interface SourceItem {
  title: string;
  /** 'task' → calendar event; 'chore' → VTODO/Reminder */
  type: 'task' | 'chore';
  /** Source-native category label e.g. "Health", "Office Work". Empty string for chores. */
  category: string;
  /** Partition keyword hint: morning | afternoon | evening | night */
  partitionHint?: string;
  /** Explicit preferred start time as HH:mm (e.g. "09:30") */
  preferredStartTime?: string;
}

/** A calendar/reminder event fetched from a backend. */
export interface CalendarEvent {
  uid: string;
  title: string;
  startTime: Date;
  endTime: Date;
  calendarName: string;
  calendarColor?: string;
  isAllDay: boolean;
}

/** Parameters for pushing a timed calendar event. */
export interface PushEventParams {
  title: string;
  startTime: Date;
  endTime: Date;
  calendarName: string;
  description?: string;
}

/** Parameters for pushing a reminder/VTODO. */
export interface PushReminderParams {
  title: string;
  dueTime: Date;
  listName: string;
}

/** Metadata about a calendar or reminder list available on a backend. */
export interface CalendarMeta {
  name: string;
  type: 'calendar' | 'reminders';
}

// ─── Plugin contracts ─────────────────────────────────────────────────────────

/**
 * ISourcePlugin — Layer 1.
 * Reads a data source (Notion, Obsidian, plain text, etc.) and returns
 * canonical SourceItems for a specific date.
 *
 * The plugin receives its own config subtree from plugins.yaml via its constructor.
 * Secrets (API tokens, passwords) must come from environment variables — never plugins.yaml.
 */
export interface ISourcePlugin {
  /** Human-readable name for logging / error messages. */
  readonly name: string;

  /**
   * Fetch all schedulable items for the given date (YYYY-MM-DD).
   * If dateStr is omitted, defaults to today.
   */
  fetchItems(dateStr?: string): Promise<SourceItem[]>;
}

/**
 * ICalendarPlugin — Layer 2.
 * Reads and writes calendar/reminder events to a calendar backend.
 *
 * Credentials must come from environment variables — never plugins.yaml.
 */
export interface ICalendarPlugin {
  /** Human-readable name for logging / error messages. */
  readonly name: string;

  /** Fetch all timed events for the given date (YYYY-MM-DD). */
  fetchEvents(dateStr?: string): Promise<CalendarEvent[]>;

  /** Push a timed calendar event. */
  pushEvent(params: PushEventParams): Promise<void>;

  /** Push a reminder/VTODO item. */
  pushReminder(params: PushReminderParams): Promise<void>;

  /** List all calendars + reminder lists available on this backend. */
  listCalendars(): Promise<CalendarMeta[]>;
}
