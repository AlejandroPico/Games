import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { graph, valid, pick, type Point } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  pieces: number[];
  history: string[];
  quiet: number;
}
const points: Point[] = Array.from({ length: 36 }, (_, i) => [
  100 + (i % 6) * 42,
  100 + Math.floor(i / 6) * 42,
]);
const links: [number, number][] = points.flatMap((_, i) => [
  ...(i % 6 < 5 ? [[i, i + 1] as [number, number]] : []),
  ...(i < 30 ? [[i, i + 6] as [number, number]] : []),
]);
export function initial(): State {
  return {
    pieces: Array.from({ length: 36 }, (_, i) =>
      i < 12 ? 1 : i >= 24 ? 0 : -1,
    ),
    turn: 0,
    winner: null,
    scores: [12, 12],
    step: 0,
    message: "Captura recorriendo al menos un bucle y sin atravesar fichas.",
    history: [],
    quiet: 0,
  };
}
/** Follow a rail straight through intersections. An outer ray may turn only on a corner loop. */
export function captures(s: State, from: number) {
  const out = new Set<number>();
  for (let d = 0; d < 4; d++) {
    let pos = from,
      dir = d,
      loop = false;
    const seen = new Set<string>();
    for (let t = 0; t < 200; t++) {
      const k = pos + "," + dir + "," + loop;
      if (seen.has(k)) break;
      seen.add(k);
      let x = pos % 6,
        y = Math.floor(pos / 6),
        nx = x + [0, 1, 0, -1][dir],
        ny = y + [-1, 0, 1, 0][dir];
      if (nx < 0 || nx > 5 || ny < 0 || ny > 5) {
        if (dir === 0 && (x === 1 || x === 2)) {
          nx = 0;
          ny = x;
          dir = 1;
        } else if (dir === 0 && (x === 3 || x === 4)) {
          nx = 5;
          ny = 5 - x;
          dir = 3;
        } else if (dir === 2 && (x === 1 || x === 2)) {
          nx = 0;
          ny = 5 - x;
          dir = 1;
        } else if (dir === 2 && (x === 3 || x === 4)) {
          nx = 5;
          ny = x;
          dir = 3;
        } else if (dir === 3 && (y === 1 || y === 2)) {
          nx = y;
          ny = 0;
          dir = 2;
        } else if (dir === 3 && (y === 3 || y === 4)) {
          nx = 5 - y;
          ny = 5;
          dir = 0;
        } else if (dir === 1 && (y === 1 || y === 2)) {
          nx = 5 - y;
          ny = 0;
          dir = 2;
        } else if (dir === 1 && (y === 3 || y === 4)) {
          nx = y;
          ny = 5;
          dir = 0;
        } else break;
        loop = true;
      }
      pos = ny * 6 + nx;
      const piece = pos === from ? -1 : s.pieces[pos];
      if (piece >= 0) {
        if (loop && piece !== s.turn) out.add(pos);
        break;
      }
    }
  }
  return [...out];
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  return s.pieces.flatMap((p, from) =>
    p === s.turn
      ? [
          ...s.pieces.flatMap((v, to) =>
            v < 0 &&
            Math.max(
              Math.abs((from % 6) - (to % 6)),
              Math.abs(Math.floor(from / 6) - Math.floor(to / 6)),
            ) === 1
              ? [{ from, to, tool: 0 }]
              : [],
          ),
          ...captures(s, from).map((to) => ({ from, to, tool: 0 })),
        ]
      : [],
  );
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    pieces: [...s.pieces],
    history: [...s.history],
    step: s.step + 1,
    turn: 1 - s.turn,
    quiet: s.pieces[a.to] >= 0 ? 0 : s.quiet + 1,
  };
  n.pieces[a.from] = -1;
  n.pieces[a.to] = s.turn;
  n.scores = [
    n.pieces.filter((v) => v === 0).length,
    n.pieces.filter((v) => v === 1).length,
  ];
  if (!n.scores[1 - s.turn] || !actions(n).length) n.winner = s.turn;
  const k = n.pieces.join() + n.turn;
  n.history.push(k);
  if (
    n.winner === null &&
    (n.history.filter((v) => v === k).length >= 3 ||
      n.quiet >= 100 ||
      n.step >= 600)
  )
    n.winner = -1;
  return n;
}
export const tools = () => [{ key: 0, label: "Mover / capturar por bucle" }];
const paths: string[] = [];
for (const k of [1, 2]) {
  const r = k * 42;
  paths.push(
    "M" + (100 + r) + " 100 A" + r + " " + r + " 0 1 0 100 " + (100 + r),
    "M" + (310 - r) + " 100 A" + r + " " + r + " 0 1 1 310 " + (100 + r),
    "M" + (100 + r) + " 310 A" + r + " " + r + " 0 1 1 100 " + (310 - r),
    "M" + (310 - r) + " 310 A" + r + " " + r + " 0 1 0 310 " + (310 - r),
  );
}
export const board = (s: State) => ({
  ...graph(points, links, s.pieces, undefined, 12, paths),
  graph: {
    ...graph(points, links, s.pieces, undefined, 12, paths).graph,
    width: 410,
    height: 410,
  },
});
export const automatic = (s: State) =>
  pick(
    s,
    actions(s),
    apply,
    (n, p) =>
      n.scores[p] * 10 -
      n.scores[1 - p] * 30 -
      n.pieces.reduce(
        (v, x, i) =>
          v + (x === 1 - p ? captures({ ...n, turn: 1 - p }, i).length * 3 : 0),
        0,
      ),
  );
