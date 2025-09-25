import 'dotenv/config';

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export const config = {
  port: num(process.env.PORT, 8080),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dbUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  drawCount: num(process.env.ROUND_DRAW_COUNT, 35),
  allNumbers: num(process.env.ROUND_ALL_NUMBERS, 48),
  minSpecOrder: num(process.env.ROUND_MIN_SPECIAL_ORDER, 6),
  maxSpecOrder: num(process.env.ROUND_MAX_SPECIAL_ORDER, 35),
  jackpot: {
    code: process.env.JACKPOT_DEFAULT_CODE || 'JP-0001',
    growPerSec: num(process.env.JACKPOT_GROW_PER_SEC, 0.2),
    start: {
      mini: num(process.env.JACKPOT_START_MINI, 15000),
      main: num(process.env.JACKPOT_START_MAIN, 250000),
    },
  },
} as const;
