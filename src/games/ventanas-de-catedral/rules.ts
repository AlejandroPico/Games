import type {
  AbstractPosition,
  BoardAction,
  BoardCell,
} from "../../shared/AbstractTable";
const same = (a: BoardAction, b: BoardAction) =>
  a.from === b.from && a.to === b.to && a.tool === b.tool;
const best = (a: number[]) => {
  const m = Math.max(...a);
  return a.filter((x) => x === m).length > 1 ? -1 : a.indexOf(m);
};

export interface Die {
  color: number;
  value: number;
}
export interface State extends AbstractPosition {
  windows: (Die | null)[][];
  restrictions: (Die | null)[];
  pool: Die[];
  round: number;
  order: number[];
  cursor: number;
}
const colorNames = ["Rojo", "Azul", "Verde", "Amarillo", "Violeta"],
  colors = ["#c96e79", "#6c94cc", "#7cb795", "#d2bd62", "#a987bd"];
const dice = (n: number): Die[] =>
  Array.from({ length: n }, () => ({
    color: Math.floor(Math.random() * 5),
    value: 1 + Math.floor(Math.random() * 6),
  }));
export const initial = (n = 2, _size = 0): State => ({
  turn: 0,
  winner: null,
  scores: Array(n).fill(0),
  step: 0,
  message: "Elige un dado y un hueco iluminado",
  windows: Array.from({ length: n }, () => Array(20).fill(null)),
  restrictions: Array.from({ length: 20 }, (_, i) =>
    i % 4 === 0
      ? { color: i % 5, value: 0 }
      : i % 7 === 0
        ? { color: -1, value: (i % 6) + 1 }
        : null,
  ),
  pool: dice(2 * n + 1),
  round: 1,
  order: [
    ...Array.from({ length: n }, (_, i) => i),
    ...Array.from({ length: n }, (_, i) => n - 1 - i),
  ],
  cursor: 0,
});
const adjacent = (a: number, b: number) =>
  Math.max(
    Math.abs((a % 5) - (b % 5)),
    Math.abs(Math.floor(a / 5) - Math.floor(b / 5)),
  ) === 1;
export function legal(s: State, to: number, tool: number) {
  const d = s.pool[tool],
    w = s.windows[s.turn],
    limit = s.restrictions[to];
  if (
    !d ||
    to < 0 ||
    to >= 20 ||
    w[to] ||
    (limit &&
      (limit.color >= 0 ? d.color !== limit.color : d.value !== limit.value))
  )
    return false;
  const first = w.every((v) => v === null);
  if (first) return to < 5 || to >= 15 || to % 5 === 0 || to % 5 === 4;
  if (!w.some((v, i) => v && adjacent(i, to))) return false;
  return !w.some(
    (v, i) =>
      v &&
      Math.abs((i % 5) - (to % 5)) +
        Math.abs(Math.floor(i / 5) - Math.floor(to / 5)) ===
        1 &&
      (v.color === d.color || v.value === d.value),
  );
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  const a: BoardAction[] = [{ from: -1, to: -1, tool: -1 }];
  for (let tool = 0; tool < s.pool.length; tool++)
    for (let to = 0; to < 20; to++)
      if (legal(s, to, tool)) a.push({ from: -1, to, tool });
  return a;
}
export function score(w: (Die | null)[], player: number) {
  let p = -w.filter((v) => v === null).length;
  p += w.reduce((n, d) => n + (d?.color === player % 5 ? d.value : 0), 0);
  for (let r = 0; r < 4; r++) {
    const a = w.slice(r * 5, r * 5 + 5);
    if (a.every(Boolean) && new Set(a.map((d) => d!.color)).size === 5) p += 5;
  }
  for (let c = 0; c < 5; c++) {
    const a = [0, 1, 2, 3].map((r) => w[r * 5 + c]);
    if (a.every(Boolean) && new Set(a.map((d) => d!.value)).size === 4) p += 4;
  }
  return p;
}
export function apply(s: State, a: BoardAction) {
  if (!actions(s).some((b) => same(a, b))) return s;
  const x = structuredClone(s);
  x.step++;
  if (a.to >= 0) {
    x.windows[x.turn][a.to] = x.pool.splice(a.tool, 1)[0];
  }
  x.cursor++;
  if (x.cursor === x.order.length) {
    x.round++;
    x.cursor = 0;
    x.pool = dice(2 * x.scores.length + 1);
    if (x.round > 10) {
      x.scores = x.windows.map(score);
      x.winner = best(x.scores);
    }
  }
  x.turn = x.order[x.cursor];
  x.message =
    "Ronda " +
    Math.min(x.round, 10) +
    " / 10 · objetivo personal " +
    colorNames[x.turn % 5];
  return x;
}
export function automatic(s: State) {
  const a = actions(s).filter((a) => a.to >= 0);
  a.sort(
    (a, b) =>
      (s.pool[b.tool].color === s.turn % 5 ? s.pool[b.tool].value : 0) -
      (s.pool[a.tool].color === s.turn % 5 ? s.pool[a.tool].value : 0),
  );
  return apply(s, a[0] || { from: -1, to: -1, tool: -1 });
}
export const tools = (s: State) => [
  { key: -1, label: "Pasar esta selección" },
  ...s.pool.map((d, key) => ({
    key,
    label: "Dado " + (key + 1) + " · " + colorNames[d.color] + " " + d.value,
  })),
];
export const board = (s: State) => ({
  columns: 5,
  cells: s.windows[s.turn].map((d, i): BoardCell => {
    const r = s.restrictions[i];
    return {
      key: i,
      text: d
        ? ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][d.value]
        : r
          ? r.color >= 0
            ? "◇"
            : "" + r.value
          : "",
      color: d
        ? colors[d.color]
        : r && r.color >= 0
          ? colors[r.color] + "55"
          : undefined,
      label:
        "Vidriera J" +
        (s.turn + 1) +
        " · hueco " +
        (i + 1) +
        (d
          ? " · " + colorNames[d.color] + " " + d.value
          : r
            ? " · restricción " + (r.color >= 0 ? colorNames[r.color] : r.value)
            : " libre"),
    };
  }),
});
