import { createDAVClient, DAVCalendar, DAVObject } from 'tsdav';
import ICAL from 'ical.js';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';

export interface CalendarEvent {
  uid: string;
  title: string;
  startTime: Date;
  endTime: Date;
  calendarName: string;
  calendarColor?: string;
  isAllDay: boolean;
}

export interface ReminderItem {
  uid: string;
  title: string;
  dueDate?: Date;
  listName: string;
  completed: boolean;
}

function makeDAVClient() {
  return createDAVClient({
    serverUrl: 'https://caldav.icloud.com',
    credentials: {
      username: process.env.ICLOUD_USERNAME!,
      password: process.env.ICLOUD_APP_PASSWORD!,
    },
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
  });
}

export async function fetchTodayEvents(dateStr?: string): Promise<CalendarEvent[]> {
  const client = await makeDAVClient();
  const date = dateStr ? parseISO(dateStr) : new Date();
  const rangeStart = startOfDay(date);
  const rangeEnd = endOfDay(date);

  const calendars: DAVCalendar[] = await client.fetchCalendars();
  const events: CalendarEvent[] = [];

  for (const cal of calendars) {
    if (cal.components?.includes('VTODO')) continue;

    const calName = String(cal.displayName || 'Unknown');

    const objects: DAVObject[] = await client.fetchCalendarObjects({
      calendar: cal,
      timeRange: {
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
      },
    });

    for (const obj of objects) {
      if (!obj.data) continue;
      try {
        const parsed = new ICAL.Component(ICAL.parse(obj.data));
        const vevents = parsed.getAllSubcomponents('vevent');

        for (const vevent of vevents) {
          const ev = new ICAL.Event(vevent);
          events.push({
            uid: ev.uid,
            title: ev.summary,
            startTime: ev.startDate.toJSDate(),
            endTime: ev.endDate.toJSDate(),
            calendarName: calName,
            isAllDay: ev.startDate.isDate,
          });
        }
      } catch {
        // malformed iCal — skip
      }
    }
  }

  return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

export async function fetchTodayReminders(dateStr?: string): Promise<ReminderItem[]> {
  const client = await makeDAVClient();
  const date = dateStr ? parseISO(dateStr) : new Date();
  const todayStr = format(date, 'yyyy-MM-dd');

  const calendars: DAVCalendar[] = await client.fetchCalendars();
  const reminders: ReminderItem[] = [];

  for (const cal of calendars) {
    if (!cal.components?.includes('VTODO')) continue;

    const objects: DAVObject[] = await client.fetchCalendarObjects({
      calendar: cal,
    });

    for (const obj of objects) {
      if (!obj.data) continue;
      try {
        const parsed = new ICAL.Component(ICAL.parse(obj.data));
        const vtodos = parsed.getAllSubcomponents('vtodo');

        for (const vtodo of vtodos) {
          const status = vtodo.getFirstPropertyValue('status') as string;
          if (status === 'COMPLETED') continue;

          const due = vtodo.getFirstPropertyValue('due') as ICAL.Time | null;
          const dueDate = due ? due.toJSDate() : undefined;

          if (dueDate && format(dueDate, 'yyyy-MM-dd') !== todayStr) continue;

          reminders.push({
            uid: vtodo.getFirstPropertyValue('uid') as string,
            title: vtodo.getFirstPropertyValue('summary') as string,
            dueDate,
            listName: String(cal.displayName || 'Reminders'),
            completed: false,
          });
        }
      } catch {
        // malformed — skip
      }
    }
  }

  return reminders;
}

export async function pushEvent(params: {
  title: string;
  startTime: Date;
  endTime: Date;
  calendarName: string;
  description?: string;
}): Promise<void> {
  const client = await makeDAVClient();
  const calendars: DAVCalendar[] = await client.fetchCalendars();
  const target = calendars.find(
    (c) => c.displayName === params.calendarName && !c.components?.includes('VTODO')
  );

  if (!target) throw new Error(`Calendar "${params.calendarName}" not found`);

  const uid = `flowtyme-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = new Date();

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FlowTyme//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(params.startTime)}`,
    `DTEND:${formatICSDate(params.endTime)}`,
    `SUMMARY:${params.title}`,
    params.description ? `DESCRIPTION:${params.description}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  await client.createCalendarObject({
    calendar: target,
    filename: `${uid}.ics`,
    iCalString: icsData,
  });
}

export async function pushReminder(params: {
  title: string;
  dueTime: Date;
  listName: string;
}): Promise<void> {
  const client = await makeDAVClient();
  const calendars: DAVCalendar[] = await client.fetchCalendars();
  const target = calendars.find(
    (c) => c.displayName === params.listName && c.components?.includes('VTODO')
  );

  if (!target) throw new Error(`Reminders list "${params.listName}" not found`);

  const uid = `flowtyme-chore-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = new Date();

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FlowTyme//EN',
    'BEGIN:VTODO',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DUE:${formatICSDate(params.dueTime)}`,
    `SUMMARY:${params.title}`,
    'STATUS:NEEDS-ACTION',
    `VALARM:TRIGGER:-PT0M`,
    'END:VTODO',
    'END:VCALENDAR',
  ].join('\r\n');

  await client.createCalendarObject({
    calendar: target,
    filename: `${uid}.ics`,
    iCalString: icsData,
  });
}

export async function listCalendars(): Promise<{ name: string; type: 'calendar' | 'reminders' }[]> {
  const client = await makeDAVClient();
  const calendars = await client.fetchCalendars();
  return calendars.map((c) => ({
    name: String(c.displayName || 'Unknown'),
    type: c.components?.includes('VTODO') ? 'reminders' : 'calendar',
  }));
}

function formatICSDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
