import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { graph, valid, pick, type Point } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  pieces: number[];
  goats: number;
  caught: number;
  history: string[];
}
const points: Point[] = Array.from({ length: 25 }, (_, i) => [
  28 + (i % 5) * 70,
  28 + Math.floor(i / 5) * 70,
]);
export const adjacent = (a: number, b: number) => {
  const x = a % 5,
    y = Math.floor(a / 5),
    u = b % 5,
    v = Math.floor(b / 5);
  return (
    Math.abs(x - u) <= 1 &&
    Math.abs(y - v) <= 1 &&
    (x !== u || y !== v) &&
    (x === u || y === v || (x + y) % 2 === 0)
  );
};
const links: [number, number][] = points.flatMap((_, a) =>
  points.flatMap((_, b) =>
    b > a && adjacent(a, b) ? [[a, b] as [number, number]] : [],
  ),
);
export function initial(): State {
  const b = Array(25).fill(-1);
  [0, 4, 20, 24].forEach((i) => (b[i] = 1));
  return {
    pieces: b,
    goats: 20,
    caught: 0,
    turn: 0,
    winner: null,
    scores: [20, 0],
    step: 0,
    history: [],
    message: "Cabras: coloca una ficha. Tigres: salta para capturar cinco.",
  };
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  if (s.turn === 0 && s.goats)
    return s.pieces.flatMap((v, to) =>
      v < 0 ? [{ from: -1, to, tool: 0 }] : [],
    );
  return s.pieces.flatMap((v, from) =>
    v === s.turn
      ? s.pieces.flatMap((w, to) => {
          if (w >= 0) return [];
          if (adjacent(from, to)) return [{ from, to, tool: 0 }];
          const dx = (to % 5) - (from % 5),
            dy = Math.floor(to / 5) - Math.floor(from / 5),
            mid = (from + to) / 2;
          if (
            s.turn === 1 &&
            Math.max(Math.abs(dx), Math.abs(dy)) === 2 &&
            (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) &&
            adjacent(from, mid) &&
            s.pieces[mid] === 0
          )
            return [{ from, to, tool: 0 }];
          return [];
        })
      : [],
  );
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    pieces: [...s.pieces],
    history: [...s.history],
    scores: [...s.scores],
    step: s.step + 1,
    turn: 1 - s.turn,
  };
  if (a.from < 0) n.goats--;
  else {
    n.pieces[a.from] = -1;
    if (
      Math.max(
        Math.abs((a.to % 5) - (a.from % 5)),
        Math.abs(Math.floor(a.to / 5) - Math.floor(a.from / 5)),
      ) === 2
    ) {
      n.pieces[(a.to + a.from) / 2] = -1;
      n.caught++;
    }
  }
  n.pieces[a.to] = s.turn;
  n.scores = [20 - n.caught, n.caught];
  if (n.caught >= 5) n.winner = 1;
  if (n.winner === null) {
    if (!actions({ ...n, turn: 1 }).length) n.winner = 0;
    else if (!actions(n).length) n.winner = 1;
  }
  const k = n.pieces.join() + n.turn + n.goats;
  n.history.push(k);
  if (
    n.winner === null &&
    (n.history.filter((v) => v === k).length >= 3 || n.step >= 500)
  )
    n.winner = -1;
  n.message =
    n.turn === 0
      ? n.goats
        ? "Coloca una cabra; faltan " + n.goats + "."
        : "Mueve una cabra por las líneas."
      : "Mueve un tigre o salta una cabra.";
  return n;
}
export const tools = (s: State) => [
  { key: 0, label: s.turn === 0 && s.goats ? "Colocar cabra" : "Mover" },
];
export const board = (s: State) => graph(points, links, s.pieces, ["●", "虎"]);
export const automatic = (s: State) =>
  pick(s, actions(s), apply, (n, p) => {
    const mobility = actions({ ...n, turn: 1, winner: null }).length;
    return p === 1 ? n.caught * 50 + mobility : -n.caught * 70 - mobility * 2;
  });
