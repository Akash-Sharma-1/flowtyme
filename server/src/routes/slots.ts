import { Router, Request, Response } from 'express';
import { fetchTodayEvents } from '../services/caldav';
import { fetchTodayPage } from '../services/notion-parser';
import { findSlots } from '../services/slot-finder';
import { getConfig } from '../services/category-mapper';
import ProposalModel from '../models/Proposal';
import { format } from 'date-fns';

const router = Router();

// Full pipeline: fetch notion + calendar → compute slots → save proposal
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const date = req.body.date as string | undefined;
    const today = date || format(new Date(), 'yyyy-MM-dd');
    const config = await getConfig();

    const dbId = config.notionDatabaseId || process.env.NOTION_DATABASE_ID;
    if (!dbId) {
      return res.status(400).json({ error: 'Notion database ID not configured' });
    }

    const overrideTasks = req.body.tasks as any[] | undefined;
    const overrideChores = req.body.chores as any[] | undefined;

    const [notionData, existingEvents] = await Promise.all([
      overrideTasks !== undefined || overrideChores !== undefined
        ? Promise.resolve({ tasks: overrideTasks || [], chores: overrideChores || [], partitionAssignments: {} })
        : fetchTodayPage(dbId, config.notionDateProperty, date),
      fetchTodayEvents(date),
    ]);

    const proposals = await findSlots({
      tasks: notionData.tasks,
      chores: notionData.chores,
      existingEvents,
      dateStr: date,
    });

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
