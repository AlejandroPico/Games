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
  phase: "draw" | "discard";
  knocker: number;
  finalHands: Card[][];
}
export function initial(n = 2): State {
  const stock = shuffled(deck()),
    hands = deal(stock, n, 10);
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Roba del mazo o del descarte",
    hands,
    stock,
    discard: [stock.pop()!],
    phase: "draw",
    knocker: -1,
    finalHands: [],
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "draw")
    return [
      { key: "stock", label: "Robar del mazo" },
      ...(s.discard.length
        ? [{ key: "waste", label: "Tomar " + label(s.discard.at(-1)!, false) }]
        : []),
    ];
  return s.hands[s.turn].flatMap((c, i) => {
    const rest = s.hands[s.turn].filter((_, j) => i !== j),
      v = deadwood(rest, false).value;
    return [
      { key: "discard:" + i, label: "Descartar " + label(c, false) },
      ...(v <= 0
        ? [
            {
              key: "close:" + i,
              label:
                "Cerrar descartando " +
                label(c, false) +
                " · sin combinar " +
                v,
            },
          ]
        : []),
    ];
  });
}
function settle(s: State, knocker: number) {
  const values = s.hands.map((h) => deadwood(h, false).value);
  s.knocker = knocker;
  s.finalHands = clone(s.hands);
  s.scores = values;
  finish(s, true);
  s.outcome += " · menor penalización gana";
  s.message = s.outcome!;
}
function finish(s: State, low = false) {
  s.winner = best(s.scores, low);
  s.outcome = s.winner < 0 ? "Empate" : `Gana J${s.winner + 1}`;
  s.message = s.outcome;
}
export function apply(old: State, key: string): State {
  if (!actions(old).some((a) => a.key === key)) return old;
  const s = clone(old),
    p = s.turn;
  s.step++;
  if (s.phase === "draw") {
    if (key === "stock" && !s.stock.length) {
      if (s.discard.length <= 1) {
        settle(s, -1);
        return s;
      }
      const top = s.discard.pop()!;
      s.stock = shuffled(s.discard);
      s.discard = [top];
    }
    s.hands[p].push((key === "stock" ? s.stock : s.discard).pop()!);
    s.phase = "discard";
    s.message = "Descarta una carta o cierra con una combinación válida";
  } else {
    const i = Number(key.split(":")[1]);
    s.discard.push(s.hands[p].splice(i, 1)[0]);
    if (key.startsWith("close:")) settle(s, p);
    else {
      s.turn = (p + 1) % s.hands.length;
      s.phase = "draw";
      s.message = "Roba del mazo o del descarte";
    }
  }
  if (s.step >= 500 && s.winner === null) {
    settle(s, -1);
    s.outcome = "Límite de 250 turnos: " + s.outcome;
  }
  return s;
}
export function automatic(s: State) {
  const a = actions(s);
  if (!a.length) return s;
  if (s.phase === "draw") {
    const h = s.hands[s.turn],
      top = s.discard.at(-1),
      v = deadwood(h, false).value;
    return apply(
      s,
      top && deadwood([...h, top], false).value < v ? "waste" : "stock",
    );
  }
  const closes = a.filter((a) => a.key.startsWith("close:"));
  if (closes.length) return apply(s, closes[0].key);
  const ranked = a.map((a) => {
    const i = Number(a.key.split(":")[1]);
    return {
      key: a.key,
      v: deadwood(
        s.hands[s.turn].filter((_, j) => i !== j),
        false,
      ).value,
    };
  });
  return apply(s, ranked.sort((a, b) => a.v - b.v)[0].key);
}
export function view(s: State) {
  const h = s.hands[s.turn];
  return {
    hand: h.map((c, i) =>
      display(
        c,
        "h" + i,
        s.phase === "discard" ? "discard:" + i : undefined,
        false,
      ),
    ),
    table: (s.winner !== null ? s.finalHands.flat() : s.discard.slice(-1)).map(
      (c, i) => display(c, "t" + i, undefined, false),
    ),
    summary:
      "Mazo " +
      s.stock.length +
      " · mano " +
      h.length +
      " · " +
      s.hands.map((h, i) => "J" + (i + 1) + ": " + h.length).join(" · "),
    notes: [
      "Esta mesa juega una mano de Rummy clásico, sin comodines ni contratos de Continental.",
      "Grupos de tres o cuatro iguales y escaleras naturales del mismo palo. El as solo es bajo. La mejor partición se calcula sin reutilizar cartas.",
      s.winner !== null
        ? s.outcome!
        : "Tus puntos sin combinar: " + deadwood(h, false).value,
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
