// src/routes/settings.ts
import { Router } from "express";
import { prisma } from "../prismaClient";

const router = Router();

/**
 * GET /api/settings
 * Uvek vrati settings; ako ne postoji -> kreira default sa id=1
 */
router.get("/", async (_req, res, next) => {
  try {
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
    res.json(s);
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/settings
 * Prima delimične izmene.
 * Ako dođe plannedDrawNumbers: number[] -> čuva se kao CSV u plannedDrawNumbersStr
 */
router.patch("/", async (req, res, next) => {
  try {
    const data = req.body ?? {};

    // plannedDrawNumbers: array -> CSV
    let plannedCsv: string | undefined;
    if (Array.isArray(data.plannedDrawNumbers)) {
      const seen = new Set<number>();
      const clean: number[] = [];
      for (const x of data.plannedDrawNumbers) {
        const n = Number(x);
        if (Number.isInteger(n) && n >= 1 && n <= 48 && !seen.has(n)) {
          seen.add(n);
          clean.push(n);
        }
      }
      plannedCsv = clean.join(",");
      delete data.plannedDrawNumbers;
    }

    const s = await prisma.setting.update({
      where: { id: 1 },
      data: {
        ...data,
        ...(plannedCsv !== undefined ? { plannedDrawNumbersStr: plannedCsv } : {}),
      },
    });

    res.json(s);
  } catch (e) {
    next(e);
  }
});

export default router;
