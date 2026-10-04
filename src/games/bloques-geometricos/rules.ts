import type {
  AbstractPosition,
  BoardAction,
  BoardCell,
} from "../../shared/AbstractTable";
const same = (a: BoardAction, b: BoardAction) =>
  a.from === b.from && a.to === b.to && a.tool === b.tool;
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};
export type Shape = [number, number][];
const normalize = (a: Shape): Shape => {
  const x = Math.min(...a.map((v) => v[0])),
    y = Math.min(...a.map((v) => v[1]));
  return a
    .map(([q, r]) => [q - x, r - y] as [number, number])
    .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
};
export function orient(shape: Shape, k: number): Shape {
  let a = shape.map(([q, r]) => [k >= 4 ? -q : q, r] as [number, number]);
  for (let i = 0; i < k % 4; i++) a = a.map(([q, r]) => [-r, q]);
  return normalize(a);
}
const signature = (a: Shape) =>
  normalize(a)
    .map((v) => v.join(","))
    .join(";");
export function polyominoes() {
  let layer: Shape[] = [[[0, 0]]];
  const out = [...layer];
  for (let n = 2; n <= 5; n++) {
    const seen = new Set<string>(),
      next: Shape[] = [];
    for (const a of layer)
      for (const [x, y] of a)
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const p: [number, number] = [x + dx, y + dy];
          if (a.some((v) => v[0] === p[0] && v[1] === p[1])) continue;
          const b = normalize([...a, p]),
            key = Array.from({ length: 8 }, (_, k) =>
              signature(orient(b, k)),
            ).sort()[0];
          if (!seen.has(key)) {
            seen.add(key);
            next.push(b);
          }
        }
    layer = next;
    out.push(...next);
  }
  return out;
}
export const shapes = polyominoes();

export interface State extends AbstractPosition {
  cells: number[];
  size: number;
  reserve: number[][];
  passes: number;
}
export const initial = (n = 4, size = 20): State => ({
  turn: 0,
  winner: null,
  scores: Array(n).fill(0),
  step: 0,
  message:
    "Coloca una pieza desde tu esquina; las propias solo se tocan por vértices",
  cells: Array(size * size).fill(-1),
  size,
  reserve: Array.from({ length: n }, () => shapes.map((_, i) => i)),
  passes: 0,
});
const orth = (i: number, n: number) =>
  [
    i % n ? i - 1 : -1,
    i % n < n - 1 ? i + 1 : -1,
    i >= n ? i - n : -1,
    i < n * (n - 1) ? i + n : -1,
  ].filter((v) => v >= 0);
const diagonal = (i: number, n: number) =>
  [-1, 1].flatMap((x) =>
    [-1, 1].flatMap((y) => {
      const c = (i % n) + x,
        r = Math.floor(i / n) + y;
      return c >= 0 && r >= 0 && c < n && r < n ? [r * n + c] : [];
    }),
  );
