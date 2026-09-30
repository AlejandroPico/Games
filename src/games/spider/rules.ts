import { shuffled, deck, type Card } from "../../shared/cards";
export type State = {
  columns: Card[][];
  stock: Card[];
  completed: number;
  suits: 1 | 2 | 4;
};
export type Source = { pile: number; index: number };
export function initial(suits: 1 | 2 | 4 = 1, random = Math.random): State {
  const cards = shuffled(
      [...deck(), ...deck()].map((c, i) => ({
        ...c,
        id: i,
        suit: suits === 1 ? 0 : suits === 2 ? c.suit % 2 : c.suit,
        up: false,
      })),
      random,
    ),
    columns: Card[][] = [];
  for (let i = 0; i < 10; i++) {
    const col = cards.splice(0, i < 4 ? 6 : 5);
    col.at(-1)!.up = true;
    columns.push(col);
  }
  return { columns, stock: cards, completed: 0, suits };
}
export function moving(s: State, source: Source): Card[] {
  const pile = s.columns[source.pile];
  if (!pile || source.index < 0 || source.index >= pile.length) return [];
  const cs = pile.slice(source.index);
  return cs.every(
    (c, i) =>
      c.up &&
      (!i || (cs[i - 1].rank === c.rank + 1 && cs[i - 1].suit === c.suit)),
  )
    ? cs
    : [];
}
function settle(s: State): State {
  const columns = s.columns.map((c) => c.map((v) => ({ ...v })));
  let completed = s.completed;
  for (const col of columns) {
    while (col.length) {
      col.at(-1)!.up = true;
      const last = col.slice(-13);
      if (
        last.length !== 13 ||
        !last.every(
          (c, i) => c.up && c.suit === last[0].suit && c.rank === 13 - i,
        )
      )
        break;
      col.splice(-13);
      completed++;
    }
  }
  return { ...s, columns, completed };
}
export function move(s: State, source: Source, to: number): State | null {
  if (source.pile === to || !s.columns[to]) return null;
  const cs = moving(s, source),
    dest = s.columns[to];
  if (!cs.length || (dest.length && dest.at(-1)!.rank !== cs[0].rank + 1))
    return null;
  const columns = s.columns.map((c) => [...c]);
  columns[source.pile].splice(source.index);
  columns[to].push(...cs);
  return settle({ ...s, columns });
}
export function deal(s: State): State | null {
  if (s.stock.length < 10 || s.columns.some((c) => !c.length)) return null;
  const stock = [...s.stock],
    columns = s.columns.map((c) => [...c, { ...stock.pop()!, up: true }]);
  return settle({ ...s, stock, columns });
}
export function hint(s: State): { source: Source; to: number } | null {
  const candidates: { source: Source; to: number; score: number }[] = [];
  s.columns.forEach((col, pile) =>
    col.forEach((_, index) => {
      if (!moving(s, { pile, index }).length) return;
      for (let to = 0; to < 10; to++)
        if (move(s, { pile, index }, to)) {
          if (index === 0 && !s.columns[to].length) continue;
          const dest = s.columns[to].at(-1);
          candidates.push({
            source: { pile, index },
            to,
            score:
              (index > 0 && !col[index - 1].up ? 20 : 0) +
              (dest?.suit === col[index].suit ? 10 : 0) +
              (13 - index),
          });
        }
    }),
  );
  return candidates.sort((a, b) => b.score - a.score)[0] || null;
}
