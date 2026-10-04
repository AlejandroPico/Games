import type {
  AbstractPosition,
  BoardAction,
  BoardCell,
} from "../../shared/AbstractTable";
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};
const same = (a: BoardAction, b: BoardAction) =>
  a.from === b.from && a.to === b.to && a.tool === b.tool;

export interface State extends AbstractPosition {
  pawns: number[];
  walls: { r: number; c: number; h: boolean }[];
  left: number[];
}
export const initial = (_n = 2, _size = 9): State => ({
  turn: 0,
  winner: null,
  scores: [0, 0],
  step: 0,
  message: "Mueve tu peón o coloca una valla",
  pawns: [76, 4],
  walls: [],
  left: [10, 10],
});
export function linked(s: State, a: number, b: number) {
  if (a < 0 || b < 0 || a >= 81 || b >= 81) return false;
  const ar = Math.floor(a / 9),
    ac = a % 9,
    br = Math.floor(b / 9),
    bc = b % 9;
  if (Math.abs(ar - br) + Math.abs(ac - bc) !== 1) return false;
  return !s.walls.some((w) =>
    w.h
      ? ac === bc && Math.min(ar, br) === w.r && (ac === w.c || ac === w.c + 1)
      : ar === br && Math.min(ac, bc) === w.c && (ar === w.r || ar === w.r + 1),
  );
}
const neighbors = (s: State, i: number) =>
  [i - 9, i + 9, i - 1, i + 1].filter((j) => linked(s, i, j));
export function distance(s: State, p: number, start = s.pawns[p]) {
  const q = [start],
    d = new Map([[start, 0]]);
  for (let k = 0; k < q.length; k++) {
    const i = q[k];
    if (Math.floor(i / 9) === (p === 0 ? 0 : 8)) return d.get(i)!;
    for (const j of neighbors(s, i))
      if (!d.has(j)) {
        d.set(j, d.get(i)! + 1);
        q.push(j);
      }
  }
  return Infinity;
}
export function wallLegal(s: State, r: number, c: number, h: boolean) {
  if (
    !s.left[s.turn] ||
    r < 0 ||
    c < 0 ||
    r > 7 ||
    c > 7 ||
    s.walls.some(
      (w) =>
        (w.r === r && w.c === c) ||
        (w.h === h &&
          (h
            ? w.r === r && Math.abs(w.c - c) < 2
            : w.c === c && Math.abs(w.r - r) < 2)),
    )
  )
    return false;
  const x = { ...s, walls: [...s.walls, { r, c, h }] };
  return [0, 1].every((p) => Number.isFinite(distance(x, p)));
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  const out: BoardAction[] = [],
    from = s.pawns[s.turn],
    other = s.pawns[1 - s.turn];
  for (const j of neighbors(s, from)) {
    if (j !== other) out.push({ from, to: j, tool: 0 });
    else {
      const behind = j + (j - from);
      if (linked(s, j, behind)) out.push({ from, to: behind, tool: 0 });
      else
        for (const z of neighbors(s, j))
          if (
            z !== from &&
            (j - from === 9 || j - from === -9
              ? Math.floor(z / 9) === Math.floor(j / 9)
              : z % 9 === j % 9)
          )
            out.push({ from, to: z, tool: 0 });
    }
  }
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      for (const h of [true, false])
        if (wallLegal(s, r, c, h))
          out.push({ from: -1, to: r * 9 + c, tool: h ? 1 : 2 });
  return out;
}
export function apply(s: State, a: BoardAction) {
  if (!actions(s).some((b) => same(a, b))) return s;
  const x = structuredClone(s);
  x.step++;
  if (a.tool) {
    x.walls.push({ r: Math.floor(a.to / 9), c: a.to % 9, h: a.tool === 1 });
    x.left[x.turn]--;
  } else {
    x.pawns[x.turn] = a.to;
    if (Math.floor(a.to / 9) === (x.turn === 0 ? 0 : 8)) x.winner = x.turn;
  }
  x.turn = 1 - x.turn;
  x.scores = x.left.slice();
  x.message = "Vallas restantes " + x.left.join(" / ");
  if (x.step >= 400 && x.winner === null) {
    x.winner = -1;
    x.message = "Tablas: límite recreativo de 400 turnos";
  }
  return x;
}
export function automatic(s: State) {
  const a = actions(s),
    p = s.turn;
  let choice = a[0],
    v = -Infinity;
  for (const m of a) {
    const x = applyFast(s, m),
      value = distance(x, 1 - p) - distance(x, p) + (m.tool ? -0.65 : 0);
    if (value > v) {
      v = value;
      choice = m;
    }
  }
  return choice ? apply(s, choice) : s;
}
function applyFast(s: State, a: BoardAction): State {
  return a.tool
    ? {
        ...s,
        walls: [
          ...s.walls,
          { r: Math.floor(a.to / 9), c: a.to % 9, h: a.tool === 1 },
        ],
      }
    : { ...s, pawns: s.pawns.map((v, i) => (i === s.turn ? a.to : v)) };
}
export const tools = (_s: State) => [
  { key: 0, label: "Mover peón" },
  { key: 1, label: "Valla horizontal (dos casillas)" },
  { key: 2, label: "Valla vertical (dos casillas)" },
];
export const board = (s: State) => ({
  columns: 9,
  cells: Array.from({ length: 81 }, (_, i): BoardCell => {
    const p = s.pawns.indexOf(i),
      r = Math.floor(i / 9),
      c = i % 9;
    return {
      key: i,
      text: p >= 0 ? "●" : "",
      owner: p >= 0 ? p : undefined,
      label: "Casilla " + (r + 1) + "," + (c + 1),
      bottom: s.walls.some(
        (w) => w.h && w.r === r && (w.c === c || w.c + 1 === c),
      ),
      right: s.walls.some(
        (w) => !w.h && w.c === c && (w.r === r || w.r + 1 === r),
      ),
    };
  }),
});
