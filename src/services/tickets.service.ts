import { ticketsRepo } from '../repos/tickets.repo';
import { z } from 'zod';

export const createTicketSchema = z.object({
  channel: z.string().default('POS'),
  outletName: z.string().optional(),
  outletId: z.string().optional(),
  operator: z.string().optional(),
  ticketCode: z.string(),
  picks: z.array(z.number().int().min(1).max(48)).max(9),
  stake: z.number().int().min(1),
  copies: z.number().int().min(1).max(10).default(1),
  note: z.string().optional(),
  maxWin: z.number().int().min(1).default(1000000),
});

export const ticketsService = {
  create(input: z.infer<typeof createTicketSchema>) {
    return ticketsRepo.create(input);
  },
};
