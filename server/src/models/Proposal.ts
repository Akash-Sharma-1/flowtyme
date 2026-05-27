import mongoose, { Schema, Document } from 'mongoose';

export interface IProposalItem {
  id: string;
  title: string;
  type: 'task' | 'chore';
  category: string;
  startTime: string;  // ISO string
  endTime: string;    // ISO string
  calendarName: string;
  accepted: boolean;
  hasConflict: boolean;
  conflictWith?: string;
  /** Plugin id or source identifier (e.g. 'notion', 'reminders', plugin-specific). */
  source: string;
}

export interface IProposal extends Document {
  date: string;        // YYYY-MM-DD
  items: IProposalItem[];
  status: 'draft' | 'pushed';
  createdAt: Date;
  updatedAt: Date;
}

const ProposalItemSchema = new Schema<IProposalItem>({
  id: String,
  title: String,
  type: { type: String, enum: ['task', 'chore'] },
  category: String,
  startTime: String,
  endTime: String,
  calendarName: String,
  accepted: { type: Boolean, default: true },
  hasConflict: { type: Boolean, default: false },
  conflictWith: String,
  source: { type: String },
});

const ProposalSchema = new Schema<IProposal>(
  {
    date: { type: String, required: true },
    items: [ProposalItemSchema],
    status: { type: String, enum: ['draft', 'pushed'], default: 'draft' },
  },
  { timestamps: true }
);

export default mongoose.model<IProposal>('Proposal', ProposalSchema);
