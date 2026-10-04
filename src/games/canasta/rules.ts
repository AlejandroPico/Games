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
  melds: Card[][][];
  reds: Card[][];
  phase: "draw" | "meld";
  frozen: boolean;
}
function wild(c: Card) {
  return c.rank === 0 || c.rank === 2;
}
function value(c: Card) {
  return c.rank === 0
    ? 50
    : c.rank === 2 || c.rank === 1
      ? 20
      : c.rank >= 8
        ? 10
        : 5;
}
function refill(s: State, p: number, count: number) {
  for (let i = 0; i < count; i++) {
    if (!s.stock.length) break;
    const c = s.stock.pop()!;
    if (c.rank === 3 && (c.suit === 1 || c.suit === 2)) {
      s.reds[p].push(c);
      i--;
    } else s.hands[p].push(c);
  }
}
export function initial(): State {
  const stock = shuffled([
    ...deck(),
    ...deck().map((c) => ({ ...c, id: c.id + 52 })),
    ...Array.from({ length: 4 }, (_, i) => ({
      id: 104 + i,
      rank: 0,
      suit: 4,
      up: true,
    })),
  ]);
  const s: State = {
    turn: 0,
    winner: null,
    scores: [0, 0],
    step: 0,
    message: "Roba dos o toma el descarte con pareja natural",
    hands: [[], []],
    stock,
    discard: [],
    melds: [[], []],
    reds: [[], []],
    phase: "draw",
    frozen: false,
  };
  refill(s, 0, 15);
  refill(s, 1, 15);
  s.discard = [s.stock.pop()!];
  s.frozen = wild(s.discard[0]);
  return s;
}
function groups(s: State) {
  const h = s.hands[s.turn],
    out: { key: string; label: string }[] = [];
  for (let r = 1; r <= 13; r++)
    if (r !== 2 && r !== 3) {
      const natural = h.flatMap((c, i) => (c.rank === r ? [i] : [])),
        ws = h.flatMap((c, i) => (wild(c) ? [i] : [])),
        existing = s.melds[s.turn].findIndex((g) =>
          g.some((c) => !wild(c) && c.rank === r),
        );
      if (existing >= 0) {
        const g = s.melds[s.turn][existing];
        for (const i of [...natural, ...(g.filter(wild).length < 3 ? ws : [])])
          out.push({
            key: "add:" + existing + ":" + i,
            label:
              "Añadir " +
              (wild(h[i]) ? "comodín" : label(h[i])) +
              " a grupo " +
              r,
          });
      } else {
        const candidates = [
          ...Array.from({ length: Math.max(0, natural.length - 2) }, (_, i) =>
            natural.slice(0, i + 3),
          ),
          ...(natural.length >= 2 && ws.length
            ? [[...natural.slice(0, 2), ws[0]]]
            : []),
        ];
        for (const is of candidates)
          if (
            s.melds[s.turn].length ||
            is.reduce((v, i) => v + value(h[i]), 0) >= 50
          )
            out.push({
              key: "meld:" + is.join(","),
              label:
                "Bajar grupo " +
                r +
                " · " +
                is
                  .map((i) => (wild(h[i]) ? "comodín" : label(h[i])))
                  .join(", "),
            });
      }
    }
  return out;
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const h = s.hands[s.turn],
    top = s.discard.at(-1);
  if (s.phase === "draw")
    return [
      { key: "draw", label: "Robar dos del mazo" },
      ...(top &&
      !wild(top) &&
      top.rank !== 3 &&
      h.filter((c) => !wild(c) && c.rank === top.rank).length >= 2 &&
      (s.melds[s.turn].length ||
        h
          .filter((c) => c.rank === top.rank)
          .slice(0, 2)
          .reduce((v, c) => v + value(c), value(top)) >= 50)
        ? [
            {
              key: "take",
              label: "Tomar todo el descarte y bajar su carta superior",
            },
          ]
        : []),
    ];
  const hasCanasta = s.melds[s.turn].some((g) => g.length >= 7);
  return [
    ...groups(s).filter(
      (a) =>
        hasCanasta ||
        (a.key.startsWith("meld:")
          ? h.length - a.key.slice(5).split(",").length >= 2
          : h.length >= 3 || s.melds[s.turn][+a.key.split(":")[1]].length >= 6),
    ),
    ...h.flatMap((c, i) =>
      h.length > 1 || hasCanasta
        ? [
            {
              key: "discard:" + i,
              label: "Descartar " + (wild(c) ? "comodín" : label(c)),
            },
          ]
        : [],
    ),
  ];
}
function settle(s: State, out = -1) {
  s.scores = s.melds.map(
    (gs, p) =>
      gs.reduce(
        (v, g) =>
          v +
          g.reduce((v, c) => v + value(c), 0) +
          (g.length >= 7 ? (g.some(wild) ? 300 : 500) : 0),
        0,
      ) -
      s.hands[p].reduce((v, c) => v + value(c), 0) +
      (gs.length ? 1 : -1) *
        s.reds[p].length *
        (s.reds[p].length === 4 ? 200 : 100) +
      (p === out ? 100 : 0),
  );
  s.winner = best(s.scores);
  s.outcome =
    (s.winner < 0 ? "Empate" : "Gana J" + (s.winner + 1)) +
    " · " +
    s.scores.join(" / ");
}
export function apply(old: State, key: string) {
  if (!actions(old).some((a) => a.key === key)) return old;
  const s = clone(old),
    p = s.turn,
    h = s.hands[p];
  s.step++;
  if (s.phase === "draw") {
    if (key === "draw") {
      if (!s.stock.length) {
        settle(s);
        return s;
      }
      refill(s, p, 2);
    } else {
      const top = s.discard.pop()!,
        is = h.flatMap((c, i) => (c.rank === top.rank ? [i] : [])).slice(0, 2);
      const group = s.melds[p].find((g) =>
        g.some((c) => !wild(c) && c.rank === top.rank),
      );
      if (group) group.push(top, ...is.map((i) => h[i]));
      else s.melds[p].push([top, ...is.map((i) => h[i])]);
      s.hands[p] = h.filter((_, i) => !is.includes(i));
      s.hands[p].push(...s.discard);
      s.discard = [];
      s.frozen = false;
    }
    s.phase = "meld";
    s.message = "Baja combinaciones; termina descartando";
  } else if (key.startsWith("meld:")) {
    const is = key.slice(5).split(",").map(Number);
    s.melds[p].push(is.map((i) => h[i]));
    s.hands[p] = h.filter((_, i) => !is.includes(i));
  } else if (key.startsWith("add:")) {
    const [, g, i] = key.split(":").map(Number);
    s.melds[p][g].push(h.splice(i, 1)[0]);
  } else {
    const c = h.splice(+key.split(":")[1], 1)[0];
    s.discard.push(c);
    if (wild(c)) s.frozen = true;
    s.turn = 1 - p;
    s.phase = "draw";
    s.message = "Roba dos o toma el descarte";
  }
  if (!s.hands[p].length) settle(s, p);
  if (s.step >= 800 && s.winner === null) {
    settle(s);
    s.outcome = "Cierre por límite de mesa: " + s.outcome;
  }
  return s;
}
export function automatic(s: State) {
  const a = actions(s);
  if (!a.length) {
    const n = clone(s);
    settle(n);
    return n;
  }
  if (s.phase === "draw")
    return apply(s, a.find((a) => a.key === "take")?.key || "draw");
  const group = a.find(
    (a) => a.key.startsWith("meld:") || a.key.startsWith("add:"),
  );
  if (group) return apply(s, group.key);
  const ds = a
    .filter((a) => a.key.startsWith("discard:"))
    .sort(
      (a, b) =>
        value(s.hands[s.turn][+a.key.split(":")[1]]) -
        value(s.hands[s.turn][+b.key.split(":")[1]]),
    );
  return apply(s, ds[0].key);
}
export function view(s: State) {
  const p = s.turn,
    fmt = (c: Card, k: string, a?: string) =>
      wild(c)
        ? {
            key: k,
            rank: c.rank === 0 ? "★" : "2",
            suit: "★",
            label: "Comodín",
            action: a,
          }
        : display(c, k, a);
  return {
    hand: s.hands[p].map((c, i) =>
      fmt(
        c,
        "h" + c.id,
        s.phase === "meld"
          ? actions(s).find((a) => a.key === "discard:" + i)?.key
          : undefined,
      ),
    ),
    table: [
      ...(s.discard.length ? [fmt(s.discard.at(-1)!, "top")] : []),
      ...s.melds.flatMap((gs, p) =>
        gs.flatMap((g, j) => [
          {
            ...fmt(g[0], p + ":" + j),
            label:
              "J" +
              (p + 1) +
              " grupo " +
              g[0].rank +
              " · " +
              g.length +
              " cartas",
          },
        ]),
      ),
    ],
    summary:
      "Mazo " +
      s.stock.length +
      " · descarte " +
      s.discard.length +
      (s.frozen ? " congelado" : "") +
      " · mano " +
      s.hands[p].length,
    notes: [
      "Canasta individual de dos: 108 cartas, quince por mano, robo de dos. Entrada fija de 50; una canasta permite salir. Máximo tres comodines por grupo; no se bajan treses ni canastas solo de comodines. Recoger descarte requiere siempre dos naturales, también cuando no está congelado; es una restricción de esta edición.",
      ...s.melds.flatMap((gs, p) =>
        gs.map(
          (g) =>
            "J" +
            (p + 1) +
            " · " +
            g.map((c) => (wild(c) ? "comodín" : label(c))).join(", "),
        ),
      ),
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
