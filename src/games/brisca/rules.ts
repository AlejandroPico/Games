import { spanishDeck, shuffled, type Card } from "../../shared/cards";
export type State = {
  hands: Card[][];
  stock: Card[];
  trump: Card | null;
  suit: number;
  turn: number;
  trick: { p: number; card: Card }[];
  scores: number[];
  exchange: boolean;
};
export const points = (c: Card) =>
  (({ 1: 11, 3: 10, 12: 4, 11: 3, 10: 2 }) as Record<number, number>)[c.rank] ||
  0;
export const strength = (c: Card) =>
  [2, 4, 5, 6, 7, 10, 11, 12, 3, 1].indexOf(c.rank);
export function beats(a: Card, b: Card, trump: number) {
  return a.suit === b.suit ? strength(a) > strength(b) : a.suit === trump;
}
export function initial(exchange = false, random = Math.random): State {
  const stock = shuffled(spanishDeck(), random),
    trump = stock.pop()!,
    hands = [stock.splice(-3), stock.splice(-3)];
  return {
    hands,
    stock,
    trump,
    suit: trump.suit,
    turn: 0,
    trick: [],
    scores: [0, 0],
    exchange,
  };
}
export function play(s: State, index: number): State | null {
  if (s.trick.length >= 2 || !s.hands[s.turn][index]) return null;
  const hands = s.hands.map((h) => [...h]),
    card = hands[s.turn].splice(index, 1)[0];
  return {
    ...s,
    hands,
    trick: [...s.trick, { p: s.turn, card }],
    turn: 1 - s.turn,
  };
}
export function winner(s: State) {
  if (s.trick.length !== 2) return -1;
  const [a, b] = s.trick;
  return beats(b.card, a.card, s.suit) ? b.p : a.p;
}
export function exchangeIndex(s: State) {
  const p = winner(s);
  if (!s.exchange || p < 0 || !s.trump || !s.stock.length) return -1;
  const rank = points(s.trump) > 0 ? 7 : 2;
  return s.hands[p].findIndex((c) => c.suit === s.suit && c.rank === rank);
}
export function swap(s: State): State | null {
  const i = exchangeIndex(s),
    p = winner(s);
  if (i < 0 || !s.trump) return null;
  const hands = s.hands.map((h) => [...h]),
    trump = hands[p][i];
  hands[p][i] = s.trump;
  return { ...s, hands, trump };
}
export function collect(s: State): State {
  const p = winner(s);
  if (p < 0) return s;
  const stock = [...s.stock],
    hands = s.hands.map((h) => [...h]),
    scores = [...s.scores];
  let trump = s.trump;
  scores[p] += s.trick.reduce((n, t) => n + points(t.card), 0);
  for (const player of [p, 1 - p]) {
    const c = stock.pop() || trump;
    if (c) {
      hands[player].push(c);
      if (!stock.length && c === trump) trump = null;
    }
  }
  return { ...s, stock, hands, scores, trump, turn: p, trick: [] };
}
export function aiMove(
  hand: Card[],
  lead: Card | undefined,
  trump: number,
): number {
  const options = hand.map((card, i) => ({ card, i }));
  if (lead && points(lead) > 0) {
    const wins = options
      .filter((o) => beats(o.card, lead, trump))
      .sort(
        (a, b) =>
          points(a.card) - points(b.card) ||
          strength(a.card) - strength(b.card),
      );
    if (wins.length) return wins[0].i;
  }
  return (
    options.sort(
      (a, b) =>
        points(a.card) +
          (a.card.suit === trump ? 12 : 0) -
          (points(b.card) + (b.card.suit === trump ? 12 : 0)) ||
        strength(a.card) - strength(b.card),
    )[0]?.i ?? -1
  );
}
