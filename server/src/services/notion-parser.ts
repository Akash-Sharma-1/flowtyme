import { Client } from '@notionhq/client';
import { BlockObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { format } from 'date-fns';

export interface NotionTask {
  title: string;
  category: string;
  partitionHint?: string;  // morning | afternoon | evening | night
  checked: boolean;
}

export interface NotionChore {
  title: string;
  checked: boolean;
}

export interface ParsedDailyPage {
  tasks: NotionTask[];
  chores: NotionChore[];
  partitionAssignments: Record<string, string[]>;  // partition → task titles pre-assigned
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function fetchTodayPage(
  databaseId: string,
  dateProperty: string,
  dateStr?: string
): Promise<ParsedDailyPage> {
  const today = dateStr || format(new Date(), 'yyyy-MM-dd');

  const response = await notion.databases.query({
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
    col1 ? fetchAllBlocks(col1.id) : Promise.resolve([]),
    col2 ? fetchAllBlocks(col2.id) : Promise.resolve([]),
    col3 ? fetchAllBlocks(col3.id) : Promise.resolve([]),
  ]);

  const tasks = parseTasksFromColumn(col1Blocks);
  const chores = parseChoresFromColumn(col2Blocks);
  const partitionAssignments = parsePartitionsFromColumn(col3Blocks);

  // annotate tasks with partition hints
  for (const [partition, titles] of Object.entries(partitionAssignments)) {
    for (const title of titles) {
      const task = tasks.find((t) => t.title.toLowerCase() === title.toLowerCase());
      if (task) task.partitionHint = partition;
    }
  }

  return { tasks, chores, partitionAssignments };
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

const PARTITION_KEYWORDS: Record<string, string> = {
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
  night: 'night',
  am: 'morning',
  pm: 'afternoon',
};

function parsePartitionsFromColumn(blocks: BlockObjectResponse[]): Record<string, string[]> {
  const assignments: Record<string, string[]> = {};
  let currentPartition: string | null = null;

  for (const block of blocks) {
    const text = extractPlainText(block).trim().toLowerCase();
    if (!text) continue;

    if (block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3') {
      const matched = Object.entries(PARTITION_KEYWORDS).find(([k]) => text.includes(k));
      if (matched) {
        currentPartition = matched[1];
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
      const rawText = extractPlainText(block).trim();
      if (rawText) assignments[currentPartition].push(rawText);
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
    const resp = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...(resp.results as BlockObjectResponse[]));
    cursor = resp.next_cursor ?? undefined;
  } while (cursor);

  return blocks;
}

function extractPlainText(block: BlockObjectResponse): string {
  const type = block.type as string;
  const content = (block as any)[type];
  if (!content?.rich_text) return '';
  return content.rich_text.map((rt: any) => rt.plain_text).join('');
}
