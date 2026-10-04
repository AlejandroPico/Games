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
  quilts: number[][];
  size: number;
  time: number[];
  income: number[];
  market: number[];
  cursor: number;
  limit: number;
}
export const initial = (_n = 2, size = 9): State => ({
  turn: 0,
  winner: null,
  scores: [5, 5],
  step: 0,
  message: "Compra uno de tres retales o avanza para ganar botones",
  quilts: [Array(size * size).fill(-1), Array(size * size).fill(-1)],
  size,
  time: [0, 0],
  income: [0, 0],
  market: shapes.map((_, i) => i).filter((i) => i > 0),
  cursor: 0,
  limit: size === 6 ? 32 : 53,
});
export const patch = (id: number) => ({
  cost: Math.max(1, shapes[id].length - 1 + (id % 3)),
  time: 2 + (id % 4),
  income: id % 3 === 0 ? 1 : 0,
});
export function placement(s: State, to: number, tool: number) {
  const id = Math.floor(tool / 8),
    shape = orient(shapes[id], tool % 8),
    c = to % s.size,
    r = Math.floor(to / s.size);
  if (shape.some(([x, y]) => c + x >= s.size || r + y >= s.size)) return null;
  const indices = shape.map(([x, y]) => (r + y) * s.size + c + x);
  return indices.some((i) => s.quilts[s.turn][i] >= 0) ? null : indices;
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  const a: BoardAction[] = [{ from: -1, to: -1, tool: -1 }];
  for (let j = 0; j < Math.min(3, s.market.length); j++) {
    const id = s.market[(s.cursor + j) % s.market.length];
    if (patch(id).cost > s.scores[s.turn]) continue;
    for (let k = 0; k < 8; k++)
      for (let to = 0; to < s.size * s.size; to++)
        if (placement(s, to, id * 8 + k))
          a.push({ from: -1, to, tool: id * 8 + k });
  }
  return a;
}
export function apply(s: State, a: BoardAction) {
  if (!actions(s).some((b) => same(a, b))) return s;
  const x = structuredClone(s),
    p = x.turn,
    old = x.time[p];
  x.step++;
  if (a.to < 0) {
    x.time[p] = Math.min(x.limit, x.time[1 - p] + 1);
    x.scores[p] += x.time[p] - old;
  } else {
    const id = Math.floor(a.tool / 8),
      data = patch(id);
    placement(x, a.to, a.tool)!.forEach((i) => (x.quilts[p][i] = id));
    x.scores[p] -= data.cost;
    x.income[p] += data.income;
    x.time[p] = Math.min(x.limit, old + data.time);
    const index = x.market.indexOf(id);
    x.market.splice(index, 1);
    x.cursor = x.market.length ? index % x.market.length : 0;
  }
  x.scores[p] +=
    (Math.floor(x.time[p] / 8) - Math.floor(old / 8)) * x.income[p];
  if (x.time.every((t) => t === x.limit)) {
    x.scores = x.scores.map(
      (v, i) => v - 2 * x.quilts[i].filter((v) => v < 0).length,
    );
    x.winner = best(x.scores);
  } else x.turn = x.time[p] <= x.time[1 - p] && x.time[p] < x.limit ? p : 1 - p;
  x.message =
    "Tiempo " + x.time.join(" / ") + " · ingresos " + x.income.join(" / ");
  return x;
}
export function automatic(s: State) {
  const a = actions(s);
  let choice = a[0],
    v = -Infinity;
  for (const m of a) {
    const value =
      m.tool < 0
        ? -2
        : shapes[Math.floor(m.tool / 8)].length * 3 -
          patch(Math.floor(m.tool / 8)).cost +
          patch(Math.floor(m.tool / 8)).income * 3;
    if (value > v) {
      v = value;
      choice = m;
    }
  }
  return apply(s, choice);
}
export const tools = (s: State) => {
  const a = new Set(actions(s).map((a) => a.tool));
  return [...a].map((key) => {
    const id = Math.floor(key / 8),
      p = key >= 0 ? patch(id) : null;
    return {
      key,
      label: p
        ? "Retal " +
          (id + 1) +
          " · " +
          shapes[id].length +
          " cuadros · coste " +
          p.cost +
          " · tiempo " +
          p.time +
          " · ingresos " +
          p.income +
          " · giro " +
          (key % 4) * 90 +
          "°" +
          (key % 8 >= 4 ? " reflejado" : "")
        : "Avanzar: cobrar botones",
    };
  });
};
export const board = (s: State) => ({
  columns: s.size,
  cells: s.quilts[s.turn].map(
    (v, i): BoardCell => ({
      key: i,
      text: v >= 0 ? "✣" : "",
      color:
        v >= 0
          ? ["#90b6ac", "#c9a590", "#a6a5c4", "#b6be82"][v % 4]
          : undefined,
      label:
        "Colcha J" +
        (s.turn + 1) +
        " · casilla " +
        (Math.floor(i / s.size) + 1) +
        "," +
        ((i % s.size) + 1),
    }),
  ),
});
export const preview = (_s: State, tool: number) =>
  tool >= 0 ? orient(shapes[Math.floor(tool / 8)], tool % 8) : [];
