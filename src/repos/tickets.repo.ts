import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const ticketsRepo = {
  create(input: {
    channel: string; outletName?: string; outletId?: string; operator?: string; ticketCode: string;
    picks: number[]; stake: number; copies: number; note?: string; maxWin: number;
  }) {
    return prisma.ticket.create({ data: { ...input, picks: input.picks as any } });
  },
};
