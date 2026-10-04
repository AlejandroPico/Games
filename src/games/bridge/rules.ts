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
  trick: { p: number; c: Card }[];
  last: { p: number; c: Card }[];
  tricks: number[];
  phase: "auction" | "play";
  bid: number;
  bidder: number;
  passes: number;
  double: number;
  first: number[][];
  declarer: number;
  dummy: number;
  handTurn: number;
  opened: boolean;
  auction: string[];
}
const denominations = [3, 2, 1, 0, -1],
  names = ["Tréboles", "Diamantes", "Corazones", "Picas", "Sin triunfo"];
export function initial(n = 4): State {
  const hands = deal(shuffled(deck()), n, 13);
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Subasta: elige contrato o pasa",
    hands,
    trick: [],
    last: [],
    tricks: Array(n).fill(0),
    phase: "auction",
    bid: -1,
    bidder: -1,
    passes: 0,
    double: 1,
    first: Array.from({ length: 2 }, () => Array(5).fill(-1)),
    declarer: -1,
    dummy: -1,
    handTurn: 0,
    opened: false,
    auction: [],
  };
}
export function legal(s: State) {
  const h = s.hands[s.handTurn];
  if (!s.trick.length) return h;
  const suit = s.trick[0].c.suit,
    follow = h.filter((c) => c.suit === suit);
  return follow.length ? follow : h;
}
function controller(s: State, p: number) {
  return p === s.dummy ? s.declarer : p;
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "auction")
    return [
      { key: "pass", label: "Paso" },
      ...Array.from({ length: 35 - s.bid - 1 }, (_, i) => {
        const bid = s.bid + i + 1;
        return {
          key: "bid:" + bid,
          label: Math.floor(bid / 5) + 1 + " " + names[bid % 5],
        };
      }),
      ...(s.bid >= 0 && s.turn % 2 !== s.bidder % 2 && s.double === 1
        ? [{ key: "double", label: "Doblar" }]
        : []),
      ...(s.bid >= 0 && s.turn % 2 === s.bidder % 2 && s.double === 2
        ? [{ key: "redouble", label: "Redoblar" }]
        : []),
    ];
  return legal(s).map((c) => ({
    key: "play:" + c.id,
    label: (s.handTurn === s.dummy ? "Muerto: " : "") + label(c),
  }));
}
export function contractScore(
  level: number,
  suit: number,
  doubled: number,
  tricks: number,
) {
  const target = 6 + level;
  if (tricks < target) {
    const down = target - tricks;
    return -(doubled === 1
      ? down * 50
      : (down === 1
          ? 100
          : down === 2
            ? 300
            : down === 3
              ? 500
              : 500 + (down - 3) * 300) * (doubled === 4 ? 2 : 1));
  }
  const base =
      (suit === 4
        ? 40 + (level - 1) * 30
        : suit < 2
          ? level * 20
          : level * 30) * doubled,
    game = base >= 100 ? 300 : 50,
    slam = level === 6 ? 500 : level === 7 ? 1000 : 0,
    over =
      (tricks - target) *
      (doubled === 1 ? (suit < 2 ? 20 : 30) : doubled === 2 ? 100 : 200);
  return (
    base + game + slam + over + (doubled === 2 ? 50 : doubled === 4 ? 100 : 0)
  );
}
export function apply(old: State, key: string): State {
  if (!actions(old).some((a) => a.key === key)) return old;
  const s = clone(old),
    p = s.turn;
  s.step++;
  if (s.phase === "auction") {
    s.auction.push(
      "J" + (p + 1) + " " + actions(old).find((a) => a.key === key)!.label,
    );
    if (key === "pass") s.passes++;
    else {
      s.passes = 0;
      if (key.startsWith("bid:")) {
        s.bid = +key.split(":")[1];
        s.bidder = p;
        s.double = 1;
        if (s.first[p % 2][s.bid % 5] < 0) s.first[p % 2][s.bid % 5] = p;
      } else s.double = key === "double" ? 2 : 4;
    }
    if (s.passes === (s.bid < 0 ? 4 : 3)) {
      if (s.bid < 0) {
        s.winner = -1;
        s.outcome = "Todos pasan: reparto sin contrato";
      } else {
        s.declarer = s.first[s.bidder % 2][s.bid % 5];
        s.dummy = (s.declarer + 2) % 4;
        s.handTurn = (s.declarer + 1) % 4;
        s.turn = controller(s, s.handTurn);
        s.phase = "play";
        s.message = "Salida inicial: el muerto aparece tras la primera carta";
      }
    } else s.turn = (p + 1) % 4;
    return s;
  }
  const h = s.hands[s.handTurn],
    c = h.splice(
      h.findIndex((c) => c.id === +key.split(":")[1]),
      1,
    )[0];
  s.trick.push({ p: s.handTurn, c });
  s.opened = true;
  if (s.trick.length === 4) {
    const trump = denominations[s.bid % 5],
      led = s.trick[0].c.suit,
      w = s.trick.reduce((a, b) =>
        (b.c.suit === trump && a.c.suit !== trump) ||
        (b.c.suit === a.c.suit && high(b.c) > high(a.c))
          ? b
          : a,
      ).p;
    s.tricks[w]++;
    s.last = s.trick;
    s.trick = [];
    s.handTurn = w;
    if (!s.hands.some((h) => h.length)) {
      const taken = s.tricks[s.declarer] + s.tricks[s.dummy],
        v = contractScore(
          Math.floor(s.bid / 5) + 1,
          s.bid % 5,
          s.double,
          taken,
        );
      s.scores = s.scores.map((_, p) => (p % 2 === s.declarer % 2 ? v : -v));
      s.winner = v >= 0 ? s.declarer : (s.declarer + 1) % 4;
      s.outcome =
        (v >= 0 ? "Contrato cumplido" : "Contrato caído") +
        " · " +
        taken +
        " bazas · " +
        Math.abs(v) +
        " puntos";
    }
  } else s.handTurn = (s.handTurn + 1) % 4;
  s.turn = controller(s, s.handTurn);
  s.message =
    "Juega " +
    (s.handTurn === s.dummy
      ? "el muerto bajo control del declarante"
      : "J" + (s.handTurn + 1));
  return s;
}
export function automatic(s: State) {
  const a = actions(s);
  if (!a.length) return s;
  if (s.phase === "auction") {
    const h = s.hands[s.turn],
      hcp = h.reduce((v, c) => v + (high(c) > 10 ? high(c) - 10 : 0), 0);
    if (s.bid < 0 && hcp >= 12) {
      const lengths = [3, 2, 1, 0]
          .map((su, i) => ({ i, v: h.filter((c) => c.suit === su).length }))
          .sort((a, b) => b.v - a.v),
        bid = hcp >= 15 && hcp <= 17 && lengths[0].v <= 5 ? 4 : lengths[0].i;
      return apply(s, "bid:" + bid);
    }
    return apply(s, "pass");
  }
  const h = [...legal(s)],
    trump = denominations[s.bid % 5];
  h.sort(
    (a, b) =>
      (a.suit === trump ? 20 : 0) +
      high(a) -
      ((b.suit === trump ? 20 : 0) + high(b)),
  );
  if (s.trick.length) {
    const w = s.trick.reduce((a, b) =>
      (b.c.suit === trump && a.c.suit !== trump) ||
      (b.c.suit === a.c.suit && high(b.c) > high(a.c))
        ? b
        : a,
    );
    if (w.p % 2 !== s.handTurn % 2) {
      const win = h.find(
        (c) =>
          (c.suit === trump && w.c.suit !== trump) ||
          (c.suit === w.c.suit && high(c) > high(w.c)),
      );
      if (win) return apply(s, "play:" + win.id);
    }
  }
  return apply(s, "play:" + h[0].id);
}
export function view(s: State) {
  const p = s.phase === "play" ? s.handTurn : s.turn;
  return {
    actor: p,
    hand: s.hands[p].map((c) =>
      display(
        c,
        "h" + c.id,
        actions(s).find((a) => a.key === "play:" + c.id)?.key,
      ),
    ),
    table: [
      ...(s.trick.length ? s.trick : s.last).map((x) => ({
        ...display(x.c, "t" + x.p),
        label: "J" + (x.p + 1) + " " + label(x.c),
      })),
      ...(s.opened
        ? s.hands[s.dummy].map((c) => ({
            ...display(c, "d" + c.id),
            label: "Muerto " + label(c),
          }))
        : []),
    ],
    summary:
      s.bid < 0
        ? "Parejas J1–J3 y J2–J4 · subasta"
        : Math.floor(s.bid / 5) +
          1 +
          " " +
          names[s.bid % 5] +
          (s.double === 2 ? " doblado" : s.double === 4 ? " redoblado" : "") +
          (s.phase === "auction" ? " · postor J" : " · declarante J") +
          ((s.phase === "auction" ? s.bidder : s.declarer) + 1) +
          " · bazas " +
          s.tricks.join("/"),
    notes: [
      "Bridge de una mano, cuatro puestos, no vulnerable. Subasta libre, doblo/redoblo, asistencia obligatoria, muerto controlado por el declarante y puntuación duplicate de una mano. Sin alertas, convenciones acordadas, reclamación de bazas ni clasificación de torneo.",
      ...s.auction,
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
