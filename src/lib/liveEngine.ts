// src/lib/liveEngine.ts
import { PrismaClient, Round } from "@prisma/client";
import { EventEmitter } from "events";

export type LiveState = {
  roundId: string | null;
  roundSerial: number | null;
  startedAt: string | null;     // ISO
  reveals: { order: number; at: string }[]; // svih planiranih reveal-ova (ISO)
  now: string;                  // server now
  visibleCount: number;         // koliko je trenutno "izašlo" (order <= now)
  nextOrder: number | null;     // sledeći order koji dolazi
  nextAt: string | null;        // ISO sledećeg reveal-a
};

type Subscriber = {
  id: string;
  write: (chunk: string) => void;
};

class LiveEngine {
  private prisma: PrismaClient;
  private emitter = new EventEmitter();

  // In-memory snapshot
  private currentRound: Round | null = null;
  private reveals: { order: number; at: Date }[] = [];
  private tickTimer: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Subscriber> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /** Jedinstveni ID za SSE klijente */
  private uid() {
    return Math.random().toString(36).slice(2);
  }

  /** Pretplata na SSE */
  public subscribe(write: (data: string) => void) {
    const id = this.uid();
    const sub: Subscriber = { id, write };
    this.subscribers.set(id, sub);
    return () => this.subscribers.delete(id);
  }

  private broadcast(event: string, payload: any) {
    const line =
      `event: ${event}\n` +
      `data: ${JSON.stringify(payload)}\n\n`;
    for (const sub of this.subscribers.values()) {
      try {
        sub.write(line);
      } catch {}
    }
  }

  /** Vraća live state koji front koristi da renderuje pravu fazu */
  public getState(): LiveState {
    const now = new Date();
    const all = this.reveals.slice().sort((a, b) => a.order - b.order);
    const visible = all.filter((x) => x.at <= now).length;
    const next = all.find((x) => x.at > now) || null;
    return {
      roundId: this.currentRound?.id ?? null,
      roundSerial: this.currentRound?.roundSerial ?? null,
      startedAt: this.currentRound?.startedAt?.toISOString?.() ?? null,
      reveals: all.map((x) => ({ order: x.order, at: x.at.toISOString() })),
      now: now.toISOString(),
      visibleCount: visible,
      nextOrder: next?.order ?? null,
      nextAt: next?.at?.toISOString?.() ?? null,
    };
  }

  /** Startuje live loop — zadaje reveal raspored i pali tick */
  public async startRound(options: {
    round: Round;
    startAt?: Date;        // default: now
    gapMs?: number;        // default: 3200 ms
  }) {
    const startAt = options.startAt ?? new Date();
    const gap = Math.max(600, Math.floor(options.gapMs ?? 3200));

    // Učitaj draws iz baze
    const draws = await this.prisma.draw.findMany({
      where: { roundId: options.round.id },
      orderBy: { order: "asc" },
      take: 35,
    });

    // Izračunaj reveal raspored
    const plan: { order: number; at: Date }[] = [];
    for (let i = 0; i < draws.length; i++) {
      const ord = i + 1;
      const at = new Date(startAt.getTime() + i * gap);
      plan.push({ order: ord, at });
    }

    // Persistiraj reveal-ove (idempotentno: brišemo stare pa upisujemo nove)
    await this.prisma.reveal.deleteMany({ where: { roundId: options.round.id } });
    if (plan.length) {
      await this.prisma.reveal.createMany({
        data: plan.map((p) => ({
          roundId: options.round.id,
          order: p.order,
          at: p.at,
        })),
      });
    }

    // Postavi live stanje u memoriji
    this.currentRound = options.round;
    this.reveals = plan;

    // Tick loop (svakih 300 ms) — proverava "stigo reveal" i šalje event
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = setInterval(async () => {
      const prevVisible = this.getState().visibleCount;
      const st = this.getState(); // recompute after now changed
      const nowVisible = st.visibleCount;

      // ako se promijenio visibleCount — desio se reveal
      if (nowVisible > prevVisible) {
        const justNow = st.reveals.filter((r) => {
          const at = new Date(r.at).getTime();
          return at <= Date.now() && at > Date.now() - 1000;
        });
        // Emituj SSE event
        this.broadcast("reveal", { visibleCount: nowVisible, justNow });
      }
    }, 300);

    // pošalji full-state inicijalno
    this.broadcast("state", this.getState());
  }

  /** Rekonstruisanje stanja iz baze (posle restart-a servera) */
  public async restoreFromDb() {
    // Uzmi najskoriji round koji ima draws
    const latest = await this.prisma.round.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (!latest) return;

    const reveals = await this.prisma.reveal.findMany({
      where: { roundId: latest.id },
      orderBy: { order: "asc" },
    });
    if (!reveals.length) return;

    this.currentRound = latest;
    this.reveals = reveals.map((r) => ({ order: r.order, at: r.at }));
    // pali tick
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = setInterval(() => {
      // samo održava heartbeat i eventualne reveal promene
      const st = this.getState();
      this.broadcast("heartbeat", { now: st.now, visibleCount: st.visibleCount });
    }, 1000);

    this.broadcast("state", this.getState());
  }
}

export function createLiveEngine(prisma: PrismaClient) {
  return new LiveEngine(prisma);
}
