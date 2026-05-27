import ConfigModel from '../models/Config';
import { readConfigFile } from './config-file';

export async function mapCategoryToCalendar(sourceCategory: string): Promise<string> {
  const config = await ConfigModel.findOne();
  if (!config) return sourceCategory;

  const mapping = config.categoryMappings.find(
    (m) => m.sourceCategory.toLowerCase() === sourceCategory.toLowerCase()
  );

  return mapping?.calendarName || sourceCategory;
}

export async function getConfig() {
  let config = await ConfigModel.findOne();
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
