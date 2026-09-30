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
  const candidates: { state: State; value: number }[] = [];
  const value = (n: State) =>
    n.foundations.reduce((v, c) => v + c.length * 100, 0) -
    n.columns.flat().filter((c) => !c.up).length * 50 +
    n.columns.filter((c) => !c.length).length * 4;
  for (const a of sources)
    for (const kind of ["foundation", "column"] as const)
      for (let pile = 0; pile < (kind === "column" ? 7 : 4); pile++) {
        const n = move(s, a, { kind, pile });
        if (n && !visited.includes(publicKey(n)))
          candidates.push({ state: n, value: value(n) });
      }
  const drawn = drawCards(s);
  if (publicKey(drawn) !== publicKey(s) && !visited.includes(publicKey(drawn)))
    candidates.push({ state: drawn, value: value(drawn) - 1 });
  return candidates.sort((a, b) => b.value - a.value)[0]?.state || null;
}
