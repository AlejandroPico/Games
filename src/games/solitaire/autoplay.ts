import { move, drawCards, type State, type Source } from "./rules";
export const publicKey = (s: State) =>
  JSON.stringify([
    s.columns.map((c) => c.map((v) => (v.up ? [v.suit, v.rank] : null))),
    s.waste,
    s.foundations,
    s.stock.length,
  ]);
export function next(s: State, visited: string[]): State | null {
  const sources: Source[] = s.columns.flatMap((c, pile) =>
    c.flatMap((v, index) =>
      v.up ? [{ kind: "column" as const, pile, index }] : [],
    ),
  );
  if (s.waste.length)
    sources.push({ kind: "waste", pile: 0, index: s.waste.length - 1 });
  // Choose on a shadow with unknown covered cards, then apply only the chosen action.
  const shadow: State = {
    ...s,
    columns: s.columns.map((c) =>
      c.map((v) => (v.up ? v : { ...v, rank: -1, suit: -1 })),
    ),
    stock: s.stock.map((v) => ({ ...v, rank: -1, suit: -1 })),
  };
  const candidates: { apply: () => State; value: number }[] = [];
  const value = (n: State) =>
    n.foundations.reduce((v, c) => v + c.length * 100, 0) -
    n.columns.flat().filter((c) => !c.up).length * 50 +
    n.columns.filter((c) => !c.length).length * 4;
  for (const a of sources)
    for (const kind of ["foundation", "column"] as const)
      for (let pile = 0; pile < (kind === "column" ? 7 : 4); pile++) {
        const n = move(shadow, a, { kind, pile });
        if (n && !visited.includes(publicKey(n)))
          candidates.push({
            apply: () => move(s, a, { kind, pile })!,
            value: value(n),
          });
      }
  if ((s.stock.length || s.waste.length) && !visited.includes(publicKey(s)))
    candidates.push({ apply: () => drawCards(s), value: value(shadow) - 1 });
  return candidates.sort((a, b) => b.value - a.value)[0]?.apply() || null;
}
