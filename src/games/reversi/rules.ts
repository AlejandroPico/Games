export type Board = number[][];
export const initial = (): Board => {
  const b = Array.from({ length: 8 }, () => Array(8).fill(0));
  b[3][3] = b[4][4] = 2;
  b[3][4] = b[4][3] = 1;
  return b;
};
export function flips(
  b: Board,
  r: number,
  c: number,
  p: number,
): [number, number][] {
  if (r < 0 || r > 7 || c < 0 || c > 7 || b[r][c]) return [];
  const result: [number, number][] = [];
  for (const [dr, dc] of [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]) {
    let rr = r + dr,
      cc = c + dc;
    const chain: [number, number][] = [];
    while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr][cc] === 3 - p) {
      chain.push([rr, cc]);
      rr += dr;
      cc += dc;
    }
    if (
      chain.length &&
      rr >= 0 &&
      rr < 8 &&
      cc >= 0 &&
      cc < 8 &&
      b[rr][cc] === p
    )
      result.push(...chain);
  }
  return result;
}
export function moves(b: Board, p: number): [number, number][] {
  const result: [number, number][] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (flips(b, r, c, p).length) result.push([r, c]);
  return result;
}
export function play(b: Board, r: number, c: number, p: number): Board | null {
  const f = flips(b, r, c, p);
  if (!f.length) return null;
  const next = b.map((row) => [...row]);
  next[r][c] = p;
  f.forEach(([rr, cc]) => (next[rr][cc] = p));
  return next;
}
export function count(b: Board, p: number) {
  return b.flat().filter((v) => v === p).length;
}
export function bestMove(
  b: Board,
  depth = 4,
  player = 2,
): [number, number] | null {
  const weights = [
    [100, -25, 10, 5, 5, 10, -25, 100],
    [-25, -45, -2, -2, -2, -2, -45, -25],
    [10, -2, 3, 2, 2, 3, -2, 10],
    [5, -2, 2, 1, 1, 2, -2, 5],
    [5, -2, 2, 1, 1, 2, -2, 5],
    [10, -2, 3, 2, 2, 3, -2, 10],
    [-25, -45, -2, -2, -2, -2, -45, -25],
    [100, -25, 10, 5, 5, 10, -25, 100],
  ];
  function search(
    board: Board,
    p: number,
    d: number,
    alpha: number,
    beta: number,
  ): number {
    const legal = moves(board, p);
    if (!legal.length) {
      if (!moves(board, 3 - p).length)
        return (count(board, 2) - count(board, 1)) * 1000;
      if (d) return search(board, 3 - p, d - 1, alpha, beta);
    }
    if (!d) {
      let score = 0;
      board.forEach((row, r) =>
        row.forEach(
          (v, c) => (score += (v === 2 ? 1 : v === 1 ? -1 : 0) * weights[r][c]),
        ),
      );
      return score + (moves(board, 2).length - moves(board, 1).length) * 5;
    }
    let value = p === 2 ? -Infinity : Infinity;
    for (const [r, c] of legal) {
      const score = search(play(board, r, c, p)!, 3 - p, d - 1, alpha, beta);
      if (p === 2) {
        value = Math.max(value, score);
        alpha = Math.max(alpha, value);
      } else {
        value = Math.min(value, score);
        beta = Math.min(beta, value);
      }
      if (alpha >= beta) break;
    }
    return value;
  }
  let choice: [number, number] | null = null,
    score = player === 2 ? -Infinity : Infinity;
  for (const [r, c] of moves(b, player)) {
    const s = search(
      play(b, r, c, player)!,
      3 - player,
      depth - 1,
      -Infinity,
      Infinity,
    );
    if (player === 2 ? s > score : s < score) {
      score = s;
      choice = [r, c];
    }
  }
  return choice;
}
