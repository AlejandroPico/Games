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
  stock: Card[];
  trick: { p: number; c: Card }[];
  last: { p: number; c: Card }[];
  taken: Card[][];
  tricks: number[];
  phase: string;
  trump: number;
  lead: number;
  bids: number[];
  bags: number[];
  broken: boolean;
}
export function initial(n = 4): State {
  const stock = shuffled(deck()),
    hands = deal(stock, n, 13);
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Completa la fase inicial",
    hands,
    stock,
    trick: [],
    last: [],
    taken: Array.from({ length: n }, () => []),
    tricks: Array(n).fill(0),
    phase: "bid",
    trump: 0,
    lead: 0,
    bids: Array(n).fill(-1),
    bags: [0, 0],
    broken: false,
  };
}
export function effective(c: Card, s: State) {
  return c.suit;
}
export function strength(c: Card, s: State) {
  return high(c);
}
function trickWinner(s: State) {
  const led = effective(s.trick[0].c, s);
  return s.trick.reduce((w, x) => {
    const ws = effective(w.c, s),
      xs = effective(x.c, s);
    return (xs === s.trump && ws !== s.trump) ||
      (xs === ws && strength(x.c, s) > strength(w.c, s))
      ? x
      : w;
  }).p;
}
export function legal(s: State) {
  const h = s.hands[s.turn];
  if (!s.trick.length) {
    if (!s.broken && h.some((c) => c.suit !== 0))
      return h.filter((c) => c.suit !== 0);
    return h;
  }
  const led = effective(s.trick[0].c, s),
    follow = h.filter((c) => effective(c, s) === led);
  let out = follow.length ? follow : h;
  return out;
}
export function actions(s: State) {
  if (s.winner !== null) return [];

  if (s.phase === "bid")
    return Array.from({ length: 14 }, (_, i) => ({
      key: "bid:" + i,
      label: i ? "Anunciar " + i + " bazas" : "Nil: ninguna baza",
    }));

  return legal(s).map((c) => ({
    key: "play:" + c.id,
    label: "Jugar " + label(c, false),
  }));
}
function settle(s: State) {
  const team = [0, 0];
  for (let t = 0; t < 2; t++) {
    const ps = [t, t + 2],
      bid = ps.reduce((v, p) => v + s.bids[p], 0),
      tricks = ps.reduce((v, p) => v + (s.bids[p] ? s.tricks[p] : 0), 0);
    team[t] = tricks >= bid ? bid * 10 + (tricks - bid) : -bid * 10;
    for (const p of ps) if (!s.bids[p]) team[t] += s.tricks[p] ? -100 : 100;
    s.bags[t] = Math.max(0, tricks - bid);
  }
  s.scores = s.scores.map((_, p) => team[p % 2]);
  s.winner = team[0] === team[1] ? -1 : team[0] > team[1] ? 0 : 1;
  s.outcome ||=
    s.winner < 0
      ? "Empate"
      : "Gana la pareja J" + (s.winner + 1) + "–J" + (s.winner + 3);
  s.message = s.outcome;
}
export function apply(old: State, key: string): State {
  if (!actions(old).some((a) => a.key === key)) return old;
  const s = clone(old),
    p = s.turn,
    n = s.hands.length;
  s.step++;

  if (s.phase === "bid") {
    s.bids[p] = +key.split(":")[1];
    s.turn = (p + 1) % n;
    if (s.turn === 0) {
      s.phase = "play";
      s.message = "Juega una carta: picas siempre triunfa";
    }
    return s;
  }

  const i = s.hands[p].findIndex((c) => c.id === +key.split(":")[1]),
    c = s.hands[p].splice(i, 1)[0];
  s.trick.push({ p, c });
  if (c.suit === 0) s.broken = true;
  if (s.trick.length === n) {
    const w = trickWinner(s);
    s.taken[w].push(...s.trick.map((x) => x.c));
    s.tricks[w]++;
    s.last = s.trick;
    s.trick = [];
    s.turn = w;
    s.lead = w;
    if (!s.hands.some((h) => h.length)) settle(s);
    else s.message = "J" + (w + 1) + " ganó la baza y sale";
  } else s.turn = (p + 1) % n;
  return s;
}
export function automatic(s: State) {
  const a = actions(s);
  if (!a.length) return s;

  if (s.phase === "bid") {
    const h = s.hands[s.turn],
      v = Math.min(
        13,
        Math.max(
          1,
          Math.round(
            h.reduce(
              (v, c) =>
                v +
                (c.suit === 0
                  ? high(c) >= 11
                    ? 1.2
                    : 0.5
                  : high(c) === 14
                    ? 1
                    : high(c) === 13
                      ? 0.5
                      : 0),
              0,
            ),
          ),
        ),
      );
    return apply(s, "bid:" + v);
  }

  const cards = [...legal(s)];
  cards.sort((a, b) => strength(a, s) - strength(b, s));
  if (s.trick.length) {
    const wins = cards.filter(
      (c) =>
        trickWinner({ ...s, trick: [...s.trick, { p: s.turn, c }] }) === s.turn,
    );
    if (wins.length) return apply(s, "play:" + wins[0].id);
  }
  return apply(s, "play:" + cards[0].id);
}
export function view(s: State) {
  return {
    hand: s.hands[s.turn].map((c) =>
      display(
        c,
        "h" + c.id,
        actions(s).find((a) => a.key === "play:" + c.id)?.key,
        false,
      ),
    ),
    table: (s.trick.length ? s.trick : s.last).map((x) => ({
      ...display(x.c, "t" + x.p, undefined, false),
      label: "J" + (x.p + 1) + " · " + label(x.c, false),
    })),
    summary:
      "Picas: contrato por parejas" +
      " · " +
      s.tricks.map((x, i) => "J" + (i + 1) + " " + x + " bazas").join(" / "),
    notes: [
      s.outcome || "Fase " + s.phase,
      "Parejas J1–J3 y J2–J4. Contrato 10 por baza anunciada; bolsas +1. Nil +100/-100. Una mano; no se acumulan bolsas de manos anteriores.",
      s.message,
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
