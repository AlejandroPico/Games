import { move, deal, moving, type State } from "./rules";
export const publicKey = (s: State) =>
  JSON.stringify([
    s.columns.map((c) => c.map((v) => (v.up ? [v.suit, v.rank] : null))),
    s.stock.length,
    s.completed,
  ]);
export function next(s: State, visited: string[]): State | null {
  const shadow: State = {
    ...s,
    columns: s.columns.map((c) =>
      c.map((v) => (v.up ? v : { ...v, rank: -1, suit: -1 })),
    ),
    stock: s.stock.map((v) => ({ ...v, rank: -1, suit: -1 })),
  };
  const candidates: { apply: () => State; value: number }[] = [],
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
              x.rank > 0 &&
              c[i - 1].rank > 0 &&
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
        const n = move(shadow, { pile, index }, to);
        if (n && !visited.includes(publicKey(n)))
          candidates.push({
            apply: () => move(s, { pile, index }, to)!,
            value: value(n),
          });
      }
    }),
  );
  if (
    s.stock.length >= 10 &&
    s.columns.every((c) => c.length) &&
    !visited.includes(publicKey(s))
  )
    candidates.push({ apply: () => deal(s)!, value: value(shadow) - 25 });
  return candidates.sort((a, b) => b.value - a.value)[0]?.apply() || null;
}
