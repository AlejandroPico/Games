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
  stacks: number[][];
  phase: "place" | "move";
  placed: number;
}
export const coords = Array.from({ length: 5 }, (_, r) =>
  Array.from(
    { length: 11 - Math.abs(r - 2) },
    (_, c) => [c + Math.max(0, 2 - r), r] as [number, number],
  ),
).flat();
const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
];
const index = (q: number, r: number) =>
  coords.findIndex((c) => c[0] === q && c[1] === r);
export const neighbors = (i: number) =>
  dirs
    .map(([q, r]) => index(coords[i][0] + q, coords[i][1] + r))
    .filter((i) => i >= 0);
export const initial = (_n = 2, _size = 0): State => ({
  turn: 0,
  winner: null,
  scores: [0, 0],
  step: 0,
  message: "Coloca los tres núcleos rojos y luego tus fichas",
  stacks: coords.map(() => []),
  phase: "place",
  placed: 0,
});
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  if (s.phase === "place")
    return s.stacks.flatMap((v, to) =>
      v.length ? [] : [{ from: -1, to, tool: 0 }],
    );
  const a: BoardAction[] = [];
  s.stacks.forEach((stack, from) => {
    if (
      stack.at(-1) !== s.turn ||
      (neighbors(from).length === 6 &&
        neighbors(from).every((i) => s.stacks[i].length))
    )
      return;
    for (const [dq, dr] of dirs) {
      const to = index(
        coords[from][0] + dq * stack.length,
        coords[from][1] + dr * stack.length,
      );
      if (to >= 0 && s.stacks[to].length) a.push({ from, to, tool: 0 });
    }
  });
  return a;
}
export function purge(s: State) {
  const linked = new Set<number>(),
    q: number[] = [];
  s.stacks.forEach((v, i) => {
    if (v.includes(2)) {
      linked.add(i);
      q.push(i);
    }
  });
  for (let k = 0; k < q.length; k++)
    for (const i of neighbors(q[k]))
      if (s.stacks[i].length && !linked.has(i)) {
        linked.add(i);
        q.push(i);
      }
  s.stacks = s.stacks.map((v, i) => (linked.has(i) ? v : []));
}
export function apply(s: State, a: BoardAction) {
  if (!actions(s).some((b) => same(a, b))) return s;
  const x = structuredClone(s);
  x.step++;
  if (x.phase === "place") {
    x.stacks[a.to] = [x.placed < 3 ? 2 : x.turn];
    x.placed++;
    x.turn = 1 - x.turn;
    if (x.placed === 49) {
      x.phase = "move";
      x.turn = 0;
      x.message = "Mueve una pila libre de tu color";
    }
  } else {
    x.stacks[a.to].push(...x.stacks[a.from]);
    x.stacks[a.from] = [];
    purge(x);
    x.turn = 1 - x.turn;
    if (!actions(x).length) {
      x.turn = 1 - x.turn;
      if (!actions(x).length)
        x.winner = best(
          [0, 1].map((p) =>
            x.stacks.reduce((n, v) => n + (v.at(-1) === p ? v.length : 0), 0),
          ),
        );
    }
    x.message = "Las pilas aisladas de los núcleos desaparecen";
  }
  x.scores = [0, 1].map((p) =>
    x.stacks.reduce((n, v) => n + (v.at(-1) === p ? v.length : 0), 0),
  );
  return x;
}
export function automatic(s: State) {
  const a = actions(s);
  if (s.phase === "place") {
    const v = a[Math.floor(Math.random() * a.length)];
    return v ? apply(s, v) : s;
  }
  let choice = a[0],
    v = -Infinity;
  for (const m of a) {
    const x = apply(s, m),
      value = x.scores[s.turn] - x.scores[1 - s.turn];
    if (value > v) {
      v = value;
      choice = m;
    }
  }
  return choice ? apply(s, choice) : s;
}
export const tools = (_s: State) => [{ key: 0, label: "Colocar / mover pila" }];
export const board = (s: State) => ({
  columns: 11,
  hex: true,
  cells: Array.from({ length: 55 }, (_, i): BoardCell => {
    const k = index(i % 11, Math.floor(i / 11)),
      v = s.stacks[k] || [];
    return {
      key: k,
      void: k < 0,
      text: v.length
        ? (v.at(-1) === 2 ? "◆" : v.includes(2) ? "◉" : "●") + v.length
        : "",
      owner: v.at(-1) !== 2 ? v.at(-1) : undefined,
      label:
        k < 0
          ? "Fuera del tablero"
          : "Pila " +
            (k + 1) +
            ": " +
            v.length +
            " fichas" +
            (v.includes(2) ? " · núcleo" : ""),
    };
  }),
});
