import type {
  LogicEngine,
  LogicPosition,
  LogicView,
} from "../../shared/LogicTable";
import { copy, shuffle, pick } from "../../shared/tableUtils";

export interface State extends LogicPosition {
  cells: number[];
  rows: number[][];
  cols: number[][];
}
export function clues(line: number[]): number[] {
  const out: number[] = [];
  let run = 0;
  for (const v of [...line, 0]) {
    if (v === 1) run++;
    else if (run) {
      out.push(run);
      run = 0;
    }
  }
  return out;
}
function patterns(n: number, c: number[]): number[][] {
  const out: number[][] = [];
  for (let m = 0; m < 2 ** n; m++) {
    const a = Array.from({ length: n }, (_, i) => (m >> i) & 1);
    if (JSON.stringify(clues(a)) === JSON.stringify(c)) out.push(a);
  }
  return out;
}
export function solve(
  rows: number[][],
  cols: number[][],
  limit = 1,
): number[][] {
  const n = rows.length,
    r = rows.map((c) => patterns(n, c)),
    col = cols.map((c) => patterns(n, c)),
    solutions: number[][] = [];
  let visits = 0;
  const walk = (y: number, grid: number[], options: number[][][]) => {
    if (++visits > 30000 || solutions.length >= limit) return;
    if (y === n) {
      solutions.push(grid);
      return;
    }
    for (const row of r[y]) {
      const next = options.map((a, x) => a.filter((p) => p[y] === row[x]));
      if (next.every((a) => a.length)) walk(y + 1, [...grid, ...row], next);
    }
  };
  walk(0, [], col);
  return visits > 30000 && limit > 1 ? [] : solutions;
}
export function initial(size: number): State {
  const n = [5, 8, 10].includes(size) ? size : 5;
  let cells: number[] = [],
    rows: number[][] = [],
    cols: number[][] = [];
  for (let attempt = 0; attempt < 8; attempt++) {
    cells = Array.from({ length: n * n }, () => (Math.random() < 0.55 ? 1 : 0));
    rows = Array.from({ length: n }, (_, y) =>
      clues(cells.slice(y * n, (y + 1) * n)),
    );
    cols = Array.from({ length: n }, (_, x) =>
      clues(Array.from({ length: n }, (_, y) => cells[y * n + x])),
    );
    if (solve(rows, cols, 2).length === 1) break;
    cells = [];
  }
  if (!cells.length) {
    const reverse = Math.random() < 0.5;
    cells = Array.from({ length: n * n }, (_, i) =>
      (reverse ? n - 1 - (i % n) : i % n) + Math.floor(i / n) < n ? 1 : 0,
    );
    rows = Array.from({ length: n }, (_, y) =>
      clues(cells.slice(y * n, (y + 1) * n)),
    );
    cols = Array.from({ length: n }, (_, x) =>
      clues(Array.from({ length: n }, (_, y) => cells[y * n + x])),
    );
  }
  return {
    size: n,
    cells: cells.map(() => -1),
    rows,
    cols,
    turn: 0,
    winner: null,
    step: 0,
    message: "Completa las secuencias de filas y columnas",
  };
}
export function solved(s: State): boolean {
  return (
    s.rows.every(
      (c, y) =>
        JSON.stringify(c) ===
        JSON.stringify(clues(s.cells.slice(y * s.size, (y + 1) * s.size))),
    ) &&
    s.cols.every(
      (c, x) =>
        JSON.stringify(c) ===
        JSON.stringify(
          clues(
            Array.from({ length: s.size }, (_, y) => s.cells[y * s.size + x]),
          ),
        ),
    )
  );
}
export function apply(s: State, key: string): State {
  const [i, v] = key.split(":").map(Number);
  if (
    s.winner !== null ||
    !Number.isInteger(i) ||
    i < 0 ||
    i >= s.cells.length ||
    ![-1, 0, 1].includes(v)
  )
    return s;
  const t = copy(s);
  t.cells[i] = v;
  t.step++;
  if (solved(t)) t.winner = 0;
  return t;
}
export function automatic(s: State): State {
  const answer = solve(s.rows, s.cols)[0];
  if (!answer) return s;
  const i = answer.findIndex((v, i) => v !== s.cells[i]);
  return i < 0 ? { ...s, winner: 0 } : apply(s, i + ":" + answer[i]);
}
export function view(s: State, tool: string): LogicView {
  const n = s.size,
    cols = n + 1;
  return {
    columns: cols,
    tools: [
      { key: "1", label: "■ Pintar" },
      { key: "0", label: "× Vacío" },
      { key: "X", label: "Borrar" },
    ],
    cells: Array.from({ length: cols * cols }, (_, i) => {
      const x = (i % cols) - 1,
        y = Math.floor(i / cols) - 1,
        j = y * n + x;
      return x < 0 || y < 0
        ? {
            key: i,
            label: "Pistas",
            text:
              x < 0 && y < 0
                ? ""
                : (x < 0 ? s.rows[y] : s.cols[x]).join(x < 0 ? " " : "\n") ||
                  "0",
            kind: "clue",
          }
        : {
            key: i,
            label: "Fila " + (y + 1) + ", columna " + (x + 1),
            text: s.cells[j] === 0 ? "×" : "",
            kind: s.cells[j] === 1 ? "filled" : "",
            action: j + ":" + (tool === "X" ? -1 : Number(tool)),
          };
    }),
    notes: [
      "Los grupos negros aparecen en el orden indicado y se separan por al menos un vacío.",
      "Pintar / marcar vacío / borrar; también puedes cambiar herramienta con 1, 0 y X. Cada tablero tiene solución única.",
    ],
  };
}

export const engine: LogicEngine<State> = { initial, apply, automatic, view };
