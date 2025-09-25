// src/repos/settings.repo.ts
import { prisma } from "../prisma";

export type SettingsPatch = Partial<{
  defaultJackpotCode: string;
  jpGrowPerSec: number;
  jpStartMini: number;
  jpStartMain: number;
  plannedMoneyBag: number | null;
  plannedX2a: number | null;
  plannedX2b: number | null;
  plannedDrawNumbersStr: string | null;
  roundSerial: number;
}>;

export const settingsRepo = {
  async get() {
    return prisma.setting.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        defaultJackpotCode: "JP-0001", // << BITNO: defaultJackpotCode (ne jackpotCode)
        jpGrowPerSec: 0.2,
        jpStartMini: 15_000,
        jpStartMain: 250_000,
        plannedMoneyBag: null,
        plannedX2a: null,
        plannedX2b: null,
        plannedDrawNumbersStr: null,
        roundSerial: 1,
      },
    });
  },

  async update(patch: SettingsPatch) {
    return prisma.setting.update({ where: { id: 1 }, data: patch });
  },
};
