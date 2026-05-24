import { Router, Request, Response } from 'express';
import { fetchTodayEvents, fetchTodayReminders, listCalendars } from '../services/caldav';

const router = Router();

router.get('/events', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    const events = await fetchTodayEvents(date);
    res.json({ events });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reminders', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    const reminders = await fetchTodayReminders(date);
    res.json({ reminders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', async (_req: Request, res: Response) => {
  try {
    const calendars = await listCalendars();
    res.json({ calendars });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
