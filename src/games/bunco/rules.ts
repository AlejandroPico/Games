import type { DicePosition, DiceAction } from "../../shared/DiceTable";
const die = () => 1 + Math.floor(Math.random() * 6);
const roll = (n: number) => Array.from({ length: n }, die);
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export interface State extends DicePosition {
  round: number;
  local: number[];
  target: number;
  rolls: number;
}
export const initial = (_n = 4, target = 6): State => ({
  turn: 0,
  winner: null,
  scores: [0, 0, 0, 0],
  dice: [],
  message: "Ronda 1 · equipos J1+J3 y J2+J4",
  step: 0,
  round: 1,
  local: [0, 0],
  target,
  rolls: 0,
});
export const actions = (s: State) =>
  s.winner !== null
    ? []
    : [{ key: "roll", label: "Lanzar buscando " + s.round }];
export function apply(s: State, key: string) {
  if (key !== "roll" || s.winner !== null) return s;
  const x = structuredClone(s);
  x.step++;
  x.rolls++;
  x.dice = roll(3);
  const triple = x.dice.every((d) => d === x.dice[0]),
    p = triple
      ? x.dice[0] === x.round
        ? 21
        : 5
      : x.dice.filter((d) => d === x.round).length,
    team = x.turn % 2;
  x.local[team] += p;
  x.message = "Ronda " + x.round + " · equipos " + x.local.join(" : ");
  if (x.local[team] >= 21 || x.rolls >= 200) {
    const w = best(x.local);
    if (w >= 0) {
      x.scores[w]++;
      x.scores[w + 2]++;
    }
    x.round++;
    x.local = [0, 0];
    x.rolls = 0;
    if (x.round > 6) {
      x.winner = best([x.scores[0], x.scores[1]]);
      x.outcome =
        x.winner === -1
          ? "Empate entre equipos"
          : x.winner === 0
            ? "Gana el equipo J1 + J3"
            : "Gana el equipo J2 + J4";
      x.message =
        "Final · victorias de equipos " + x.scores[0] + " : " + x.scores[1];
    } else x.message = "Ronda " + x.round + " · comienza otra ronda";
    x.turn = (x.turn + 1) % 4;
  } else if (!p) x.turn = (x.turn + 1) % 4;
  return x;
}
export const automatic = (s: State) => apply(s, "roll");
