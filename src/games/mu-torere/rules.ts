import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { graph, valid, pick, type Point } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  pieces: number[];
  history: string[];
}
const points: Point[] = Array.from({ length: 8 }, (_, i) => [
  175 + 140 * Math.sin((i * Math.PI) / 4),
  175 - 140 * Math.cos((i * Math.PI) / 4),
]);
points.push([175, 175]);
const links: [number, number][] = Array.from({ length: 8 }, (_, i) => [
  i,
  (i + 1) % 8,
]);
links.push(...Array.from({ length: 8 }, (_, i) => [i, 8] as [number, number]));
export function initial(): State {
  return {
    pieces: [0, 0, 0, 0, 1, 1, 1, 1, -1],
    turn: 0,
    winner: null,
    scores: [4, 4],
    step: 0,
    history: [],
    message:
      "Mueve por el aro o hacia el centro. La primera jugada debe permitir respuesta.",
  };
}
function moves(b: number[], p: number) {
  return links.flatMap(([x, y]) =>
    b[x] === p && b[y] < 0
      ? [{ from: x, to: y, tool: 0 }]
      : b[y] === p && b[x] < 0
        ? [{ from: y, to: x, tool: 0 }]
        : [],
  );
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  return moves(s.pieces, s.turn).filter((a) => {
    if (s.step) return true;
    const b = [...s.pieces];
    b[a.to] = s.turn;
    b[a.from] = -1;
    return moves(b, 1 - s.turn).length > 0;
  });
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    pieces: [...s.pieces],
    history: [...s.history],
    turn: 1 - s.turn,
    step: s.step + 1,
  };
  n.pieces[a.from] = -1;
  n.pieces[a.to] = s.turn;
  if (!moves(n.pieces, n.turn).length) n.winner = s.turn;
  const k = n.pieces.join() + n.turn;
  n.history.push(k);
  if (
    n.winner === null &&
    (n.history.filter((v) => v === k).length >= 3 || n.step >= 300)
  )
    n.winner = -1;
  n.message = "Bloquea los movimientos del rival sin capturar.";
  return n;
}
export const tools = () => [{ key: 0, label: "Mover" }];
export const board = (s: State) =>
  graph(points, links, s.pieces, undefined, 16);
export const automatic = (s: State) =>
  pick(
    s,
    actions(s),
    apply,
    (n, p) =>
      moves(n.pieces, p).length -
      moves(n.pieces, 1 - p).length * 3 -
      n.history.filter((k) => k === n.pieces.join() + n.turn).length,
  );
