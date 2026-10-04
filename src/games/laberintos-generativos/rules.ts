import type {
  LogicEngine,
  LogicPosition,
  LogicView,
} from "../../shared/LogicTable";
import { copy, shuffle, pick } from "../../shared/tableUtils";

export interface State extends LogicPosition {
  open: boolean[];
  position: number;
  trail: number[];
}
function adj(i: number, n: number): number[] {
  return [
    i % n ? i - 1 : -1,
    i % n < n - 1 ? i + 1 : -1,
    i >= n ? i - n : -1,
    i < n * (n - 1) ? i + n : -1,
  ].filter((x) => x >= 0);
}
export function initial(size: number): State {
  const n = [9, 15, 21].includes(size) ? size : 9,
    open = Array(n * n).fill(false),
    stack = [n + 1];
  open[n + 1] = true;
  while (stack.length) {
    const at = stack.at(-1)!,
      x = at % n,
      y = Math.floor(at / n),
      next = shuffle([
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2],
      ]).find(
        ([dx, dy]) =>
          x + dx > 0 &&
          x + dx < n - 1 &&
          y + dy > 0 &&
          y + dy < n - 1 &&
          !open[(y + dy) * n + x + dx],
      );
    if (next) {
      const [dx, dy] = next,
        to = (y + dy) * n + x + dx;
      open[(y + dy / 2) * n + x + dx / 2] = true;
      open[to] = true;
      stack.push(to);
    } else stack.pop();
  }
  return {
    size: n,
    open,
    position: n + 1,
    trail: [n + 1],
    turn: 0,
    winner: null,
    step: 0,
    message: "Encuentra la salida ◇",
  };
}
export function apply(s: State, key: string): State {
  const to = Number(key);
  if (s.winner !== null || !adj(s.position, s.size).includes(to) || !s.open[to])
    return s;
  const t = copy(s);
  t.position = to;
  t.trail.push(to);
  t.step++;
  if (to === (s.size - 2) * s.size + s.size - 2) t.winner = 0;
  return t;
}
export function route(s: State): number[] {
  const goal = (s.size - 2) * s.size + s.size - 2,
    queue = [s.position],
    prev = new Map<number, number>([[s.position, -1]]);
  for (let i = 0; i < queue.length; i++) {
    const at = queue[i];
    if (at === goal) break;
    for (const n of adj(at, s.size))
      if (s.open[n] && !prev.has(n)) {
        prev.set(n, at);
        queue.push(n);
      }
  }
  if (!prev.has(goal)) return [];
  const path = [goal];
  while (path.at(-1) !== s.position) path.push(prev.get(path.at(-1)!)!);
  return path.reverse().slice(1);
}
export function automatic(s: State): State {
  const next = route(s)[0];
  return next === undefined ? s : apply(s, String(next));
}
export function view(s: State): LogicView {
  return {
    columns: s.size,
    cells: s.open.map((o, i) => ({
      key: i,
      label:
        "Casilla " + (i + 1) + (i === s.position ? " posición actual" : ""),
      text:
        i === s.position
          ? "●"
          : i === (s.size - 2) * s.size + s.size - 2
            ? "◇"
            : "",
      kind: !o
        ? "wall"
        : i === s.position
          ? "current"
          : s.trail.includes(i)
            ? "path"
            : "",
      action: o && adj(s.position, s.size).includes(i) ? String(i) : undefined,
    })),
    notes: [
      "Pulsa una casilla abierta junto a tu posición. Puedes retroceder; el rastro recuerda tu recorrido.",
      "Cada laberinto se genera como un árbol de corredores conectados: siempre existe un camino entre entrada y salida.",
    ],
  };
}

export const engine: LogicEngine<State> = { initial, apply, automatic, view };
