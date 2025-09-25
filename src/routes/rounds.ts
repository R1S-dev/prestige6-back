// src/routes/rounds.ts
import { Router } from "express";
import { prisma } from "../prismaClient";
import { Prisma } from "@prisma/client";
import { live } from "../live";

const router = Router();

// — Prisma tipovi radi čistog TS intellisense-a
type RoundWithRels = Prisma.RoundGetPayload<{
  include: { draws: true; specials: true };
}>;
type DrawRow = Prisma.DrawGetPayload<{}>;

// — Helperi
function makeDrawsFromNumbers(nums: number[]) {
  const seen = new Set<number>();
  const unique: number[] = [];
  for (const n of nums) {
    if (!seen.has(n)) {
      seen.add(n);
      unique.push(n);
    }
  }
  return unique.slice(0, 35).map((n, i) => ({ number: n, order: i + 1 }));
}

function makeRandomDraws() {
  const pool = Array.from({ length: 48 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return makeDrawsFromNumbers(pool);
}

function parseCsvToNums(csv?: string | null): number[] {
  if (!csv) return [];
  const out: number[] = [];
  const seen = new Set<number>();
  for (const raw of csv.split(",").map((s) => s.trim()).filter(Boolean)) {
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 1 && n <= 48 && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out.slice(0, 48);
}

// GET /api/rounds?take=50
router.get("/", async (req, res, next) => {
  try {
    const take = Math.min(100, Number(req.query.take) || 20);

    const rows: RoundWithRels[] = await prisma.round.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: {
        draws: { orderBy: { order: "asc" } },
        specials: true,
      },
    });

    const dto = rows.map((r) => ({
      id: r.id,
      roundSerial: r.roundSerial,
      ts:
        (r.createdAt instanceof Date
          ? r.createdAt
          : new Date(r.createdAt as any)
        ).toISOString(),
      draws: (r.draws as DrawRow[]).map((d) => ({
        order: d.order,
        number: d.number,
      })),
      meta: {
        jackpotCode: r.jackpotCode,
        jackpotStart: { mini: r.jpStartMini, main: r.jpStartMain },
        jackpotGrowPerSec: r.jpGrowPerSec,
        specials: {
          moneyBags: r.specials?.moneyBag ? [r.specials.moneyBag] : [],
          x2: [r.specials?.x2a, r.specials?.x2b].filter(
            (x): x is number => Number.isInteger(x ?? null)
          ),
        },
      },
    }));

    res.json(dto);
  } catch (e) {
    next(e);
  }
});

// POST /api/rounds/start  { live?: boolean, drawNumbers?: number[] }
router.post("/start", async (req, res, next) => {
  try {
    const wantLive = !!req.body?.live;
    const fromBody: number[] | undefined = Array.isArray(req.body?.drawNumbers)
      ? req.body.drawNumbers
      : undefined;

    // Uvek obezbedi settings zapis (id=1)
    const s = await prisma.setting.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        jackpotCode: "JP-0001",
        jpGrowPerSec: 0.2,
        jpStartMini: 15000,
        jpStartMain: 250000,
        plannedMoneyBag: null,
        plannedX2a: null,
        plannedX2b: null,
        plannedDrawNumbersStr: null,
        roundSerial: 1,
      },
    });

    const planned = fromBody ?? parseCsvToNums(s.plannedDrawNumbersStr);
    const draws = planned.length ? makeDrawsFromNumbers(planned) : makeRandomDraws();

    const created: RoundWithRels = await prisma.round.create({
      data: {
        roundSerial: s.roundSerial,
        seed: crypto.randomUUID(),
        jackpotCode: s.jackpotCode,
        jpGrowPerSec: s.jpGrowPerSec,
        jpStartMini: s.jpStartMini,
        jpStartMain: s.jpStartMain,
        startedAt: new Date(),
        draws: { createMany: { data: draws } },
        specials: {
          create: {
            moneyBag: s.plannedMoneyBag ?? null,
            x2a: s.plannedX2a ?? null,
            x2b: s.plannedX2b ?? null,
          },
        },
      },
      include: {
        draws: { orderBy: { order: "asc" } },
        specials: true,
      },
    });

    await prisma.setting.update({
      where: { id: 1 },
      data: { roundSerial: s.roundSerial + 1 },
    });

    if (wantLive) {
      // pokreni live motor (SSE klijenti će videti kugle)
      live.startFromRound({ round: created, stepMs: 3200, emergeLeadMs: 1600 });
    }

    res.json({
      id: created.id,
      roundSerial: created.roundSerial,
      ts:
        (created.createdAt instanceof Date
          ? created.createdAt
          : new Date(created.createdAt as any)
        ).toISOString(),
      draws: (created.draws as DrawRow[]).map((d) => ({
        order: d.order,
        number: d.number,
      })),
      meta: {
        jackpotCode: created.jackpotCode,
        jackpotStart: { mini: created.jpStartMini, main: created.jpStartMain },
        jackpotGrowPerSec: created.jpGrowPerSec,
        specials: {
          moneyBags: created.specials?.moneyBag ? [created.specials.moneyBag] : [],
          x2: [created.specials?.x2a, created.specials?.x2b].filter(
            (x): x is number => Number.isInteger(x ?? null)
          ),
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
