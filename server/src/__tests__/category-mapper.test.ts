import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ConfigModel from '../models/Config';
import { mapCategoryToCalendar } from '../services/category-mapper';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await ConfigModel.deleteMany({});
});

async function seedMappings(mappings: { sourceCategory: string; calendarName: string }[]) {
  await ConfigModel.create({
    categoryMappings: mappings,
    partitions: [],
    durationOverrides: [],
    defaultTaskDurationMinutes: 60,
    defaultChoreDurationMinutes: 15,
  });
}

describe('mapCategoryToCalendar', () => {
  it('maps exact emoji category to calendar name', async () => {
    await seedMappings([{ sourceCategory: '💵 Finances', calendarName: 'Side Hustle' }]);
    expect(await mapCategoryToCalendar('💵 Finances')).toBe('Side Hustle');
  });

  it('maps 🥗 Health to Fitness and Meals', async () => {
    await seedMappings([{ sourceCategory: '🥗 Health', calendarName: 'Fitness and Meals' }]);
    expect(await mapCategoryToCalendar('🥗 Health')).toBe('Fitness and Meals');
  });

  it('maps 😇 Personal Well Being and Personality to Reminders', async () => {
    await seedMappings([{ sourceCategory: '😇 Personal Well Being and Personality', calendarName: 'Reminders' }]);
    expect(await mapCategoryToCalendar('😇 Personal Well Being and Personality')).toBe('Reminders');
  });

  it('is case-insensitive', async () => {
    await seedMappings([{ sourceCategory: 'Office Work', calendarName: 'Office Work' }]);
    expect(await mapCategoryToCalendar('office work')).toBe('Office Work');
    expect(await mapCategoryToCalendar('OFFICE WORK')).toBe('Office Work');
  });

  it('strips variation selectors from emoji before comparing', async () => {
    // U+FE0F (variation selector-16) appended — Notion sometimes returns this
    const withVariationSelector = '🥗️ Health'; // 🥗️ Health
    await seedMappings([{ sourceCategory: '🥗 Health', calendarName: 'Fitness and Meals' }]);
    expect(await mapCategoryToCalendar(withVariationSelector)).toBe('Fitness and Meals');
  });

  it('returns source category unchanged when no mapping exists', async () => {
    await seedMappings([{ sourceCategory: 'Office', calendarName: 'Office Work' }]);
    expect(await mapCategoryToCalendar('Unknown Category')).toBe('Unknown Category');
  });

  it('returns source category when config is empty', async () => {
    await seedMappings([]);
    expect(await mapCategoryToCalendar('💵 Finances')).toBe('💵 Finances');
  });

  it('handles multiple mappings and picks correct one', async () => {
    await seedMappings([
      { sourceCategory: '💵 Finances', calendarName: 'Side Hustle' },
      { sourceCategory: '🥗 Health', calendarName: 'Fitness and Meals' },
      { sourceCategory: '😇 Personal Well Being and Personality', calendarName: 'Reminders' },
      { sourceCategory: 'Office', calendarName: 'Office Work' },
    ]);
    expect(await mapCategoryToCalendar('💵 Finances')).toBe('Side Hustle');
    expect(await mapCategoryToCalendar('🥗 Health')).toBe('Fitness and Meals');
    expect(await mapCategoryToCalendar('😇 Personal Well Being and Personality')).toBe('Reminders');
    expect(await mapCategoryToCalendar('Office')).toBe('Office Work');
  });
});
