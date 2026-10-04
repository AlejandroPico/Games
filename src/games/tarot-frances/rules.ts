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
  dog: Card[];
  revealedDog: Card[];
  taken: Card[][];
  trick: { p: number; c: Card }[];
  last: { p: number; c: Card }[];
  tricks: number[];
  phase: "bid" | "discard" | "play";
  bid: number;
  bidder: number;
  bidsDone: number;
  discarded: number;
  adjust: number[];
  petit: number;
}
export const tarotDeck = () => [
  ...Array.from({ length: 56 }, (_, i) => ({
    id: i,
    rank: (i % 14) + 1,
    suit: Math.floor(i / 14),
    up: true,
  })),
  ...Array.from({ length: 21 }, (_, i) => ({
    id: 56 + i,
    rank: i + 1,
    suit: 4,
    up: true,
  })),
  { id: 77, rank: 0, suit: 5, up: true },
];
const bout = (c: Card) =>
    c.suit === 5 || (c.suit === 4 && (c.rank === 1 || c.rank === 21)),
  value = (c: Card) =>
    bout(c) ? 4.5 : c.suit < 4 && c.rank >= 11 ? c.rank - 10 + 0.5 : 0.5;
const name = (c: Card) =>
  c.suit === 5
    ? "Excusa"
    : c.suit === 4
      ? "Triunfo " + c.rank
      : ([
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "Sota",
          "Caballo",
          "Dama",
          "Rey",
        ][c.rank] || c.rank) +
        " de " +
        suitName(c.suit);
