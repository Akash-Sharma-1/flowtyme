import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryMapping {
  /** Source-native category label (e.g. "Health", "Office Work"). Plugin-agnostic. */
  sourceCategory: string;
  /** Target calendar name on the calendar backend. */
  calendarName: string;
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
  // notionDatabaseId + notionDateProperty removed — these now live in plugins.yaml
}

const ConfigSchema = new Schema<IConfig>({
  categoryMappings: [
    {
      sourceCategory: String,
      calendarName: String,
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
}, { timestamps: true });

export default mongoose.model<IConfig>('Config', ConfigSchema);
