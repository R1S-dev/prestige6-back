import { Request, Response } from 'express';
import { roundsService, PreviewSchema } from '../services/rounds.service';
import { roundsRepo } from '../repos/rounds.repo';

export const roundsController = {
  async latest(_req: Request, res: Response) {
    const r = await roundsRepo.latest();
    if (!r) return res.status(204).send();
    res.json(roundsService.toDTO(r));
  },

  async list(req: Request, res: Response) {
    const take = Math.min(100, Number(req.query.take) || 20);
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const rows = await roundsRepo.list(cursor, take);
    res.json(rows.map(roundsService.toDTO));
  },

  async startNow(req: Request, res: Response) {
    const plan = PreviewSchema.safeParse(req.body);
    const round = await roundsService.createFromPlan(plan.success ? plan.data : undefined);
    res.status(201).json(roundsService.toDTO(round));
  },
};
