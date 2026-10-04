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
  broken: boolean;
  passed: Card[][];
  selected: number[][];
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
    phase: "pass",
    trump: -1,
    lead: 0,
    broken: false,
    passed: Array.from({ length: n }, () => []),
    selected: Array.from({ length: n }, () => []),
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
    if (!s.last.length) return h.filter((c) => c.suit === 3 && c.rank === 2);
    if (!s.broken && h.some((c) => c.suit !== 1))
      return h.filter((c) => c.suit !== 1);
    return h;
  }
  const led = effective(s.trick[0].c, s),
    follow = h.filter((c) => effective(c, s) === led);
  let out = follow.length ? follow : h;
  if (
    !s.last.length &&
    !follow.length &&
    out.some((c) => c.suit !== 1 && !(c.suit === 0 && c.rank === 12))
  )
    out = out.filter((c) => c.suit !== 1 && !(c.suit === 0 && c.rank === 12));
  return out;
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "pass")
    return [
      ...s.hands[s.turn].map((c, i) => ({
        key: "select:" + i,
        label:
          (s.selected[s.turn].includes(i) ? "Quitar " : "Seleccionar ") +
          label(c),
      })),
      ...(s.selected[s.turn].length === 3
        ? [{ key: "pass", label: "Pasar tres cartas a la izquierda" }]
        : []),
    ];

  return legal(s).map((c) => ({
    key: "play:" + c.id,
    label: "Jugar " + label(c, false),
  }));
}
function settle(s: State) {
  const p = s.taken.map((h) =>
      h.reduce(
        (v, c) =>
          v + (c.suit === 1 ? 1 : c.suit === 0 && c.rank === 12 ? 13 : 0),
        0,
      ),
    ),
    moon = p.indexOf(26);
  s.scores = moon < 0 ? p : p.map((_, i) => (i === moon ? 0 : 26));
  s.winner = best(s.scores, true);
  s.outcome ||= s.winner < 0 ? "Empate" : "Gana J" + (s.winner + 1);
  s.message = s.outcome;
}
export function apply(old: State, key: string): State {
  if (!actions(old).some((a) => a.key === key)) return old;
  const s = clone(old),
    p = s.turn,
    n = s.hands.length;
  s.step++;
  if (s.phase === "pass") {
    if (key === "pass") {
      s.passed[p] = s.selected[p].map((i) => s.hands[p][i]);
      s.hands[p] = s.hands[p].filter((_, i) => !s.selected[p].includes(i));
      s.turn = (p + 1) % n;
      if (s.turn === 0) {
        for (let i = 0; i < n; i++) s.hands[(i + 1) % n].push(...s.passed[i]);
        s.phase = "play";
        s.turn = s.hands.findIndex((h) =>
          h.some((c) => c.suit === 3 && c.rank === 2),
        );
        s.message = "Comienza el dos de tréboles";
      }
    } else {
      const i = +key.split(":")[1],
        list = s.selected[p];
      if (list.includes(i)) s.selected[p] = list.filter((x) => x !== i);
      else if (list.length < 3) list.push(i);
    }
    return s;
  }

  const i = s.hands[p].findIndex((c) => c.id === +key.split(":")[1]),
    c = s.hands[p].splice(i, 1)[0];
  s.trick.push({ p, c });
  if (c.suit === 1) s.broken = true;
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
  if (s.phase === "pass") {
    if (s.selected[s.turn].length === 3) return apply(s, "pass");
    const choices = s.hands[s.turn]
      .map((c, i) => ({
        i,
        v:
          c.suit === 0 && c.rank === 12
            ? 100
            : c.suit === 1
              ? high(c) + 10
              : high(c),
      }))
      .filter((x) => !s.selected[s.turn].includes(x.i))
      .sort((a, b) => b.v - a.v);
    return apply(s, "select:" + choices[0].i);
  }

  const cards = [...legal(s)];
  cards.sort((a, b) =>
    s.trick.length ? high(b) - high(a) : high(a) - high(b),
  );
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
      "Corazones: evita penalizaciones" +
      " · " +
      s.tricks.map((x, i) => "J" + (i + 1) + " " + x + " bazas").join(" / "),
    notes: [
      s.outcome || "Fase " + s.phase,
      "Se pasan tres cartas a la izquierda antes de jugar. Una mano de trece bazas; corazones 1, dama de picas 13; luna 26 al resto.",
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
