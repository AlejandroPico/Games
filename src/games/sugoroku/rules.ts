import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { valid } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  positions: number[];
  wait: number[];
  roll: number;
}
export const jumps: Record<number, number> = {
  3: 10,
  8: 15,
  12: 5,
  17: 24,
  22: 14,
  27: 20,
};
export function initial(players = 2): State {
  return {
    positions: Array(players).fill(0),
    wait: Array(players).fill(0),
    roll: 0,
    turn: 0,
    winner: null,
    scores: Array(players).fill(0),
    step: 0,
    message: "E-sugoroku: viaje ilustrado de Games, treinta estaciones.",
  };
}
export const actions = (s: State): BoardAction[] =>
  s.winner !== null
    ? []
    : [
        {
          from: -1,
          to: -1,
          tool: 0,
          label: s.wait[s.turn] ? "Cumplir descanso" : "Lanzar dado",
        },
      ];
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    positions: [...s.positions],
    wait: [...s.wait],
    scores: [...s.scores],
    step: s.step + 1,
    turn: (s.turn + 1) % s.positions.length,
  };
  if (s.wait[s.turn]) {
    n.wait[s.turn]--;
    n.message = "Descanso: se consume un turno.";
    return n;
  }
  n.roll = 1 + Math.floor(Math.random() * 6);
  let to = s.positions[s.turn] + n.roll;
  if (to > 30) to = 60 - to;
  const landing = to;
  to = jumps[to] || to;
  n.positions[s.turn] = to;
  if (to === 6 || to === 19) n.wait[s.turn] = 1;
  n.scores = [...n.positions];
  n.message =
    "Dado " +
    n.roll +
    " · estación " +
    to +
    (landing !== to ? " · ruta " + landing + " → " + to : "") +
    (n.wait[s.turn] ? " · descansas un turno" : "");
  if (to === 30) n.winner = s.turn;
  return n;
}
export const tools = () => [{ key: 0, label: "Viajar" }];
export const board = (s: State) => ({
  columns: 6,
  cells: Array.from({ length: 30 }, (_, i) => {
    const row = Math.floor(i / 6),
      col = i % 6,
      key = row % 2 ? row * 6 + 6 - col : i + 1,
      ps = s.positions.flatMap((v, p) => (v === key ? [p] : []));
    return {
      key,
      text:
        (ps.length
          ? ps.map((p) => "●" + (p + 1)).join(" ")
          : jumps[key]
            ? "→" + jumps[key]
            : key === 6 || key === 19
              ? "⌂"
              : key === 30
                ? "★"
                : "山") +
        " " +
        key,
      owner: ps[0],
      label: "Estación " + key + (jumps[key] ? " · ir a " + jumps[key] : ""),
      color: jumps[key] ? "#b6c6be" : "#e1cdb0",
    };
  }),
});
export const automatic = (s: State) =>
  s.winner !== null ? s : apply(s, actions(s)[0]);