export function placement(s: State, to: number, tool: number) {
  if (
    !Number.isInteger(to) ||
    !Number.isInteger(tool) ||
    to < 0 ||
    to >= s.cells.length ||
    tool < 0 ||
    tool >= shapes.length * 8
  )
    return null;
  const id = Math.floor(tool / 8),
    shape = orient(shapes[id], tool % 8),
    c = to % s.size,
    r = Math.floor(to / s.size);
  if (!s.reserve[s.turn].includes(id)) return null;
  const indices = shape.map(([x, y]) => (r + y) * s.size + c + x);
  if (
    shape.some(([x, y]) => c + x >= s.size || r + y >= s.size) ||
    indices.some(
      (i) =>
        s.cells[i] >= 0 || orth(i, s.size).some((j) => s.cells[j] === s.turn),
    )
  )
    return null;
  const first = s.reserve[s.turn].length === shapes.length,
    corners =
      s.scores.length === 2
        ? [0, s.size * s.size - 1]
        : [0, s.size - 1, s.size * s.size - 1, s.size * (s.size - 1)];
  if (
    first
      ? !indices.includes(corners[s.turn])
      : !indices.some((i) =>
          diagonal(i, s.size).some((j) => s.cells[j] === s.turn),
        )
  )
    return null;
  return indices;
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  const a: BoardAction[] = [],
    corners =
      s.scores.length === 2
        ? [0, s.size * s.size - 1]
        : [0, s.size - 1, s.size * s.size - 1, s.size * (s.size - 1)],
    first = s.reserve[s.turn].length === shapes.length,
    anchors = first
      ? [corners[s.turn]]
      : s.cells
          .flatMap((v, i) => (v === s.turn ? diagonal(i, s.size) : []))
          .filter((i) => s.cells[i] < 0);
  for (const id of s.reserve[s.turn]) {
    const unique = new Set<string>();
    for (let k = 0; k < 8; k++) {
      const shape = orient(shapes[id], k),
        sig = signature(shape);
      if (unique.has(sig)) continue;
      unique.add(sig);
      const checked = new Set<number>();
      for (const anchor of anchors)
        for (const [x, y] of shape) {
          const c = (anchor % s.size) - x,
            r = Math.floor(anchor / s.size) - y;
          if (c < 0 || r < 0) continue;
          const to = r * s.size + c;
          if (checked.has(to)) continue;
          checked.add(to);
          if (placement(s, to, id * 8 + k))
            a.push({ from: -1, to, tool: id * 8 + k });
        }
    }
  }
  return a.length ? a : [{ from: -1, to: -1, tool: -1 }];
}
export function apply(s: State, a: BoardAction) {
  if (a.from !== -1) return s;
  if (a.to < 0 && !actions(s).some((b) => same(a, b))) return s;
  const cells = a.to >= 0 ? placement(s, a.to, a.tool) : null;
  if ((a.to >= 0 && !cells) || s.winner !== null) return s;
  const x = structuredClone(s);
  x.step++;
  if (cells) {
    for (const i of cells) x.cells[i] = x.turn;
    x.reserve[x.turn] = x.reserve[x.turn].filter(
      (v) => v !== Math.floor(a.tool / 8),
    );
    x.scores[x.turn] += cells.length;
    x.passes = 0;
  } else x.passes++;
  x.turn = (x.turn + 1) % x.scores.length;
  if (x.passes === x.scores.length) x.winner = best(x.scores);
  x.message = "Coloca desde un vértice iluminado · puntos: casillas cubiertas";
  return x;
}
export function automatic(s: State) {
  const a = actions(s);
  a.sort(
    (a, b) =>
      (b.tool < 0 ? 0 : shapes[Math.floor(b.tool / 8)].length) -
      (a.tool < 0 ? 0 : shapes[Math.floor(a.tool / 8)].length),
  );
  return a.length ? apply(s, a[0]) : s;
}
export const tools = (s: State) => {
  const legal = new Set(actions(s).map((a) => a.tool));
  return [...legal].map((key) => ({
    key,
    label:
      key < 0
        ? "Pasar: sin colocaciones"
        : "Pieza " +
          (Math.floor(key / 8) + 1) +
          " (" +
          shapes[Math.floor(key / 8)].length +
          " cuadros), giro " +
          (key % 4) * 90 +
          "°" +
          (key % 8 >= 4 ? " reflejado" : ""),
  }));
};
export const board = (s: State) => ({
  columns: s.size,
  cells: s.cells.map(
    (v, i): BoardCell => ({
      key: i,
      text: v >= 0 ? "■" : "",
      owner: v >= 0 ? v : undefined,
      color:
        v >= 0 ? ["#75afc3", "#cf9390", "#b6c987", "#d1bb74"][v] : undefined,
      label:
        "Casilla " +
        (Math.floor(i / s.size) + 1) +
        "," +
        ((i % s.size) + 1) +
        (v >= 0 ? " · J" + (v + 1) : ""),
    }),
  ),
});
export const preview = (_s: State, tool: number) =>
  tool >= 0 ? orient(shapes[Math.floor(tool / 8)], tool % 8) : [];
