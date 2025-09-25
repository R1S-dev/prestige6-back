import { settingsRepo } from '../repos/settings.repo';
import { z } from 'zod';
import { config } from '../config';

export const updateSettingsSchema = z.object({
  jackpotCode: z.string().min(0).optional(),
  jpGrowPerSec: z.number().min(0).optional(),
  jpStartMini: z.number().int().min(0).optional(),
  jpStartMain: z.number().int().min(0).optional(),
  plannedMoneyBag: z.number().int().min(config.minSpecOrder).max(config.maxSpecOrder).nullable().optional(),
  plannedX2a: z.number().int().min(config.minSpecOrder).max(config.maxSpecOrder).nullable().optional(),
  plannedX2b: z.number().int().min(config.minSpecOrder).max(config.maxSpecOrder).nullable().optional(),
  plannedDrawNumbers: z.array(z.number().int().min(1).max(config.allNumbers)).max(config.allNumbers).nullable().optional(),
  roundSerial: z.number().int().min(1).optional(),
});

export const settingsService = {
  async get() { return settingsRepo.get(); },
  async update(payload: z.infer<typeof updateSettingsSchema>) {
    return settingsRepo.update(payload as any);
  },
};
