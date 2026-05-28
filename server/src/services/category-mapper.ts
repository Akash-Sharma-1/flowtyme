import ConfigModel from '../models/Config';
import { readConfigFile } from './config-file';

export async function mapCategoryToCalendar(sourceCategory: string): Promise<string> {
  const config = await getConfig();

  const normalize = (s: string) =>
    s
      .normalize('NFC')
      // strip emoji + variation selectors + common unicode “invisible” marks
      .replace(/\p{Extended_Pictographic}/gu, '')
      .replace(/[︀-️\u{E0100}-\u{E01EF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const mapping = config.categoryMappings.find(
    (m) => normalize(m.sourceCategory) === normalize(sourceCategory)
  );

  console.log(config.categoryMappings);
  console.log(mapping);

  if (!mapping?.calendarName) {
    console.warn(`[category-mapper] No mapping for "${sourceCategory}". Available: ${config.categoryMappings.map(m => `"${m.sourceCategory}"`).join(', ')}`);
    return sourceCategory;
  }
  console.log(`[category-mapper] mapping for "${sourceCategory}". Available: ${mapping.calendarName}`);

  return mapping.calendarName;
}

export async function getConfig() {
  // Sort by updatedAt desc so the most recently saved config wins when duplicates exist
  let config = await ConfigModel.findOne().sort({ updatedAt: -1, _id: -1 });
  if (!config) {
    const fromFile = readConfigFile();
    config = await ConfigModel.create(fromFile || {
      categoryMappings: [],
      partitions: [
        { name: 'morning', startTime: '06:00', endTime: '12:00' },
        { name: 'afternoon', startTime: '12:00', endTime: '17:00' },
        { name: 'evening', startTime: '17:00', endTime: '20:00' },
        { name: 'night', startTime: '20:00', endTime: '23:00' },
      ],
      durationOverrides: [],
      defaultTaskDurationMinutes: 60,
      defaultChoreDurationMinutes: 15,
    });
  }
  return config;
}

export async function getDurationForCategory(category: string, isChore: boolean): Promise<number> {
  const config = await getConfig();
  if (isChore) return config.defaultChoreDurationMinutes;

  const override = config.durationOverrides.find(
    (d) => d.category.toLowerCase() === category.toLowerCase()
  );
  return override?.durationMinutes || config.defaultTaskDurationMinutes;
}
