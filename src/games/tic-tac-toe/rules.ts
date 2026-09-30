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
export function bestMove(b: Board): number {
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
    score = -Infinity;
  for (const i of [4, 0, 2, 6, 8, 1, 3, 5, 7]) {
    if (b[i]) continue;
    const next = [...b];
    next[i] = "O";
    const value = search(next, "X", 0);
    if (value > score) {
      score = value;
      move = i;
    }
  }
  return move;
}
