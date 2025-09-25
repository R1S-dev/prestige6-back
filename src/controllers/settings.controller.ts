import { Request, Response } from 'express';
import { settingsService, updateSettingsSchema } from '../services/settings.service';

export const settingsController = {
  async get(_req: Request, res: Response) {
    const s = await settingsService.get();
    res.json(s);
  },
  async update(req: Request, res: Response) {
    const parsed = updateSettingsSchema.parse(req.body);
    const s = await settingsService.update(parsed);
    res.json(s);
  },
};
