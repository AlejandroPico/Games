import type { DicePosition, DiceAction } from "../../shared/DiceTable";
const die = () => 1 + Math.floor(Math.random() * 6);
const roll = (n: number) => Array.from({ length: n }, die);
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export interface State extends DicePosition {
  point: number;
  round: number;
  target: number;
}
export const initial = (n = 2, target = 10): State => ({
  turn: 0,
  winner: null,
  scores: Array(n).fill(10),
  dice: [],
  message: "Salida: 7 u 11 ganan; 2, 3 o 12 pierden",
  step: 0,
  point: 0,
  round: 0,
  target,
});
export const actions = (s: State) =>
  s.winner !== null
    ? []
    : [
        {
          key: "roll",
          label: s.point
            ? "Buscar punto " + s.point + " antes de 7"
            : "Lanzamiento de salida",
        },
      ];
export function apply(s: State, key: string) {
  if (key !== "roll" || s.winner !== null) return s;
  const x = structuredClone(s);
  x.step++;
  x.dice = roll(2);
  const v = x.dice[0] + x.dice[1];
  let result = 0;
  if (!x.point) {
    if (v === 7 || v === 11) result = 1;
    else if ([2, 3, 12].includes(v)) result = -1;
    else x.point = v;
  } else if (v === x.point) result = 1;
  else if (v === 7) result = -1;
  if (result) {
    x.scores[x.turn] += result;
    x.message =
      result > 0 ? "Éxito: +1 crédito ficticio" : "Fallo: −1 crédito ficticio";
    x.point = 0;
    x.turn = (x.turn + 1) % x.scores.length;
    x.round++;
    if (x.round >= x.target * x.scores.length) x.winner = best(x.scores);
  } else x.message = "Punto " + x.point + " · suma " + v;
  return x;
}
export const automatic = (s: State) => apply(s, "roll");
