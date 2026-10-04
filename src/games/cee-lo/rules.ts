import type { DicePosition, DiceAction } from "../../shared/DiceTable";
const die = () => 1 + Math.floor(Math.random() * 6);
const roll = (n: number) => Array.from({ length: n }, die);
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export interface State extends DicePosition {
  ranks: number[];
  round: number;
  target: number;
  attempts: number;
}
export function rank(d: number[]) {
  const a = [...d].sort();
  if (a.join("") === "456") return 200;
  if (a.join("") === "123") return -1;
  if (a[0] === a[2]) return 100 + a[0];
  if (a[0] === a[1]) return a[2];
  if (a[1] === a[2]) return a[0];
  return 0;
}
export const initial = (n = 2, target = 6): State => ({
  turn: 0,
  winner: null,
  scores: Array(n).fill(0),
  dice: [],
  message: "Consigue una combinación de tres dados",
  step: 0,
  ranks: Array(n).fill(0),
  round: 0,
  target,
  attempts: 0,
});
export const actions = (s: State) =>
  s.winner !== null ? [] : [{ key: "roll", label: "Lanzar tres dados" }];
export function apply(s: State, key: string) {
  if (key !== "roll" || s.winner !== null) return s;
  const x = structuredClone(s);
  x.step++;
  x.dice = roll(3);
  x.attempts++;
  let r = rank(x.dice);
  if (!r && x.attempts < 3) {
    x.message = "Sin combinación · vuelve a lanzar";
    return x;
  }
  if (!r) r = -2;
  x.ranks[x.turn] = r;
  x.attempts = 0;
  x.message = "Valor de mano: " + r + " (4-5-6=200; triples=100+cara)";
  x.turn++;
  if (x.turn === x.scores.length) {
    const w = best(x.ranks);
    if (w >= 0) x.scores[w]++;
    x.ranks.fill(0);
    x.turn = 0;
    x.round++;
    if (x.round >= x.target) x.winner = best(x.scores);
  }
  return x;
}
export const automatic = (s: State) => apply(s, "roll");
