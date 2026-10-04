import type { DicePosition, DiceAction } from "../../shared/DiceTable";
const die = () => 1 + Math.floor(Math.random() * 6);
const roll = (n: number) => Array.from({ length: n }, die);
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export interface State extends DicePosition {
  hands: number[][];
  bid: { count: number; face: number; actor: number } | null;
  phase: "bid" | "reveal";
  palifico: boolean;
  used: boolean[];
  starter: number;
}
export const initial = (n = 2, _target = 5): State => {
  const hands = Array.from({ length: n }, () => roll(5));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(5),
    hands,
    dice: hands[0],
    message: "Los unos son comodines salvo en palifico",
    step: 0,
    bid: null,
    phase: "bid",
    palifico: false,
    used: Array(n).fill(false),
    starter: 0,
  };
};
const next = (s: State, t: number) => {
  do {
    t = (t + 1) % s.scores.length;
  } while (!s.scores[t]);
  return t;
};
export function legalBid(s: State, count: number, face: number) {
  if (
    count < 1 ||
    count > s.scores.reduce((a, b) => a + b, 0) ||
    face < 1 ||
    face > 6
  )
    return false;
  if (!s.bid) return true;
  const b = s.bid;
  if (s.palifico)
    return count > b.count && (face === b.face || s.scores[s.turn] === 1);
  if (b.face === 1 && face !== 1) return count >= b.count * 2 + 1;
  if (b.face !== 1 && face === 1) return count >= Math.ceil(b.count / 2);
  return count > b.count || (count === b.count && face > b.face);
}
export function actions(s: State): DiceAction[] {
  if (s.winner !== null) return [];
  if (s.phase === "reveal")
    return [{ key: "next", label: "Nueva ronda: volver a ocultar los dados" }];
  const a: DiceAction[] = s.bid
    ? [{ key: "dudo", label: "Dudo: revelar y comprobar la última propuesta" }]
    : [];
  for (let n = 1; n <= s.scores.reduce((a, b) => a + b, 0); n++)
    for (let f = 1; f <= 6; f++)
      if (legalBid(s, n, f))
        a.push({ key: n + "," + f, label: n + " dados de cara " + f });
  return a;
}
export function apply(s: State, key: string) {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s);
  x.step++;
  if (key === "next") {
    x.hands = x.scores.map(roll);
    x.bid = null;
    x.phase = "bid";
    x.palifico = x.scores[x.turn] === 1 && !x.used[x.turn];
    if (x.palifico) x.used[x.turn] = true;
    x.dice = x.hands[x.turn];
    x.message = x.palifico
      ? "Palifico: sin comodines, cara bloqueada"
      : "Nueva ronda · unos comodines";
  } else if (key === "dudo") {
    const b = x.bid!,
      actual = x.hands
        .flat()
        .filter(
          (d) => d === b.face || (!x.palifico && b.face !== 1 && d === 1),
        ).length,
      loser = actual >= b.count ? x.turn : b.actor;
    x.scores[loser]--;
    x.dice = x.hands.flat();
    x.message = "Había " + actual + " · J" + (loser + 1) + " pierde un dado";
    x.turn = x.scores[loser] ? loser : next(x, loser);
    x.phase = "reveal";
    if (x.scores.filter(Boolean).length === 1)
      x.winner = x.scores.findIndex(Boolean);
  } else {
    const [count, face] = key.split(",").map(Number);
    x.bid = { count, face, actor: x.turn };
    x.turn = next(x, x.turn);
    x.dice = x.hands[x.turn];
    x.message =
      "Última propuesta: " +
      count +
      " dados de " +
      face +
      (x.palifico ? " · palifico" : "");
  }
  return x;
}
export function automatic(s: State) {
  if (s.phase === "reveal") return apply(s, "next");
  const own = s.hands[s.turn],
    total = s.scores.reduce((a, b) => a + b, 0),
    b = s.bid;
  if (b) {
    const known = own.filter(
        (d) => d === b.face || (!s.palifico && b.face !== 1 && d === 1),
      ).length,
      expect =
        known +
        (total - own.length) * (s.palifico || b.face === 1 ? 1 / 6 : 1 / 3);
    if (b.count > expect + 0.4) return apply(s, "dudo");
  }
  const a = actions(s).filter((a) => a.key !== "dudo");
  let choice = a[0];
  let value = -Infinity;
  for (const c of a) {
    const [n, f] = c.key.split(",").map(Number),
      known = own.filter(
        (d) => d === f || (!s.palifico && f !== 1 && d === 1),
      ).length,
      v =
        known +
        (total - own.length) * (s.palifico || f === 1 ? 1 / 6 : 1 / 3) -
        n;
    if (v > value) {
      value = v;
      choice = c;
    }
  }
  return apply(s, choice?.key || "dudo");
}
