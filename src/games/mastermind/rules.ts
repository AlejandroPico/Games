export type Row = { guess: number[]; exact: number; near: number };
export function feedback(
  secret: number[],
  guess: number[],
): { exact: number; near: number } {
  let exact = 0;
  const a = Array(6).fill(0),
    b = Array(6).fill(0);
  for (let i = 0; i < 4; i++)
    if (secret[i] === guess[i]) exact++;
    else {
      a[secret[i]]++;
      b[guess[i]]++;
    }
  return { exact, near: a.reduce((n, v, i) => n + Math.min(v, b[i]), 0) };
}
export function codes(repeats = true): number[][] {
  const result: number[][] = [];
  for (let n = 0; n < 1296; n++) {
    let v = n;
    const code: number[] = [];
    for (let i = 0; i < 4; i++) {
      code.push(v % 6);
      v = Math.floor(v / 6);
    }
    if (repeats || new Set(code).size === 4) result.push(code);
  }
  return result;
}
export function secret(repeats = true, random = Math.random) {
  const pool = codes(repeats);
  return pool[Math.floor(random() * pool.length)];
}
export function suggestion(history: Row[], repeats = true): number[] | null {
  if (!history.length) return repeats ? [0, 0, 1, 1] : [0, 1, 2, 3];
  const possible = codes(repeats).filter((c) =>
    history.every((h) => {
      const f = feedback(c, h.guess);
      return f.exact === h.exact && f.near === h.near;
    }),
  );
  if (!possible.length) return null;
  if (possible.length === 1) return possible[0];
  let best = possible[0],
    worst = Infinity;
  const sample = possible
    .filter((_, i) => i % Math.max(1, Math.floor(possible.length / 100)) === 0)
    .slice(0, 110);
  for (const guess of sample) {
    const groups = new Map<string, number>();
    for (const code of possible) {
      const f = feedback(code, guess),
        key = f.exact + ":" + f.near;
      groups.set(key, (groups.get(key) || 0) + 1);
    }
    const max = Math.max(...groups.values());
    if (max < worst) {
      worst = max;
      best = guess;
    }
  }
  return best;
}
