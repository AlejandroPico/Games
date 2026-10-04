import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { valid, pick } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  pieces: number[][];
  roll: number;
  phase: "roll" | "move";
  dice: number[];
}
export const routes = [
  [3, 2, 1, 0, 8, 9, 10, 11, 12, 13, 14, 15, 7, 6],
  [19, 18, 17, 16, 8, 9, 10, 11, 12, 13, 14, 15, 23, 22],
];
const rosettes = [0, 16, 11, 6, 22];
export function initial(): State {
  return {
    pieces: [Array(7).fill(-1), Array(7).fill(-1)],
    roll: 0,
    dice: [],
    phase: "roll",
    scores: [0, 0],
    turn: 0,
    winner: null,
    step: 0,
    message: "Lanza los cuatro dados binarios y saca tus siete fichas.",
  };
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  if (s.phase === "roll")
    return [{ from: -1, to: -1, tool: 0, label: "Lanzar cuatro dados" }];
  const p = s.turn,
    a: BoardAction[] = [];
  s.pieces[p].forEach((pos, i) => {
    const next = pos + s.roll;
    if (
      s.roll === 0 ||
      pos >= 14 ||
      next > 14 ||
      (next < 14 && s.pieces[p].some((v, j) => j !== i && v === next))
    )
      return;
    const dest = next === 14 ? 24 + p : routes[p][next];
    if (
      dest === 11 &&
      s.pieces[1 - p].some((v) => v >= 0 && v < 14 && routes[1 - p][v] === dest)
    )
      return;
    a.push({ from: pos < 0 ? -1 : routes[p][pos], to: dest, tool: i + 1 });
  });
  return a.length
    ? a
    : [{ from: -1, to: -1, tool: 99, label: "Pasar: no hay movimiento" }];
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    pieces: s.pieces.map((b) => [...b]),
    scores: [...s.scores],
    step: s.step + 1,
  };
  if (s.phase === "roll") {
    n.dice = Array.from({ length: 4 }, () => (Math.random() < 0.5 ? 0 : 1));
    n.roll = n.dice.reduce((a, b) => a + b, 0);
    n.phase = "move";
    n.message =
      "Resultado " +
      n.roll +
      " (" +
      n.dice.join(" + ") +
      "). Elige ficha y destino.";
    return n;
  }
  if (a.tool === 99) {
    n.turn = 1 - s.turn;
    n.phase = "roll";
    n.message = "Sin movimiento: turno del rival.";
    return n;
  }
  const i = a.tool - 1,
    next = n.pieces[s.turn][i] + s.roll;
  n.pieces[s.turn][i] = next;
  const dest = next === 14 ? 24 + s.turn : routes[s.turn][next];
  n.pieces[1 - s.turn] = n.pieces[1 - s.turn].map((v) =>
    v >= 4 && v <= 11 && routes[1 - s.turn][v] === dest ? -1 : v,
  );
  n.scores = n.pieces.map((b) => b.filter((v) => v === 14).length);
  if (n.scores[s.turn] === 7) n.winner = s.turn;
  n.turn = rosettes.includes(dest) ? s.turn : 1 - s.turn;
  n.phase = "roll";
  n.message = rosettes.includes(dest)
    ? "Roseta: vuelves a lanzar."
    : "Lanza los cuatro dados.";
  return n;
}
export const tools = (s: State) =>
  [...new Set(actions(s).map((a) => a.tool))].map((key) => ({
    key,
    label:
      key === 0
        ? "Lanzar"
        : key === 99
          ? "Sin movimiento"
          : "Ficha " +
            key +
            (s.pieces[s.turn][key - 1] < 0 ? " · reserva" : ""),
  }));
export const board = (s: State) => ({
  columns: 8,
  cells: Array.from({ length: 32 }, (_, key) => {
    const owner = s.pieces.findIndex((b, p) =>
      b.some((v) => v >= 0 && v < 14 && routes[p][v] === key),
    );
    return {
      key,
      text:
        key === 24 || key === 25
          ? "↑" + (key - 23)
          : owner >= 0
            ? "●"
            : rosettes.includes(key)
              ? "✧"
              : "",
      owner: owner >= 0 ? owner : undefined,
      void: [4, 5, 20, 21].includes(key) || key > 25,
      label:
        key === 24 || key === 25
          ? "Salida J" + (key - 23)
          : "Casilla " +
            key +
            (owner >= 0
              ? " · J" + (owner + 1)
              : rosettes.includes(key)
                ? " · roseta"
                : ""),
      color: rosettes.includes(key) ? "#ccb27b" : undefined,
    };
  }),
});
export const automatic = (s: State) =>
  pick(
    s,
    actions(s),
    apply,
    (n, p) =>
      n.scores[p] * 100 +
      n.pieces[p].reduce((a, b) => a + Math.max(0, b), 0) +
      n.pieces[1 - p].filter((v) => v < 0).length * 8 +
      (n.turn === p ? 10 : 0),
  );
