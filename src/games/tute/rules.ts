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
  sung: number[][];
}
export function initial(n = 4): State {
  const stock = shuffled(spanishDeck()),
    hands = deal(stock, n, 10);
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Juega una carta; debes asistir y montar",
    hands,
    stock,
    trick: [],
    last: [],
    taken: Array.from({ length: n }, () => []),
    tricks: Array(n).fill(0),
    phase: "play",
    trump: Math.floor(Math.random() * 4),
    lead: 0,
    sung: Array.from({ length: n }, () => []),
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
  const winner = trickWinner(s),
    wc = s.trick.find((x) => x.p === winner)!.c;
  if (follow.length) {
    const above = follow.filter(
      (c) => effective(wc, s) === led && strength(c, s) > strength(wc, s),
    );
    return above.length ? above : follow;
  }
  const trumps = h.filter((c) => c.suit === s.trump),
    above = trumps.filter(
      (c) => wc.suit !== s.trump || strength(c, s) > strength(wc, s),
    );
  return above.length ? above : trumps.length ? trumps : h;
}
export function actions(s: State) {
  if (s.winner !== null) return [];

  const h = s.hands[s.turn],
    songs =
      s.tricks[s.turn] > 0
        ? [0, 1, 2, 3]
            .filter(
              (k) =>
                !s.sung[s.turn].includes(k) &&
                h.some((c) => c.suit === k && c.rank === 12) &&
                h.some((c) => c.suit === k && c.rank === 11),
            )
            .map((k) => ({
              key: "sing:" + k,
              label:
                "Cantar " +
                (k === s.trump ? 40 : 20) +
                " en " +
                suitName(k, true),
            }))
        : [];
  return [
    ...(s.tricks[s.turn] > 0 &&
    [11, 12].some((rank) =>
      [0, 1, 2, 3].every((suit) =>
        h.some((c) => c.rank === rank && c.suit === suit),
      ),
    )
      ? [{ key: "tute", label: "Cantar Tute: cuatro reyes o cuatro caballos" }]
      : []),
    ...songs,
    ...legal(s).map((c) => ({
      key: "play:" + c.id,
      label: "Jugar " + label(c, true),
    })),
  ];
}
function settle(s: State) {
  const team = [0, 0];
  for (let p = 0; p < s.hands.length; p++)
    team[p % 2] += s.scores[p] + s.taken[p].reduce((v, c) => v + points(c), 0);
  team[s.lead % 2] += 10;
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

  if (key === "tute") {
    s.winner = p % 2;
    s.scores = s.scores.map((_, i) => (i % 2 === p % 2 ? 200 : 0));
    s.outcome = "La pareja de J" + (p + 1) + " gana por Tute";
    return s;
  }

  if (key.startsWith("sing:")) {
    const k = +key.split(":")[1];
    s.sung[p].push(k);
    s.scores[p] += k === s.trump ? 40 : 20;
    s.message = "J" + (p + 1) + " canta " + (k === s.trump ? 40 : 20);
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
  if (a.some((a) => a.key === "tute")) return apply(s, "tute");

  const song = a.find((a) => a.key.startsWith("sing:"));
  if (song) return apply(s, song.key);
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
      "Tute de cuatro por parejas, sin arrastre de mazo. As, tres, rey, caballo, sota; obligación de asistir, montar y fallar. Cantos 20/40 después de ganar una baza; última baza 10.",
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
