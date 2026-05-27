import { ISourcePlugin, SourceItem } from '../interfaces';
import { fetchTodayPage } from '../../services/notion-parser';

export interface NotionSourceConfig {
  databaseId: string;
  dateProperty: string;
}

/**
 * NotionSourcePlugin — wraps the existing notion-parser service.
 * Flattens the two-array output (tasks + chores) into a unified SourceItem[].
 * notion-parser.ts is NOT modified — this is a thin adapter.
 */
export class NotionSourcePlugin implements ISourcePlugin {
  readonly name = 'notion';
  private config: NotionSourceConfig;

  constructor(config: NotionSourceConfig) {
    this.config = config;
  }

  async fetchItems(dateStr?: string): Promise<SourceItem[]> {
    const parsed = await fetchTodayPage(
      this.config.databaseId,
      this.config.dateProperty,
      dateStr
    );

    const taskItems: SourceItem[] = parsed.tasks.map((t) => ({
      type: 'task' as const,
      title: t.title,
      category: t.category,
      partitionHint: t.partitionHint,
      preferredStartTime: t.preferredStartTime,
    }));

    const choreItems: SourceItem[] = parsed.chores.map((c) => ({
      type: 'chore' as const,
      title: c.title,
      category: '',
      partitionHint: c.partitionHint,
      preferredStartTime: c.preferredStartTime,
    }));

    return [...taskItems, ...choreItems];
  }
}
