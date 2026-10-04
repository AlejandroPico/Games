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
  capture: boolean;
  history: string[];
}
const mills = (b: number[], p: number) =>
  millLines.filter((l) => l.every((i) => b[i] === p));
export function initial(): State {
  return {
    pieces: Array(24).fill(-1),
    reserve: [9, 9],
    capture: false,
    turn: 0,
    winner: null,
    scores: [9, 9],
    step: 0,
    message: "Coloca tus nueve fichas y forma molinos.",
    history: [],
  };
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  const p = s.turn,
    enemy = 1 - p;
  if (s.capture) {
    const free = s.pieces.flatMap((v, i) =>
      v === enemy && !mills(s.pieces, enemy).some((l) => l.includes(i))
        ? [i]
        : [],
    );
    return (
      free.length ? free : s.pieces.flatMap((v, i) => (v === enemy ? [i] : []))
    ).map((to) => ({ from: -1, to, tool: 1 }));
  }
  if (s.reserve[p])
    return s.pieces.flatMap((v, to) =>
      v < 0 ? [{ from: -1, to, tool: 0 }] : [],
    );
  const fly = s.pieces.filter((v) => v === p).length === 3;
  return s.pieces.flatMap((v, from) =>
    v === p
      ? s.pieces.flatMap((w, to) =>
          w < 0 &&
          (fly ||
            millLinks.some(
              ([a, b]) => (a === from && b === to) || (b === from && a === to),
            ))
            ? [{ from, to, tool: 0 }]
            : [],
        )
      : [],
  );
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n: State = {
    ...s,
    pieces: [...s.pieces],
    reserve: [...s.reserve],
    scores: [...s.scores],
    history: [...s.history],
    step: s.step + 1,
  };
  if (s.capture) {
    n.pieces[a.to] = -1;
    n.capture = false;
    n.turn = 1 - s.turn;
  } else {
    if (a.from >= 0) n.pieces[a.from] = -1;
    else n.reserve[s.turn]--;
    n.pieces[a.to] = s.turn;
    if (mills(n.pieces, s.turn).some((l) => l.includes(a.to))) {
      n.capture = true;
      n.message = "Molino: retira una ficha rival que no esté protegida.";
    } else n.turn = 1 - s.turn;
  }
  n.scores = n.reserve.map(
    (r, p) => r + n.pieces.filter((v) => v === p).length,
  );
  if (n.scores[1 - s.turn] < 3) n.winner = s.turn;
  if (!n.capture) {
    const key = n.pieces.join(",") + "|" + n.turn + "|" + n.reserve.join(",");
    n.history.push(key);
    if (
      n.winner === null &&
      (n.history.filter((k) => k === key).length >= 3 || n.step >= 600)
    )
      n.winner = -1;
    if (n.winner === null && !actions(n).length) n.winner = s.turn;
    n.message = n.reserve[n.turn]
      ? "Coloca una ficha."
      : "Mueve por las líneas; con tres fichas puedes volar.";
  }
  return n;
}
export const tools = (s: State) => [
  {
    key: s.capture ? 1 : 0,
    label: s.capture
      ? "Retirar rival"
      : s.reserve[s.turn]
        ? "Colocar"
        : "Mover",
  },
];
export const board = (s: State) => graph(millPoints, millLinks, s.pieces);
export const automatic = (s: State) =>
  pick(
    s,
    actions(s),
    apply,
    (n, p) =>
      n.scores[p] * 15 -
      n.scores[1 - p] * 18 +
      (n.capture && n.turn === p ? 20 : 0) +
      millLines.reduce(
        (v, l) =>
          v +
          (l.filter((i) => n.pieces[i] === p).length === 2 &&
          l.some((i) => n.pieces[i] < 0)
            ? 4
            : 0) -
          (l.filter((i) => n.pieces[i] === 1 - p).length === 2 &&
          l.some((i) => n.pieces[i] < 0)
            ? 5
            : 0),
        0,
      ),
  );
