import type {
  AbstractPosition,
  BoardAction,
  BoardCell,
} from "../../shared/AbstractTable";
export type Bug = 0 | 1 | 2 | 3 | 4;
export interface Piece {
  owner: number;
  bug: Bug;
}
export interface State extends AbstractPosition {
  hive: Record<number, Piece[]>;
  reserve: number[][];
  turns: number[];
  passes: number;
  history: string[];
}
export const names = ["Reina", "Hormiga", "Saltamontes", "Escarabajo", "Araña"],
  icons = ["♛", "🐜", "🦗", "◆", "🕷"];
const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
];
export const encode = (q: number, r: number) => (q + 32) * 64 + r + 32;
export const decode = (i: number) => [Math.floor(i / 64) - 32, (i % 64) - 32];
export const neighbors = (i: number) => {
  const [q, r] = decode(i);
  return dirs.map(([a, b]) => encode(q + a, r + b));
};
export const initial = (_n = 2, _size = 0): State => ({
  turn: 0,
  winner: null,
  scores: [0, 0],
  step: 0,
  message: "Coloca una pieza de tu reserva",
  hive: {},
  reserve: [
    [1, 3, 3, 2, 2],
    [1, 3, 3, 2, 2],
  ],
  turns: [0, 0],
  passes: 0,
  history: [],
});
const occupied = (h: State["hive"], i: number) => !!h[i]?.length;
export const queen = (s: State, p: number) =>
  Object.entries(s.hive).find(([, v]) =>
    v.some((t) => t.owner === p && t.bug === 0),
  )?.[0];
