import type {
  LogicEngine,
  LogicPosition,
  LogicView,
} from "../../shared/LogicTable";
import { copy, shuffle, pick } from "../../shared/tableUtils";

export interface Run {
  cells: number[];
  sum: number;
}
export interface State extends LogicPosition {
  values: number[];
  runs: Run[];
}
export function solutions(s: State, limit = 1): number[][] {
  const n = s.size,
    cells = Array.from({ length: n * n }, (_, i) => i).filter((i) =>
      s.runs.some((r) => r.cells.includes(i)),
    ),
    values = Array(n * n).fill(0),
    out: number[][] = [];
  let budget = 200000;
  const walk = () => {
    if (--budget < 0 || out.length >= limit) return;
    let best = -1,
      options: number[] = [];
    for (const i of cells)
      if (!values[i]) {
        const allowed = Array.from({ length: 9 }, (_, i) => i + 1).filter((v) =>
          s.runs
            .filter((r) => r.cells.includes(i))
            .every((r) => {
              const used = r.cells
                .filter((j) => j !== i && values[j])
                .map((j) => values[j]);
              if (used.includes(v)) return false;
              const sum = used.reduce((a, b) => a + b, 0) + v,
                empty = r.cells.filter((j) => j !== i && !values[j]).length,
                remain = Array.from({ length: 9 }, (_, i) => i + 1).filter(
                  (x) => x !== v && !used.includes(x),
                );
              return empty === 0
                ? sum === r.sum
                : sum + remain.slice(0, empty).reduce((a, b) => a + b, 0) <=
                    r.sum &&
                    sum + remain.slice(-empty).reduce((a, b) => a + b, 0) >=
                      r.sum;
            }),
        );
        if (!allowed.length) return;
        if (best < 0 || allowed.length < options.length) {
          best = i;
          options = allowed;
        }
      }
    if (best < 0) {
      out.push([...values]);
      return;
    }
    for (const v of options) {
      values[best] = v;
      walk();
      values[best] = 0;
    }
  };
  walk();
  return out;
}
export function initial(size: number): State {
  const n = size === 10 ? 10 : 7,
    values = Array(n * n).fill(-1),
    runs: Run[] = [];
  const blocks =
    n === 7
      ? [
          [1, 1],
          [1, 4],
          [4, 1],
          [4, 4],
        ]
      : [
          [1, 1],
          [1, 4],
          [1, 7],
          [4, 1],
          [4, 4],
          [4, 7],
          [7, 1],
          [7, 4],
          [7, 7],
        ];
  // Independent two-by-two crossing panels use unique sum systems; transformations vary each session.
  for (const [y, x] of blocks) {
    if (y + 1 >= n || x + 1 >= n) continue;
    const c = [y * n + x, y * n + x + 1, (y + 1) * n + x, (y + 1) * n + x + 1];
    const patterns = [
        [1, 2, 3, 1],
        [2, 1, 1, 3],
        [1, 3, 2, 1],
        [3, 1, 1, 2],
      ],
      v = pick(patterns);
    for (const i of c) values[i] = 0;
    runs.push(
      { cells: [c[0], c[1]], sum: v[0] + v[1] },
      { cells: [c[2], c[3]], sum: v[2] + v[3] },
      { cells: [c[0], c[2]], sum: v[0] + v[2] },
      { cells: [c[1], c[3]], sum: v[1] + v[3] },
    );
  }
  return {
    size: n,
    values,
    runs,
    turn: 0,
    winner: null,
    step: 0,
    message: "Completa las sumas sin repetir cifras en cada tramo",
  };
}
export function valid(s: State): boolean {
  return s.runs.every(
    (r) =>
      r.cells.every((i) => s.values[i] > 0) &&
      new Set(r.cells.map((i) => s.values[i])).size === r.cells.length &&
      r.cells.reduce((v, i) => v + s.values[i], 0) === r.sum,
  );
}
export function apply(s: State, key: string): State {
  const [i, v] = key.split(":").map(Number);
  if (
    s.winner !== null ||
    !Number.isInteger(i) ||
    s.values[i] === undefined ||
    s.values[i] < 0 ||
    !Number.isInteger(v) ||
    v < 0 ||
    v > 9
  )
    return s;
  const t = copy(s);
  t.values[i] = v;
  t.step++;
  if (valid(t)) t.winner = 0;
  return t;
}
export function automatic(s: State): State {
  const answer = solutions(s)[0];
  if (!answer) return s;
  const i = s.values.findIndex((v, i) => v >= 0 && v !== answer[i]);
  return i < 0 ? { ...s, winner: 0 } : apply(s, i + ":" + answer[i]);
}
export function view(s: State, tool: string): LogicView {
  return {
    columns: s.size,
    tools: Array.from({ length: 10 }, (_, i) => ({
      key: String(i),
      label: i ? String(i) : "Borrar",
    })),
    cells: s.values.map((v, i) => ({
      key: i,
      label: "Casilla " + (i + 1),
      text: v > 0 ? String(v) : "",
      kind: v < 0 ? "wall" : "",
      action: v >= 0 ? i + ":" + (Number(tool) || 0) : undefined,
      top:
        v < 0
          ? s.runs.find((r) => r.cells[0] === i + s.size)?.sum.toString()
          : undefined,
      left:
        v < 0
          ? s.runs
              .find(
                (r) =>
                  r.cells[0] === i + 1 &&
                  Math.floor(i / s.size) === Math.floor((i + 1) / s.size),
              )
              ?.sum.toString()
          : undefined,
    })),
    notes: [
      "Edición de entrenamiento: paneles de dos por dos con sumas cruzadas.",
      "Pistas por coordenadas:",
      ...s.runs.map(
        (r) =>
          "[" +
          r.cells
            .map(
              (i) =>
                "F" + (Math.floor(i / s.size) + 1) + "C" + ((i % s.size) + 1),
            )
            .join(", ") +
          "] suma " +
          r.sum,
      ),
      "Cada tramo usa cifras 1–9 distintas. Cualquier solución que cumpla todas las sumas es válida.",
    ],
  };
}

export const engine: LogicEngine<State> = { initial, apply, automatic, view };
