import { Request, Response } from 'express';
import { createTicketSchema, ticketsService } from '../services/tickets.service';

export const ticketsController = {
  async create(req: Request, res: Response) {
    const input = createTicketSchema.parse(req.body);
    const t = await ticketsService.create(input);
    res.status(201).json(t);
  },
};
