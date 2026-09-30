import { move, moving, type State, type Source } from "./rules";
export const publicKey = (s: State) => JSON.stringify(s);
export function next(s: State, visited: string[]): State | null {
  const sources: Source[] = s.columns.flatMap((c, pile) =>
    c.flatMap((_, index) =>
      moving(s, { kind: "column", pile, index }).length
        ? [{ kind: "column" as const, pile, index }]
        : [],
    ),
  );
  s.cells.forEach((c, pile) => {
    if (c) sources.push({ kind: "cell", pile, index: 0 });
  });
  const candidates: { state: State; value: number }[] = [],
    value = (n: State) =>
      n.foundations.reduce((v, c) => v + c.length * 100, 0) +
      n.cells.filter((c) => !c).length * 5 +
      n.columns.filter((c) => !c.length).length * 8;
  for (const a of sources)
    for (const kind of ["foundation", "column", "cell"] as const)
      for (let pile = 0; pile < (kind === "column" ? 8 : 4); pile++) {
        const n = move(s, a, { kind, pile });
        if (n && !visited.includes(publicKey(n)))
          candidates.push({ state: n, value: value(n) });
      }
  return candidates.sort((a, b) => b.value - a.value)[0]?.state || null;
}
