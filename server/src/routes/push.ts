import { Router, Request, Response } from 'express';
import { pluginRegistry } from '../plugins/registry';
import ProposalModel from '../models/Proposal';
import { mapCategoryToCalendar } from '../services/category-mapper';
import { parseISO } from 'date-fns';

const router = Router();

router.post('/confirm/:proposalId', async (req: Request, res: Response) => {
  try {
    const proposal = await ProposalModel.findById(req.params.proposalId);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    const calPlugin = await pluginRegistry.getPrimaryCalendarPlugin();

    const requestedName: string = req.body.remindersListName || 'Reminders';
    const remindersListName = requestedName;

    const accepted = proposal.items.filter((item) => item.accepted);
    const results: { id: string; title: string; status: 'pushed' | 'error'; error?: string }[] = [];

    for (const item of accepted) {
      try {
        if (item.type === 'task') {
          const resolvedCalendar = await mapCategoryToCalendar(item.category);
          await calPlugin.pushEvent({
            title: item.title,
            startTime: parseISO(item.startTime),
            endTime: parseISO(item.endTime),
            calendarName: resolvedCalendar,
            description: `FlowTyme — ${item.category}`,
          });
        } else {
          // chore → push as VEVENT to the reminders calendar
          // iCloud CalDAV VTODO writes are silently dropped (post-iOS 13 Reminders format)
          await calPlugin.pushEvent({
            title: item.title,
            startTime: parseISO(item.startTime),
            endTime: parseISO(item.endTime),
            calendarName: remindersListName,
            description: `FlowTyme chore`,
          });
        }
        results.push({ id: item.id, title: item.title, status: 'pushed' });
      } catch (err: any) {
        results.push({ id: item.id, title: item.title, status: 'error', error: err.message });
      }
    }

    proposal.status = 'pushed';
    await proposal.save();

    res.json({
      results,
      total: accepted.length,
      pushed: results.filter((r) => r.status === 'pushed').length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
