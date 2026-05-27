import { addMinutes, parseISO, startOfDay, setHours, setMinutes } from 'date-fns';
import { CalendarEvent } from './caldav';
import { NotionTask, NotionChore } from './notion-parser';
import { getConfig, getDurationForCategory, mapCategoryToCalendar } from './category-mapper';
import { IProposalItem } from '../models/Proposal';

interface TimeSlot {
  start: Date;
  end: Date;
}

interface SlotFinderInput {
  tasks: NotionTask[];
  chores: NotionChore[];
  existingEvents: CalendarEvent[];
  dateStr?: string;
}

const PARTITION_ORDER = ['morning', 'afternoon', 'evening', 'night'];

export async function findSlots(input: SlotFinderInput): Promise<IProposalItem[]> {
  const config = await getConfig();
  const date = input.dateStr ? parseISO(input.dateStr) : new Date();
  const proposals: IProposalItem[] = [];

  const busySlots: TimeSlot[] = input.existingEvents
    .filter((e) => !e.isAllDay)
    .map((e) => ({ start: e.startTime, end: e.endTime }));

  const partitionMap = buildPartitionMap(config.partitions, date);

  const sortedTasks = sortByPartitionHints(input.tasks);
  for (const task of sortedTasks) {
    const durationMins = await getDurationForCategory(task.category, false);
    const calendarName = await mapCategoryToCalendar(task.category);
    const item = scheduleItem({
      title: task.title,
      type: 'task',
      category: task.category,
      calendarName,
      source: 'notion',
      durationMins,
      partitionHint: task.partitionHint,
      preferredStartTime: task.preferredStartTime,
      partitionMap,
      busySlots,
      date,
      idPrefix: 'task',
    });
    proposals.push(item);
    if (!item.hasConflict) {
      busySlots.push({ start: parseISO(item.startTime), end: parseISO(item.endTime) });
    }
  }

  const sortedChores = sortByPartitionHints(input.chores);
  for (const chore of sortedChores) {
    const durationMins = config.defaultChoreDurationMinutes;
    const item = scheduleItem({
      title: chore.title,
      type: 'chore',
      category: 'Chores',
      calendarName: 'Reminders',
      source: 'reminders',
      durationMins,
      partitionHint: chore.partitionHint,
      preferredStartTime: chore.preferredStartTime,
      partitionMap,
      busySlots,
      date,
      idPrefix: 'chore',
    });
    proposals.push(item);
    if (!item.hasConflict) {
      busySlots.push({ start: parseISO(item.startTime), end: parseISO(item.endTime) });
    }
  }

  // detect overlap conflicts between proposals
  for (let i = 0; i < proposals.length; i++) {
    for (let j = i + 1; j < proposals.length; j++) {
      const a = proposals[i];
      const b = proposals[j];
      if (slotsOverlap(parseISO(a.startTime), parseISO(a.endTime), parseISO(b.startTime), parseISO(b.endTime))) {
        proposals[i].hasConflict = true;
        proposals[j].hasConflict = true;
        proposals[i].conflictWith = b.id;
        proposals[j].conflictWith = a.id;
        proposals[i].accepted = false;
        proposals[j].accepted = false;
      }
    }
  }

  return proposals;
}

interface ScheduleItemInput {
  title: string;
  type: 'task' | 'chore';
  category: string;
  calendarName: string;
  source: 'notion' | 'reminders';
  durationMins: number;
  partitionHint?: string;
  preferredStartTime?: string;
  partitionMap: Record<string, TimeSlot>;
  busySlots: TimeSlot[];
  date: Date;
  idPrefix: string;
}

