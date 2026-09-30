export type Node = { cell: number; degree: number };
export type State = {
  width: number;
  height: number;
  nodes: Node[];
  lines: number[][];
  turn: number;
  winner: number;
};
export const initial = (count = 3): State => ({
  width: 41,
  height: 29,
  nodes: Array.from({ length: count }, (_, i) => ({
    cell:
      (i % 2 ? 19 : 9) * 41 + Math.round(7 + (i * 27) / Math.max(1, count - 1)),
    degree: 0,
  })),
  lines: [],
  turn: 1,
  winner: 0,
});
function neighbors(cell: number, s: State, variant = 0) {
  const r = Math.floor(cell / s.width),
    c = cell % s.width,
    ns = [
      [r - 1, c],
      [r, c + 1],
      [r + 1, c],
      [r, c - 1],
    ]
      .filter(([r, c]) => r > 0 && r < s.height - 1 && c > 0 && c < s.width - 1)
      .map(([r, c]) => r * s.width + c);
  return [...ns.slice(variant % 4), ...ns.slice(0, variant % 4)];
}
/** Complete route search on the declared orthogonal digital grid. */
export function route(
  s: State,
  a: number,
  b: number,
  variant = 0,
): number[] | null {
  if (
    s.winner ||
    !s.nodes[a] ||
    !s.nodes[b] ||
    s.nodes[a].degree + (a === b ? 2 : 1) > 3 ||
    s.nodes[b].degree + 1 > 3
  )
    return null;
  const start = s.nodes[a].cell,
    end = s.nodes[b].cell,
    blocked = new Set([...s.lines.flat(), ...s.nodes.map((n) => n.cell)]);
  const free = (i: number) => !blocked.has(i);
  const find = (from: number, to: number): number[] | null => {
    const queue = [from],
      prev = new Map<number, number>([[from, -1]]);
    for (let k = 0; k < queue.length; k++) {
      const i = queue[k];
      if (i === to) {
        const path = [];
        let j = i;
        while (j !== -1) {
          path.push(j);
          j = prev.get(j)!;
        }
        return path.reverse();
      }
      for (const j of neighbors(i, s, variant))
        if ((free(j) || j === to) && !prev.has(j)) {
          prev.set(j, i);
          queue.push(j);
        }
    }
    return null;
  };
  const ports = neighbors(start, s, variant).filter(free);
  if (a !== b) {
    for (const p of ports) {
      const path = find(p, end);
      if (path && path.length >= 2) return [start, ...path];
    }
    return null;
  }
  for (let i = 0; i < ports.length; i++)
    for (let j = i + 1; j < ports.length; j++) {
      const path = find(ports[i], ports[j]);
      if (path && path.length >= 3) return [start, ...path, start];
    }
  return null;
}
export function legalPairs(s: State): [number, number][] {
  const result: [number, number][] = [];
  for (let a = 0; a < s.nodes.length; a++)
    for (let b = a; b < s.nodes.length; b++)
      if (route(s, a, b)) result.push([a, b]);
  return result;
}
export function play(
  s: State,
  a: number,
  b: number,
  variant = 0,
): State | null {
  const path = route(s, a, b, variant);
  if (!path) return null;
  const nodes = s.nodes.map((n, i) => ({
    ...n,
    degree: n.degree + (i === a ? 1 : 0) + (i === b ? 1 : 0),
  }));
  nodes.push({ cell: path[Math.floor((path.length - 1) / 2)], degree: 2 });
  const n = { ...s, nodes, lines: [...s.lines, path], turn: 3 - s.turn };
  if (!legalPairs(n).length) n.winner = s.turn;
  return n;
}
export function bestMove(s: State): [number, number] | null {
  return (
    legalPairs(s).sort(
      ([a, b], [c, d]) =>
        s.nodes[c].degree +
        s.nodes[d].degree -
        (s.nodes[a].degree + s.nodes[b].degree),
    )[0] || null
  );
}
