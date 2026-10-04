import { spanishDeck, shuffled, type Card } from "../../shared/cards";
export type State = {
  hands: Card[][];
  table: Card[];
  stock: Card[];
  captured: Card[][];
  sweeps: number[];
  scores: number[];
  turn: number;
  dealer: number;
  last: number;
  winner: number | null;
  ply: number;
  round: number;
  target: number;
  summary: string;
};
export const value = (c: Card) => (c.rank > 7 ? c.rank - 2 : c.rank);
export function initial(n: number, target = 21): State {
  return deal({
    hands: Array.from({ length: n }, () => []),
    table: [],
    stock: [],
    captured: Array.from({ length: n }, () => []),
    sweeps: Array(n).fill(0),
    scores: Array(n).fill(0),
    turn: 0,
    dealer: n - 1,
    last: n - 1,
    winner: null,
    ply: 0,
    round: 0,
    target,
    summary: "",
  });
}
function deal(s: State): State {
  const x = structuredClone(s),
    n = x.hands.length;
  x.dealer = (x.dealer + 1) % n;
  x.turn = (x.dealer + 1) % n;
  x.last = x.dealer;
  x.stock = shuffled(spanishDeck());
  x.table = x.stock.splice(0, 4);
  x.hands = Array.from({ length: n }, () => x.stock.splice(0, 3));
  x.captured = Array.from({ length: n }, () => []);
  x.sweeps = Array(n).fill(0);
  x.round++;
  const sum = x.table.reduce((v, c) => v + value(c), 0);
  if (sum === 15 || sum === 30) {
    x.captured[x.dealer] = x.table;
    x.table = [];
    x.sweeps[x.dealer] = sum / 15;
  }
  return x;
}
export function combinations(table: Card[], card: Card): number[][] {
  const result: number[][] = [],
    target = 15 - value(card);
  const visit = (i: number, sum: number, picks: number[]) => {
    if (sum === target) {
      result.push(picks);
      return;
    }
    if (sum > target) return;
    for (let k = i; k < table.length; k++)
      visit(k + 1, sum + value(table[k]), [...picks, k]);
  };
  visit(0, 0, []);
  return result.filter((r) => r.length > 0);
}
export function move(s: State, hand: number, picks: number[]): State {
  if (s.winner !== null || !s.hands[s.turn][hand]) return s;
  const choices = combinations(s.table, s.hands[s.turn][hand]);
  if (
    (choices.length &&
      !choices.some(
        (c) => c.length === picks.length && c.every((i) => picks.includes(i)),
      )) ||
    (!choices.length && picks.length)
  )
    return s;
  const x = structuredClone(s),
    [card] = x.hands[x.turn].splice(hand, 1);
  if (picks.length) {
    x.captured[x.turn].push(
      card,
      ...x.table.filter((_, i) => picks.includes(i)),
    );
    x.table = x.table.filter((_, i) => !picks.includes(i));
    x.last = x.turn;
    if (!x.table.length) x.sweeps[x.turn]++;
  } else x.table.push(card);
  x.turn = (x.turn + 1) % x.hands.length;
  x.ply++;
  if (x.hands.every((h) => !h.length)) {
    if (x.stock.length) x.hands = x.hands.map(() => x.stock.splice(0, 3));
    else {
      x.captured[x.last].push(...x.table);
      x.table = [];
      const points = [...x.sweeps];
      for (const metric of [
        (h: Card[]) => h.length,
        (h: Card[]) => h.filter((c) => c.suit === 0).length,
        (h: Card[]) => h.filter((c) => c.rank === 7).length,
      ]) {
        const counts = x.captured.map(metric),
          max = Math.max(...counts);
        if (counts.filter((v) => v === max).length === 1)
          points[counts.indexOf(max)]++;
      }
      x.captured.forEach((h, i) => {
        if (h.some((c) => c.rank === 7 && c.suit === 0)) points[i]++;
      });
      x.scores = x.scores.map((v, i) => v + points[i]);
      x.summary = `Mano ${x.round}: ${points.map((v, i) => `J${i + 1} +${v}`).join(" · ")}`;
      const max = Math.max(...x.scores);
      if (max >= x.target && x.scores.filter((v) => v === max).length === 1)
        x.winner = x.scores.indexOf(max);
      else return deal(x);
    }
  }
  return x;
}
export function automatic(s: State): State {
  let best = { hand: 0, picks: [] as number[] },
    score = -Infinity;
  s.hands[s.turn].forEach((c, hand) => {
    const options = combinations(s.table, c);
    for (const picks of options.length ? options : [[]]) {
      const cards = [c, ...picks.map((i) => s.table[i])],
        v = picks.length
          ? cards.length +
            cards.filter((c) => c.suit === 0).length * 2 +
            cards.filter((c) => c.rank === 7).length * 4 +
            (cards.some((c) => c.rank === 7 && c.suit === 0) ? 10 : 0) +
            (picks.length === s.table.length ? 12 : 0)
          : -value(c) * 0.05;
      if (v > score) {
        score = v;
        best = { hand, picks };
      }
    }
  });
  return move(s, best.hand, best.picks);
}
