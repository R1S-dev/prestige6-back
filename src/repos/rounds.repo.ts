import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const roundsRepo = {
  async createRound(input: {
    roundSerial: number;
    seed: string;
    jackpotCode: string;
    jpStartMini: number;
    jpStartMain: number;
    jpGrowPerSec: number;
    draws: { order: number; number: number }[];
    specials?: { moneyBag?: number | null; x2a?: number | null; x2b?: number | null };
  }) {
    return prisma.round.create({
      data: {
        roundSerial: input.roundSerial,
        seed: input.seed,
        jackpotCode: input.jackpotCode,
        jpStartMini: input.jpStartMini,
        jpStartMain: input.jpStartMain,
        jpGrowPerSec: input.jpGrowPerSec,
        draws: { create: input.draws.map(d => ({ order: d.order, number: d.number })) },
        specials: input.specials ? { create: input.specials } : undefined,
      },
      include: { draws: true, specials: true },
    });
  },

  async latest() {
    return prisma.round.findFirst({ orderBy: { createdAt: 'desc' }, include: { draws: true, specials: true } });
  },

  async list(cursor?: string, take = 20) {
    return prisma.round.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { draws: true, specials: true },
    });
  },
};
