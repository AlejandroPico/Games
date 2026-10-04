import { deck, shuffled, type Card } from "../../shared/cards";
export type State = {
  hands: Card[][];
  stock: Card[];
  up: Card;
  trump: number;
  taker: number;
  turn: number;
  dealer: number;
  bid: number;
  phase: "bid" | "play";
  trick: { player: number; card: Card }[];
  lastTrick: { player: number; card: Card }[];
  points: number[];
  tricks: number[];
  scores: number[];
  belote: number;
  belotePlayed: number;
  winner: number | null;
  ply: number;
  summary: string;
};
const pack = () => shuffled(deck().filter((c) => c.rank === 1 || c.rank >= 7));
export function initial(): State {
  const cards = pack();
  return {
    hands: Array.from({ length: 4 }, () => cards.splice(0, 5)),
    stock: cards.slice(1),
    up: cards[0],
    trump: -1,
    taker: -1,
    turn: 1,
    dealer: 0,
    bid: 0,
    phase: "bid",
    trick: [],
    lastTrick: [],
    points: [0, 0],
    tricks: [0, 0],
    scores: [0, 0],
    belote: -1,
    belotePlayed: 0,
    winner: null,
    ply: 0,
    summary: "",
  };
}
export const strength = (c: Card, trump: number) =>
  (c.suit === trump
    ? [7, 8, 12, 13, 10, 1, 9, 11]
    : [7, 8, 9, 11, 12, 13, 10, 1]
  ).indexOf(c.rank);
export const cardPoints = (c: Card, trump: number) =>
  c.rank === 1
    ? 11
    : c.rank === 10
      ? 10
      : c.rank === 13
        ? 4
        : c.rank === 12
          ? 3
          : c.rank === 11
            ? c.suit === trump
              ? 20
              : 2
            : c.rank === 9 && c.suit === trump
              ? 14
              : 0;
