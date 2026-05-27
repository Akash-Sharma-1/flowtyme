import type { ProposalItem, CalendarEvent, AppConfig } from './types';

const TTL = 30 * 60 * 1000; // 30 min — covers one planning session

interface Entry {
  proposalId: string;
  items: ProposalItem[];
  existingEvents: CalendarEvent[];
  config: AppConfig;
  ts: number;
}

function cacheKey(date: string) {
  return `flowtyme-proposals-${date}`;
}

export function getProposalCache(date: string): Omit<Entry, 'ts'> | null {
  try {
    const raw = localStorage.getItem(cacheKey(date));
    if (!raw) return null;
    const entry: Entry = JSON.parse(raw);
    if (Date.now() - entry.ts > TTL) {
      localStorage.removeItem(cacheKey(date));
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ts: _, ...rest } = entry;
    return rest;
  } catch {
    return null;
  }
}

export function setProposalCache(date: string, data: Omit<Entry, 'ts'>): void {
  try {
    localStorage.setItem(cacheKey(date), JSON.stringify({ ...data, ts: Date.now() }));
  } catch {}
}

export function updateCachedItems(date: string, items: ProposalItem[]): void {
  try {
    const raw = localStorage.getItem(cacheKey(date));
    if (!raw) return;
    const entry: Entry = JSON.parse(raw);
    localStorage.setItem(cacheKey(date), JSON.stringify({ ...entry, items }));
  } catch {}
}

export function clearProposalCache(date: string): void {
  localStorage.removeItem(cacheKey(date));
}
