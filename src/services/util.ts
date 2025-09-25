export const ALL_NUMBERS = 48;
export const DRAW_COUNT = 35;
export const MIN_SPEC_ORDER = 6;
export const MAX_SPEC_ORDER = 35;

export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeDrawsFromNumbers(nums: number[]) {
  const uniq: number[] = [];
  const seen = new Set<number>();
  for (const n of nums) {
    const x = Math.trunc(n);
    if (x >= 1 && x <= ALL_NUMBERS && !seen.has(x)) {
      seen.add(x);
      uniq.push(x);
    }
  }
  return uniq.slice(0, DRAW_COUNT).map((n, i) => ({ order: i + 1, number: n }));
}

export function makeRandomDraws() {
  const pool = Array.from({ length: ALL_NUMBERS }, (_, i) => i + 1);
  shuffle(pool);
  return makeDrawsFromNumbers(pool);
}

export function parseJSONArr(str?: string | null): number[] | null {
  if (!str) return null;
  try {
    const v = JSON.parse(str);
    return Array.isArray(v) ? v.map(Number).filter(Number.isFinite) : null;
  } catch {
    return null;
  }
}

export function toJSONString(arr?: number[] | null): string | null {
  if (!arr || !arr.length) return null;
  return JSON.stringify(arr);
}
