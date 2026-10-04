import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { graph, valid, type Point } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  pieces: number[][];
  started: boolean[];
  roll: number;
  grace: boolean;
  phase: "roll" | "move";
  shells: number[];
}
/** Each arm has 8x3 cells: 17 perimeter cells and seven central lane cells. */
const rotate = ([x, y]: Point, p: number): Point => {
  for (let i = 0; i < p; i++) [x, y] = [y, -x];
  return [x, y];
};
const arm: Point[] = [
  ...Array.from({ length: 8 }, (_, i) => [-1, -1 - i] as Point),
  [0, -8],
  ...Array.from({ length: 8 }, (_, i) => [1, -8 + i] as Point),
];
export const points: Point[] = Array.from({ length: 4 }, (_, p) =>
  arm.map((pt) => rotate(pt, p)),
).flat();
for (let p = 0; p < 4; p++)
  for (let k = 1; k <= 7; k++) points.push(rotate([0, -k], p));
points.push([0, 0]);
/** Entry down the lane, a complete 68-point circuit, then return up the same lane. */
export const routes = Array.from({ length: 4 }, (_, p) => [
  ...Array.from({ length: 7 }, (_, i) => 68 + p * 7 + i),
  ...Array.from({ length: 68 }, (_, i) => (p * 17 + 8 + i) % 68),
  ...Array.from({ length: 7 }, (_, i) => 68 + p * 7 + 6 - i),
]);
export const castles = Array.from({ length: 4 }, (_, p) => [
  p * 17 + 4,
  p * 17 + 8,
  p * 17 + 12,
]).flat();
export function initial(): State {
  return {
    pieces: Array.from({ length: 4 }, () => Array(4).fill(-1)),
    started: Array(4).fill(false),
    roll: 0,
    grace: false,
    phase: "roll",
    shells: [],
    scores: [0, 0, 0, 0],
    turn: 0,
    winner: null,
    step: 0,
    message: "Equipos J1/J3 y J2/J4. Lanza seis cauris.",
  };
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  if (s.phase === "roll")
    return [{ from: -1, to: -1, tool: 0, label: "Lanzar seis cauris" }];
  const a: BoardAction[] = s.pieces[s.turn].flatMap((pos, i) => {
    const next = pos + s.roll;
    if (pos === 82 || next > 82 || (pos < 0 && s.started[s.turn] && !s.grace))
      return [];
    const to = next === 82 ? 96 : routes[s.turn][next];
    if (
      castles.includes(to) &&
      s.pieces.some(
        (b, p) =>
          p % 2 !== s.turn % 2 &&
          b.some((v) => v >= 0 && v < 82 && routes[p][v] === to),
      )
    )
      return [];
    return [{ from: pos < 0 ? -1 : routes[s.turn][pos], to, tool: i + 1 }];
  });
  a.push({ from: -1, to: -1, tool: 99, label: "Pasar esta tirada" });
  return a;
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    pieces: s.pieces.map((b) => [...b]),
    started: [...s.started],
    scores: [...s.scores],
    step: s.step + 1,
  };
  if (s.phase === "roll") {
    n.shells = Array.from({ length: 6 }, () => (Math.random() < 0.5 ? 0 : 1));
    const up = n.shells.reduce((a, b) => a + b, 0);
    n.roll = up === 0 ? 25 : up === 1 ? 10 : up;
    n.grace = up <= 1 || up === 6;
    n.phase = "move";
    n.message =
      "Cauris: " +
      n.roll +
      (n.grace ? " · gracia y nueva tirada" : "") +
      ". Elige ficha o pasa.";
    return n;
  }
  let captured = false;
  if (a.tool !== 99) {
    const i = a.tool - 1,
      next = n.pieces[s.turn][i] + s.roll;
    n.started[s.turn] = true;
    n.pieces[s.turn][i] = next;
    const cell = next === 82 ? 96 : routes[s.turn][next];
    if (!castles.includes(cell) && cell < 68)
      for (let p = 0; p < 4; p++)
        if (p % 2 !== s.turn % 2)
          n.pieces[p] = n.pieces[p].map((v) => {
            if (v >= 0 && v < 82 && routes[p][v] === cell) {
              captured = true;
              return -1;
            }
            return v;
          });
  }
  n.scores = n.pieces.map((b) => b.filter((v) => v === 82).length);
  const partner = (s.turn + 2) % 4;
  if (n.scores[s.turn] + n.scores[partner] === 8) n.winner = s.turn % 2;
  n.turn = s.grace || captured ? s.turn : (s.turn + 1) % 4;
  while (n.winner === null && n.scores[n.turn] === 4) n.turn = (n.turn + 1) % 4;
  if (n.winner === null && n.pieces.every((b) => b.every((v) => v >= 81)))
    n.winner = -1;
  n.phase = "roll";
  n.message = captured
    ? "Captura: las fichas rivales vuelven al centro y repites."
    : "Lanza seis cauris; llegada exacta al centro.";
  return n;
}
export const tools = (s: State) =>
  [...new Set(actions(s).map((a) => a.tool))].map((key) => ({
    key,
    label:
      key === 0
        ? "Lanzar cauris"
        : key === 99
          ? "Pasar"
          : "Ficha " + key + (s.pieces[s.turn][key - 1] < 0 ? " · centro" : ""),
  }));
export const board = (s: State) => {
  const b = graph(
    points.map(([x, y]) => [190 + x * 19, 190 + y * 19]),
    [],
    Array(points.length).fill(-1),
    undefined,
    8,
  );
  b.graph.width = 380;
  b.graph.height = 380;
  b.graph.links = routes.flatMap((r) =>
    r.slice(1).map((v, i) => [r[i], v] as [number, number]),
  );
  for (const c of b.cells) {
    const ps = s.pieces.flatMap((a, p) =>
      a.some((v) => v >= 0 && v < 82 && routes[p][v] === c.key) ? [p] : [],
    );
    c.owner = ps[0];
    c.text = ps.length
      ? ps.map((p) => String(p + 1)).join("/")
      : c.key === 96
        ? "☸"
        : castles.includes(c.key)
          ? "✧"
          : "";
    c.label =
      c.key === 96
        ? "Centro: llegada"
        : "Punto " +
          (c.key + 1) +
          (ps.length
            ? " · J" + ps.map((p) => p + 1).join("/")
            : castles.includes(c.key)
              ? " · castillo"
              : "");
  }
  return b;
};
export const result = (s: State) =>
  s.winner === null
    ? ""
    : s.winner < 0
      ? "Tablas"
      : s.winner === 0
        ? "Gana el equipo J1 / J3"
        : "Gana el equipo J2 / J4";
export const automatic = (s: State) => {
  const list = actions(s);
  if (!list.length) return s;
  if (list.length === 1) return apply(s, list[0]);
  let best = list[0],
    v = -Infinity;
  for (const a of list) {
    const n = apply(s, a),
      p = s.turn;
    const value =
      n.winner === p % 2
        ? 1e6
        : n.winner !== null
          ? -1e6
          : n.scores[p] * 120 +
            n.scores[(p + 2) % 4] * 120 +
            n.pieces[p].reduce(
              (sum, x) => sum + (x === 81 ? -300 : Math.max(0, x)),
              0,
            ) +
            n.pieces
              .flatMap((b, q) => (q % 2 !== p % 2 ? b : []))
              .filter((x) => x < 0).length *
              12 +
            (n.turn === p ? 2 : 0) +
            Math.random() * 0.1;
    if (value > v) {
      v = value;
      best = a;
    }
  }
  return apply(s, best);
};
