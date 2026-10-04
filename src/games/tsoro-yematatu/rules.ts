import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { graph, valid, pick, type Point } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  pieces: number[];
  reserve: number[];
  history: string[];
}
export const lines = [
  [0, 1, 4],
  [0, 2, 5],
  [0, 3, 6],
  [1, 2, 3],
  [4, 5, 6],
];
const points: Point[] = [
  [170, 28],
  [95, 148],
  [170, 148],
  [245, 148],
  [20, 268],
  [170, 268],
  [320, 268],
];
export function initial(): State {
  return {
    pieces: Array(7).fill(-1),
    reserve: [3, 3],
    turn: 0,
    winner: null,
    scores: [0, 0],
    step: 0,
    message: "Coloca tres fichas para alinear tres.",
    history: [],
  };
}
export function actions(s: State): BoardAction[] {
  return s.winner !== null
    ? []
    : s.pieces.flatMap((v, to) =>
        v < 0
          ? s.reserve[s.turn]
            ? [{ from: -1, to, tool: 0 }]
            : s.pieces.flatMap((w, from) =>
                w === s.turn ? [{ from, to, tool: 0 }] : [],
              )
          : [],
      );
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    pieces: [...s.pieces],
    reserve: [...s.reserve],
    history: [...s.history],
    step: s.step + 1,
  };
  if (a.from < 0) n.reserve[s.turn]--;
  else n.pieces[a.from] = -1;
  n.pieces[a.to] = s.turn;
  if (lines.some((l) => l.every((i) => n.pieces[i] === s.turn)))
    n.winner = s.turn;
  n.turn = 1 - s.turn;
  const k = n.pieces.join() + n.turn + n.reserve.join();
  n.history.push(k);
  if (
    n.winner === null &&
    (n.history.filter((v) => v === k).length >= 3 || n.step >= 200)
  )
    n.winner = -1;
  n.message = n.reserve[n.turn]
    ? "Coloca tu siguiente ficha."
    : "Mueve cualquier ficha al único punto vacío.";
  return n;
}
export const tools = () => [{ key: 0, label: "Colocar / mover" }];
export const board = (s: State) =>
  graph(
    points,
    lines.flatMap(
      (l) =>
        [
          [l[0], l[1]],
          [l[1], l[2]],
        ] as [number, number][],
    ),
    s.pieces,
  );
export const automatic = (s: State) =>
  pick(s, actions(s), apply, (n, p) => {
    if (n.winner === p) return 1e6;
    let threat = 0;
    for (const a of actions(n)) {
      if (apply(n, a).winner === 1 - p) threat -= 1000;
    }
    return (
      threat +
      lines.reduce(
        (v, l) =>
          v +
          (l.filter((i) => n.pieces[i] === p).length === 2 &&
          !l.some((i) => n.pieces[i] === 1 - p)
            ? 5
            : 0),
        0,
      )
    );
  });
