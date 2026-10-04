import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { graph, valid, pick, type Point } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  pieces: number[];
  chain: number;
  visited: number[];
  direction: string;
  history: string[];
}
const points: Point[] = Array.from({ length: 45 }, (_, i) => [
  25 + (i % 9) * 45,
  25 + Math.floor(i / 9) * 60,
]);
export const adjacent = (a: number, b: number) => {
  const dx = Math.abs((a % 9) - (b % 9)),
    dy = Math.abs(Math.floor(a / 9) - Math.floor(b / 9));
  return (
    dx <= 1 &&
    dy <= 1 &&
    dx + dy > 0 &&
    (dx === 0 || dy === 0 || ((a % 9) + Math.floor(a / 9)) % 2 === 0)
  );
};
const links: [number, number][] = points.flatMap((_, a) =>
  points.flatMap((_, b) =>
    b > a && adjacent(a, b) ? [[a, b] as [number, number]] : [],
  ),
);
export function initial(): State {
  return {
    pieces: Array.from({ length: 45 }, (_, i) =>
      i < 18
        ? 1
        : i >= 27
          ? 0
          : i === 22
            ? -1
            : [1, 0, 1, 0, -1, 1, 0, 1, 0][i - 18],
    ),
    chain: -1,
    visited: [],
    direction: "",
    turn: 0,
    winner: null,
    scores: [22, 22],
    step: 0,
    history: [],
    message: "La captura inicial es obligatoria si existe.",
  };
}
export function victims(s: State, a: BoardAction) {
  const dx = (a.to % 9) - (a.from % 9),
    dy = Math.floor(a.to / 9) - Math.floor(a.from / 9);
  let x = a.tool === 1 ? (a.to % 9) + dx : (a.from % 9) - dx,
    y = a.tool === 1 ? Math.floor(a.to / 9) + dy : Math.floor(a.from / 9) - dy;
  const sign = a.tool === 1 ? 1 : -1,
    out: number[] = [];
  while (
    x >= 0 &&
    x < 9 &&
    y >= 0 &&
    y < 5 &&
    s.pieces[y * 9 + x] === 1 - s.turn
  ) {
    out.push(y * 9 + x);
    x += dx * sign;
    y += dy * sign;
  }
  return out;
}
function raw(s: State) {
  return s.pieces.flatMap((p, from) =>
    p === s.turn && (s.chain < 0 || s.chain === from)
      ? s.pieces.flatMap((q, to) =>
          q < 0 &&
          adjacent(from, to) &&
          !s.visited.includes(to) &&
          [
            (to % 9) - (from % 9),
            Math.floor(to / 9) - Math.floor(from / 9),
          ].join() !== s.direction
            ? [0, 1, 2].flatMap((tool) => {
                const a = { from, to, tool };
                return tool === 0 ? [a] : victims(s, a).length ? [a] : [];
              })
            : [],
        )
      : [],
  );
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  const a = raw(s),
    caps = a.filter((a) => a.tool > 0);
  if (s.chain >= 0)
    return [...caps, { from: -1, to: -1, tool: 3, label: "Terminar captura" }];
  return caps.length ? caps : a.filter((a) => a.tool === 0);
}
function end(n: State, p: number) {
  n.turn = 1 - p;
  n.chain = -1;
  n.visited = [];
  n.direction = "";
  const k = n.pieces.join() + n.turn;
  n.history.push(k);
  if (n.history.filter((v) => v === k).length >= 3 || n.step >= 600)
    n.winner = -1;
  if (n.winner === null && !actions(n).length) n.winner = p;
  n.message = "Selecciona aproximación o retirada, y mueve por una línea.";
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    pieces: [...s.pieces],
    scores: [...s.scores],
    visited: [...s.visited],
    history: [...s.history],
    step: s.step + 1,
  };
  if (a.tool === 3) {
    end(n, s.turn);
    return n;
  }
  const captured = a.tool ? victims(s, a) : [];
  captured.forEach((i) => (n.pieces[i] = -1));
  n.pieces[a.from] = -1;
  n.pieces[a.to] = s.turn;
  n.scores = [
    n.pieces.filter((p) => p === 0).length,
    n.pieces.filter((p) => p === 1).length,
  ];
  if (!n.scores[1 - s.turn]) {
    n.winner = s.turn;
    return n;
  }
  if (captured.length) {
    n.chain = a.to;
    n.visited = [...s.visited, a.from];
    n.direction = [
      (a.to % 9) - (a.from % 9),
      Math.floor(a.to / 9) - Math.floor(a.from / 9),
    ].join();
    n.message =
      "Puedes seguir con la misma ficha o terminar; cambia de dirección.";
    if (!raw(n).some((a) => a.tool > 0)) end(n, s.turn);
  } else end(n, s.turn);
  return n;
}
export const tools = (s: State) =>
  [...new Set(actions(s).map((a) => a.tool))].map((key) => ({
    key,
    label: [
      "Mover sin captura",
      "Aproximación",
      "Retirada",
      "Terminar secuencia",
    ][key],
  }));
export const board = (s: State) =>
  graph(points, links, s.pieces, undefined, 12);
export const automatic = (s: State) =>
  pick(
    s,
    actions(s),
    apply,
    (n, p) =>
      n.scores[p] * 5 -
      n.scores[1 - p] * 10 +
      (n.turn === p && n.chain >= 0 ? 1 : 0),
  );