export function connected(h: State["hive"]) {
  const all = Object.keys(h)
    .map(Number)
    .filter((i) => occupied(h, i));
  if (!all.length) return true;
  const seen = new Set([all[0]]),
    q = [all[0]];
  for (let k = 0; k < q.length; k++)
    for (const i of neighbors(q[k]))
      if (occupied(h, i) && !seen.has(i)) {
        seen.add(i);
        q.push(i);
      }
  return seen.size === all.length;
}
export function slide(h: State["hive"], a: number, b: number, height = 1) {
  const gates = neighbors(a).filter((i) => neighbors(b).includes(i));
  return !(
    gates.length === 2 && gates.every((i) => (h[i]?.length || 0) >= height)
  );
}
export function destinations(s: State, from: number) {
  const stack = s.hive[from];
  if (
    !stack?.length ||
    stack.at(-1)!.owner !== s.turn ||
    queen(s, s.turn) === undefined
  )
    return [];
  const bug = stack.at(-1)!.bug,
    h = structuredClone(s.hive);
  h[from].pop();
  if (!connected(h)) return [];
  const boundary = (i: number) =>
    !occupied(h, i) && neighbors(i).some((j) => occupied(h, j));
  const out = new Set<number>();
  if (bug === 2) {
    const [q, r] = decode(from);
    for (const [dq, dr] of dirs) {
      let k = 1;
      if (!occupied(h, encode(q + dq, r + dr))) continue;
      while (k < 64 && occupied(h, encode(q + dq * k, r + dr * k))) k++;
      out.add(encode(q + dq * k, r + dr * k));
    }
  } else if (bug === 3) {
    for (const to of neighbors(from)) {
      const height = Math.max(stack.length, (h[to]?.length || 0) + 1);
      if (slide(h, from, to, height) && (occupied(h, to) || boundary(to)))
        out.add(to);
    }
  } else if (bug === 0) {
    for (const to of neighbors(from))
      if (boundary(to) && slide(h, from, to)) out.add(to);
  } else if (bug === 1) {
    const q = [from],
      seen = new Set(q);
    for (let k = 0; k < q.length; k++)
      for (const to of neighbors(q[k]))
        if (boundary(to) && slide(h, q[k], to) && !seen.has(to)) {
          seen.add(to);
          out.add(to);
          q.push(to);
        }
  } else {
    const walk = (i: number, path: number[]) => {
      if (path.length === 4) {
        out.add(i);
        return;
      }
      for (const to of neighbors(i))
        if (!path.includes(to) && boundary(to) && slide(h, i, to))
          walk(to, [...path, to]);
    };
    walk(from, [from]);
  }
  out.delete(from);
  return [...out];
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  const out: BoardAction[] = [],
    keys = Object.keys(s.hive)
      .map(Number)
      .filter((i) => occupied(s.hive, i)),
    candidates = keys.length
      ? [...new Set(keys.flatMap(neighbors))].filter(
          (i) => !occupied(s.hive, i),
        )
      : [encode(0, 0)],
    force = s.turns[s.turn] >= 3 && queen(s, s.turn) === undefined;
  for (const to of candidates) {
    const around = neighbors(to).filter((i) => occupied(s.hive, i));
    if (
      keys.length > 1 &&
      (!around.some((i) => s.hive[i].at(-1)!.owner === s.turn) ||
        around.some((i) => s.hive[i].at(-1)!.owner !== s.turn))
    )
      continue;
    for (let bug = 0; bug < 5; bug++)
      if (s.reserve[s.turn][bug] > 0 && (!force || bug === 0))
        out.push({ from: -1, to, tool: bug });
  }
  if (!force)
    for (const from of keys)
      for (const to of destinations(s, from)) out.push({ from, to, tool: 5 });
  return out.length ? out : [{ from: -1, to: -1, tool: 6 }];
}
export function apply(s: State, a: BoardAction) {
  if (
    !actions(s).some(
      (b) => a.from === b.from && a.to === b.to && a.tool === b.tool,
    )
  )
    return s;
  const x = structuredClone(s);
  x.step++;
  x.turns[x.turn]++;
  if (a.to < 0) x.passes++;
  else {
    x.passes = 0;
    if (a.from < 0) {
      x.reserve[x.turn][a.tool]--;
      x.hive[a.to] = [{ owner: x.turn, bug: a.tool as Bug }];
    } else {
      const p = x.hive[a.from].pop()!;
      (x.hive[a.to] ??= []).push(p);
    }
  }
  const surrounded = [0, 1].map((p) => {
    const q = queen(x, p);
    return q !== undefined && neighbors(+q).every((i) => occupied(x.hive, i));
  });
  if (surrounded[0] && surrounded[1]) x.winner = -1;
  else if (surrounded[0]) x.winner = 1;
  else if (surrounded[1]) x.winner = 0;
  x.turn = 1 - x.turn;
  x.scores = [0, 1].map((p) => {
    const q = queen(x, p);
    return q === undefined
      ? 0
      : neighbors(+q).filter((i) => occupied(x.hive, i)).length;
  });
  x.message = "Rodea la reina rival · contadores: vecinos ocupados";
  const key =
    Object.keys(x.hive)
      .map(Number)
      .filter((i) => occupied(x.hive, i))
      .sort((a, b) => a - b)
      .map(
        (i) => i + ":" + x.hive[i].map((p) => p.owner + "-" + p.bug).join("."),
      )
      .join("|") +
    "/" +
    x.turn;
  x.history.push(key);
  if (
    x.winner === null &&
    (x.passes >= 2 ||
      x.history.filter((k) => k === key).length >= 3 ||
      x.step >= 300)
  )
    x.winner = -1;
  return x;
}
export function automatic(s: State) {
  const a = actions(s);
  let choice = a[0],
    v = -Infinity;
  const enemy = queen(s, 1 - s.turn),
    own = queen(s, s.turn);
  for (const m of a) {
    let value = Math.random();
    if (enemy !== undefined && neighbors(+enemy).includes(m.to)) value += 10;
    if (own !== undefined && neighbors(+own).includes(m.to)) value -= 5;
    if (m.tool === 0 && own === undefined) value += 3;
    if (m.from >= 0 && own !== undefined && neighbors(+own).includes(m.from))
      value += 4;
    if (value > v) {
      v = value;
      choice = m;
    }
  }
  return choice ? apply(s, choice) : s;
}
export const tools = (s: State) => [
  ...names.flatMap((name, key) =>
    s.reserve[s.turn][key] > 0
      ? [{ key, label: name + " · reserva " + s.reserve[s.turn][key] }]
      : [],
  ),
  { key: 5, label: "Mover pieza desplegada" },
  { key: 6, label: "Pasar (solo sin jugadas)" },
];
export function board(s: State) {
  const keys = Object.keys(s.hive)
      .map(Number)
      .filter((i) => occupied(s.hive, i)),
    all = keys.length
      ? [...new Set(keys.flatMap((i) => [i, ...neighbors(i)]))]
      : [encode(0, 0)];
  const qs = all.map((i) => decode(i)[0]),
    rs = all.map((i) => decode(i)[1]),
    minQ = Math.min(...qs),
    maxQ = Math.max(...qs),
    minR = Math.min(...rs),
    maxR = Math.max(...rs),
    columns = maxQ - minQ + 1;
  return {
    columns,
    hex: true,
    cells: Array.from(
      { length: columns * (maxR - minR + 1) },
      (_, i): BoardCell => {
        const q = minQ + (i % columns),
          r = minR + Math.floor(i / columns),
          key = encode(q, r),
          stack = s.hive[key] || [],
          p = stack.at(-1);
        return {
          key,
          text: p ? icons[p.bug] + (stack.length > 1 ? stack.length : "") : "",
          owner: p?.owner,
          label:
            "Hexágono " +
            q +
            "," +
            r +
            (p ? " · " + names[p.bug] + " J" + (p.owner + 1) : ""),
        };
      },
    ),
  };
}
