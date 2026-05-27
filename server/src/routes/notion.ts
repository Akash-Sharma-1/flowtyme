import { Router, Request, Response } from 'express';
import { fetchTodayPage } from '../services/notion-parser';

const router = Router();

// Diagnostic/debug endpoint — calls notion-parser directly (bypasses plugin layer).
// notionDatabaseId + notionDateProperty now live in plugins.yaml, but for this
// debug route we read from env vars so /test-notion skill works without the server
// needing to parse plugins.yaml a second time.
router.get('/parse', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;

    const dbId = process.env.NOTION_DATABASE_ID;
    if (!dbId) {
      return res.status(400).json({
        error: 'NOTION_DATABASE_ID env var not set. Add it to server/.env',
      });
    }
    const dateProperty = process.env.NOTION_DATE_PROPERTY || 'Date';

    const parsed = await fetchTodayPage(dbId, dateProperty, date);
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
