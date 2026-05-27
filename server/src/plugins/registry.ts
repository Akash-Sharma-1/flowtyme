import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ISourcePlugin, ICalendarPlugin, SourceItem } from './interfaces';
import { NotionSourcePlugin, NotionSourceConfig } from './sources/notion-source';
import { ICloudCalendarPlugin } from './calendars/icloud-calendar';

interface PluginEntry {
  id: string;
  type: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

interface PluginsYaml {
  sources?: PluginEntry[];
  calendars?: PluginEntry[];
}

function loadPluginsYaml(): PluginsYaml {
  // plugins.yaml lives at repo root; server runs from flowtyme/server
  const candidates = [
    path.resolve(__dirname, '../../../plugins.yaml'),  // dist: server/dist/plugins/
    path.resolve(__dirname, '../../../../plugins.yaml'), // ts-node: server/src/plugins/
    path.resolve(process.cwd(), '../plugins.yaml'),
    path.resolve(process.cwd(), 'plugins.yaml'),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return yaml.load(fs.readFileSync(p, 'utf8')) as PluginsYaml;
    }
  }

  throw new Error(
    `plugins.yaml not found. Searched:\n${candidates.join('\n')}\n` +
    'Create plugins.yaml at the repo root (next to the server/ and client/ directories).'
  );
}

function instantiateSource(entry: PluginEntry): ISourcePlugin {
  switch (entry.type) {
    case 'notion':
      return new NotionSourcePlugin(entry.config as unknown as NotionSourceConfig);
    // Add new source types here:
    // case 'obsidian':
    //   return new ObsidianSourcePlugin(entry.config as ObsidianSourceConfig);
    default:
      throw new Error(`Unknown source plugin type: "${entry.type}" (id: ${entry.id}). ` +
        'Add a case to instantiateSource() in server/src/plugins/registry.ts, ' +
        'or run /generate-parser to create the adapter.');
  }
}

function instantiateCalendar(entry: PluginEntry): ICalendarPlugin {
  switch (entry.type) {
    case 'icloud':
      return new ICloudCalendarPlugin();
    // Add new calendar types here:
    // case 'google':
    //   return new GoogleCalendarPlugin(entry.config as GoogleCalendarConfig);
    default:
      throw new Error(`Unknown calendar plugin type: "${entry.type}" (id: ${entry.id}). ` +
        'Add a case to instantiateCalendar() in server/src/plugins/registry.ts.');
  }
}

export class PluginRegistry {
  private sourcePlugins: ISourcePlugin[] = [];
  private calendarPlugins: ICalendarPlugin[] = [];
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;

    const doc = loadPluginsYaml();

    for (const entry of (doc.sources || []).filter((e) => e.enabled)) {
      this.sourcePlugins.push(instantiateSource(entry));
    }

    for (const entry of (doc.calendars || []).filter((e) => e.enabled)) {
      this.calendarPlugins.push(instantiateCalendar(entry));
    }

    if (this.sourcePlugins.length === 0) {
      console.warn('[PluginRegistry] No source plugins enabled in plugins.yaml');
    }
    if (this.calendarPlugins.length === 0) {
      console.warn('[PluginRegistry] No calendar plugins enabled in plugins.yaml');
    }

    this.loaded = true;
  }

  /**
   * Fetch items from all enabled source plugins and merge them.
   * Multiple sources are run in parallel; results are concatenated.
   * Future: add dedup by normalized title here.
   */
  async getSourceItems(dateStr?: string): Promise<SourceItem[]> {
    await this.load();
    const results = await Promise.all(
      this.sourcePlugins.map((p) => p.fetchItems(dateStr))
    );
    return results.flat();
  }

  /** Returns the first enabled calendar plugin (primary backend). */
  async getPrimaryCalendarPlugin(): Promise<ICalendarPlugin> {
    await this.load();
    if (this.calendarPlugins.length === 0) {
      throw new Error('No calendar plugin enabled in plugins.yaml');
    }
    return this.calendarPlugins[0];
  }

  /** Returns all enabled calendar plugins (for multi-target push). */
  async getAllCalendarPlugins(): Promise<ICalendarPlugin[]> {
    await this.load();
    return this.calendarPlugins;
  }

  /** Reset loaded state (useful for hot-reload on plugins.yaml change). */
  reset(): void {
    this.sourcePlugins = [];
    this.calendarPlugins = [];
    this.loaded = false;
  }
}

/** Singleton registry — import this in routes and services. */
export const pluginRegistry = new PluginRegistry();
