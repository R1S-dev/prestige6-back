export function toRoundDTO(r: any) {
  return {
    id: r.id,
    roundSerial: r.roundSerial,
    ts: r.createdAt.toISOString(),
    status: r.status ?? "idle",
    startedAt: r.startedAt ? new Date(r.startedAt).toISOString() : null,
    revealed: r.revealed ?? 0,
    stepMs: r.stepMs ?? 3200,
    emergeLeadMs: r.emergeLeadMs ?? 1600,
    draws: r.draws
      .slice()
      .sort((a: any, b: any) => a.order - b.order)
      .map((d: any) => ({ order: d.order, number: d.number })),
    reveals: (r.reveals ?? [])
      .slice()
      .sort((a: any, b: any) => a.order - b.order)
      .map((x: any) => ({ order: x.order, at: x.at.toISOString() })),
    meta: {
      jackpotCode: r.jackpotCode,
      jackpotStart: { mini: r.jpStartMini, main: r.jpStartMain },
      jackpotGrowPerSec: r.jpGrowPerSec,
      specials: {
        moneyBags: r.specials?.moneyBag ? [r.specials.moneyBag] : [],
        x2: [r.specials?.x2a, r.specials?.x2b].filter((x: any) => Number.isInteger(x)),
      },
    },
  };
}

export function mapSettingForApi(s: any) {
  return {
    id: s.id,
    jackpotCode: s.jackpotCode,
    jpGrowPerSec: s.jpGrowPerSec,
    jpStartMini: s.jpStartMini,
    jpStartMain: s.jpStartMain,
    plannedMoneyBag: s.plannedMoneyBag,
    plannedX2a: s.plannedX2a,
    plannedX2b: s.plannedX2b,
    plannedDrawNumbers: s.plannedDrawNumbersStr ? JSON.parse(s.plannedDrawNumbersStr) : [],
    roundSerial: s.roundSerial,
  };
}
