import { Router, Request, Response } from 'express';
import { pushEvent, pushReminder } from '../services/caldav';
import ProposalModel from '../models/Proposal';
import { parseISO } from 'date-fns';
import { getConfig } from '../services/category-mapper';

const router = Router();

router.post('/confirm/:proposalId', async (req: Request, res: Response) => {
  try {
    const proposal = await ProposalModel.findById(req.params.proposalId);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    const config = await getConfig();
    const remindersListName = req.body.remindersListName || 'Reminders';

    const accepted = proposal.items.filter((item) => item.accepted);
    const results: { id: string; title: string; status: 'pushed' | 'error'; error?: string }[] = [];

    for (const item of accepted) {
      try {
        if (item.type === 'task') {
          await pushEvent({
            title: item.title,
            startTime: parseISO(item.startTime),
            endTime: parseISO(item.endTime),
            calendarName: item.calendarName,
            description: `FlowTyme — ${item.category}`,
          });
        } else {
          // chore → push as Reminder VTODO
          await pushReminder({
            title: item.title,
            dueTime: parseISO(item.startTime),
            listName: remindersListName,
          });
        }
        results.push({ id: item.id, title: item.title, status: 'pushed' });
      } catch (err: any) {
        results.push({ id: item.id, title: item.title, status: 'error', error: err.message });
      }
    }

    proposal.status = 'pushed';
    await proposal.save();

    res.json({ results, total: accepted.length, pushed: results.filter((r) => r.status === 'pushed').length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