export function winning(trick: State["trick"], trump: number) {
  let best = trick[0];
  for (const t of trick.slice(1))
    if (
      (t.card.suit === best.card.suit &&
        strength(t.card, trump) > strength(best.card, trump)) ||
      (t.card.suit === trump && best.card.suit !== trump)
    )
      best = t;
  return best.player;
}
export function bid(s: State, suit: number): State {
  if (
    s.phase !== "bid" ||
    s.winner !== null ||
    (suit !== -1 && (s.bid < 4 ? suit !== s.up.suit : suit === s.up.suit)) ||
    suit > 3 ||
    suit < -1
  )
    return s;
  const x = structuredClone(s);
  x.ply++;
  if (suit === -1) {
    x.bid++;
    x.turn = (x.turn + 1) % 4;
    if (x.bid === 8) {
      const y = initial();
      return {
        ...y,
        dealer: (s.dealer + 1) % 4,
        turn: (s.dealer + 2) % 4,
        scores: s.scores,
        ply: x.ply,
        summary: "Todos pasan: nuevo reparto.",
      };
    }
    return x;
  }
  x.trump = suit;
  x.taker = x.turn;
  x.hands[x.turn].push(x.up);
  for (let k = 1; k <= 4; k++) {
    const p = (x.dealer + k) % 4;
    x.hands[p].push(...x.stock.splice(0, p === x.taker ? 2 : 3));
  }
  x.stock = [];
  x.turn = (x.dealer + 1) % 4;
  x.phase = "play";
  x.belote = x.hands.findIndex(
    (h) =>
      h.some((c) => c.suit === suit && c.rank === 12) &&
      h.some((c) => c.suit === suit && c.rank === 13),
  );
  return x;
}
export function legal(s: State) {
  const hand = s.hands[s.turn],
    all = hand.map((_, i) => i);
  if (!s.trick.length) return all;
  const suit = s.trick[0].card.suit,
    following = all.filter((i) => hand[i].suit === suit),
    trumps = all.filter((i) => hand[i].suit === s.trump),
    highest = Math.max(
      -1,
      ...s.trick
        .filter((t) => t.card.suit === s.trump)
        .map((t) => strength(t.card, s.trump)),
    ),
    higher = trumps.filter((i) => strength(hand[i], s.trump) > highest);
  if (following.length)
    return suit === s.trump && higher.length ? higher : following;
  const teammate = winning(s.trick, s.trump) % 2 === s.turn % 2;
  if (teammate) return all;
  return trumps.length ? (higher.length ? higher : trumps) : all;
}
export function play(s: State, i: number): State {
  if (s.phase !== "play" || s.winner !== null || !legal(s).includes(i))
    return s;
  const x = structuredClone(s),
    [card] = x.hands[x.turn].splice(i, 1);
  x.trick.push({ player: x.turn, card });
  x.ply++;
  if (
    x.turn === x.belote &&
    card.suit === x.trump &&
    (card.rank === 12 || card.rank === 13)
  )
    x.belotePlayed++;
  x.turn = (x.turn + 1) % 4;
  if (x.trick.length === 4) {
    const win = winning(x.trick, x.trump);
    x.points[win % 2] += x.trick.reduce(
      (v, t) => v + cardPoints(t.card, x.trump),
      0,
    );
    x.tricks[win % 2]++;
    x.turn = win;
    x.lastTrick = x.trick;
    x.trick = [];
    if (x.hands.every((h) => !h.length)) {
      x.points[win % 2] += 10;
      const capot = x.tricks.findIndex((n) => n === 8);
      if (capot >= 0) x.points[capot] += 90;
      const bonus = [0, 0];
      if (x.belote >= 0 && x.belotePlayed === 2) bonus[x.belote % 2] = 20;
      const taking = x.taker % 2,
        other = 1 - taking,
        earned = x.points.map((v, j) => v + bonus[j]);
      if (earned[taking] < earned[other]) {
        earned[other] = x.points[0] + x.points[1] + bonus[other];
        earned[taking] = bonus[taking];
      }
      x.scores = x.scores.map((v, j) => v + earned[j]);
      x.summary = `Mano: equipo 1 +${earned[0]}, equipo 2 +${earned[1]}`;
      if (Math.max(...x.scores) >= 501 && x.scores[0] !== x.scores[1])
        x.winner = x.scores[0] > x.scores[1] ? 0 : 1;
      else {
        const y = initial();
        return {
          ...y,
          scores: x.scores,
          summary: x.summary,
          dealer: (x.dealer + 1) % 4,
          turn: (x.dealer + 2) % 4,
          ply: x.ply,
        };
      }
    }
  }
  return x;
}
export function automatic(s: State): State {
  if (s.phase === "bid") {
    const suits =
        s.bid < 4 ? [s.up.suit] : [0, 1, 2, 3].filter((t) => t !== s.up.suit),
      best = suits.sort((a, b) => {
        const weight = (suit: number) =>
          s.hands[s.turn]
            .filter((c) => c.suit === suit)
            .reduce((v, c) => v + cardPoints(c, suit) + 3, 0);
        return weight(b) - weight(a);
      })[0],
      weight = s.hands[s.turn]
        .filter((c) => c.suit === best)
        .reduce((v, c) => v + cardPoints(c, best) + 3, 0);
    return bid(s, weight >= 23 || s.bid === 7 ? best : -1);
  }
  const opts = legal(s);
  let i = opts[0];
  if (s.trick.length) {
    const winners = opts.filter(
      (i) =>
        winning(
          [...s.trick, { player: s.turn, card: s.hands[s.turn][i] }],
          s.trump,
        ) === s.turn,
    );
    if (winners.length)
      i = winners.sort(
        (a, b) =>
          cardPoints(s.hands[s.turn][a], s.trump) -
          cardPoints(s.hands[s.turn][b], s.trump),
      )[0];
    else
      i = opts.sort(
        (a, b) =>
          cardPoints(s.hands[s.turn][a], s.trump) -
          cardPoints(s.hands[s.turn][b], s.trump),
      )[0];
  }
  return play(s, i);
}
