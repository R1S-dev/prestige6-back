// src/live.ts
import { Prisma } from "@prisma/client";

type SpecialDTO = {
  moneyBags: number[];
  x2: number[];
};

type LiveMetaDTO = {
  jackpotCode: string;
  jackpotStart: { mini: number; main: number };
  jackpotGrowPerSec: number;
  specials: SpecialDTO;
};

export type LiveDTO = {
  status: "idle" | "running" | "completed";
  roundId?: string;
  roundSerial?: number;
  startedAt?: string;
  revealed: number;
  stepMs: number;
  emergeLeadMs: number;
  draws: { order: number; number: number }[];
  meta?: LiveMetaDTO;
};

type Subscriber = (chunk: LiveDTO) => void;

// ✔ Round sa relations tipom direktno iz Prisme:
type RoundWithRels = Prisma.RoundGetPayload<{
  include: { draws: true; specials: true };
}>;

class LiveService {
  private state: LiveDTO = {
    status: "idle",
    revealed: 0,
    stepMs: 3200,
    emergeLeadMs: 1600,
    draws: [],
  };

  private subs = new Set<Subscriber>();
  private tickTimer: any = null;
  private hbTimer: any = null;

  start() {
    if (this.hbTimer) clearInterval(this.hbTimer);
    this.hbTimer = setInterval(() => this.broadcast(), 5000);
  }

  getState(): LiveDTO {
    return this.state;
  }

  subscribe(fn: Subscriber) {
    this.subs.add(fn);
    return () => this.subs.delete(fn);
  }

  private setState(next: Partial<LiveDTO>) {
    this.state = { ...this.state, ...next };
  }

  private clearTick() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  private broadcast() {
    const snap = this.getState();
    for (const s of this.subs) {
      try { s(snap); } catch {}
    }
  }

  startFromRound(args: { round: RoundWithRels; stepMs?: number; emergeLeadMs?: number }) {
    const { round, stepMs = 3200, emergeLeadMs = 1600 } = args;

    const draws = [...round.draws]
      .sort((a, b) => a.order - b.order)
      .slice(0, 35)
      .map(d => ({ order: d.order, number: d.number }));

    const specials: SpecialDTO = {
      moneyBags: round.specials?.moneyBag ? [round.specials.moneyBag] : [],
      x2: [round.specials?.x2a, round.specials?.x2b].filter((x): x is number => Number.isInteger(x ?? null)),
    };

    this.clearTick();

    this.setState({
      status: "running",
      roundId: round.id,
      roundSerial: round.roundSerial,
      startedAt: new Date().toISOString(),
      revealed: 0,
      stepMs,
      emergeLeadMs,
      draws,
      meta: {
        jackpotCode: round.jackpotCode,
        jackpotStart: { mini: round.jpStartMini, main: round.jpStartMain },
        jackpotGrowPerSec: round.jpGrowPerSec,
        specials,
      },
    });

    this.broadcast();

    this.tickTimer = setInterval(() => {
      const next = Math.min(35, (this.state.revealed ?? 0) + 1);
      this.setState({ revealed: next });
      this.broadcast();
      if (next >= 35) {
        this.clearTick();
        this.setState({ status: "completed" });
        this.broadcast();
      }
    }, stepMs);
  }
}

export const live = new LiveService();
