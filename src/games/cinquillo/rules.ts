import { spanishDeck, shuffled, type Card } from "../../shared/cards";
export const order = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
export type State = {
  hands: Card[][];
  table: Card[];
  turn: number;
  winner: number | null;
  ply: number;
};
export function initial(n: number): State {
  const hands: Card[][] = Array.from({ length: n }, () => []);
  shuffled(spanishDeck()).forEach((c, i) => hands[i % n].push(c));
  return {
    hands,
    table: [],
    turn: hands.findIndex((h) => h.some((c) => c.suit === 0 && c.rank === 5)),
    winner: null,
    ply: 0,
  };
}
export function legal(s: State): number[] {
  return s.hands[s.turn].flatMap((c, i) => {
    if (!s.table.length) return c.suit === 0 && c.rank === 5 ? [i] : [];
    const suit = s.table.filter((t) => t.suit === c.suit),
      r = order.indexOf(c.rank);
    return c.rank === 5 ||
      suit.some((t) => Math.abs(order.indexOf(t.rank) - r) === 1)
      ? [i]
      : [];
  });
}
export function move(s: State, i: number): State {
  if (
    s.winner !== null ||
    (i === -1 && legal(s).length) ||
    (i !== -1 && !legal(s).includes(i))
  )
    return s;
  const x = structuredClone(s);
  if (i >= 0) {
    const [c] = x.hands[x.turn].splice(i, 1);
    x.table.push(c);
    if (!x.hands[x.turn].length) x.winner = x.turn;
  }
  x.turn = (x.turn + 1) % x.hands.length;
  x.ply++;
  return x;
}
export function automatic(s: State): State {
  const list = legal(s).sort((a, b) => {
    const weight = (i: number) =>
      s.hands[s.turn].filter((c) => c.suit === s.hands[s.turn][i].suit).length;
    return weight(b) - weight(a);
  });
  return move(s, list.length ? list[0] : -1);
}
