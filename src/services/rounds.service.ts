// src/services/rounds.service.ts
import { z } from "zod";
import { roundsRepo } from "../repos/rounds.repo";
import { settingsRepo } from "../repos/settings.repo";
import { config } from "../config";

export const SpecialsSchema = z.object({
  moneyBags: z.array(z.number().int()).default([]),
  x2: z.array(z.number().int()).default([]),
});

export const PreviewSchema = z.object({
  drawNumbers: z
    .array(z.number().int().min(1).max(config.allNumbers))
    .max(config.allNumbers)
    .optional(),
});

function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeDrawsFromNumbers(nums: number[]) {
  const uniq: number[] = [];
  const seen = new Set<number>();
  for (const n of nums) {
    if (!seen.has(n)) {
      seen.add(n);
      uniq.push(n);
    }
  }
  return uniq.slice(0, config.drawCount).map((n, i) => ({ order: i + 1, number: n }));
}

function makeRandomDraws() {
  const pool = Array.from({ length: config.allNumbers }, (_, i) => i + 1);
  shuffle(pool);
  return makeDrawsFromNumbers(pool);
}

export const roundsService = {
  toDTO(r: any) {
    return {
      id: r.id,
      roundSerial: r.roundSerial,
      ts: r.createdAt?.toISOString?.() ?? r.startedAt?.toISOString?.() ?? new Date().toISOString(),
      draws: (r.draws || [])
        .slice()
        .sort((a: any, b: any) => a.order - b.order)
        .map((d: any) => ({ order: d.order, number: d.number })),
      meta: {
        jackpotCode: r.jackpotCode,
        jackpotStart: { mini: r.jpStartMini, main: r.jpStartMain },
        jackpotGrowPerSec: r.jpGrowPerSec,
        specials: {
          moneyBags: r.specials?.moneyBag ? [r.specials.moneyBag] : [],
          x2: [r.specials?.x2a, r.specials?.x2b].filter((x: any) => Number.isInteger(x)) as number[],
        },
      },
    };
  },

  async createFromPlan(plan?: { drawNumbers?: number[] }) {
    const s = await settingsRepo.get();
    const draws =
      plan?.drawNumbers?.length ? makeDrawsFromNumbers(plan.drawNumbers) : makeRandomDraws();

    const round = await roundsRepo.createRound({
      roundSerial: s.roundSerial,
      seed: Math.random().toString(36).slice(2),
      jackpotCode: s.defaultJackpotCode, // << ISPRAVKA
      jpStartMini: s.jpStartMini,
      jpStartMain: s.jpStartMain,
      jpGrowPerSec: s.jpGrowPerSec,
      draws,
      specials: {
        moneyBag: s.plannedMoneyBag ?? null,
        x2a: s.plannedX2a ?? null,
        x2b: s.plannedX2b ?? null,
      },
    });

    await settingsRepo.update({ roundSerial: s.roundSerial + 1 });
    return round;
  },
};