const card = (c: Card, key: string, action?: string) => ({
  key,
  action,
  rank: c.suit === 5 ? "★" : String(c.rank),
  suit: c.suit === 4 ? "◆" : c.suit === 5 ? "★" : ["♠", "♥", "♦", "♣"][c.suit],
  red: c.suit === 1 || c.suit === 2,
  label: name(c),
});
export function initial(): State {
  let stock: Card[], hands: Card[][];
  do {
    stock = shuffled(tarotDeck());
    hands = deal(stock, 4, 18);
  } while (
    hands.some(
      (h) =>
        h.some((c) => c.suit === 4 && c.rank === 1) &&
        h.filter((c) => c.suit >= 4).length === 1,
    )
  );
  return {
    turn: 0,
    winner: null,
    scores: [0, 0, 0, 0],
    step: 0,
    message: "Subasta: toma, guarda, sin perro o contra perro",
    hands,
    dog: stock,
    revealedDog: [],
    taken: [[], [], [], []],
    trick: [],
    last: [],
    tricks: [0, 0, 0, 0],
    phase: "bid",
    bid: 0,
    bidder: -1,
    bidsDone: 0,
    discarded: 0,
    adjust: [0, 0, 0, 0],
    petit: 0,
  };
}
function win(s: State) {
  const normal = s.trick.filter((x) => x.c.suit !== 5);
  if (!normal.length) return s.turn;
  return normal.reduce((a, b) =>
    (b.c.suit === 4 && a.c.suit !== 4) ||
    (b.c.suit === a.c.suit && b.c.rank > a.c.rank)
      ? b
      : a,
  ).p;
}
export function legal(s: State) {
  const h = s.hands[s.turn],
    excuse = h.filter((c) => c.suit === 5),
    normal = h.filter((c) => c.suit !== 5),
    led = s.trick.find((x) => x.c.suit !== 5)?.c.suit;
  if (led === undefined) return h;
  const follow = normal.filter((c) => c.suit === led);
  let available = follow.length ? follow : normal.filter((c) => c.suit === 4);
  if (!available.length) available = normal;
  const trumps = available.filter((c) => c.suit === 4),
    top = Math.max(
      0,
      ...s.trick.filter((x) => x.c.suit === 4).map((x) => x.c.rank),
    ),
    higher = trumps.filter((c) => c.rank > top);
  if (trumps.length && higher.length) available = higher;
  return [...excuse, ...available];
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "bid")
    return [
      { key: "pass", label: "Paso" },
      ...[
        "Toma ×1",
        "Guarda ×2",
        "Guarda sin perro ×4",
        "Guarda contra perro ×6",
      ].flatMap((v, i) =>
        i + 1 > s.bid ? [{ key: "bid:" + (i + 1), label: v }] : [],
      ),
    ];
  if (s.phase === "discard") {
    const h = s.hands[s.turn],
      normal = h.filter((c) => c.suit < 4 && c.rank !== 14),
      available = normal.length
        ? normal
        : h.filter((c) => c.suit === 4 && !bout(c));
    return available.map((c) => ({
      key: "discard:" + c.id,
      label: "Al descarte: " + name(c),
    }));
  }
  return legal(s).map((c) => ({
    key: "play:" + c.id,
    label: "Jugar " + name(c),
  }));
}
function settle(s: State) {
  const own = s.taken[s.bidder],
    points = own.reduce((v, c) => v + value(c), 0) + s.adjust[s.bidder],
    bouts = own.filter(bout).length,
    target = [56, 51, 41, 36][bouts],
    success = points >= target,
    mult = [0, 1, 2, 4, 6][s.bid],
    delta =
      ((success ? 1 : -1) * (25 + Math.abs(points - target)) + s.petit) * mult,
    attackTricks = s.tricks[s.bidder],
    bonus = attackTricks === 18 ? 200 : attackTricks === 0 ? -200 : 0,
    total = delta + bonus;
  s.scores = s.scores.map((_, p) => (p === s.bidder ? total * 3 : -total));
  s.winner = total >= 0 ? s.bidder : (s.bidder + 1) % 4;
  s.outcome =
    "J" +
    (s.bidder + 1) +
    ": " +
    points +
    "/" +
    target +
    " puntos, " +
    bouts +
    " bouts · " +
    (success ? "contrato cumplido" : "contrato caído") +
    " · " +
    total +
    " por rival";
}
export function apply(old: State, key: string) {
  if (!actions(old).some((a) => a.key === key)) return old;
  const s = clone(old),
    p = s.turn;
  s.step++;
  if (s.phase === "bid") {
    if (key !== "pass") {
      s.bid = +key.split(":")[1];
      s.bidder = p;
    }
    s.bidsDone++;
    if (s.bidsDone === 4) {
      if (s.bidder < 0) {
        s.winner = -1;
        s.outcome = "Todos pasan: reparto anulado";
      } else if (s.bid <= 2) {
        s.revealedDog = [...s.dog];
        s.hands[s.bidder].push(...s.dog);
        s.dog = [];
        s.turn = s.bidder;
        s.phase = "discard";
        s.message = "Descarta seis; no reyes, bouts ni Excusa";
      } else {
        s.taken[s.bid === 3 ? s.bidder : (s.bidder + 1) % 4].push(...s.dog);
        s.dog = [];
        s.turn = 0;
        s.phase = "play";
        s.message = "Asiste, corta y sobrecorta cuando sea posible";
      }
    } else s.turn = (p + 1) % 4;
    return s;
  }
  if (s.phase === "discard") {
    const h = s.hands[p],
      c = h.splice(
        h.findIndex((c) => c.id === +key.split(":")[1]),
        1,
      )[0];
    s.taken[p].push(c);
    s.discarded++;
    if (s.discarded === 6) {
      s.phase = "play";
      s.turn = 0;
      s.message = "Asiste, corta y sobrecorta cuando sea posible";
    }
    return s;
  }
  const h = s.hands[p],
    c = h.splice(
      h.findIndex((c) => c.id === +key.split(":")[1]),
      1,
    )[0];
  s.trick.push({ p, c });
  if (s.trick.length < 4) {
    s.turn = (p + 1) % 4;
    return s;
  }
  const last = !s.hands.some((h) => h.length),
    excuse = s.trick.find((x) => x.c.suit === 5);
  let w = win(s);
  if (last && excuse && s.trick[0] === excuse) {
    const team =
      excuse.p === s.bidder
        ? s.tricks[s.bidder]
        : s.tricks.reduce((a, b) => a + b, 0) - s.tricks[s.bidder];
    if (team === 17) w = excuse.p;
  }
  s.tricks[w]++;
  for (const x of s.trick) {
    if (x.c.suit !== 5) s.taken[w].push(x.c);
    else if (last) {
      const chelem =
        (x.p === s.bidder
          ? s.tricks[s.bidder]
          : s.tricks.reduce((a, b) => a + b, 0) - s.tricks[s.bidder]) === 18;
      const owner = chelem
        ? w
        : x.p === s.bidder
          ? (s.bidder + 1) % 4
          : s.bidder;
      s.taken[owner].push(x.c);
    } else {
      s.taken[x.p].push(x.c);
      if ((x.p === s.bidder) !== (w === s.bidder)) {
        s.adjust[x.p] -= 0.5;
        s.adjust[w] += 0.5;
      }
    }
  }
  if (last && s.trick.some((x) => x.c.suit === 4 && x.c.rank === 1))
    s.petit = w === s.bidder ? 10 : -10;
  s.last = s.trick;
  s.trick = [];
  s.turn = w;
  s.message = "J" + (w + 1) + " ganó la baza";
  if (last) settle(s);
  return s;
}
export function automatic(s: State) {
  const a = actions(s);
  if (!a.length) return s;
  if (s.phase === "bid") {
    const h = s.hands[s.turn],
      v =
        h.filter((c) => c.suit === 4).length +
        3 * h.filter(bout).length +
        2 * h.filter((c) => c.suit < 4 && c.rank === 14).length;
    return apply(
      s,
      v >= 12 && s.bid < 2 ? "bid:2" : v >= 9 && s.bid < 1 ? "bid:1" : "pass",
    );
  }
  if (s.phase === "discard")
    return apply(
      s,
      a.sort(
        (a, b) =>
          value(s.hands[s.turn].find((c) => c.id === +a.key.split(":")[1])!) -
          value(s.hands[s.turn].find((c) => c.id === +b.key.split(":")[1])!),
      )[0].key,
    );
  const h = [...legal(s)].sort(
    (a, b) => value(a) - value(b) || a.rank - b.rank,
  );
  return apply(s, "play:" + h[0].id);
}
export function view(s: State) {
  return {
    hand: s.hands[s.turn].map((c) =>
      card(
        c,
        "h" + c.id,
        actions(s).find(
          (a) => a.key === "play:" + c.id || a.key === "discard:" + c.id,
        )?.key,
      ),
    ),
    table: [
      ...(s.trick.length ? s.trick : s.last).map((x) => card(x.c, "t" + x.p)),
      ...s.revealedDog.map((c) => ({
        ...card(c, "dog" + c.id),
        label: "Perro revelado: " + name(c),
      })),
    ],
    summary:
      "Tarot de cuatro · " +
      (s.bid
        ? ["", "Toma", "Guarda", "Sin perro", "Contra perro"][s.bid]
        : "subasta") +
      " · " +
      s.tricks.join("/") +
      " bazas",
    notes: [
      "78 cartas: 56 de palo, 21 triunfos y Excusa. Dieciocho por mano y seis en perro. Un contrato, sin poignée ni chelem anunciado; sí petit au bout y chelem no anunciado. Excusa en última baza cambia de bando; antes se conserva y compensa medio punto. El sentido de juego de esta mesa es horario.",
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
