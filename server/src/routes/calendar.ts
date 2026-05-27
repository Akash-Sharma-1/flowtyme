import { Router, Request, Response } from 'express';
import { pluginRegistry } from '../plugins/registry';
import { fetchTodayReminders } from '../services/caldav';

const router = Router();

router.get('/events', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    const plugin = await pluginRegistry.getPrimaryCalendarPlugin();
    const events = await plugin.fetchEvents(date);
    res.json({ events });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reminders', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    // Reminders (VTODO) are iCloud-specific — call caldav directly for now.
    // Future: expose fetchReminders() on ICalendarPlugin interface.
    const reminders = await fetchTodayReminders(date);
    res.json({ reminders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', async (_req: Request, res: Response) => {
  try {
    const plugin = await pluginRegistry.getPrimaryCalendarPlugin();
    const calendars = await plugin.listCalendars();
    res.json({ calendars });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
