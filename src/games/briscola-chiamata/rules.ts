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
  bid: number;
  bidder: number;
  passed: boolean[];
  called: Card | null;
  partner: number;
  revealed: boolean;
}
export function initial(n = 5): State {
  const stock = shuffled(spanishDeck()),
    hands = deal(stock, n, 8);
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
    bid: 60,
    bidder: -1,
    passed: Array(n).fill(false),
    called: null,
    partner: -1,
    revealed: false,
  };
}
export function effective(c: Card, s: State) {
  return c.suit;
}
export function strength(c: Card, s: State) {
  return [2, 4, 5, 6, 7, 10, 11, 12, 3, 1].indexOf(c.rank);
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
  return h;
}
export function actions(s: State) {
  if (s.winner !== null) return [];

  if (s.phase === "bid")
    return [
      { key: "pass", label: "Pasar la subasta" },
      ...Array.from({ length: 120 - s.bid }, (_, i) => ({
        key: "bid:" + (s.bid + 1 + i),
        label: "Prometer " + (s.bid + 1 + i) + " puntos",
      })),
    ];
  if (s.phase === "call")
    return spanishDeck()
      .filter((c) => !s.hands[s.turn].some((x) => x.id === c.id))
      .map((c) => ({ key: "call:" + c.id, label: "Llamar " + label(c, true) }));
  return legal(s).map((c) => ({
    key: "play:" + c.id,
    label: "Jugar " + label(c, true),
  }));
}
function settle(s: State) {
  const attack = [s.bidder, s.partner],
    total = attack.reduce(
      (v, p) => v + s.taken[p].reduce((v, c) => v + points(c), 0),
      0,
    ),
    win = total >= s.bid;
  s.scores = s.hands.map((_, p) =>
    attack.includes(p) ? (win ? 2 : -2) : win ? -1 : 1,
  );
  s.winner = win ? s.bidder : [0, 1, 2, 3, 4].find((p) => !attack.includes(p))!;
  s.revealed = true;
  s.outcome =
    "Declarante J" +
    (s.bidder + 1) +
    " y socio J" +
    (s.partner + 1) +
    ": " +
    total +
    "/" +
    s.bid +
    " · " +
    (win ? "contrato cumplido" : "gana defensa");
  s.outcome ||= s.winner < 0 ? "Empate" : "Gana J" + (s.winner + 1);
  s.message = s.outcome;
}
export function apply(old: State, key: string): State {
  if (!actions(old).some((a) => a.key === key)) return old;
  const s = clone(old),
    p = s.turn,
    n = s.hands.length;
  s.step++;

  if (s.phase === "bid") {
    if (key === "pass") s.passed[p] = true;
    else {
      s.bid = +key.split(":")[1];
      s.bidder = p;
    }
    const active = s.passed.flatMap((x, i) => (!x ? [i] : []));
    if (!active.length) {
      s.winner = -1;
      s.outcome = "Todos pasan";
    } else if ((active.length === 1 && s.bidder >= 0) || s.bid === 120) {
      s.phase = "call";
      s.turn = s.bidder;
      s.message = "Llama una carta que no poseas";
    } else {
      do {
        s.turn = (s.turn + 1) % n;
      } while (s.passed[s.turn]);
    }
    return s;
  }
  if (s.phase === "call") {
    s.called = spanishDeck().find((c) => c.id === +key.split(":")[1])!;
    s.trump = s.called.suit;
    s.partner = s.hands.findIndex((h) => h.some((c) => c.id === s.called!.id));
    s.phase = "play";
    s.turn = 0;
    s.message = "Juega libremente; no es obligatorio asistir";
    return s;
  }

  const i = s.hands[p].findIndex((c) => c.id === +key.split(":")[1]),
    c = s.hands[p].splice(i, 1)[0];
  s.trick.push({ p, c });
  if (c.id === s.called!.id) s.revealed = true;
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
    const strength = s.hands[s.turn].reduce((v, c) => v + points(c), 0);
    return apply(
      s,
      strength >= 22 && s.bid < 75 ? "bid:" + (s.bid + 1) : "pass",
    );
  }
  if (s.phase === "call") {
    const suit = [0, 1, 2, 3].sort(
        (a, b) =>
          s.hands[s.turn].filter((c) => c.suit === b).length -
          s.hands[s.turn].filter((c) => c.suit === a).length,
      )[0],
      calls = a.filter(
        (a) =>
          spanishDeck().find((c) => c.id === +a.key.split(":")[1])!.suit ===
          suit,
      );
    return apply(
      s,
      (
        calls.sort(
          (a, b) =>
            points(spanishDeck()[+b.key.split(":")[1]]) -
            points(spanishDeck()[+a.key.split(":")[1]]),
        )[0] || a[0]
      ).key,
    );
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
        true,
      ),
    ),
    table: (s.trick.length ? s.trick : s.last).map((x) => ({
      ...display(x.c, "t" + x.p, undefined, true),
      label: "J" + (x.p + 1) + " · " + label(x.c, true),
    })),
    summary:
      "Triunfo " +
      (s.trump >= 0 ? suitName(s.trump, true) : "por elegir") +
      " · " +
      s.tricks.map((x, i) => "J" + (i + 1) + " " + x + " bazas").join(" / "),
    notes: [
      s.outcome || "Fase " + s.phase,
      "Subasta de puntos de 61 a 120. La carta llamada determina triunfo y compañero oculto. Se juega libremente sin obligación de asistir. Edición de subasta numérica; no se usa la variante de subasta de cartas.",
      s.called
        ? "Carta llamada " +
          label(s.called, true) +
          (s.revealed ? " · socio J" + (s.partner + 1) : " · socio por revelar")
        : "Contrato por elegir",
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
