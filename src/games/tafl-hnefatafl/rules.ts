import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { grid, valid, pick } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  pieces: number[];
  history: string[];
}
const corners = [0, 10, 110, 120],
  throne = 60,
  restricted = [...corners, throne];
const neighbours = (i: number) =>
  [
    i % 11 ? i - 1 : -1,
    i % 11 < 10 ? i + 1 : -1,
    i >= 11 ? i - 11 : -1,
    i < 110 ? i + 11 : -1,
  ].filter((v) => v >= 0);
export function initial(): State {
  const b = Array(121).fill(-1);
  for (const i of [
    3, 4, 5, 6, 7, 16, 33, 44, 55, 66, 77, 56, 43, 54, 65, 76, 87, 64, 113, 114,
    115, 116, 117, 104,
  ])
    b[i] = 0;
  for (const i of [38, 49, 58, 59, 61, 62, 71, 82, 48, 50, 70, 72]) b[i] = 1;
  b[60] = 2;
  return {
    pieces: b,
    turn: 0,
    winner: null,
    scores: [24, 12],
    step: 0,
    history: [],
    message: "Atacantes juegan primero. El rey debe alcanzar una esquina.",
  };
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  return s.pieces.flatMap((p, from) =>
    p === s.turn || (s.turn === 1 && p === 2)
      ? [-11, 11, -1, 1].flatMap((d) => {
          const a: BoardAction[] = [];
          let to = from + d,
            last = from;
          while (
            to >= 0 &&
            to < 121 &&
            (Math.abs(d) !== 1 ||
              Math.floor(to / 11) === Math.floor(last / 11)) &&
            s.pieces[to] < 0
          ) {
            if (p === 2 || !restricted.includes(to))
              a.push({ from, to, tool: 0 });
            last = to;
            to += d;
          }
          return a;
        })
      : [],
  );
}
export function encircled(b: number[]) {
  const white = b.flatMap((p, i) => (p >= 1 ? [i] : [])),
    seen = new Set<number>(),
    todo = [...white];
  while (todo.length) {
    const i = todo.pop()!;
    if (seen.has(i)) continue;
    seen.add(i);
    if (i % 11 === 0 || i % 11 === 10 || i < 11 || i >= 110) return false;
    todo.push(...neighbours(i).filter((j) => b[j] !== 0 && !seen.has(j)));
  }
  return true;
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    pieces: [...s.pieces],
    history: [...s.history],
    turn: 1 - s.turn,
    step: s.step + 1,
  };
  const piece = n.pieces[a.from];
  n.pieces[a.from] = -1;
  n.pieces[a.to] = piece;
  for (const mid of neighbours(a.to)) {
    const enemy = n.pieces[mid],
      end = mid + (mid - a.to);
    if (
      enemy >= 0 &&
      enemy !== 2 &&
      (enemy === 0) !== (s.turn === 0) &&
      end >= 0 &&
      end < 121 &&
      neighbours(mid).includes(end)
    ) {
      const friend =
          n.pieces[end] === s.turn || (s.turn === 1 && n.pieces[end] === 2),
        hostile =
          restricted.includes(end) &&
          (end !== throne || enemy === 0 || n.pieces[end] < 0);
      if (friend || hostile) n.pieces[mid] = -1;
    }
  }
  const king = n.pieces.indexOf(2);
  if (corners.includes(king)) n.winner = 1;
  else if (s.turn === 0) {
    const adj = neighbours(king);
    if (adj.length === 4 && adj.every((i) => n.pieces[i] === 0 || i === throne))
      n.winner = 0;
    else if (encircled(n.pieces)) n.winner = 0;
  }
  n.scores = [
    n.pieces.filter((p) => p === 0).length,
    n.pieces.filter((p) => p === 1).length,
  ];
  if (n.winner === null && !actions(n).length) n.winner = s.turn;
  const k = n.pieces.join() + n.turn;
  n.history.push(k);
  if (
    n.winner === null &&
    (n.history.filter((v) => v === k).length >= 3 || n.step >= 600)
  )
    n.winner = -1;
  return n;
}
export const tools = () => [{ key: 0, label: "Mover pieza / rey" }];
export const board = (s: State) => {
  const b = grid(
    s.pieces.map((p) => (p === 2 ? 1 : p)),
    11,
    Object.fromEntries(
      restricted.map((i) => [i, corners.includes(i) ? "✧" : "♜"]),
    ),
  );
  const k = s.pieces.indexOf(2);
  if (k >= 0) b.cells[k].text = "♔";
  return b;
};
export const automatic = (s: State) =>
  pick(s, actions(s), apply, (n, p) => {
    const k = n.pieces.indexOf(2),
      distance = Math.min(
        ...corners.map(
          (c) =>
            Math.abs((c % 11) - (k % 11)) +
            Math.abs(Math.floor(c / 11) - Math.floor(k / 11)),
        ),
      );
    return p === 1
      ? n.scores[1] * 12 -
          distance * 3 -
          neighbours(k).filter((i) => n.pieces[i] === 0).length * 8
      : n.scores[0] * 5 -
          n.scores[1] * 18 +
          neighbours(k).filter((i) => n.pieces[i] === 0).length * 10 +
          distance;
  });
