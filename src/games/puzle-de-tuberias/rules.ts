import type {
  LogicEngine,
  LogicPosition,
  LogicView,
} from "../../shared/LogicTable";
import { copy, shuffle, pick } from "../../shared/tableUtils";

export interface State extends LogicPosition {
  pipes: number[];
  source: number;
}
const bits = [1, 2, 4, 8],
  dx = [0, 1, 0, -1],
  dy = [-1, 0, 1, 0];
export function rotate(p: number): number {
  return ((p << 1) & 15) | (p >> 3);
}
export function initial(size: number): State {
  const n = [4, 6, 8].includes(size) ? size : 4,
    pipes = Array(n * n).fill(0),
    visited = new Set([0]),
    stack = [0];
  while (stack.length) {
    const i = stack.at(-1)!,
      x = i % n,
      y = Math.floor(i / n),
      d = shuffle([0, 1, 2, 3]).find(
        (d) =>
          x + dx[d] >= 0 &&
          x + dx[d] < n &&
          y + dy[d] >= 0 &&
          y + dy[d] < n &&
          !visited.has(i + dx[d] + dy[d] * n),
      );
    if (d === undefined) stack.pop();
    else {
      const j = i + dx[d] + dy[d] * n;
      pipes[i] |= bits[d];
      pipes[j] |= bits[(d + 2) % 4];
      visited.add(j);
      stack.push(j);
    }
  }
  for (let i = 0; i < pipes.length; i++)
    for (let k = 0, r = Math.floor(Math.random() * 4); k < r; k++)
      pipes[i] = rotate(pipes[i]);
  return {
    size: n,
    pipes,
    source: 0,
    turn: 0,
    winner: null,
    step: 0,
    message: "Conecta la fuente con todas las tuberías sin fugas",
  };
}
export function connected(s: State): number[] {
  const seen = new Set([s.source]),
    queue = [s.source];
  for (let at = 0; at < queue.length; at++) {
    const i = queue[at],
      x = i % s.size,
      y = Math.floor(i / s.size);
    for (let d = 0; d < 4; d++)
      if (s.pipes[i] & bits[d]) {
        const nx = x + dx[d],
          ny = y + dy[d],
          j = ny * s.size + nx;
        if (
          nx >= 0 &&
          nx < s.size &&
          ny >= 0 &&
          ny < s.size &&
          s.pipes[j] & bits[(d + 2) % 4] &&
          !seen.has(j)
        ) {
          seen.add(j);
          queue.push(j);
        }
      }
  }
  return [...seen];
}
export function solved(s: State): boolean {
  if (connected(s).length !== s.pipes.length) return false;
  return s.pipes.every((p, i) =>
    bits.every((b, d) => {
      if (!(p & b)) return true;
      const x = (i % s.size) + dx[d],
        y = Math.floor(i / s.size) + dy[d];
      return (
        x >= 0 &&
        x < s.size &&
        y >= 0 &&
        y < s.size &&
        !!(s.pipes[y * s.size + x] & bits[(d + 2) % 4])
      );
    }),
  );
}
export function apply(s: State, key: string): State {
  const i = Number(key);
  if (s.winner !== null || !Number.isInteger(i) || i < 0 || i >= s.pipes.length)
    return s;
  const t = copy(s);
  t.pipes[i] = rotate(t.pipes[i]);
  t.step++;
  if (solved(t)) t.winner = 0;
  return t;
}
export function solution(s: State): number[] {
  const n = s.size,
    opts = s.pipes.map((p, i) => {
      const a = new Set<number>();
      for (let k = 0; k < 4; k++, p = rotate(p))
        if (
          bits.every(
            (b, d) =>
              !(p & b) ||
              ((i % n) + dx[d] >= 0 &&
                (i % n) + dx[d] < n &&
                Math.floor(i / n) + dy[d] >= 0 &&
                Math.floor(i / n) + dy[d] < n),
          )
        )
          a.add(p);
      return [...a];
    });
  let budget = 100000;
  const walk = (a: number[][]): number[] | null => {
    if (--budget < 0) return null;
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < a.length; i++) {
        const next = a[i].filter((p) =>
          bits.every((b, d) => {
            const x = (i % n) + dx[d],
              y = Math.floor(i / n) + dy[d];
            if (x < 0 || x >= n || y < 0 || y >= n) return !(p & b);
            return a[y * n + x].some(
              (q) => !!(p & b) === !!(q & bits[(d + 2) % 4]),
            );
          }),
        );
        if (!next.length) return null;
        if (next.length !== a[i].length) {
          a[i] = next;
          changed = true;
        }
      }
    }
    const i = a.reduce(
      (best, v, j) =>
        v.length > 1 && (best < 0 || v.length < a[best].length) ? j : best,
      -1,
    );
    if (i < 0) {
      const pipes = a.map((x) => x[0]);
      return solved({ ...s, pipes }) ? pipes : null;
    }
    for (const p of a[i]) {
      const b = a.map((x) => [...x]);
      b[i] = [p];
      const r = walk(b);
      if (r) return r;
    }
    return null;
  };
  return walk(opts) || [];
}
export function automatic(s: State): State {
  if (solved(s)) return { ...s, winner: 0 };
  const answer = solution(s),
    i = answer.findIndex((p, i) => p !== s.pipes[i]);
  return i < 0 ? s : apply(s, String(i));
}
export function view(s: State): LogicView {
  const glyph = [
      "",
      "╵",
      "╶",
      "└",
      "╷",
      "│",
      "┌",
      "├",
      "╴",
      "┘",
      "─",
      "┴",
      "┐",
      "┤",
      "┬",
      "┼",
    ],
    wet = connected(s);
  return {
    columns: s.size,
    cells: s.pipes.map((p, i) => ({
      key: i,
      label: "Tubería " + (i + 1) + ", girar noventa grados",
      text: glyph[p],
      kind: wet.includes(i) ? "path" : "",
      action: String(i),
    })),
    notes: [
      "La fuente está en la esquina superior izquierda. Cada clic gira una pieza en sentido horario.",
      "El agua colorea las piezas conectadas. Para ganar todas deben estar conectadas y ninguna salida puede apuntar al borde o a una pared de otra pieza.",
    ],
  };
}

export const engine: LogicEngine<State> = { initial, apply, automatic, view };
