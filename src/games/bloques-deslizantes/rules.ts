import type {
  LogicEngine,
  LogicPosition,
  LogicView,
} from "../../shared/LogicTable";
import { copy, shuffle, pick } from "../../shared/tableUtils";

export interface State extends LogicPosition {
  tiles: number[];
  previous: number;
}
function moves(s: State): number[] {
  const i = s.tiles.indexOf(0),
    n = s.size;
  return [
    i % n ? i - 1 : -1,
    i % n < n - 1 ? i + 1 : -1,
    i >= n ? i - n : -1,
    i < n * (n - 1) ? i + n : -1,
  ].filter((i) => i >= 0);
}
export function distance(a: number[], n: number): number {
  return a.reduce(
    (v, t, i) =>
      v +
      (t
        ? Math.abs((i % n) - ((t - 1) % n)) +
          Math.abs(Math.floor(i / n) - Math.floor((t - 1) / n))
        : 0),
    0,
  );
}
export function initial(size: number): State {
  const n = size === 4 ? 4 : 3,
    s: State = {
      size: n,
      tiles: Array.from({ length: n * n }, (_, i) => (i + 1) % (n * n)),
      previous: -1,
      turn: 0,
      winner: null,
      step: 0,
      message: "Ordena los bloques; el hueco termina abajo a la derecha",
    };
  for (let k = 0; k < (n === 3 ? 22 : 32); k++) {
    const i = pick(moves(s).filter((i) => i !== s.previous)),
      z = s.tiles.indexOf(0);
    [s.tiles[z], s.tiles[i]] = [s.tiles[i], s.tiles[z]];
    s.previous = z;
  }
  return s;
}
export function apply(s: State, key: string): State {
  const i = Number(key);
  if (s.winner !== null || !moves(s).includes(i)) return s;
  const t = copy(s),
    z = t.tiles.indexOf(0);
  [t.tiles[z], t.tiles[i]] = [t.tiles[i], t.tiles[z]];
  t.previous = z;
  t.step++;
  if (!distance(t.tiles, t.size)) t.winner = 0;
  return t;
}
export function search(s: State): number[] {
  const n = s.size,
    a = [...s.tiles],
    path: number[] = [],
    seen = new Set<string>();
  let visited = 0;
  const walk = (g: number, bound: number, z: number, prev: number): number => {
    const h = distance(a, n),
      f = g + h;
    if (f > bound) return f;
    if (!h) return -1;
    if (++visited > 1500000) return Infinity;
    const sig = a.join(",");
    if (seen.has(sig)) return Infinity;
    seen.add(sig);
    let min = Infinity;
    const candidates = [
      z % n ? z - 1 : -1,
      z % n < n - 1 ? z + 1 : -1,
      z >= n ? z - n : -1,
      z < n * (n - 1) ? z + n : -1,
    ]
      .filter((i) => i >= 0 && i !== prev)
      .sort((x, y) => {
        const estimate = (i: number) => {
          const t = a[i];
          return (
            Math.abs((z % n) - ((t - 1) % n)) +
            Math.abs(Math.floor(z / n) - Math.floor((t - 1) / n)) -
            Math.abs((i % n) - ((t - 1) % n)) -
            Math.abs(Math.floor(i / n) - Math.floor((t - 1) / n))
          );
        };
        return estimate(x) - estimate(y);
      });
    for (const i of candidates) {
      [a[z], a[i]] = [a[i], a[z]];
      path.push(i);
      const r = walk(g + 1, bound, i, z);
      if (r === -1) return -1;
      path.pop();
      [a[z], a[i]] = [a[i], a[z]];
      min = Math.min(min, r);
    }
    seen.delete(sig);
    return min;
  };
  let bound = distance(a, n);
  while (bound <= 70) {
    seen.clear();
    const result = walk(0, bound, a.indexOf(0), -1);
    if (result === -1) return path;
    if (!Number.isFinite(result)) break;
    bound = result;
  }
  return [];
}
export function automatic(s: State): State {
  const p = search(s);
  if (p.length) return apply(s, String(p[0]));
  return s;
}
export function view(s: State): LogicView {
  return {
    columns: s.size,
    cells: s.tiles.map((v, i) => ({
      key: i,
      label: v ? "Bloque " + v : "Hueco",
      text: v ? String(v) : "",
      kind: !v ? "wall" : "",
      action: moves(s).includes(i) ? String(i) : undefined,
    })),
    notes: [
      "Edición de bloques numerados: desliza un vecino del hueco y ordena por filas, de menor a mayor.",
      "Todos los tableros se mezclan mediante movimientos legales. La IA busca rutas con IDA* en un Worker; en posiciones manuales muy alejadas puede alcanzar su límite de búsqueda.",
    ],
  };
}

export const engine: LogicEngine<State> = { initial, apply, automatic, view };
