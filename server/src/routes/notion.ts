import { Router, Request, Response } from 'express';
import { fetchTodayPage } from '../services/notion-parser';
import { getConfig } from '../services/category-mapper';

const router = Router();

router.get('/parse', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    const config = await getConfig();

    const dbId = config.notionDatabaseId || process.env.NOTION_DATABASE_ID;
    if (!dbId) {
      return res.status(400).json({ error: 'Notion database ID not configured' });
    }

    const parsed = await fetchTodayPage(dbId, config.notionDateProperty, date);
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
