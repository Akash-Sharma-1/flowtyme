import { addMinutes, parseISO, format, isWithinInterval, startOfDay, setHours, setMinutes } from 'date-fns';
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

export async function findSlots(input: SlotFinderInput): Promise<IProposalItem[]> {
  const config = await getConfig();
  const date = input.dateStr ? parseISO(input.dateStr) : new Date();
  const proposals: IProposalItem[] = [];

  const busySlots: TimeSlot[] = input.existingEvents
    .filter((e) => !e.isAllDay)
    .map((e) => ({ start: e.startTime, end: e.endTime }));

  const partitionMap = buildPartitionMap(config.partitions, date);

  // Process tasks — respect partition hints from Col 3
  for (const task of input.tasks) {
    const durationMins = await getDurationForCategory(task.category, false);
    const calendarName = await mapCategoryToCalendar(task.category);

    let searchWindow: TimeSlot | undefined;
    if (task.partitionHint && partitionMap[task.partitionHint]) {
      searchWindow = partitionMap[task.partitionHint];
    }

    const slot = findFreeSlot(busySlots, durationMins, date, searchWindow);
    const hasConflict = slot === null;
    const assignedSlot = slot || getFallbackSlot(busySlots, durationMins, date);

    const item: IProposalItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: task.title,
      type: 'task',
      category: task.category,
      startTime: assignedSlot.start.toISOString(),
      endTime: assignedSlot.end.toISOString(),
      calendarName,
      accepted: !hasConflict,
      hasConflict,
      source: 'notion',
    };

    proposals.push(item);

    if (!hasConflict) {
      busySlots.push(assignedSlot);
    }
  }

  // Process chores — fit into any available 15-min gap
  for (const chore of input.chores) {
    const durationMins = config.defaultChoreDurationMinutes;

    const slot = findFreeSlot(busySlots, durationMins, date, undefined);
    const hasConflict = slot === null;
    const assignedSlot = slot || getFallbackSlot(busySlots, durationMins, date);

    const item: IProposalItem = {
      id: `chore-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: chore.title,
      type: 'chore',
      category: 'Chores',
      startTime: assignedSlot.start.toISOString(),
      endTime: assignedSlot.end.toISOString(),
      calendarName: 'Reminders',
      accepted: !hasConflict,
      hasConflict,
      source: 'reminders',
    };

    proposals.push(item);

    if (!hasConflict) {
      busySlots.push(assignedSlot);
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

function buildPartitionMap(
  partitions: Array<{ name: string; startTime: string; endTime: string }>,
  date: Date
): Record<string, TimeSlot> {
  const map: Record<string, TimeSlot> = {};
  for (const p of partitions) {
    const [sh, sm] = p.startTime.split(':').map(Number);
    const [eh, em] = p.endTime.split(':').map(Number);
    map[p.name] = {
      start: setMinutes(setHours(startOfDay(date), sh), sm),
      end: setMinutes(setHours(startOfDay(date), eh), em),
    };
  }
  return map;
}

function findFreeSlot(
  busy: TimeSlot[],
  durationMins: number,
  date: Date,
  window?: TimeSlot
): TimeSlot | null {
  const dayStart = window?.start || setHours(startOfDay(date), 7);
  const dayEnd = window?.end || setHours(startOfDay(date), 22);

  const STEP = 15;
  let cursor = dayStart;

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

function getFallbackSlot(busy: TimeSlot[], durationMins: number, date: Date): TimeSlot {
  // put at end of day even if it conflicts — caller will mark hasConflict
  const sorted = [...busy].sort((a, b) => b.end.getTime() - a.end.getTime());
  const lastEnd = sorted[0]?.end || setHours(startOfDay(date), 18);
  return { start: lastEnd, end: addMinutes(lastEnd, durationMins) };
}

function slotsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}
