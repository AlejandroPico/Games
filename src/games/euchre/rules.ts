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
  bidRound: number;
  up: Card;
  bidder: number;
  dealer: number;
}
export function initial(n = 4): State {
  const stock = shuffled(deck().filter((c) => c.rank === 1 || c.rank >= 9)),
    hands = deal(stock, n, 5);
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
    trump: -1,
    lead: 0,
    bidRound: 0,
    up: stock[0],
    bidder: -1,
    dealer: 3,
  };
}
export function effective(c: Card, s: State) {
  return c.rank === 11 && c.suit === [3, 2, 1, 0][s.trump] ? s.trump : c.suit;
}
export function strength(c: Card, s: State) {
  if (c.rank === 11 && c.suit === s.trump) return 30;
  if (c.rank === 11 && effective(c, s) === s.trump) return 29;
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
    return [
      { key: "pass", label: "Pasar" },
      ...(s.bidRound === 0
        ? [
            {
              key: "trump:" + s.up.suit,
              label: "Ordenar " + suitName(s.up.suit),
            },
          ]
        : [0, 1, 2, 3]
            .filter((k) => k !== s.up.suit)
            .map((k) => ({
              key: "trump:" + k,
              label: "Elegir " + suitName(k),
            }))),
    ];
  if (s.phase === "discard")
    return s.hands[s.turn].map((c, i) => ({
      key: "discard:" + i,
      label: "Descartar " + label(c),
    }));

  return legal(s).map((c) => ({
    key: "play:" + c.id,
    label: "Jugar " + label(c, false),
  }));
}
function settle(s: State) {
  const t = s.bidder % 2,
    won = s.tricks[t] + s.tricks[t + 2],
    team = [0, 0];
  team[won >= 3 ? t : 1 - t] = won === 5 ? 2 : won >= 3 ? 1 : 2;
  s.scores = s.scores.map((_, p) => team[p % 2]);
  s.winner = team[0] > team[1] ? 0 : 1;
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
    if (key === "pass") {
      s.turn = (p + 1) % 4;
      if (s.turn === 0) {
        s.bidRound++;
        if (s.bidRound >= 2) {
          s.winner = -1;
          s.outcome = "Todos pasan: reparto sin contrato";
        }
      }
    } else {
      s.trump = +key.split(":")[1];
      s.bidder = p;
      if (s.bidRound === 0) {
        s.hands[s.dealer].push(s.stock.shift()!);
        s.phase = "discard";
        s.turn = s.dealer;
        s.message = "El repartidor descarta una carta";
      } else {
        s.phase = "play";
        s.turn = 0;
        s.message = "Juega: la sota del mismo color pertenece al triunfo";
      }
    }
    return s;
  }
  if (s.phase === "discard") {
    s.hands[p].splice(+key.split(":")[1], 1);
    s.phase = "play";
    s.turn = 0;
    s.message = "Juega una carta";
    return s;
  }

  const i = s.hands[p].findIndex((c) => c.id === +key.split(":")[1]),
    c = s.hands[p].splice(i, 1)[0];
  s.trick.push({ p, c });
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
    const choices = a
      .filter((a) => a.key !== "pass")
      .map((a) => {
        const trump = +a.key.split(":")[1],
          h = s.hands[s.turn];
        return {
          key: a.key,
          v: h.reduce(
            (v, c) =>
              v +
              (effective(c, { ...s, trump }) === trump
                ? strength(c, { ...s, trump }) / 10
                : high(c) === 14
                  ? 0.7
                  : 0),
            0,
          ),
        };
      })
      .sort((a, b) => b.v - a.v);
    return apply(s, choices[0].v >= 3 ? choices[0].key : "pass");
  }
  if (s.phase === "discard")
    return apply(
      s,
      "discard:" +
        s.hands[s.turn]
          .map((c, i) => ({
            i,
            v: effective(c, s) === s.trump ? 30 + strength(c, s) : high(c),
          }))
          .sort((a, b) => a.v - b.v)[0].i,
    );

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
      "Triunfo " +
      (s.trump >= 0 ? suitName(s.trump, false) : "por elegir") +
      " · " +
      s.tricks.map((x, i) => "J" + (i + 1) + " " + x + " bazas").join(" / "),
    notes: [
      s.outcome || "Fase " + s.phase,
      "Una mano de Euchre por parejas, cinco bazas. Dos rondas de elección de triunfo; dealer recoge la carta si se ordena. Sota derecha y del mismo color son triunfos altos. Sin modalidad de jugar solo.",
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
