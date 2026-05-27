import { ICalendarPlugin, CalendarEvent, PushEventParams, PushReminderParams, CalendarMeta } from '../interfaces';
import * as caldav from '../../services/caldav';

/**
 * ICloudCalendarPlugin — wraps the existing caldav service.
 * caldav.ts is NOT modified — this is a pure delegation adapter.
 * Credentials come from ICLOUD_USERNAME + ICLOUD_APP_PASSWORD env vars.
 */
export class ICloudCalendarPlugin implements ICalendarPlugin {
  readonly name = 'icloud';

  fetchEvents(dateStr?: string): Promise<CalendarEvent[]> {
    return caldav.fetchTodayEvents(dateStr);
  }

  pushEvent(params: PushEventParams): Promise<void> {
    return caldav.pushEvent(params);
  }

  pushReminder(params: PushReminderParams): Promise<void> {
    return caldav.pushReminder(params);
  }

  listCalendars(): Promise<CalendarMeta[]> {
    return caldav.listCalendars();
  }
}
