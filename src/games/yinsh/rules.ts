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
  rings: (number | null)[];
  markers: (number | null)[];
  phase: "place" | "move" | "row" | "remove";
  placed: number;
  resume: number;
  mover: number;
  chosenRow: number[] | null;
  history: string[];
}
export const coords: [number, number][] = [];
for (let q = -5; q <= 5; q++)
  for (let r = -5; r <= 5; r++)
    if (
      Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= 5 &&
      ![
        [5, 0],
        [0, 5],
        [-5, 0],
        [0, -5],
        [5, -5],
        [-5, 5],
      ].some((c) => c[0] === q && c[1] === r)
    )
      coords.push([q, r]);
const dirs = [
  [1, 0],
  [0, 1],
  [1, -1],
  [-1, 0],
  [0, -1],
  [-1, 1],
];
const index = (q: number, r: number) =>
  coords.findIndex((c) => c[0] === q && c[1] === r);
export const initial = (_n = 2, _size = 0): State => ({
  turn: 0,
  winner: null,
  scores: [0, 0],
  step: 0,
  message: "Coloca cinco anillos por bando",
  rings: coords.map(() => null),
  markers: coords.map(() => null),
  phase: "place",
  placed: 0,
  resume: 0,
  mover: 0,
  chosenRow: null,
  history: [],
});
export function rows(s: State, p: number) {
  const out: number[][] = [];
  for (let i = 0; i < coords.length; i++)
    if (s.markers[i] === p)
      for (const [dq, dr] of dirs.slice(0, 3)) {
        const a = Array.from({ length: 5 }, (_, k) =>
          index(coords[i][0] + dq * k, coords[i][1] + dr * k),
        );
        if (a.every((j) => j >= 0 && s.markers[j] === p)) out.push(a);
      }
  return out;
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  if (s.phase === "place")
    return s.rings.flatMap((v, to) =>
      v === null ? [{ from: -1, to, tool: 0 }] : [],
    );
  if (s.phase === "row")
    return rows(s, s.turn).map((r, tool) => ({ from: -1, to: r[0], tool }));
  if (s.phase === "remove")
    return s.rings.flatMap((v, to) =>
      v === s.turn ? [{ from: -1, to, tool: 0 }] : [],
    );
  const out: BoardAction[] = [];
  s.rings.forEach((v, from) => {
    if (v !== s.turn) return;
    for (const [dq, dr] of dirs) {
      let jumped = false;
      for (let k = 1; k <= 10; k++) {
        const to = index(coords[from][0] + dq * k, coords[from][1] + dr * k);
        if (to < 0 || s.rings[to] !== null) break;
        if (s.markers[to] !== null) jumped = true;
        else {
          out.push({ from, to, tool: 0 });
          if (jumped) break;
        }
      }
    }
  });
  return out;
}
function resolve(x: State) {
  if (rows(x, x.mover).length) {
    x.turn = x.mover;
    x.phase = "row";
    x.message = "Escoge una línea de cinco marcadores";
    return;
  }
  if (rows(x, 1 - x.mover).length) {
    x.turn = 1 - x.mover;
    x.phase = "row";
    x.message = "El rival también debe retirar su línea";
    return;
  }
  x.turn = x.resume;
  x.phase = "move";
  x.message = "Mueve un anillo; los marcadores atravesados cambian de color";
  if (x.markers.filter((v) => v !== null).length >= 51)
    x.winner = best(x.scores);
  else if (!actions(x).length) x.winner = best(x.scores);
}
export function apply(s: State, a: BoardAction) {
  if (!actions(s).some((b) => same(a, b))) return s;
  const x = structuredClone(s);
  x.step++;
  if (x.phase === "place") {
    x.rings[a.to] = x.turn;
    x.placed++;
    x.turn = 1 - x.turn;
    if (x.placed === 10) {
      x.phase = "move";
      x.message = "Selecciona un anillo y muévelo";
    }
  } else if (x.phase === "row") {
    const row = rows(x, x.turn)[a.tool];
    row.forEach((i) => (x.markers[i] = null));
    x.chosenRow = row;
    x.phase = "remove";
    x.message = "Retira uno de tus anillos";
  } else if (x.phase === "remove") {
    x.rings[a.to] = null;
    x.scores[x.turn]++;
    if (x.scores[x.turn] === 3) x.winner = x.turn;
    else resolve(x);
  } else {
    x.markers[a.from] = x.turn;
    x.rings[a.from] = null;
    x.rings[a.to] = x.turn;
    const [q, r] = coords[a.from],
      [t, u] = coords[a.to],
      steps = Math.max(
        Math.abs(t - q),
        Math.abs(u - r),
        Math.abs(t + u - q - r),
      ),
      dq = (t - q) / steps,
      dr = (u - r) / steps;
    for (let k = 1; k < steps; k++) {
      const i = index(q + dq * k, r + dr * k);
      if (x.markers[i] !== null) x.markers[i] = 1 - x.markers[i]!;
    }
    x.mover = x.turn;
    x.resume = 1 - x.turn;
    resolve(x);
    const key = x.rings.join(",") + "|" + x.markers.join(",") + "|" + x.turn;
    x.history.push(key);
    if (
      x.winner === null &&
      (x.history.filter((k) => k === key).length >= 3 || x.step >= 600)
    )
      x.winner = -1;
  }
  return x;
}
export function automatic(s: State) {
  const a = actions(s);
  if (s.phase === "place")
    return a.length ? apply(s, a[Math.floor(Math.random() * a.length)]) : s;
  let choice = a[0],
    v = -Infinity;
  for (const m of a) {
    const x = apply(s, m);
    let value =
      (x.scores[s.turn] - x.scores[1 - s.turn]) * 100 +
      rows(x, s.turn).length * 50 -
      rows(x, 1 - s.turn).length * 50;
    if (x.winner === s.turn) value += 10000;
    if (s.phase === "move") value += Math.random();
    if (value > v) {
      v = value;
      choice = m;
    }
  }
  return choice ? apply(s, choice) : s;
}
export const tools = (s: State) =>
  s.phase === "row"
    ? rows(s, s.turn).map((r, i) => ({
        key: i,
        label: "Retirar línea " + r.map((j) => j + 1).join("–"),
      }))
    : [
        {
          key: 0,
          label:
            s.phase === "remove"
              ? "Retirar un anillo"
              : "Colocar / mover anillo",
        },
      ];
export const board = (s: State) => ({
  columns: 11,
  hex: true,
  cells: Array.from({ length: 121 }, (_, i): BoardCell => {
    const k = index((i % 11) - 5, Math.floor(i / 11) - 5);
    return {
      key: k,
      void: k < 0,
      text:
        k >= 0
          ? s.rings[k] !== null
            ? "◎"
            : s.markers[k] !== null
              ? "●"
              : ""
          : "",
      owner: k >= 0 ? (s.rings[k] ?? s.markers[k] ?? undefined) : undefined,
      label:
        k < 0
          ? "Fuera del tablero"
          : "Punto " +
            (k + 1) +
            (s.rings[k] !== null
              ? " · anillo J" + (s.rings[k]! + 1)
              : s.markers[k] !== null
                ? " · marcador J" + (s.markers[k]! + 1)
                : ""),
    };
  }),
});
