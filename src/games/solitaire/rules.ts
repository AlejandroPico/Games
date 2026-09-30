export type Card = { suit: number; rank: number; up: boolean };
export type State = {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  columns: Card[][];
  draw: 1 | 3;
};
export type Source = {
  kind: "column" | "waste" | "foundation";
  pile: number;
  index: number;
};
export type Target = { kind: "column" | "foundation"; pile: number };
export type Hint =
  | { source: Source; target: Target }
  | "draw"
  | "recycle"
  | null;
export const red = (c: Card) => c.suit === 1 || c.suit === 2;
export function initial(draw: 1 | 3 = 1, random = Math.random): State {
  const deck: Card[] = Array.from({ length: 52 }, (_, i) => ({
    suit: Math.floor(i / 13),
    rank: (i % 13) + 1,
    up: false,
  }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const columns: Card[][] = [];
  for (let i = 0; i < 7; i++) {
    const col = deck.splice(0, i + 1);
    col[col.length - 1] = { ...col[col.length - 1], up: true };
    columns.push(col);
  }
  return {
    stock: deck,
    waste: [],
    foundations: [[], [], [], []],
    columns,
    draw,
  };
}
export function drawCards(s: State): State {
  if (!s.stock.length)
    return s.waste.length
      ? {
          ...s,
          stock: [...s.waste].reverse().map((c) => ({ ...c, up: false })),
          waste: [],
        }
      : s;
  const stock = [...s.stock],
    waste = [...s.waste];
  for (let i = 0; i < s.draw && stock.length; i++)
    waste.push({ ...stock.pop()!, up: true });
  return { ...s, stock, waste };
}
export function moving(s: State, source: Source): Card[] {
  const pile =
    source.kind === "column"
      ? s.columns[source.pile]
      : source.kind === "foundation"
        ? s.foundations[source.pile]
        : s.waste;
  if (!pile || source.index < 0 || source.index >= pile.length) return [];
  if (source.kind !== "column" && source.index !== pile.length - 1) return [];
  const cards = pile.slice(source.index);
  if (cards.some((c) => !c.up)) return [];
  if (
    cards.some(
      (c, i) =>
        i > 0 &&
        (cards[i - 1].rank !== c.rank + 1 || red(cards[i - 1]) === red(c)),
    )
  )
    return [];
  return cards;
}
export function move(s: State, source: Source, target: Target): State | null {
  if (source.kind === target.kind && source.pile === target.pile) return null;
  const cards = moving(s, source);
  if (!cards.length) return null;
  const destination =
    target.kind === "column"
      ? s.columns[target.pile]
      : s.foundations[target.pile];
  if (!destination) return null;
  const top = destination.at(-1),
    first = cards[0];
  if (target.kind === "foundation") {
    if (
      cards.length !== 1 ||
      first.suit !== target.pile ||
      first.rank !== (top ? top.rank + 1 : 1)
    )
      return null;
  } else if (
    top
      ? first.rank !== top.rank - 1 || red(first) === red(top)
      : first.rank !== 13
  )
    return null;
  const next: State = {
    ...s,
    stock: [...s.stock],
    waste: [...s.waste],
    columns: s.columns.map((col) => col.map((c) => ({ ...c }))),
    foundations: s.foundations.map((f) => [...f]),
  };
  const from =
    source.kind === "column"
      ? next.columns[source.pile]
      : source.kind === "foundation"
        ? next.foundations[source.pile]
        : next.waste;
  from.splice(source.index);
  if (source.kind === "column" && from.length) from[from.length - 1].up = true;
  (target.kind === "column"
    ? next.columns[target.pile]
    : next.foundations[target.pile]
  ).push(...cards);
  return next;
}
export function hint(s: State): Hint {
  const sources: Source[] = [];
  if (s.waste.length)
    sources.push({ kind: "waste", pile: 0, index: s.waste.length - 1 });
  s.columns.forEach((col, pile) =>
    col.forEach((c, index) => {
      if (c.up) sources.push({ kind: "column", pile, index });
    }),
  );
  for (const source of sources) {
    const cards = moving(s, source);
    if (cards.length === 1) {
      const target: Target = { kind: "foundation", pile: cards[0].suit };
      if (move(s, source, target)) return { source, target };
    }
  }
  const sorted = sources.sort(
    (a, b) =>
      Number(
        b.kind === "column" &&
          b.index > 0 &&
          !s.columns[b.pile][b.index - 1].up,
      ) -
      Number(
        a.kind === "column" &&
          a.index > 0 &&
          !s.columns[a.pile][a.index - 1].up,
      ),
  );
  for (const source of sorted)
    for (let pile = 0; pile < 7; pile++) {
      if (
        source.kind === "column" &&
        source.index === 0 &&
        !s.columns[pile].length
      )
        continue;
      const target: Target = { kind: "column", pile };
      if (move(s, source, target)) return { source, target };
    }
  return s.stock.length ? "draw" : s.waste.length ? "recycle" : null;
}
export const won = (s: State) => s.foundations.every((f) => f.length === 13);
