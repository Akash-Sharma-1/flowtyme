export interface CalendarEvent {
  uid: string;
  title: string;
  startTime: string;  // ISO
  endTime: string;    // ISO
  calendarName: string;
  isAllDay: boolean;
}

export interface ProposalItem {
  id: string;
  title: string;
  type: 'task' | 'chore';
  category: string;
  startTime: string;  // ISO
  endTime: string;    // ISO
  calendarName: string;
  accepted: boolean;
  hasConflict: boolean;
  conflictWith?: string;
  /** Plugin id or source identifier (e.g. 'notion', 'reminders'). */
  source: string;
}

export interface Proposal {
  _id: string;
  date: string;
  items: ProposalItem[];
  status: 'draft' | 'pushed';
}

export interface CategoryMapping {
  /** Source-native category label (e.g. "Health", "Office Work"). */
  sourceCategory: string;
  /** Target calendar name on the calendar backend. */
  calendarName: string;
  color?: string;
}

export interface Partition {
  name: string;
  startTime: string;
  endTime: string;
}

export interface AppConfig {
  categoryMappings: CategoryMapping[];
  partitions: Partition[];
  defaultTaskDurationMinutes: number;
  defaultChoreDurationMinutes: number;
  durationOverrides: { category: string; durationMinutes: number }[];
  // notionDatabaseId + notionDateProperty removed — configure in plugins.yaml
}
