import {
  deck,
  spanishDeck,
  shuffled,
  clone,
  display,
  deal,
  best,
  high,
  points,
  label,
  suitName,
  deadwood,
  meldMasks,
  type Card,
} from "../../shared/cardData";
import type { CardEngine } from "../../shared/CardTable";

export interface State {
  turn: number;
  winner: number | null;
  scores: number[];
  step: number;
  message: string;
  outcome?: string;
  hands: Card[][];
  kept: Card[][];
  crib: Card[];
  starter: Card;
  stock: Card[];
  phase: "discard" | "peg";
  sequence: Card[];
  count: number;
  go: boolean[];
  lastPlayer: number;
  dealer: number;
  last: Card[];
  round: number;
}
const pip = (c: Card) => Math.min(c.rank, 10);
export function handScore(hand: Card[], starter: Card, crib = false) {
  const h = [...hand, starter];
  let score = 0;
  for (let m = 1; m < 32; m++) {
    const cs = h.filter((_, i) => m & (2 ** i));
    if (cs.reduce((v, c) => v + pip(c), 0) === 15) score += 2;
  }
  for (let i = 0; i < 5; i++)
    for (let j = i + 1; j < 5; j++) if (h[i].rank === h[j].rank) score += 2;
  let longest = 0,
    runs = 0;
  for (let m = 1; m < 32; m++) {
    const rs = h
      .filter((_, i) => m & (2 ** i))
      .map((c) => c.rank)
      .sort((a, b) => a - b);
    if (rs.length >= 3 && rs.every((r, i) => !i || r === rs[i - 1] + 1)) {
      if (rs.length > longest) {
        longest = rs.length;
        runs = 1;
      } else if (rs.length === longest) runs++;
    }
  }
  score += longest * runs;
  const flush = hand.every((c) => c.suit === hand[0].suit);
  if (flush && (!crib || starter.suit === hand[0].suit))
    score += starter.suit === hand[0].suit ? 5 : 4;
  if (hand.some((c) => c.rank === 11 && c.suit === starter.suit)) score++;
  return score;
}
export function pegScore(sequence: Card[]) {
  const sum = sequence.reduce((v, c) => v + pip(c), 0);
  let score = sum === 15 || sum === 31 ? 2 : 0;
  const tail = sequence.at(-1)!;
  let same = 0;
  for (
    let i = sequence.length - 1;
    i >= 0 && sequence[i].rank === tail.rank;
    i--
  )
    same++;
  score += same === 2 ? 2 : same === 3 ? 6 : same === 4 ? 12 : 0;
  for (let n = sequence.length; n >= 3; n--) {
    const r = sequence
      .slice(-n)
      .map((c) => c.rank)
      .sort((a, b) => a - b);
    if (r.every((v, i) => !i || v === r[i - 1] + 1)) {
      score += n;
      break;
    }
  }
  return score;
}
export function initial(): State {
  const stock = shuffled(deck()),
    hands = deal(stock, 2, 6);
  return {
    turn: 0,
    winner: null,
    scores: [0, 0],
    step: 0,
    message: "Descarta dos cartas al crib del repartidor",
    hands,
    kept: [],
    crib: [],
    starter: stock.pop()!,
    stock,
    phase: "discard",
    sequence: [],
    count: 0,
    go: [false, false],
    lastPlayer: -1,
    dealer: 1,
    last: [],
    round: 1,
  };
}
function add(s: State, p: number, v: number) {
  s.scores[p] += v;
  if (s.scores[p] >= 121) {
    s.winner = p;
    s.outcome = "J" + (p + 1) + " llega a 121";
  }
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "discard")
    return s.hands[s.turn].map((c, i) => ({
      key: "discard:" + i,
      label: "Al crib: " + label(c),
    }));
  const a = s.hands[s.turn]
    .filter((c) => s.count + pip(c) <= 31)
    .map((c) => ({
      key: "play:" + c.id,
      label: "Jugar " + label(c) + " · total " + (s.count + pip(c)),
    }));
  return a.length ? a : [{ key: "go", label: "Go: no puedo jugar" }];
}
function show(s: State) {
  for (const p of [1 - s.dealer, s.dealer]) {
    add(s, p, handScore(s.kept[p], s.starter));
    if (s.winner !== null) return;
  }
  add(s, s.dealer, handScore(s.crib, s.starter, true));
  if (s.winner !== null) return;
  const scores = s.scores,
    step = s.step,
    dealer = 1 - s.dealer,
    round = s.round + 1;
  Object.assign(s, initial(), {
    scores,
    step,
    dealer,
    turn: 1 - dealer,
    round,
  });
  s.message =
    "Reparto " + round + " · descarta dos al crib de J" + (dealer + 1);
}
function resetCount(s: State) {
  if (s.count !== 31 && s.lastPlayer >= 0) add(s, s.lastPlayer, 1);
  s.last = clone(s.sequence);
  s.sequence = [];
  s.count = 0;
  s.go = [false, false];
  if (s.winner !== null) return;
  if (!s.hands.some((h) => h.length)) {
    show(s);
    return;
  }
  s.turn = s.hands[1 - s.lastPlayer].length ? 1 - s.lastPlayer : s.lastPlayer;
}
export function apply(old: State, key: string) {
  if (!actions(old).some((a) => a.key === key)) return old;
  const s = clone(old),
    p = s.turn;
  s.step++;
  if (s.phase === "discard") {
    s.crib.push(s.hands[p].splice(+key.split(":")[1], 1)[0]);
    if (s.hands[p].length === 4) {
      if (s.crib.length === 4) {
        s.kept = clone(s.hands);
        s.phase = "peg";
        s.turn = 1 - s.dealer;
        if (s.starter.rank === 11) add(s, s.dealer, 2);
        s.message = "Pegging: juega sin superar 31";
      } else s.turn = 1 - p;
    }
    return s;
  }
  if (key === "go") {
    s.go[p] = true;
    if (s.go[1 - p] || !s.hands[1 - p].length) resetCount(s);
    else s.turn = 1 - p;
    return s;
  }
  const i = s.hands[p].findIndex((c) => c.id === +key.split(":")[1]),
    c = s.hands[p].splice(i, 1)[0];
  s.sequence.push(c);
  s.count += pip(c);
  s.lastPlayer = p;
  add(s, p, pegScore(s.sequence));
  if (s.winner !== null) return s;
  if (s.count === 31 || !s.hands.some((h) => h.length)) resetCount(s);
  else if (s.hands[1 - p].length && !s.go[1 - p]) s.turn = 1 - p;
  else if (!s.hands[p].some((c) => s.count + pip(c) <= 31)) resetCount(s);
  s.message = "Cuenta " + s.count + " · no superar 31";
  return s;
}
export function automatic(s: State) {
  const a = actions(s);
  if (!a.length) return s;
  if (s.phase === "discard") {
    const h = s.hands[s.turn];
    let win = 0,
      v = -999;
    for (let i = 0; i < h.length; i++) {
      const rest = h.filter((_, j) => i !== j);
      const value =
        rest.reduce(
          (v, c, j) =>
            v +
            rest
              .slice(j + 1)
              .filter((x) => x.rank === c.rank || pip(x) + pip(c) === 15)
              .length *
              2,
          0,
        ) +
        (s.turn === s.dealer
          ? pip(h[i]) === 5
            ? 2
            : 0
          : pip(h[i]) === 5
            ? -3
            : 0);
      if (value > v) {
        v = value;
        win = i;
      }
    }
    return apply(s, "discard:" + win);
  }
  const plays = a
    .filter((a) => a.key.startsWith("play:"))
    .map((a) => {
      const c = s.hands[s.turn].find((c) => c.id === +a.key.split(":")[1])!;
      return { key: a.key, v: pegScore([...s.sequence, c]) * 20 - pip(c) };
    })
    .sort((a, b) => b.v - a.v);
  return apply(s, (plays[0] || a[0]).key);
}
export function view(s: State) {
  return {
    hand: s.hands[s.turn].map((c, i) =>
      display(
        c,
        "h" + c.id,
        s.phase === "discard"
          ? "discard:" + i
          : actions(s).find((a) => a.key === "play:" + c.id)?.key,
      ),
    ),
    table: [
      ...(s.phase === "peg" ? [display(s.starter, "starter")] : []),
      ...(s.sequence.length ? s.sequence : s.last).map((c, i) =>
        display(c, "p" + i),
      ),
    ],
    summary:
      "Cribbage a 121 · reparto " +
      s.round +
      " · crib J" +
      (s.dealer + 1) +
      " · cuenta " +
      s.count,
    notes: [
      "Cribbage de dos completo: seis cartas, descarte de dos, starter y heels; pegging con 15,31, parejas, tríos, póquer, carreras y go. Recuento automático de manos y crib: quincenas, parejas, carreras con multiplicidad, flush y nobs. No hay muggins ni reclamación manual.",
      s.outcome || s.message,
    ],
  };
}

export const engine: CardEngine<State> = {
  initial,
  actions,
  apply,
  automatic,
  view,
};
