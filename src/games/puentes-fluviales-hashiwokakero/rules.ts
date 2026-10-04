import type {
  LogicEngine,
  LogicPosition,
  LogicView,
} from "../../shared/LogicTable";
import { copy, shuffle, pick } from "../../shared/tableUtils";

export interface Edge {
  a: number;
  b: number;
  count: number;
}
export interface State extends LogicPosition {
  islands: { x: number; y: number; need: number }[];
  edges: Edge[];
}
function crossing(s: State, a: Edge, b: Edge): boolean {
  const p = s.islands[a.a],
    q = s.islands[a.b],
    r = s.islands[b.a],
    t = s.islands[b.b];
  if (p.y === q.y && r.x === t.x)
    return (
      r.x > Math.min(p.x, q.x) &&
      r.x < Math.max(p.x, q.x) &&
      p.y > Math.min(r.y, t.y) &&
      p.y < Math.max(r.y, t.y)
    );
  if (p.x === q.x && r.y === t.y) return crossing(s, b, a);
  return false;
}
export function initial(size: number): State {
  const n = size === 5 ? 5 : 3,
    islands = Array.from({ length: n * n }, (_, i) => ({
      x: (i % n) * 70,
      y: Math.floor(i / n) * 70,
      need: 0,
    })),
    edges: Edge[] = [];
  for (let i = 0; i < islands.length; i++) {
    if (i % n < n - 1) edges.push({ a: i, b: i + 1, count: 0 });
    if (i < islands.length - n) edges.push({ a: i, b: i + n, count: 0 });
  }
  // Generate connected comb networks, then derive clues. Solvers accept every legal network.
  for (const e of edges) {
    const a = islands[e.a],
      b = islands[e.b],
      on = a.y === b.y || a.x === 0;
    const count = on ? (Math.random() < 0.5 ? 1 : 2) : 0;
    islands[e.a].need += count;
    islands[e.b].need += count;
  }
  return {
    size: n,
    islands,
    edges,
    turn: 0,
    winner: null,
    step: 0,
    message: "Une todas las islas con uno o dos puentes",
  };
}
export function valid(s: State): boolean {
  if (
    !s.islands.every(
      (p, i) =>
        s.edges
          .filter((e) => e.a === i || e.b === i)
          .reduce((n, e) => n + e.count, 0) === p.need,
    )
  )
    return false;
  if (
    s.edges.some(
      (e, i) =>
        e.count &&
        s.edges.some((q, j) => j > i && q.count && crossing(s, e, q)),
    )
  )
    return false;
  const seen = new Set([0]),
    q = [0];
  for (let i = 0; i < q.length; i++)
    for (const e of s.edges)
      if (e.count && (e.a === q[i] || e.b === q[i])) {
        const j = e.a === q[i] ? e.b : e.a;
        if (!seen.has(j)) {
          seen.add(j);
          q.push(j);
        }
      }
  return seen.size === s.islands.length;
}
export function apply(s: State, key: string): State {
  const i = Number(key);
  if (s.winner !== null || !Number.isInteger(i) || i < 0 || i >= s.edges.length)
    return s;
  const t = copy(s);
  t.edges[i].count = (t.edges[i].count + 1) % 3;
  if (
    t.edges[i].count &&
    t.edges.some((e, j) => j !== i && e.count && crossing(t, t.edges[i], e))
  )
    return s;
  t.step++;
  if (valid(t)) t.winner = 0;
  return t;
}
export function solution(s: State): number[] {
  let budget = 300000;
  const t = copy(s);
  t.edges.forEach((e) => (e.count = 0));
  const walk = (idx: number): number[] | null => {
    if (--budget < 0) return null;
    if (idx === t.edges.length)
      return valid(t) ? t.edges.map((e) => e.count) : null;
    const e = t.edges[idx];
    for (let count = 2; count >= 0; count--) {
      e.count = count;
      if (
        count &&
        t.edges.slice(0, idx).some((q) => q.count && crossing(t, e, q))
      )
        continue;
      const possible = t.islands.every((p, j) => {
        const used = t.edges
            .slice(0, idx + 1)
            .filter((e) => e.a === j || e.b === j)
            .reduce((n, e) => n + e.count, 0),
          left = t.edges
            .slice(idx + 1)
            .filter((e) => e.a === j || e.b === j).length;
        return used <= p.need && used + 2 * left >= p.need;
      });
      if (possible) {
        const result = walk(idx + 1);
        if (result) return result;
      }
    }
    e.count = 0;
    return null;
  };
  return walk(0) || [];
}
export function automatic(s: State): State {
  const answer = solution(s),
    i = answer.findIndex((v, i) => v !== s.edges[i].count);
  return i < 0 ? (valid(s) ? { ...s, winner: 0 } : s) : apply(s, String(i));
}
export function view(s: State): LogicView {
  return {
    columns: 1,
    cells: [],
    graph: {
      width: (s.size - 1) * 70,
      height: (s.size - 1) * 70,
      nodes: s.islands.map((p, i) => ({
        key: i,
        x: p.x,
        y: p.y,
        text: String(p.need),
      })),
      edges: s.edges.map((e, i) => ({
        from: e.a,
        to: e.b,
        count: e.count,
        action: String(i),
      })),
    },
    notes: [
      "Pulsa un enlace tenue para ciclar 0 → 1 → 2 → 0 puentes.",
      "Solo se unen islas vecinas alineadas, sin atravesar otra isla ni cruzar puentes. Cada número indica el total de puentes que debe tocar la isla; la red final debe estar conectada.",
      "Esta edición usa redes regulares generadas. Puede admitir más de una solución: se acepta cualquier red válida.",
    ],
  };
}

export const engine: LogicEngine<State> = { initial, apply, automatic, view };
