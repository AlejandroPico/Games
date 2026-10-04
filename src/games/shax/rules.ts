import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import {
  graph,
  valid,
  pick,
  millPoints,
  millLines,
  millLinks,
} from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  pieces: number[];
  reserve: number[];
  first: number;
  capture: number;
  opening: number;
  freeFor: number;
  history: string[];
}
const mills = (b: number[], p: number) =>
  millLines.filter((l) => l.every((i) => b[i] === p));
function moves(b: number[], p: number) {
  return millLinks.flatMap(([a, bp]) =>
    b[a] === p && b[bp] < 0
      ? [{ from: a, to: bp, tool: 0 }]
      : b[bp] === p && b[a] < 0
        ? [{ from: bp, to: a, tool: 0 }]
        : [],
  );
}
export function initial(): State {
  return {
    pieces: Array(24).fill(-1),
    reserve: [12, 12],
    first: -1,
    capture: 0,
    opening: -1,
    freeFor: -1,
    history: [],
    turn: 0,
    winner: null,
    scores: [12, 12],
    step: 0,
    message:
      "Coloca doce fichas. El primer jare se recuerda, pero todavía no captura.",
  };
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  if (s.reserve.some((v) => v))
    return s.pieces.flatMap((v, to) =>
      v < 0 ? [{ from: -1, to, tool: 0 }] : [],
    );
  if (s.capture)
    return s.pieces.flatMap((v, to) =>
      v === 1 - s.turn ? [{ from: -1, to, tool: 1 }] : [],
    );
  return moves(s.pieces, s.turn).filter((a) => {
    if (s.freeFor < 0) return true;
    const b = [...s.pieces];
    b[a.from] = -1;
    b[a.to] = s.turn;
    return moves(b, s.freeFor).length > 0;
  });
}
function next(n: State, p: number) {
  n.turn = 1 - p;
  n.freeFor = -1;
  if (!moves(n.pieces, n.turn).length) {
    n.freeFor = n.turn;
    n.turn = p;
    if (!actions(n).length) n.winner = -1;
  }
  const k = n.pieces.join() + n.turn + "," + n.freeFor;
  n.history.push(k);
  if (
    n.winner === null &&
    (n.history.filter((v) => v === k).length >= 3 || n.step >= 600)
  )
    n.winner = -1;
  n.message =
    n.freeFor >= 0
      ? "Debes abrir una salida al rival; esta jugada no captura."
      : "Mueve a un punto vecino y forma un jare.";
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    pieces: [...s.pieces],
    reserve: [...s.reserve],
    history: [...s.history],
    step: s.step + 1,
  };
  if (s.reserve.some((v) => v)) {
    n.reserve[s.turn]--;
    n.pieces[a.to] = s.turn;
    if (n.first < 0 && mills(n.pieces, s.turn).length) n.first = s.turn;
    n.turn = 1 - s.turn;
    if (n.reserve.every((v) => !v)) {
      n.turn = n.first < 0 ? 1 : n.first;
      n.opening = n.turn;
      n.capture = 2;
      n.message =
        "Apertura: retira cualquier ficha rival; luego lo hará el otro jugador.";
    }
  } else if (s.capture) {
    n.pieces[a.to] = -1;
    n.capture--;
    n.scores = [
      n.pieces.filter((v) => v === 0).length,
      n.pieces.filter((v) => v === 1).length,
    ];
    if (n.scores[1 - s.turn] < 3) n.winner = s.turn;
    if (n.capture) n.turn = 1 - s.turn;
    else if (s.capture === 1 && s.opening >= 0) {
      n.turn = s.opening;
      n.opening = -1;
    } else next(n, s.turn);
  } else {
    n.pieces[a.from] = -1;
    n.pieces[a.to] = s.turn;
    if (s.freeFor >= 0) {
      n.turn = s.freeFor;
      n.freeFor = -1;
    } else if (mills(n.pieces, s.turn).some((l) => l.includes(a.to))) {
      n.capture = 1;
      n.message =
        "Jare: retira una ficha rival, también puede pertenecer a otro jare.";
    } else next(n, s.turn);
  }
  return n;
}
export const tools = (s: State) => [
  {
    key: s.capture ? 1 : 0,
    label: s.capture
      ? "Retirar rival"
      : s.reserve.some((v) => v)
        ? "Colocar"
        : "Mover por línea",
  },
];
export const board = (s: State) =>
  graph(millPoints, millLinks, s.pieces, undefined, 13);
export const automatic = (s: State) =>
  pick(
    s,
    actions(s),
    apply,
    (n, p) =>
      n.scores[p] * 10 -
      n.scores[1 - p] * 15 +
      (n.capture && n.turn === p ? 15 : 0) +
      millLines.reduce(
        (v, l) =>
          v +
          (l.filter((i) => n.pieces[i] === p).length === 2 &&
          !l.some((i) => n.pieces[i] === 1 - p)
            ? 3
            : 0),
        0,
      ),
  );
