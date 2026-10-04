import type { AbstractPosition, BoardAction, BoardCell } from "./AbstractTable";
export type Point = [number, number];
/** Geometry only: no game rules, turns or captures are shared here. */
export function graph(
  points: Point[],
  links: [number, number][],
  pieces: number[],
  names?: string[],
  radius = 13,
  paths?: string[],
) {
  const cells: BoardCell[] = points.map(([x, y], key) => ({
    key,
    x,
    y,
    text: pieces[key] >= 0 ? names?.[pieces[key]] || "●" : "",
    owner: pieces[key] >= 0 ? pieces[key] : undefined,
    label: `Punto ${key + 1}: ${pieces[key] >= 0 ? "J" + (pieces[key] + 1) : "vacío"}`,
  }));
  return {
    columns: 1,
    cells,
    graph: {
      width: Math.max(...points.map((p) => p[0])) + 28,
      height: Math.max(...points.map((p) => p[1])) + 28,
      links,
      radius,
      paths,
    },
  };
}
export function grid(
  pieces: number[],
  columns: number,
  special: Record<number, string> = {},
) {
  return {
    columns,
    cells: pieces.map((p, key) => ({
      key,
      text: p >= 0 ? "●" : special[key] || "",
      owner: p >= 0 ? p : undefined,
      label: `Casilla ${key + 1}: ${p >= 0 ? "J" + (p + 1) : special[key] || "vacía"}`,
      color: special[key] ? "#bba675" : undefined,
    })),
  };
}
export function valid(action: BoardAction, list: BoardAction[]) {
  return list.some(
    (a) =>
      a.from === action.from && a.to === action.to && a.tool === action.tool,
  );
}
export function pick<T extends AbstractPosition>(
  s: T,
  actions: BoardAction[],
  apply: (s: T, a: BoardAction) => T,
  evaluate: (s: T, p: number) => number,
): T {
  if (!actions.length) return s;
  if (actions.length === 1) return apply(s, actions[0]);
  let best = actions[0],
    value = -Infinity;
  for (const a of actions) {
    const n = apply(s, a),
      v =
        n.winner === s.turn
          ? 1e6
          : n.winner !== null && n.winner >= 0
            ? -1e6
            : evaluate(n, s.turn) + Math.random() * 0.3;
    if (v > value) {
      best = a;
      value = v;
    }
  }
  return apply(s, best);
}
export const millPoints: Point[] = [
  [25, 25],
  [175, 25],
  [325, 25],
  [325, 175],
  [325, 325],
  [175, 325],
  [25, 325],
  [25, 175],
  [75, 75],
  [175, 75],
  [275, 75],
  [275, 175],
  [275, 275],
  [175, 275],
  [75, 275],
  [75, 175],
  [125, 125],
  [175, 125],
  [225, 125],
  [225, 175],
  [225, 225],
  [175, 225],
  [125, 225],
  [125, 175],
];
export const millLines = [
  [0, 1, 2],
  [2, 3, 4],
  [4, 5, 6],
  [6, 7, 0],
  [8, 9, 10],
  [10, 11, 12],
  [12, 13, 14],
  [14, 15, 8],
  [16, 17, 18],
  [18, 19, 20],
  [20, 21, 22],
  [22, 23, 16],
  [1, 9, 17],
  [3, 11, 19],
  [5, 13, 21],
  [7, 15, 23],
];
export const millLinks: [number, number][] = millLines.flatMap(
  (l) =>
    [
      [l[0], l[1]],
      [l[1], l[2]],
    ] as [number, number][],
);
