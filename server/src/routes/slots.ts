import { Router, Request, Response } from 'express';
import { pluginRegistry } from '../plugins/registry';
import { findSlots } from '../services/slot-finder';
import { SourceItem } from '../plugins/interfaces';
import ProposalModel from '../models/Proposal';
import { format } from 'date-fns';

const router = Router();

/**
 * Convert raw override arrays (from req.body) to SourceItem[].
 * Used when the caller supplies tasks/chores directly instead of letting
 * the source plugins fetch them.
 */
function toSourceItems(
  tasks: Array<{ title: string; category?: string; partitionHint?: string; preferredStartTime?: string }>,
  chores: Array<{ title: string; partitionHint?: string; preferredStartTime?: string }>
): SourceItem[] {
  const taskItems: SourceItem[] = tasks.map((t) => ({
    type: 'task' as const,
    title: t.title,
    category: t.category || '',
    partitionHint: t.partitionHint,
    preferredStartTime: t.preferredStartTime,
  }));
  const choreItems: SourceItem[] = chores.map((c) => ({
    type: 'chore' as const,
    title: c.title,
    category: '',
    partitionHint: c.partitionHint,
    preferredStartTime: c.preferredStartTime,
  }));
  return [...taskItems, ...choreItems];
}

// Full pipeline: fetch source items + calendar events → compute slots → save proposal
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const date = req.body.date as string | undefined;
    const today = date || format(new Date(), 'yyyy-MM-dd');

    const overrideTasks = req.body.tasks as any[] | undefined;
    const overrideChores = req.body.chores as any[] | undefined;
    const hasOverrides = overrideTasks !== undefined || overrideChores !== undefined;

    const calPlugin = await pluginRegistry.getPrimaryCalendarPlugin();

    const [items, existingEvents] = await Promise.all([
      hasOverrides
        ? Promise.resolve(toSourceItems(overrideTasks || [], overrideChores || []))
        : pluginRegistry.getSourceItems(today),
      calPlugin.fetchEvents(today),
    ]);

    const proposals = await findSlots({ items, existingEvents, dateStr: today });

    // upsert proposal for today
    const saved = await ProposalModel.findOneAndUpdate(
      { date: today },
      { date: today, items: proposals, status: 'draft' },
      { upsert: true, new: true }
    );

    res.json({
      proposalId: saved._id,
      date: today,
      items: saved.items,
      existingEvents,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:date', async (req: Request, res: Response) => {
  try {
    const proposal = await ProposalModel.findOne({ date: req.params.date });
    if (!proposal) return res.status(404).json({ error: 'No proposal for this date' });
    res.json(proposal);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/items', async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    const proposal = await ProposalModel.findByIdAndUpdate(
      req.params.id,
      { items },
      { new: true }
    );
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    res.json(proposal);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
