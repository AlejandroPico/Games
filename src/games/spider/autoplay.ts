import { move, deal, moving, type State } from "./rules";
export const publicKey = (s: State) =>
  JSON.stringify([
    s.columns.map((c) => c.map((v) => (v.up ? [v.suit, v.rank] : null))),
    s.stock.length,
    s.completed,
  ]);
export function next(s: State, visited: string[]): State | null {
  const candidates: { state: State; value: number }[] = [],
    value = (n: State) =>
      n.completed * 1000 -
      n.columns.flat().filter((c) => !c.up).length * 40 +
      n.columns.reduce(
        (v, c) =>
          v +
          c.filter(
            (x, i) =>
              i > 0 &&
              x.up &&
              c[i - 1].up &&
              x.suit === c[i - 1].suit &&
              x.rank === c[i - 1].rank - 1,
          ).length *
            6,
        0,
      );
  s.columns.forEach((c, pile) =>
    c.forEach((_, index) => {
      if (!moving(s, { pile, index }).length) return;
      for (let to = 0; to < 10; to++) {
        const n = move(s, { pile, index }, to);
        if (n && !visited.includes(publicKey(n)))
          candidates.push({ state: n, value: value(n) });
      }
    }),
  );
  const drawn = deal(s);
  if (drawn && !visited.includes(publicKey(drawn)))
    candidates.push({ state: drawn, value: value(drawn) - 25 });
  return candidates.sort((a, b) => b.value - a.value)[0]?.state || null;
}
