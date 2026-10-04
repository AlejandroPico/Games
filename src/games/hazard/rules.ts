import type { DicePosition, DiceAction } from "../../shared/DiceTable";
const die = () => 1 + Math.floor(Math.random() * 6);
const roll = (n: number) => Array.from({ length: n }, die);
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export interface State extends DicePosition {
  main: number;
  chance: number;
  round: number;
  target: number;
}
export const initial = (n = 2, target = 10): State => ({
  turn: 0,
  winner: null,
  scores: Array(n).fill(10),
  dice: [],
  message: "Escoge un main entre 5 y 9",
  step: 0,
  main: 0,
  chance: 0,
  round: 0,
  target,
});
export const actions = (s: State) =>
  s.winner !== null
    ? []
    : s.main
      ? [
          {
            key: "roll",
            label: s.chance
              ? "Buscar chance " + s.chance + " antes del main " + s.main
              : "Lanzar con main " + s.main,
          },
        ]
      : [5, 6, 7, 8, 9].map((v) => ({ key: "main-" + v, label: "Main " + v }));
export function opening(main: number, v: number) {
  if (
    v === main ||
    (main === 7 && v === 11) ||
    ([6, 8].includes(main) && v === 12)
  )
    return 1;
  if (
    [2, 3].includes(v) ||
    (v === 11 && main !== 7) ||
    (v === 12 && ![6, 8].includes(main))
  )
    return -1;
  return 0;
}
export function apply(s: State, key: string) {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s);
  x.step++;
  if (key.startsWith("main")) {
    x.main = +key.slice(5);
    x.message = "Main " + x.main;
    return x;
  }
  x.dice = roll(2);
  const v = x.dice[0] + x.dice[1];
  const result = x.chance
    ? v === x.chance
      ? 1
      : v === x.main
        ? -1
        : 0
    : opening(x.main, v);
  if (result) {
    x.scores[x.turn] += result;
    x.message =
      result > 0 ? "Éxito: +1 crédito ficticio" : "Fallo: −1 crédito ficticio";
    x.main = 0;
    x.chance = 0;
    x.turn = (x.turn + 1) % x.scores.length;
    x.round++;
    if (x.round >= x.target * x.scores.length) x.winner = best(x.scores);
  } else {
    if (!x.chance) x.chance = v;
    x.message = "Chance " + x.chance + " antes de " + x.main;
  }
  return x;
}
export const automatic = (s: State) => apply(s, s.main ? "roll" : "main-7");
