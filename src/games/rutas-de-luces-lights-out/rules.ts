import type {
  LogicEngine,
  LogicPosition,
  LogicView,
} from "../../shared/LogicTable";
import { copy, shuffle, pick } from "../../shared/tableUtils";

export interface State extends LogicPosition {
  lights: number[];
}
function neighbors(i: number, n: number): number[] {
  return [
    i,
    i % n > 0 ? i - 1 : -1,
    i % n < n - 1 ? i + 1 : -1,
    i >= n ? i - n : -1,
    i < n * (n - 1) ? i + n : -1,
  ].filter((x) => x >= 0);
}
export function initial(size: number): State {
  const n = [3, 5, 7].includes(size) ? size : 3,
    s: State = {
      size: n,
      lights: Array(n * n).fill(0),
      turn: 0,
      winner: null,
      step: 0,
      message: "Apaga todas las luces",
    };
  for (const i of shuffle(Array.from({ length: n * n }, (_, i) => i)).slice(
    0,
    Math.ceil(n * n * 0.6),
  ))
    for (const j of neighbors(i, n)) s.lights[j] ^= 1;
  if (!s.lights.some(Boolean))
    for (const j of neighbors(0, n)) s.lights[j] ^= 1;
  return s;
}
export function apply(s: State, key: string): State {
  const i = Number(key);
  if (
    s.winner !== null ||
    !Number.isInteger(i) ||
    i < 0 ||
    i >= s.lights.length
  )
    return s;
  const t = copy(s);
  for (const j of neighbors(i, s.size)) t.lights[j] ^= 1;
  t.step++;
  if (!t.lights.some(Boolean)) t.winner = 0;
  return t;
}
export function solution(s: State): number[] {
  const n = s.lights.length,
    a = Array.from({ length: n }, (_, r) => [
      ...Array.from({ length: n }, (_, c) =>
        neighbors(c, s.size).includes(r) ? 1 : 0,
      ),
      s.lights[r],
    ]);
  const pivots: number[] = [];
  let row = 0;
  for (let c = 0; c < n; c++) {
    const p = a.findIndex((r, i) => i >= row && r[c]);
    if (p < 0) continue;
    [a[row], a[p]] = [a[p], a[row]];
    for (let r = 0; r < n; r++)
      if (r !== row && a[r][c])
        for (let k = c; k <= n; k++) a[r][k] ^= a[row][k];
    pivots.push(c);
    row++;
  }
  if (a.some((r) => r.slice(0, n).every((x) => !x) && r[n])) return [];
  const x = Array(n).fill(0);
  pivots.forEach((c, r) => (x[c] = a[r][n]));
  return x.flatMap((v, i) => (v ? [i] : []));
}
export function automatic(s: State): State {
  const moves = solution(s);
  return moves.length
    ? apply(s, String(moves[0]))
    : s.lights.some(Boolean)
      ? s
      : { ...s, winner: 0 };
}
export function view(s: State): LogicView {
  return {
    columns: s.size,
    cells: s.lights.map((v, i) => ({
      key: i,
      label: "Luz " + (i + 1) + (v ? " encendida" : " apagada"),
      text: v ? "✦" : "·",
      kind: v ? "filled" : "",
      action: String(i),
    })),
    notes: [
      "Pulsar una luz invierte esa casilla y las vecinas ortogonales. Los bordes no se conectan.",
      "El generador parte de un tablero apagado; la IA calcula una solución por eliminación binaria, sin usar una respuesta guardada.",
    ],
  };
}

export const engine: LogicEngine<State> = { initial, apply, automatic, view };
