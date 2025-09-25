export type Specials = { moneyBags: number[]; x2: number[] };
export type DrawDTO = { order: number; number: number };
export type RoundDTO = {
  id: string;
  roundSerial: number;
  ts: string;
  draws: DrawDTO[];
  meta: {
    jackpotCode: string;
    jackpotStart: { mini: number; main: number };
    jackpotGrowPerSec: number;
    specials: Specials;
  };
};
