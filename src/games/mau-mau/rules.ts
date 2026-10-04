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
  discard: Card[];
  suit: number;
  pending: number;
  drawn: boolean;
  direction: number;
}
export function initial(n = 2): State {
  const stock = shuffled(
      deck().filter((c) => [1, 7, 8, 9, 10, 11, 12, 13].includes(c.rank)),
    ),
    hands = deal(stock, n, 5),
    c = stock.pop()!;
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Iguala palo o valor; la sota cambia el palo",
    hands,
    stock,
    discard: [c],
    suit: c.suit,
    pending: 0,
    drawn: false,
    direction: 1,
  };
}
function recycle(s: State) {
  if (!s.stock.length && s.discard.length > 1) {
    const c = s.discard.pop()!;
    s.stock = shuffled(s.discard);
    s.discard = [c];
  }
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.pending)
    return [{ key: "pay", label: "Robar " + s.pending + " y perder turno" }];
  const a = s.hands[s.turn].flatMap((c, i) =>
    c.rank === 11
      ? [0, 1, 2, 3].map((k) => ({
          key: "play:" + i + ":" + k,
          label: "Sota: cambiar a " + suitName(k),
        }))
      : c.suit === s.suit || c.rank === s.discard.at(-1)!.rank
        ? [{ key: "play:" + i, label: "Jugar " + label(c) }]
        : [],
  );
  return [
    ...a,
    {
      key: s.drawn ? "pass" : "draw",
      label: s.drawn ? "Pasar" : "Robar una carta",
    },
  ];
}
export function apply(old: State, key: string) {
  if (!actions(old).some((a) => a.key === key)) return old;
  const s = clone(old),
    p = s.turn,
    n = s.hands.length;
  s.step++;
  if (key === "draw") {
    recycle(s);
    if (s.stock.length) {
      s.hands[p].push(s.stock.pop()!);
      s.drawn = true;
    } else {
      s.turn = (p + 1) % n;
      s.drawn = false;
    }
  } else if (key === "pay") {
    for (let i = 0; i < s.pending; i++) {
      recycle(s);
      if (s.stock.length) s.hands[p].push(s.stock.pop()!);
    }
    s.pending = 0;
    s.turn = (p + 1) % n;
    s.drawn = false;
  } else if (key === "pass") {
    s.turn = (p + 1) % n;
    s.drawn = false;
  } else {
    const [, i, k] = key.split(":").map(Number),
      c = s.hands[p].splice(i, 1)[0];
    s.discard.push(c);
    s.suit = c.rank === 11 ? k : c.suit;
    s.turn = (p + (c.rank === 8 ? 2 : 1)) % n;
    s.pending = c.rank === 7 ? 2 : 0;
    s.drawn = false;
    if (!s.hands[p].length) {
      s.winner = p;
      s.scores[p] = s.hands.reduce(
        (v, h) => v + h.reduce((v, c) => v + Math.min(high(c), 10), 0),
        0,
      );
      s.outcome = "J" + (p + 1) + " se queda sin cartas";
    }
  }
  s.message = s.pending
    ? "Roba la penalización de siete"
    : "Iguala palo o valor; la sota cambia el palo";
  if (s.step >= 600 && s.winner === null) {
    s.scores = s.hands.map((h) => h.length);
    s.winner = best(s.scores, true);
    s.outcome = "Límite de mesa: gana la menor mano";
  }
  return s;
}
export function automatic(s: State) {
  const a = actions(s),
    plays = a.filter((a) => a.key.startsWith("play:"));
  return apply(
    s,
    (
      plays.sort((a, b) => {
        const ca = s.hands[s.turn][+a.key.split(":")[1]],
          cb = s.hands[s.turn][+b.key.split(":")[1]];
        return (
          (cb.rank === 7 ? 20 : cb.rank === 8 ? 15 : high(cb)) -
          (ca.rank === 7 ? 20 : ca.rank === 8 ? 15 : high(ca))
        );
      })[0] || a[0]
    ).key,
  );
}
export function view(s: State) {
  return {
    hand: s.hands[s.turn].map((c, i) =>
      display(
        c,
        "h" + i,
        actions(s).find(
          (a) => a.key.startsWith("play:" + i + ":") || a.key === "play:" + i,
        )?.key,
      ),
    ),
    table: [display(s.discard.at(-1)!, "discard")],
    summary:
      "Palo " +
      suitName(s.suit) +
      " · mazo " +
      s.stock.length +
      " · " +
      s.hands.map((h, i) => "J" + (i + 1) + ": " + h.length).join(" · "),
    notes: [
      "Mau-Mau de 32 cartas. 7 obliga a robar dos sin acumular; 8 salta; sota elige palo. Se puede jugar la carta robada; victoria inmediata al vaciar mano. No hay penalización por anunciar Mau.",
      s.outcome || "Las manos rivales permanecen ocultas.",
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
