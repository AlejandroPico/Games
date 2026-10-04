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
  original: Card[][];
  trick: { p: number; c: Card }[];
  last: { p: number; c: Card }[];
  results: number[];
  mano: number;
  stake: number;
  raiser: number;
  phase: "play" | "respond";
  offer: "truco" | "envido";
  caller: number;
  resume: number;
  envidoUsed: boolean;
}
export function strength(c: Card) {
  if (c.rank === 1 && c.suit === 2) return 14;
  if (c.rank === 1 && c.suit === 3) return 13;
  if (c.rank === 7 && c.suit === 2) return 12;
  if (c.rank === 7 && c.suit === 0) return 11;
  return (
    {
      3: 10,
      2: 9,
      1: 8,
      12: 7,
      11: 6,
      10: 5,
      7: 4,
      6: 3,
      5: 2,
      4: 1,
    } as Record<number, number>
  )[c.rank];
}
export function envido(h: Card[]) {
  let v = Math.max(...h.map((c) => (c.rank < 10 ? c.rank : 0)));
  for (let i = 0; i < h.length; i++)
    for (let j = i + 1; j < h.length; j++)
      if (h[i].suit === h[j].suit)
        v = Math.max(
          v,
          20 +
            (h[i].rank < 10 ? h[i].rank : 0) +
            (h[j].rank < 10 ? h[j].rank : 0),
        );
  return v;
}
export function initial(): State {
  const h = deal(shuffled(spanishDeck()), 2, 3);
  return {
    turn: 0,
    winner: null,
    scores: [0, 0],
    step: 0,
    message: "Tres cartas; envite y dos bazas para ganar",
    hands: h,
    original: clone(h),
    trick: [],
    last: [],
    results: [],
    mano: 0,
    stake: 1,
    raiser: -1,
    phase: "play",
    offer: "truco",
    caller: -1,
    resume: 0,
    envidoUsed: false,
  };
}
function score(s: State, p: number, v: number) {
  s.scores[p] += v;
  if (s.scores[p] >= 15) {
    s.winner = p;
    s.outcome = "J" + (p + 1) + " alcanza quince tantos";
  }
}
function handEnd(s: State, p: number, v: number) {
  score(s, p, v);
  if (s.winner !== null) return;
  const scores = s.scores,
    step = s.step,
    mano = 1 - s.mano,
    h = deal(shuffled(spanishDeck()), 2, 3);
  Object.assign(s, initial(), {
    scores,
    step,
    mano,
    turn: mano,
    hands: h,
    original: clone(h),
  });
  s.message = "Nuevo reparto; sale J" + (mano + 1);
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "respond")
    return [
      { key: "accept", label: "Quiero" },
      { key: "reject", label: "No quiero" },
    ];
  return [
    ...s.hands[s.turn].map((c) => ({
      key: "play:" + c.id,
      label: "Jugar " + label(c, true),
    })),
    { key: "fold", label: "Irse al mazo" },
    ...(s.stake < 4 && s.raiser !== s.turn
      ? [
          {
            key: "truco",
            label:
              s.stake === 1
                ? "Truco"
                : s.stake === 2
                  ? "Retruco"
                  : "Vale cuatro",
          },
        ]
      : []),
    ...(!s.envidoUsed && !s.results.length && !s.trick.length
      ? [{ key: "envido", label: "Envido · dos tantos" }]
      : []),
  ];
}
function resolved(results: number[], mano: number) {
  if (results.length === 1) return null;
  const [a, b, c] = results;
  if (a >= 0 && (a === b || b < 0)) return a;
  if (a < 0 && b >= 0) return b;
  if (results.length === 2) return null;
  if (a === -1 && b === -1) return c >= 0 ? c : mano;
  if (c < 0) return a >= 0 ? a : mano;
  return c;
}
export function apply(old: State, key: string) {
  if (!actions(old).some((a) => a.key === key)) return old;
  const s = clone(old),
    p = s.turn;
  s.step++;
  if (s.phase === "respond") {
    if (s.offer === "envido") {
      const w =
        envido(s.original[0]) === envido(s.original[1])
          ? s.mano
          : envido(s.original[0]) > envido(s.original[1])
            ? 0
            : 1;
      score(s, key === "accept" ? w : s.caller, key === "accept" ? 2 : 1);
      s.envidoUsed = true;
      s.phase = "play";
      s.turn = s.resume;
      s.message = "Envido resuelto";
    } else if (key === "reject") handEnd(s, s.caller, s.stake);
    else {
      s.stake++;
      s.raiser = s.caller;
      s.phase = "play";
      s.turn = s.resume;
      s.message = "Envite aceptado: " + s.stake + " tantos";
    }
    return s;
  }
  if (key === "truco" || key === "envido") {
    s.offer = key;
    s.caller = p;
    s.resume = p;
    s.turn = 1 - p;
    s.phase = "respond";
    s.message =
      key === "envido"
        ? "Responder Envido"
        : "Responder aumento a " + (s.stake + 1);
    return s;
  }
  if (key === "fold") {
    handEnd(s, 1 - p, s.stake);
    return s;
  }
  const c = s.hands[p].splice(
    s.hands[p].findIndex((c) => c.id === +key.split(":")[1]),
    1,
  )[0];
  s.trick.push({ p, c });
  if (s.trick.length === 2) {
    const [a, b] = s.trick,
      w =
        strength(a.c) === strength(b.c)
          ? -1
          : strength(a.c) > strength(b.c)
            ? a.p
            : b.p;
    s.results.push(w);
    s.last = s.trick;
    s.trick = [];
    const done = resolved(s.results, s.mano);
    if (done !== null) handEnd(s, done, s.stake);
    else {
      s.turn = w < 0 ? a.p : w;
      s.message = "Baza " + (w < 0 ? "parda" : "para J" + (w + 1));
    }
  } else s.turn = 1 - p;
  return s;
}
export function automatic(s: State) {
  const h = s.hands[s.turn],
    a = actions(s);
  if (!a.length) return s;
  if (s.phase === "respond") {
    const v =
      s.offer === "envido"
        ? envido(s.original[s.turn]) >= 25
        : h.some((c) => strength(c) >= 9);
    return apply(s, v ? "accept" : "reject");
  }
  if (!s.envidoUsed && envido(h) >= 28 && a.some((a) => a.key === "envido"))
    return apply(s, "envido");
  if (s.stake === 1 && h.filter((c) => strength(c) >= 10).length >= 2)
    return apply(s, "truco");
  const sorted = [...h].sort((a, b) => strength(a) - strength(b)),
    op = s.trick[0]?.c,
    w = op ? sorted.find((c) => strength(c) > strength(op)) : sorted.at(-1);
  return apply(s, "play:" + (w || sorted[0]).id);
}
export function view(s: State) {
  return {
    hand: s.hands[s.turn].map((c) =>
      display(
        c,
        "h" + c.id,
        s.phase === "play" ? "play:" + c.id : undefined,
        true,
      ),
    ),
    table: (s.trick.length ? s.trick : s.last).map((x) =>
      display(x.c, "t" + x.p, undefined, true),
    ),
    summary:
      "Truco argentino · objetivo 15 · envite " +
      s.stake +
      " · " +
      s.results.map((x) => (x < 0 ? "Parda" : "J" + (x + 1))).join(" / "),
    notes: [
      "Variante argentina sin flor: Envido simple de dos tantos antes de la primera carta; no hay Real/Falta Envido, señas, ni variante uruguaya de muestra. Truco, Retruco y Vale cuatro sí se responden en el puesto rival.",
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
