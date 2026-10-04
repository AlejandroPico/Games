import type { DicePosition, DiceAction } from "../../shared/DiceTable";
const die = () => 1 + Math.floor(Math.random() * 6);
const roll = (n: number) => Array.from({ length: n }, die);
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export interface State extends DicePosition {
  round: number;
  target: number;
}
export const symbols = [
  "Corona",
  "Ancla",
  "Picas",
  "Corazones",
  "Diamantes",
  "Tréboles",
];
export const initial = (n = 2, target = 10): State => ({
  turn: 0,
  winner: null,
  scores: Array(n).fill(10),
  dice: [],
  message: "Elige un símbolo; créditos ficticios",
  step: 0,
  round: 0,
  target,
});
export const actions = (s: State) =>
  s.winner !== null
    ? []
    : symbols.map((v, i) => ({ key: "" + (i + 1), label: v }));
export function apply(s: State, key: string) {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s);
  x.step++;
  x.dice = roll(3);
  const count = x.dice.filter((d) => d === +key).length;
  x.scores[x.turn] += count || -1;
  x.message =
    symbols[+key - 1] +
    ": " +
    count +
    " coincidencias · " +
    (count ? "+" + count : "−1") +
    " puntos";
  x.turn = (x.turn + 1) % x.scores.length;
  x.round++;
  if (x.round >= x.target * x.scores.length) x.winner = best(x.scores);
  return x;
}
export const automatic = (s: State) => apply(s, "" + die());
