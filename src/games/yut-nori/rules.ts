import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { graph, valid, pick, type Point } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  pieces: { node: number; route: number; index: number }[][];
  throws: number[];
  phase: "roll" | "move";
  sticks: number[];
}
export const routes: number[][] = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 0],
  [1, 2, 3, 4, 5, 20, 21, 24, 27, 28, 15, 16, 17, 18, 19, 0],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 22, 23, 24, 25, 26, 0],
  [1, 2, 3, 4, 5, 20, 21, 24, 25, 26, 0],
];
const points: Point[] = Array.from({ length: 20 }, (_, i) => {
  if (i <= 5) return [330, 330 - i * 58];
  if (i <= 10) return [330 - (i - 5) * 58, 40];
  if (i <= 15) return [40, 40 + (i - 10) * 58];
  return [40 + (i - 15) * 58, 330];
});
points.push(
  ...([
    [272, 98],
    [214, 156],
    [98, 98],
    [156, 156],
    [185, 185],
    [214, 214],
    [272, 272],
    [156, 214],
    [98, 272],
  ] as Point[]),
);
points.push([185, 355]);
export function initial(): State {
  return {
    pieces: Array.from({ length: 2 }, () =>
      Array.from({ length: 4 }, () => ({ node: -1, route: 0, index: -1 })),
    ),
    throws: [],
    phase: "roll",
    sticks: [],
    turn: 0,
    winner: null,
    scores: [0, 0],
    step: 0,
    message: "Lanza cuatro palos: 4 o 5 conceden otra tirada antes de mover.",
  };
}
export function options(piece: { node: number; route: number; index: number }) {
  if (piece.node < 0) return [piece.route];
  const available = [piece.route];
  if (piece.route === 0 && piece.node === 5) available.push(1);
  if (piece.route === 0 && piece.node === 10) available.push(2);
  if (piece.route === 1 && piece.node === 24) available.push(3);
  return [...new Set(available)];
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  if (s.phase === "roll")
    return [{ from: -1, to: -1, tool: 0, label: "Lanzar cuatro palos" }];
  return s.throws.flatMap((roll, t) =>
    s.pieces[s.turn].flatMap((piece, i) =>
      piece.node === 29
        ? []
        : options(piece).map((r) => {
            const path = routes[r],
              index =
                r === piece.route ? piece.index : path.indexOf(piece.node),
              next = index + roll,
              to = next >= path.length ? 29 : path[next];
            return {
              from: piece.node < 0 ? -1 : piece.node,
              to,
              tool: 1 + t * 100 + i * 10 + r,
            };
          }),
    ),
  );
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    pieces: s.pieces.map((b) => b.map((v) => ({ ...v }))),
    throws: [...s.throws],
    scores: [...s.scores],
    step: s.step + 1,
  };
  if (s.phase === "roll") {
    n.sticks = Array.from({ length: 4 }, () => (Math.random() < 0.5 ? 0 : 1));
    let value = n.sticks.reduce((a, b) => a + b, 0);
    if (!value) value = 5;
    n.throws.push(value);
    n.phase = value >= 4 ? "roll" : "move";
    n.message =
      "Palos: " +
      value +
      " · pendientes " +
      n.throws.join(", ") +
      (value >= 4 ? " · vuelve a lanzar" : " · elige tirada, ficha y ruta");
    return n;
  }
  const code = a.tool - 1,
    t = Math.floor(code / 100),
    i = Math.floor((code % 100) / 10),
    r = code % 10,
    piece = s.pieces[s.turn][i],
    index = r === piece.route ? piece.index : routes[r].indexOf(piece.node),
    next = index + s.throws[t],
    node = next >= routes[r].length ? 29 : routes[r][next],
    group = s.pieces[s.turn].flatMap((p, j) =>
      j === i || (piece.node >= 0 && p.node === piece.node) ? [j] : [],
    );
  group.forEach((j) => (n.pieces[s.turn][j] = { node, route: r, index: next }));
  let captured = false;
  if (node !== 29)
    n.pieces[1 - s.turn] = n.pieces[1 - s.turn].map((p) => {
      if (p.node === node) {
        captured = true;
        return { node: -1, route: 0, index: -1 };
      }
      return p;
    });
  n.throws.splice(t, 1);
  n.scores = n.pieces.map((b) => b.filter((p) => p.node === 29).length);
  if (n.scores[s.turn] === 4) n.winner = s.turn;
  if (captured) n.phase = "roll";
  else if (n.throws.length) n.phase = "move";
  else {
    n.turn = 1 - s.turn;
    n.phase = "roll";
  }
  n.message = captured
    ? "Captura: grupo rival devuelto a reserva y nueva tirada."
    : n.throws.length
      ? "Quedan " + n.throws.join(", ") + ". Elige ficha y recorrido."
      : "Turno siguiente: lanza los palos.";
  return n;
}
export const tools = (s: State) =>
  actions(s).map((a) => ({
    key: a.tool,
    label:
      a.tool === 0
        ? "Lanzar palos"
        : (() => {
            const c = a.tool - 1,
              t = Math.floor(c / 100),
              i = Math.floor((c % 100) / 10),
              r = c % 10;
            return (
              "Tirada " +
              s.throws[t] +
              " · ficha " +
              (i + 1) +
              " · " +
              (r === 0
                ? "exterior"
                : r === 1
                  ? "atajo A"
                  : r === 2
                    ? "atajo B"
                    : "atajo C")
            );
          })(),
  }));
export const board = (s: State) => {
  const b = graph(
    points,
    [
      ...Array.from(
        { length: 20 },
        (_, i) => [i, (i + 1) % 20] as [number, number],
      ),
      [5, 20],
      [20, 21],
      [21, 24],
      [24, 27],
      [27, 28],
      [28, 15],
      [10, 22],
      [22, 23],
      [23, 24],
      [24, 25],
      [25, 26],
      [26, 0],
    ] as [number, number][],
    Array(30).fill(-1),
    undefined,
    11,
  );
  b.graph.width = 370;
  b.graph.height = 380;
  for (const cell of b.cells) {
    const p = s.pieces.findIndex((b) => b.some((v) => v.node === cell.key)),
      count =
        p >= 0 ? s.pieces[p].filter((v) => v.node === cell.key).length : 0;
    cell.owner = p >= 0 ? p : undefined;
    cell.text = count
      ? String(count)
      : cell.key === 29
        ? "★"
        : [0, 5, 10, 15, 24].includes(cell.key)
          ? "✧"
          : "";
    cell.label =
      cell.key === 29
        ? "Salida"
        : "Punto " +
          cell.key +
          (p >= 0 ? " · J" + (p + 1) + " · " + count + " fichas" : "");
  }
  return b;
};
export const automatic = (s: State) =>
  pick(
    s,
    actions(s),
    apply,
    (n, p) =>
      n.scores[p] * 100 +
      n.pieces[p].reduce(
        (v, piece) =>
          v +
          (piece.node === 29
            ? 0
            : piece.index >= 0
              ? 30 - (routes[piece.route].length - piece.index)
              : 0),
        0,
      ) +
      n.pieces[1 - p].filter((v) => v.node < 0).length * 8,
  );