function scheduleItem(input: ScheduleItemInput): IProposalItem {
  const searchWindow = resolvePartitionWindow(input.partitionHint, input.partitionMap);
  const slot = findFreeSlot(
    input.busySlots,
    input.durationMins,
    input.date,
    searchWindow,
    input.preferredStartTime
  );

  let hasConflict = false;
  let assignedSlot: TimeSlot;

  if (slot) {
    assignedSlot = slot;
  } else if (searchWindow) {
    // Partition hinted but window full — anchor inside window, mark conflict
    hasConflict = true;
    assignedSlot = getPartitionAnchoredSlot(
      searchWindow,
      input.durationMins,
      input.date,
      input.preferredStartTime
    );
  } else {
    hasConflict = slot === null;
    assignedSlot = getFallbackSlot(input.busySlots, input.durationMins, input.date);
  }

  return {
    id: `${input.idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: input.title,
    type: input.type,
    category: input.category,
    startTime: assignedSlot.start.toISOString(),
    endTime: assignedSlot.end.toISOString(),
    calendarName: input.calendarName,
    accepted: !hasConflict,
    hasConflict,
    source: input.source,
  };
}

function sortByPartitionHints<T extends { partitionHint?: string; preferredStartTime?: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const pa = partitionSortKey(a.partitionHint);
    const pb = partitionSortKey(b.partitionHint);
    if (pa !== pb) return pa - pb;
    if (a.preferredStartTime && b.preferredStartTime) {
      return a.preferredStartTime.localeCompare(b.preferredStartTime);
    }
    if (a.preferredStartTime) return -1;
    if (b.preferredStartTime) return 1;
    return 0;
  });
}

function partitionSortKey(hint?: string): number {
  if (!hint) return PARTITION_ORDER.length;
  const idx = PARTITION_ORDER.indexOf(hint.toLowerCase());
  return idx === -1 ? PARTITION_ORDER.length - 1 : idx;
}

function buildPartitionMap(
  partitions: Array<{ name: string; startTime: string; endTime: string }>,
  date: Date
): Record<string, TimeSlot> {
  const map: Record<string, TimeSlot> = {};
  for (const p of partitions) {
    const [sh, sm] = p.startTime.split(':').map(Number);
    const [eh, em] = p.endTime.split(':').map(Number);
    const slot: TimeSlot = {
      start: setMinutes(setHours(startOfDay(date), sh), sm),
      end: setMinutes(setHours(startOfDay(date), eh), em),
    };
    map[p.name.toLowerCase()] = slot;
  }
  return map;
}

function resolvePartitionWindow(
  hint: string | undefined,
  partitionMap: Record<string, TimeSlot>
): TimeSlot | undefined {
  if (!hint) return undefined;
  return partitionMap[hint.toLowerCase()];
}

function findFreeSlot(
  busy: TimeSlot[],
  durationMins: number,
  date: Date,
  window?: TimeSlot,
  preferredHHmm?: string
): TimeSlot | null {
  const dayStart = window?.start || setHours(startOfDay(date), 7);
  const dayEnd = window?.end || setHours(startOfDay(date), 22);

  const STEP = 15;
  let cursor = dayStart;

  if (preferredHHmm) {
    const preferred = hhmmOnDate(preferredHHmm, date);
    if (preferred >= dayStart && preferred < dayEnd) {
      cursor = preferred;
    }
  }

  while (addMinutes(cursor, durationMins) <= dayEnd) {
    const slotEnd = addMinutes(cursor, durationMins);
    const overlaps = busy.some((b) => slotsOverlap(cursor, slotEnd, b.start, b.end));

    if (!overlaps) {
      return { start: cursor, end: slotEnd };
    }

    cursor = addMinutes(cursor, STEP);
  }

  return null;
}

function getPartitionAnchoredSlot(
  window: TimeSlot,
  durationMins: number,
  date: Date,
  preferredHHmm?: string
): TimeSlot {
  let start = window.start;
  if (preferredHHmm) {
    const preferred = hhmmOnDate(preferredHHmm, date);
    if (preferred >= window.start && addMinutes(preferred, durationMins) <= window.end) {
      start = preferred;
    }
  }
  return { start, end: addMinutes(start, durationMins) };
}

function getFallbackSlot(busy: TimeSlot[], durationMins: number, date: Date): TimeSlot {
  const sorted = [...busy].sort((a, b) => b.end.getTime() - a.end.getTime());
  const lastEnd = sorted[0]?.end || setHours(startOfDay(date), 18);
  return { start: lastEnd, end: addMinutes(lastEnd, durationMins) };
}

function hhmmOnDate(hhmm: string, date: Date): Date {
  const [h, m] = hhmm.split(':').map(Number);
  return setMinutes(setHours(startOfDay(date), h), m);
}

function slotsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}
