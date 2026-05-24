import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryMapping {
  notionCategory: string;
  appleCalendarName: string;
  color?: string;
}

export interface IPartition {
  name: string;
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
}

export interface IDurationOverride {
  category: string;
  durationMinutes: number;
}

export interface IConfig extends Document {
  categoryMappings: ICategoryMapping[];
  partitions: IPartition[];
  durationOverrides: IDurationOverride[];
  defaultTaskDurationMinutes: number;
  defaultChoreDurationMinutes: number;
  notionDatabaseId: string;
  notionDateProperty: string;
}

const ConfigSchema = new Schema<IConfig>({
  categoryMappings: [
    {
      notionCategory: String,
      appleCalendarName: String,
      color: String,
    },
  ],
  partitions: [
    {
      name: String,
      startTime: String,
      endTime: String,
    },
  ],
  durationOverrides: [
    {
      category: String,
      durationMinutes: Number,
    },
  ],
  defaultTaskDurationMinutes: { type: Number, default: 60 },
  defaultChoreDurationMinutes: { type: Number, default: 15 },
  notionDatabaseId: { type: String, default: '' },
  notionDateProperty: { type: String, default: 'Date' },
});

export default mongoose.model<IConfig>('Config', ConfigSchema);
