import type { AbstractPosition, BoardAction } from "../../shared/AbstractTable";
import { grid, valid, pick } from "../../shared/traditionalBoard";

export interface State extends AbstractPosition {
  pieces: number[];
  players: number;
  size: number;
  chain: number;
  visited: number[];
  history: string[];
}
export function camp(n: number, p: number, players: number) {
  const raw: number[] = [];
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 5; x++)
      if (players === 2 ? x + y <= 5 : x + y <= 4 && !(x === 4 || y === 4)) {
        if (
          players === 2 &&
          (x + y > 5 || (x === 0 && y === 5) || (y === 0 && x === 5))
        )
          continue;
        const corner = players === 2 ? p * 2 : p;
        const xx = corner === 1 || corner === 2 ? n - 1 - x : x,
          yy = corner >= 2 ? n - 1 - y : y;
        raw.push(yy * n + xx);
      }
  return raw;
}
export function initial(players = 2): State {
  const size = 16,
    b = Array(size * size).fill(-1);
  for (let p = 0; p < players; p++)
    camp(size, p, players).forEach((i) => (b[i] = p));
  return {
    pieces: b,
    players,
    size,
    chain: -1,
    visited: [],
    history: [],
    turn: 0,
    winner: null,
    scores: Array(players).fill(0),
    step: 0,
    message: "Mueve o encadena saltos hasta el campamento opuesto.",
  };
}
export function actions(s: State): BoardAction[] {
  if (s.winner !== null) return [];
  const a: BoardAction[] = [],
    goal = camp(
      s.size,
      (s.turn + (s.players === 2 ? 1 : 2)) % s.players,
      s.players,
    );
  for (let from = 0; from < s.pieces.length; from++)
    if (s.pieces[from] === s.turn && (s.chain < 0 || s.chain === from)) {
      const x = from % s.size,
        y = Math.floor(from / s.size);
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          for (const len of [1, 2]) {
            if (len === 1 && s.chain >= 0) continue;
            const u = x + dx * len,
              v = y + dy * len,
              to = v * s.size + u;
            if (
              u < 0 ||
              u >= s.size ||
              v < 0 ||
              v >= s.size ||
              s.pieces[to] >= 0 ||
              s.visited.includes(to) ||
              (goal.includes(from) && !goal.includes(to))
            )
              continue;
            if (len === 2 && s.pieces[(y + dy) * s.size + x + dx] < 0) continue;
            a.push({ from, to, tool: len === 1 ? 0 : 1 });
          }
        }
    }
  if (s.chain >= 0)
    a.push({ from: -1, to: -1, tool: 2, label: "Terminar saltos" });
  return a;
}
function end(n: State) {
  n.turn = (n.turn + 1) % n.players;
  n.chain = -1;
  n.visited = [];
  const k = n.pieces.join() + n.turn;
  n.history.push(k);
  if (n.history.filter((v) => v === k).length >= 3 || n.step >= 1800)
    n.winner = -1;
  if (n.winner === null && !actions(n).length) n.winner = -1;
}
export function apply(s: State, a: BoardAction): State {
  if (!valid(a, actions(s))) return s;
  const n = {
    ...s,
    pieces: [...s.pieces],
    history: [...s.history],
    visited: [...s.visited],
    step: s.step + 1,
  };
  if (a.tool === 2) {
    end(n);
    return n;
  }
  n.pieces[a.from] = -1;
  n.pieces[a.to] = s.turn;
  n.scores = Array.from(
    { length: s.players },
    (_, p) =>
      camp(
        s.size,
        (p + (s.players === 2 ? 1 : 2)) % s.players,
        s.players,
      ).filter((i) => n.pieces[i] === p).length,
  );
  if (n.scores[s.turn] === camp(s.size, s.turn, s.players).length) {
    n.winner = s.turn;
    return n;
  }
  if (a.tool === 1) {
    n.chain = a.to;
    n.visited = [...s.visited, a.from];
    n.message = "Puedes continuar saltando o terminar.";
    if (!actions(n).some((a) => a.tool === 1)) end(n);
  } else end(n);
  return n;
}
export const tools = (s: State) =>
  [...new Set(actions(s).map((a) => a.tool))].map((key) => ({
    key,
    label: ["Paso", "Saltar", "Terminar saltos"][key],
  }));
export const board = (s: State) => {
  const b = grid(s.pieces, s.size);
  for (let p = 0; p < s.players; p++)
    for (const i of camp(s.size, p, s.players))
      b.cells[i].color = ["#93b6b3", "#d0a4a0", "#bca1cb", "#d3c08b"][p];
  return b;
};
export const automatic = (s: State) =>
  pick(s, actions(s), apply, (n, p) => {
    const targets = camp(
      n.size,
      (p + (n.players === 2 ? 1 : 2)) % n.players,
      n.players,
    );
    return (
      n.scores[p] * 8 -
      n.pieces.reduce(
        (v, x, i) =>
          v +
          (x === p
            ? Math.min(
                ...targets
                  .filter((t) => n.pieces[t] !== p || t === i)
                  .map((t) =>
                    Math.max(
                      Math.abs((t % n.size) - (i % n.size)),
                      Math.abs(Math.floor(t / n.size) - Math.floor(i / n.size)),
                    ),
                  ),
              )
            : 0),
        0,
      ) +
      (n.chain >= 0 && n.turn === p ? 0.01 : 0)
    );
  });
