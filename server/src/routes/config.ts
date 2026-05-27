import { Router, Request, Response } from 'express';
import { getConfig } from '../services/category-mapper';
import ConfigModel from '../models/Config';
import { writeConfigFile } from '../services/config-file';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const config = await getConfig();
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req: Request, res: Response) => {
  try {
    const existing = await getConfig();
    const updated = await ConfigModel.findByIdAndUpdate(existing._id, req.body, { new: true });
    if (updated) writeConfigFile(updated.toObject() as unknown as Record<string, unknown>);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
