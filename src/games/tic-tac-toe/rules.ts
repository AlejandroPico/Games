export type Mark = "X" | "O";
export type Board = (Mark | null)[];
export const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
export function winner(b: Board) {
  const line = lines.find((l) => b[l[0]] && l.every((i) => b[i] === b[l[0]]));
  return line ? { mark: b[line[0]]!, line } : null;
}
export function bestMove(b: Board, player: Mark = "O"): number {
  function search(board: Board, turn: Mark, depth: number): number {
    const w = winner(board);
    if (w) return w.mark === "O" ? 10 - depth : depth - 10;
    if (board.every(Boolean)) return 0;
    let value = turn === "O" ? -Infinity : Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue;
      const next = [...board];
      next[i] = turn;
      const score = search(next, turn === "O" ? "X" : "O", depth + 1);
      value = turn === "O" ? Math.max(value, score) : Math.min(value, score);
    }
    return value;
  }
  let move = -1,
    score = player === "O" ? -Infinity : Infinity;
  for (const i of [4, 0, 2, 6, 8, 1, 3, 5, 7]) {
    if (b[i]) continue;
    const next = [...b];
    next[i] = player;
    const value = search(next, player === "O" ? "X" : "O", 0);
    if (player === "O" ? value > score : value < score) {
      score = value;
      move = i;
    }
  }
  return move;
}

export type ContinuousState = {
  board: Board;
  queues: Record<Mark, number[]>;
  turn: Mark;
};
export const initialContinuous = (): ContinuousState => ({
  board: Array(9).fill(null),
  queues: { X: [], O: [] },
  turn: "X",
});
export function placeMark(
  s: ContinuousState,
  index: number,
  continuous = true,
): ContinuousState | null {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index > 8 ||
    s.board[index] ||
    winner(s.board)
  )
    return null;
  const board = [...s.board],
    queue = [...s.queues[s.turn]];
  if (continuous && queue.length === 3) board[queue.shift()!] = null;
  board[index] = s.turn;
  queue.push(index);
  return {
    board,
    queues: { ...s.queues, [s.turn]: queue },
    turn: s.turn === "X" ? "O" : "X",
  };
}
// Finite search handles repeated positions without declaring the actual game drawn.
export function bestContinuousMove(s: ContinuousState, depth = 8): number {
  const key = (p: ContinuousState) =>
    p.turn + ":" + p.queues.X.join(",") + "|" + p.queues.O.join(",");
  function search(p: ContinuousState, left: number, path: Set<string>): number {
    const w = winner(p.board);
    if (w) return w.mark === "O" ? 100 + left : -100 - left;
    const k = key(p);
    if (path.has(k)) return 0;
    if (!left)
      return lines.reduce((n, l) => {
        const x = l.filter((i) => p.board[i] === "X").length,
          o = l.filter((i) => p.board[i] === "O").length;
        return n + (x ? 0 : o * o) - (o ? 0 : x * x);
      }, 0);

    const nextPath = new Set(path);
    nextPath.add(k);
    let value = p.turn === "O" ? -Infinity : Infinity;
    for (const i of [4, 0, 2, 6, 8, 1, 3, 5, 7]) {
      const next = placeMark(p, i);
      if (!next) continue;
      const v = search(next, left - 1, nextPath);
      value = p.turn === "O" ? Math.max(value, v) : Math.min(value, v);
    }
    if (!Number.isFinite(value)) value = 0;
    return value;
  }
  let chosen = -1,
    value = s.turn === "O" ? -Infinity : Infinity;
  for (const i of [4, 0, 2, 6, 8, 1, 3, 5, 7]) {
    const next = placeMark(s, i);
    if (!next) continue;
    const v = search(next, depth - 1, new Set([key(s)]));
    if (s.turn === "O" ? v > value : v < value) {
      value = v;
      chosen = i;
    }
  }
  return chosen;
}
