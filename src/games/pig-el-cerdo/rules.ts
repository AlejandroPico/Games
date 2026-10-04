import type { DicePosition, DiceAction } from "../../shared/DiceTable";
const die = () => 1 + Math.floor(Math.random() * 6);
const roll = (n: number) => Array.from({ length: n }, die);
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export interface State extends DicePosition {
  bank: number;
  target: number;
}
export const initial = (n = 2, target = 100): State => ({
  turn: 0,
  winner: null,
  scores: Array(n).fill(0),
  dice: [],
  message: "Lanza o conserva tus puntos",
  step: 0,
  bank: 0,
  target,
});
export const actions = (s: State) =>
  s.winner !== null
    ? []
    : [
        { key: "roll", label: "Lanzar el dado" },
        ...(s.bank > 0
          ? [{ key: "bank", label: "Plantarse: guardar " + s.bank }]
          : []),
      ];
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s);
  x.step++;
  if (key === "bank") {
    x.scores[x.turn] += x.bank;
    if (x.scores[x.turn] >= x.target) x.winner = x.turn;
    x.bank = 0;
    x.turn = (x.turn + 1) % x.scores.length;
    x.message = "Puntos conservados";
  } else {
    x.dice = roll(1);
    if (x.dice[0] === 1) {
      x.bank = 0;
      x.turn = (x.turn + 1) % x.scores.length;
      x.message = "Uno: pierdes el acumulado del turno";
    } else {
      x.bank += x.dice[0];
      x.message = "Acumulado del turno: " + x.bank;
    }
  }
  return x;
}
export const automatic = (s: State) =>
  apply(
    s,
    s.bank >= 20 || s.scores[s.turn] + s.bank >= s.target ? "bank" : "roll",
  );
