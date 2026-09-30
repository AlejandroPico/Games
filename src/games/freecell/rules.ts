import { deck, shuffled, red, type Card } from "../../shared/cards";
export type State = {
  columns: Card[][];
  cells: (Card | null)[];
  foundations: Card[][];
};
export type Source = {
  kind: "column" | "cell" | "foundation";
  pile: number;
  index: number;
};
export type Target = { kind: "column" | "cell" | "foundation"; pile: number };
export function initial(random = Math.random): State {
  const cards = shuffled(deck(), random),
    columns: Card[][] = Array.from({ length: 8 }, () => []);
  cards.forEach((c, i) => columns[i % 8].push(c));
  return {
    columns,
    cells: Array(4).fill(null),
    foundations: Array.from({ length: 4 }, () => []),
  };
}
export function moving(s: State, a: Source): Card[] {
  if (a.kind === "cell") return s.cells[a.pile] ? [s.cells[a.pile]!] : [];
  const pile = (a.kind === "column" ? s.columns : s.foundations)[a.pile];
  if (
    !pile ||
    a.index < 0 ||
    a.index >= pile.length ||
    (a.kind === "foundation" && a.index !== pile.length - 1)
  )
    return [];
  const cs = pile.slice(a.index);
  return cs.every(
    (c, i) =>
      !i || (cs[i - 1].rank === c.rank + 1 && red(cs[i - 1]) !== red(c)),
  )
    ? cs
    : [];
}
export function capacity(s: State, to: number): number {
  return (
    (s.cells.filter((c) => !c).length + 1) *
    2 ** s.columns.filter((c, i) => !c.length && i !== to).length
  );
}
export function move(s: State, a: Source, t: Target): State | null {
  if (a.kind === t.kind && a.pile === t.pile) return null;
  const cs = moving(s, a);
  if (!cs.length || t.pile < 0 || t.pile >= (t.kind === "column" ? 8 : 4))
    return null;
  if (t.kind === "cell") {
    if (cs.length !== 1 || s.cells[t.pile]) return null;
  } else if (t.kind === "foundation") {
    const f = s.foundations[t.pile];
    if (
      cs.length !== 1 ||
      cs[0].suit !== t.pile ||
      cs[0].rank !== (f.at(-1)?.rank || 0) + 1
    )
      return null;
  } else {
    const top = s.columns[t.pile].at(-1);
    if (
      cs.length > capacity(s, t.pile) ||
      (top && (top.rank !== cs[0].rank + 1 || red(top) === red(cs[0])))
    )
      return null;
  }
  const n = {
    columns: s.columns.map((c) => [...c]),
    cells: [...s.cells],
    foundations: s.foundations.map((c) => [...c]),
  };
  if (a.kind === "cell") n.cells[a.pile] = null;
  else
    (a.kind === "column" ? n.columns : n.foundations)[a.pile].splice(a.index);
  if (t.kind === "cell") n.cells[t.pile] = cs[0];
  else (t.kind === "column" ? n.columns : n.foundations)[t.pile].push(...cs);
  return n;
}
export function hint(s: State): { source: Source; target: Target } | null {
  const sources: Source[] = [];
  s.columns.forEach((col, pile) =>
    col.forEach((_, index) => {
      if (moving(s, { kind: "column", pile, index }).length)
        sources.push({ kind: "column", pile, index });
    }),
  );
  s.cells.forEach((c, pile) => {
    if (c) sources.push({ kind: "cell", pile, index: 0 });
  });
  for (const kind of ["foundation", "column", "cell"] as const)
    for (const source of sources)
      for (let pile = 0; pile < (kind === "column" ? 8 : 4); pile++) {
        if (
          kind === "column" &&
          !s.columns[pile].length &&
          source.kind === "column" &&
          source.index === 0
        )
          continue;
        const target = { kind, pile };
        if (move(s, source, target)) return { source, target };
      }
  return null;
}
