import type { DicePosition, DiceAction } from "../../shared/DiceTable";
const die = () => 1 + Math.floor(Math.random() * 6);
const roll = (n: number) => Array.from({ length: n }, die);
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export interface State extends DicePosition {
  hands: number[][];
  claim: number;
  claimant: number;
  phase: "claim" | "reveal";
}
export const categories = [
  "Nada",
  "Pareja",
  "Dos parejas",
  "Trío",
  "Escalera",
  "Full",
  "Póker",
  "Cinco iguales",
];
export function rank(d: number[]) {
  const c = Array(7).fill(0);
  d.forEach((v) => c[v]++);
  const a = c.filter(Boolean).sort((a, b) => b - a);
  if (a[0] === 5) return 7;
  if (a[0] === 4) return 6;
  if (a[0] === 3 && a[1] === 2) return 5;
  if (new Set(d).size === 5 && Math.max(...d) - Math.min(...d) === 4) return 4;
  if (a[0] === 3) return 3;
  if (a[0] === 2 && a[1] === 2) return 2;
  if (a[0] === 2) return 1;
  return 0;
}
export const initial = (n = 2, _target = 5): State => {
  const hands = Array.from({ length: n }, () => roll(5));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(5),
    dice: hands[0],
    message:
      "Variante de póker mentiroso: anuncia una categoría de tu propia mano",
    step: 0,
    hands,
    claim: -1,
    claimant: 0,
    phase: "claim",
  };
};
const next = (s: State, t: number) => {
  do {
    t = (t + 1) % s.scores.length;
  } while (!s.scores[t]);
  return t;
};
export const actions = (s: State): DiceAction[] =>
  s.winner !== null
    ? []
    : s.phase === "reveal"
      ? [{ key: "next", label: "Nueva ronda" }]
      : [
          ...(s.claim >= 0
            ? [{ key: "dudo", label: "Desafiar la mano del anterior jugador" }]
            : []),
          ...categories.flatMap((v, i) =>
            i > s.claim ? [{ key: "" + i, label: "Tengo al menos " + v }] : [],
          ),
        ];
export function apply(s: State, key: string) {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s);
  x.step++;
  if (key === "next") {
    x.hands = x.scores.map((n) => (n ? roll(5) : []));
    x.claim = -1;
    x.phase = "claim";
    x.dice = x.hands[x.turn];
    x.message = "Dados ocultos nuevos";
  } else if (key === "dudo") {
    const actual = rank(x.hands[x.claimant]),
      loser = actual >= x.claim ? x.turn : x.claimant;
    x.scores[loser]--;
    x.dice = x.hands[x.claimant];
    x.message =
      "Mano real: " + categories[actual] + " · pierde una vida J" + (loser + 1);
    x.turn = x.scores[loser] ? loser : next(x, loser);
    x.phase = "reveal";
    if (x.scores.filter(Boolean).length === 1)
      x.winner = x.scores.findIndex(Boolean);
  } else {
    x.claim = +key;
    x.claimant = x.turn;
    x.turn = next(x, x.turn);
    x.dice = x.hands[x.turn];
    x.message = "J" + (x.claimant + 1) + " afirma " + categories[x.claim];
  }
  return x;
}
export function automatic(s: State) {
  if (s.phase === "reveal") return apply(s, "next");
  const r = rank(s.hands[s.turn]);
  return apply(
    s,
    s.claim >= r && s.claim >= 0 ? "dudo" : "" + Math.max(s.claim + 1, r),
  );
}
