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
  trump: number;
  attacker: number;
  defender: number;
  limit: number;
  pairs: { a: Card; d: Card | null }[];
  phase: "attack" | "defend";
  taken: Card[];
}
export function initial(n = 2): State {
  const stock = shuffled(deck().filter((c) => c.rank === 1 || c.rank >= 6)),
    hands = deal(stock, n, 6),
    trump = stock[0].suit;
  let p = 0,
    v = 99;
  hands.forEach((h, i) =>
    h
      .filter((c) => c.suit === trump)
      .forEach((c) => {
        if (high(c) < v) {
          v = high(c);
          p = i;
        }
      }),
  );
  return {
    turn: p,
    winner: null,
    scores: [0, 0],
    step: 0,
    message: "Ataca con una carta",
    hands,
    stock,
    trump,
    attacker: p,
    defender: 1 - p,
    limit: 6,
    pairs: [],
    phase: "attack",
    taken: [],
  };
}
export function beats(a: Card, d: Card, trump: number) {
  return (
    (d.suit === a.suit && high(d) > high(a)) ||
    (d.suit === trump && a.suit !== trump)
  );
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "defend") {
    const a = s.pairs.find((x) => !x.d)!.a;
    return [
      { key: "take", label: "Recoger el ataque y perder salida" },
      ...s.hands[s.turn]
        .filter((c) => beats(a, c, s.trump))
        .map((c) => ({
          key: "defend:" + c.id,
          label: "Defender con " + label(c),
        })),
    ];
  }
  const ranks = s.pairs.flatMap((x) => [x.a.rank, ...(x.d ? [x.d.rank] : [])]);
  return [
    ...(s.pairs.length ? [{ key: "finish", label: "Terminar ataque" }] : []),
    ...s.hands[s.turn]
      .filter(
        (c) =>
          s.pairs.length < s.limit && (!ranks.length || ranks.includes(c.rank)),
      )
      .map((c) => ({ key: "attack:" + c.id, label: "Atacar con " + label(c) })),
  ];
}
function endRound(s: State, took: boolean) {
  if (took)
    s.hands[s.defender].push(
      ...s.pairs.flatMap((x) => [x.a, ...(x.d ? [x.d] : [])]),
    );
  else s.taken.push(...s.pairs.flatMap((x) => [x.a, x.d!]));
  for (const p of [s.attacker, s.defender])
    while (s.stock.length && s.hands[p].length < 6)
      s.hands[p].push(s.stock.pop()!);
  s.pairs = [];
  if (!s.stock.length) {
    const empty = s.hands.flatMap((h, i) => (!h.length ? [i] : []));
    if (empty.length) {
      s.winner = empty.length === 2 ? -1 : empty[0];
      s.scores = s.hands.map((h) => -h.length);
      s.outcome =
        s.winner < 0
          ? "Ambos salen: empate"
          : "J" + (s.winner + 1) + " sale; el rival es Durak";
      return;
    }
  }
  if (!took) {
    [s.attacker, s.defender] = [s.defender, s.attacker];
  }
  s.turn = s.attacker;
  s.limit = Math.min(6, s.hands[s.defender].length);
  s.phase = "attack";
  s.message = "Ataca; máximo " + s.limit + " cartas en este asalto";
}
export function apply(old: State, key: string) {
  if (!actions(old).some((a) => a.key === key)) return old;
  const s = clone(old);
  s.step++;
  if (key === "take" || key === "finish") endRound(s, key === "take");
  else {
    const h = s.hands[s.turn],
      c = h.splice(
        h.findIndex((c) => c.id === +key.split(":")[1]),
        1,
      )[0];
    if (s.phase === "attack") {
      s.pairs.push({ a: c, d: null });
      s.turn = s.defender;
      s.phase = "defend";
      s.message = "Defiende o recoge";
    } else {
      s.pairs.find((x) => !x.d)!.d = c;
      s.turn = s.attacker;
      s.phase = "attack";
      s.message = "Añade un valor presente o termina";
    }
  }
  if (s.step >= 700 && s.winner === null) {
    s.winner = -1;
    s.outcome = "Partida detenida por límite de asaltos: empate";
  }
  return s;
}
export function automatic(s: State) {
  const a = actions(s);
  if (!a.length) return s;
  const plays = a
    .filter((x) => x.key.includes(":"))
    .sort((a, b) => {
      const h = s.hands[s.turn],
        value = (key: string) => {
          const c = h.find((c) => c.id === +key.split(":")[1])!;
          return high(c) + (c.suit === s.trump ? 20 : 0);
        };
      return value(a.key) - value(b.key);
    });
  return apply(s, (plays[0] || a[0]).key);
}
export function view(s: State) {
  return {
    hand: s.hands[s.turn].map((c) =>
      display(
        c,
        "h" + c.id,
        actions(s).find((a) => a.key.endsWith(":" + c.id))?.key,
      ),
    ),
    table: s.pairs.flatMap((x, i) => [
      display(x.a, "a" + i),
      ...(x.d ? [display(x.d, "d" + i)] : []),
    ]),
    summary:
      "Triunfo " +
      suitName(s.trump) +
      " · mazo " +
      s.stock.length +
      " · J1 " +
      s.hands[0].length +
      " / J2 " +
      s.hands[1].length,
    notes: [
      "Podkidnoy Durak de dos jugadores, sin transferencias. 36 cartas, seis en mano. Añadir solo valores que ya están en mesa; máximo seis o la mano inicial del defensor. Esta mesa termina inmediatamente la recogida, sin añadir cartas después de elegir recoger.",
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
