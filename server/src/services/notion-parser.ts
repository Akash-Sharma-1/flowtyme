import { Client } from '@notionhq/client';
import { BlockObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { format } from 'date-fns';

export interface NotionTask {
  title: string;
  category: string;
  partitionHint?: string;  // morning | afternoon | evening | night
  preferredStartTime?: string;  // HH:mm — explicit time from Col 3, if any
  checked: boolean;
}

export interface NotionChore {
  title: string;
  checked: boolean;
  partitionHint?: string;  // morning | afternoon | evening | night
  preferredStartTime?: string;  // HH:mm
}

export interface ParsedDailyPage {
  tasks: NotionTask[];
  chores: NotionChore[];
  partitionAssignments: Record<string, PartitionAssignmentEntry[]>;
}

function getClient() {
  return new Client({ auth: process.env.NOTION_TOKEN });
}

export async function fetchTodayPage(
  databaseId: string,
  dateProperty: string,
  dateStr?: string
): Promise<ParsedDailyPage> {
  const today = dateStr || format(new Date(), 'yyyy-MM-dd');

  const response = await getClient().databases.query({
    database_id: databaseId,
    filter: {
      property: dateProperty,
      date: { equals: today },
    },
    page_size: 1,
  });

  if (response.results.length === 0) {
    throw new Error(`No Notion daily page found for ${today}`);
  }

  const page = response.results[0] as PageObjectResponse;
  return parseDailyPage(page.id);
}

async function parseDailyPage(pageId: string): Promise<ParsedDailyPage> {
  const blocks = await fetchAllBlocks(pageId);

  // top-level should contain a column_list block
  const columnList = blocks.find((b) => b.type === 'column_list');

  if (!columnList || columnList.type !== 'column_list') {
    // fallback: try to parse flat structure
    return parseFlatBlocks(blocks);
  }

  const columnChildren = await fetchAllBlocks(columnList.id);

  const col1 = columnChildren[0];
  const col2 = columnChildren[1];
  const col3 = columnChildren[2];

  const [col1Blocks, col2Blocks, col3Blocks] = await Promise.all([
    col1 ? fetchAllBlocksDeep(col1.id) : Promise.resolve([]),
    col2 ? fetchAllBlocksDeep(col2.id) : Promise.resolve([]),
    col3 ? fetchAllBlocksDeep(col3.id) : Promise.resolve([]),
  ]);

  const tasks = parseTasksFromColumn(col1Blocks);
  const chores = parseChoresFromColumn(col2Blocks);
  const partitionAssignments = parsePartitionsFromColumn(col3Blocks);

  applyPartitionHints(tasks, chores, partitionAssignments);

  return { tasks, chores, partitionAssignments };
}

/** Match Col 3 scheduling lines to tasks/chores (fuzzy) and attach hints + optional start time. */
export function applyPartitionHints(
  tasks: NotionTask[],
  chores: NotionChore[],
  partitionAssignments: Record<string, Array<{ title: string; preferredStartTime?: string }>>
): void {
  for (const [partition, entries] of Object.entries(partitionAssignments)) {
    for (const entry of entries) {
      const task = tasks.find((t) => titlesMatch(t.title, entry.title));
      if (task) {
        task.partitionHint = partition;
        if (entry.preferredStartTime) task.preferredStartTime = entry.preferredStartTime;
        continue;
      }
      const chore = chores.find((c) => titlesMatch(c.title, entry.title));
      if (chore) {
        chore.partitionHint = partition;
        if (entry.preferredStartTime) chore.preferredStartTime = entry.preferredStartTime;
      }
    }
  }
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function titlesMatch(a: string, b: string): boolean {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
}

function parseTasksFromColumn(blocks: BlockObjectResponse[]): NotionTask[] {
  const tasks: NotionTask[] = [];
  let currentCategory = 'General';

  for (const block of blocks) {
    const text = extractPlainText(block);
    if (!text.trim()) continue;

    if (block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3') {
      currentCategory = text.trim();
      continue;
    }

    if (
      block.type === 'bulleted_list_item' ||
      block.type === 'numbered_list_item' ||
      block.type === 'to_do'
    ) {
      const checked = block.type === 'to_do' ? (block as any).to_do?.checked === true : false;
      if (!checked) {
        tasks.push({ title: text.trim(), category: currentCategory, checked });
      }
    }
  }

  return tasks;
}

function parseChoresFromColumn(blocks: BlockObjectResponse[]): NotionChore[] {
  const chores: NotionChore[] = [];

  for (const block of blocks) {
    const text = extractPlainText(block);
    if (!text.trim()) continue;

    if (block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3') {
      continue;
    }

    if (
      block.type === 'bulleted_list_item' ||
      block.type === 'numbered_list_item' ||
      block.type === 'to_do'
    ) {
      const checked = block.type === 'to_do' ? (block as any).to_do?.checked === true : false;
      if (!checked) {
        chores.push({ title: text.trim(), checked });
      }
    }
  }

  return chores;
}

const PARTITION_KEYWORDS: Array<[string, string]> = [
  ['morning', 'morning'],
  ['afternoon', 'afternoon'],
  ['evening', 'evening'],
  ['night', 'night'],
];

export function partitionIdFromHeading(text: string): string | null {
  const lower = text.trim().toLowerCase();
  if (!lower) return null;
  for (const [keyword, id] of PARTITION_KEYWORDS) {
    if (lower.includes(keyword)) return id;
  }
  // Parse start time from "Part N : Xam to Ypm" style headings.
  // 'am'/'pm' keyword fallback above mis-maps multi-meridiem ranges, so we
  // extract the first explicit time value and map by time-of-day thresholds.
  const timeMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (timeMatch) {
    const h = parseHour(Number(timeMatch[1]), timeMatch[3]);
    const m = Number(timeMatch[2] ?? 0);
    const totalMins = h * 60 + m;
    if (totalMins < 9 * 60) return 'morning';
    if (totalMins < 17 * 60 + 30) return 'afternoon';
    if (totalMins < 21 * 60) return 'evening';
    return 'night';
  }
  return null;
}

export interface PartitionAssignmentEntry {
  title: string;
  preferredStartTime?: string;
}

/** Parse explicit time from Col 3 line, e.g. "Standup 9:30am", "Trees study at 14:00". */
export function parseSchedulingLine(rawText: string): PartitionAssignmentEntry {
  const timePatterns: Array<{ re: RegExp; pick: (m: RegExpMatchArray) => string }> = [
    {
      re: /\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/i,
      pick: (m) => toHHmm(parseHour(Number(m[1]), m[3]), Number(m[2])),
    },
    {
      re: /\b(?:at\s+)?(\d{1,2})\s*(am|pm)\b/i,
      pick: (m) => toHHmm(parseHour(Number(m[1]), m[2]), 0),
    },
  ];

  for (const { re, pick } of timePatterns) {
    const match = rawText.match(re);
    if (match) {
      const title = rawText.replace(match[0], '').replace(/\s+/g, ' ').trim();
      return { title: title || rawText.trim(), preferredStartTime: pick(match) };
    }
  }

  return { title: rawText.trim() };
}

function parseHour(hour: number, ampm?: string): number {
  if (!ampm) return hour;
  const mer = ampm.toLowerCase();
  if (mer === 'am') return hour === 12 ? 0 : hour;
  return hour === 12 ? 12 : hour + 12;
}

function toHHmm(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parsePartitionsFromColumn(
  blocks: BlockObjectResponse[]
): Record<string, PartitionAssignmentEntry[]> {
  const assignments: Record<string, PartitionAssignmentEntry[]> = {};
  let currentPartition: string | null = null;

  for (const block of blocks) {
    const rawText = extractPlainText(block).trim();
    if (!rawText) continue;

    const isHeading =
      block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3';
    const isPartitionHeader =
      isHeading || (block.type === 'paragraph' && partitionIdFromHeading(rawText) !== null);

    if (isPartitionHeader) {
      const partition = partitionIdFromHeading(rawText);
      if (partition) {
        currentPartition = partition;
        if (!assignments[currentPartition]) assignments[currentPartition] = [];
      }
      continue;
    }

    if (
      currentPartition &&
      (block.type === 'bulleted_list_item' ||
        block.type === 'numbered_list_item' ||
        block.type === 'to_do' ||
        block.type === 'paragraph')
    ) {
      const entry = parseSchedulingLine(rawText);
      if (entry.title) assignments[currentPartition].push(entry);
    }
  }

  return assignments;
}

function parseFlatBlocks(blocks: BlockObjectResponse[]): ParsedDailyPage {
  // no column layout — best-effort parse everything as tasks
  return {
    tasks: parseTasksFromColumn(blocks),
    chores: [],
    partitionAssignments: {},
  };
}

async function fetchAllBlocks(blockId: string): Promise<BlockObjectResponse[]> {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const resp = await getClient().blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...(resp.results as BlockObjectResponse[]));
    cursor = resp.next_cursor ?? undefined;
  } while (cursor);

  return blocks;
}

/** Flatten nested blocks (e.g. toggles) so Col 3 items inside toggles are parsed. */
async function fetchAllBlocksDeep(blockId: string): Promise<BlockObjectResponse[]> {
  const top = await fetchAllBlocks(blockId);
  const out: BlockObjectResponse[] = [];

  for (const block of top) {
    out.push(block);
    if (block.has_children && block.type !== 'child_page' && block.type !== 'child_database') {
      out.push(...(await fetchAllBlocksDeep(block.id)));
    }
  }

  return out;
}

function extractPlainText(block: BlockObjectResponse): string {
  const type = block.type as string;
  const content = (block as any)[type];
  if (!content?.rich_text) return '';
  return content.rich_text.map((rt: any) => rt.plain_text).join('');
}
