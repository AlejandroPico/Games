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
  board: Card[];
  chips: number[];
  paid: number[];
  bets: number[];
  folded: boolean[];
  pending: boolean[];
  rights: boolean[];
  street: number;
  current: number;
  minRaise: number;
  log: string[];
  revealed: boolean;
}
export function rankFive(h: Card[]) {
  const values = h.map(high).sort((a, b) => b - a),
    unique = [...new Set(values)],
    flush = h.every((c) => c.suit === h[0].suit),
    straight =
      unique.length === 5 &&
      (unique[0] - unique[4] === 4
        ? unique[0]
        : unique.join(",") === "14,5,4,3,2"
          ? 5
          : 0),
    counts = unique
      .map((r) => ({ r, n: values.filter((v) => v === r).length }))
      .sort((a, b) => b.n - a.n || b.r - a.r);
  let cat = 0,
    k = values;
  if (flush && straight) {
    cat = 8;
    k = [straight];
  } else if (counts[0].n === 4) {
    cat = 7;
    k = counts.map((x) => x.r);
  } else if (counts[0].n === 3 && counts[1].n === 2) {
    cat = 6;
    k = counts.map((x) => x.r);
  } else if (flush) {
    cat = 5;
  } else if (straight) {
    cat = 4;
    k = [straight];
  } else if (counts[0].n === 3) {
    cat = 3;
    k = counts.map((x) => x.r);
  } else if (counts[0].n === 2 && counts[1].n === 2) {
    cat = 2;
    k = counts.map((x) => x.r);
  } else if (counts[0].n === 2) {
    cat = 1;
    k = counts.map((x) => x.r);
  }
  let v = cat;
  for (let i = 0; i < 5; i++) v = v * 15 + (k[i] || 0);
  return v;
}
export function rankHand(h: Card[]) {
  let bestRank = 0;
  for (let a = 0; a < h.length - 4; a++)
    for (let b = a + 1; b < h.length - 3; b++)
      for (let c = b + 1; c < h.length - 2; c++)
        for (let d = c + 1; d < h.length - 1; d++)
          for (let e = d + 1; e < h.length; e++)
            bestRank = Math.max(
              bestRank,
              rankFive([h[a], h[b], h[c], h[d], h[e]]),
            );
  return bestRank;
}
export function initial(n = 2): State {
  const stock = shuffled(deck()),
    hands = deal(stock, n, 2),
    small = n === 2 ? 0 : 1,
    big = n === 2 ? 1 : 2,
    bets = Array(n).fill(0),
    chips = Array(n).fill(100);
  bets[small] = 1;
  bets[big] = 2;
  chips[small]--;
  chips[big] -= 2;
  return {
    turn: (big + 1) % n,
    winner: null,
    scores: [...chips],
    step: 0,
    message: "Ciegas 1/2; una mano de No-Limit con fichas virtuales",
    hands,
    stock,
    board: [],
    chips,
    paid: [...bets],
    bets,
    folded: Array(n).fill(false),
    pending: Array(n).fill(true),
    rights: Array(n).fill(true),
    street: 0,
    current: 2,
    minRaise: 2,
    log: [],
    revealed: false,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const p = s.turn,
    call = s.current - s.bets[p],
    max = s.bets[p] + s.chips[p],
    minimum = s.current + s.minRaise;
  return [
    { key: "fold", label: "Retirarse" },
    {
      key: "call",
      label: call
        ? "Igualar " +
          Math.min(call, s.chips[p]) +
          (call >= s.chips[p] ? " · all-in" : "")
        : "Pasar",
    },
    ...(s.rights[p] && max > s.current
      ? [
          ...new Set([
            minimum,
            minimum + s.minRaise,
            minimum + 2 * s.minRaise,
            max,
          ]),
        ]
          .filter((x) => x <= max && (x >= minimum || x === max))
          .map((v) => ({
            key: "raise:" + v,
            label: (v === max ? "All-in" : "Subir") + " hasta " + v,
          }))
      : []),
  ];
}
function pay(s: State, p: number, v: number) {
  v = Math.min(v, s.chips[p]);
  s.chips[p] -= v;
  s.bets[p] += v;
  s.paid[p] += v;
}
function settle(s: State) {
  const levels = [...new Set(s.paid.filter((x) => x > 0))].sort(
    (a, b) => a - b,
  );
  let prev = 0;
  s.revealed = s.folded.filter((x) => !x).length > 1;
  for (const level of levels) {
    const contributors = s.paid.flatMap((x, p) => (x >= level ? [p] : [])),
      amount = (level - prev) * contributors.length,
      eligible = contributors.filter((p) => !s.folded[p]);
    if (!eligible.length) {
      for (const p of contributors) s.chips[p] += level - prev;
    } else {
      const ranks = eligible.map((p) => ({
          p,
          v: rankHand([...s.hands[p], ...s.board]),
        })),
        v = Math.max(...ranks.map((x) => x.v)),
        wins = ranks.filter((x) => x.v === v).map((x) => x.p);
      for (const p of wins) s.chips[p] += Math.floor(amount / wins.length);
      for (let i = 0; i < amount % wins.length; i++) s.chips[wins[i]]++;
      s.log.push(
        "Bote " +
          amount +
          " para " +
          wins.map((p) => "J" + (p + 1)).join(" / "),
      );
    }
    prev = level;
  }
  s.scores = [...s.chips];
  s.winner = best(s.scores);
  s.outcome =
    (s.winner < 0 ? "Empate de fichas" : "Mayor saldo: J" + (s.winner + 1)) +
    " · " +
    s.log.at(-1);
}
function nextStreet(s: State) {
  if (s.street === 3) {
    settle(s);
    return;
  }
  s.street++;
  s.stock.pop();
  s.board.push(...s.stock.splice(-(s.street === 1 ? 3 : 1)));
  s.bets = s.bets.map(() => 0);
  s.current = 0;
  s.minRaise = 2;
  s.pending = s.chips.map((v, p) => v > 0 && !s.folded[p]);
  s.rights = [...s.pending];
  s.turn = 1 % s.chips.length;
  while (!s.pending[s.turn] && s.pending.some(Boolean))
    s.turn = (s.turn + 1) % s.chips.length;
  s.message = ["", "Flop", "Turn", "River"][s.street] + " · apuesta o pasa";
  const active = s.pending.filter(Boolean).length;
  if (active < 2) {
    while (s.board.length < 5) {
      s.stock.pop();
      s.board.push(...s.stock.splice(-(s.board.length === 0 ? 3 : 1)));
    }
    settle(s);
  }
}
export function apply(old: State, key: string) {
  if (!actions(old).some((a) => a.key === key)) return old;
  const s = clone(old),
    p = s.turn,
    n = s.chips.length;
  s.step++;
  s.pending[p] = false;
  s.rights[p] = false;
  if (key === "fold") {
    s.folded[p] = true;
    s.log.push("J" + (p + 1) + " se retira");
  } else if (key === "call") {
    pay(s, p, s.current - s.bets[p]);
    s.log.push("J" + (p + 1) + " iguala/pasa");
  } else {
    const total = +key.split(":")[1],
      delta = total - s.current,
      full = delta >= s.minRaise;
    pay(s, p, total - s.bets[p]);
    s.current = total;
    if (full) {
      s.minRaise = delta;
      s.rights = s.chips.map((x, i) => i !== p && x > 0 && !s.folded[i]);
    }
    s.pending = s.chips.map(
      (x, i) => i !== p && x > 0 && !s.folded[i] && s.bets[i] < s.current,
    );
    s.log.push("J" + (p + 1) + " sube a " + total);
  }
  s.scores = [...s.chips];
  if (s.folded.filter((x) => !x).length === 1) {
    settle(s);
    return s;
  }
  if (!s.pending.some(Boolean)) {
    nextStreet(s);
    return s;
  }
  do {
    s.turn = (s.turn + 1) % n;
  } while (!s.pending[s.turn]);
  s.message = "Apuesta " + s.current + " · mínimo de subida " + s.minRaise;
  return s;
}
export function automatic(s: State) {
  const a = actions(s);
  if (!a.length) return s;
  const h = s.hands[s.turn],
    call = s.current - s.bets[s.turn],
    known = [...h, ...s.board],
    category =
      known.length >= 5
        ? Math.floor(rankHand(known) / 15 ** 5)
        : h[0].rank === h[1].rank
          ? 2
          : Math.max(...h.map(high)) >= 12
            ? 1
            : 0;
  const raise = a.find((a) => a.key.startsWith("raise:"));
  if (category >= 2 && raise && s.current <= 12) return apply(s, raise.key);
  if (call > 30 && category < 1) return apply(s, "fold");
  return apply(s, "call");
}
export function view(s: State) {
  return {
    hand: s.hands[s.turn].map((c) => display(c, "h" + c.id)),
    table: [...s.board, ...(s.revealed ? s.hands.flat() : [])].map((c, i) =>
      display(c, "b" + i),
    ),
    summary:
      ["Preflop", "Flop", "Turn", "River"][s.street] +
      " · bote " +
      s.paid.reduce((a, b) => a + b, 0) +
      " · " +
      s.chips
        .map((x, i) => "J" + (i + 1) + ": " + x + (s.folded[i] ? " fuera" : ""))
        .join(" / "),
    notes: [
      "Una mano de Texas Hold’em No-Limit: 100 fichas, ciegas 1/2, dos cartas propias, cinco comunitarias, mejor combinación de cinco entre siete. All-in, botes secundarios y empate con reparto; una subida incompleta no reabre el derecho a subir. Sin dinero ni torneo persistente. Fichas impares se asignan por orden de puesto entre ganadores.",
      ...s.log,
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
