export type Player = 1 | 2;
export type Grid = number[][];
export const emptyGrid = (): Grid =>
  Array.from({ length: 6 }, () => Array(7).fill(0));
export function drop(grid: Grid, column: number, player: Player): Grid | null {
  if (column < 0 || column > 6 || !Number.isInteger(column) || grid[0][column])
    return null;
  const next = grid.map((row) => [...row]);
  for (let row = 5; row >= 0; row--)
    if (!next[row][column]) {
      next[row][column] = player;
      return next;
    }
  return null;
}
export function winningLine(
  grid: Grid,
): { player: Player; cells: [number, number][] } | null {
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 7; c++)
      if (grid[r][c])
        for (const [dr, dc] of [
          [0, 1],
          [1, 0],
          [1, 1],
          [1, -1],
        ]) {
          const cells: [number, number][] = [];
          for (let i = 0; i < 4; i++) {
            const rr = r + dr * i,
              cc = c + dc * i;
            if (
              rr < 0 ||
              rr >= 6 ||
              cc < 0 ||
              cc >= 7 ||
              grid[rr][cc] !== grid[r][c]
            )
              break;
            cells.push([rr, cc]);
          }
          if (cells.length === 4)
            return { player: grid[r][c] as Player, cells };
        }
  return null;
}
const order = [3, 2, 4, 1, 5, 0, 6];
function evaluate(grid: Grid): number {
  let score = grid.reduce(
    (n, row) => n + (row[3] === 2 ? 7 : row[3] === 1 ? -7 : 0),
    0,
  );
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 7; c++)
      for (const [dr, dc] of [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
      ]) {
        const line = [];
        for (let i = 0; i < 4; i++) {
          const rr = r + dr * i,
            cc = c + dc * i;
          if (rr < 0 || rr >= 6 || cc < 0 || cc >= 7) break;
          line.push(grid[rr][cc]);
        }
        if (line.length !== 4) continue;
        const ai = line.filter((v) => v === 2).length,
          human = line.filter((v) => v === 1).length;
        if (!human) score += [0, 1, 9, 80, 100000][ai];
        if (!ai) score -= [0, 1, 12, 100, 100000][human];
      }
  return score;
}
function minimax(
  grid: Grid,
  depth: number,
  ai: boolean,
  alpha: number,
  beta: number,
): number {
  const win = winningLine(grid);
  if (win) return win.player === 2 ? 100000 + depth : -100000 - depth;
  const valid = order.filter((c) => !grid[0][c]);
  if (!valid.length) return 0;
  if (!depth) return evaluate(grid);
  let best = ai ? -Infinity : Infinity;
  for (const col of valid) {
    const next = drop(grid, col, ai ? 2 : 1)!;
    const score = minimax(next, depth - 1, !ai, alpha, beta);
    if (ai) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  return best;
}
export function bestMove(grid: Grid, depth = 5): number {
  let best = -Infinity,
    column = -1;
  for (const c of order) {
    const next = drop(grid, c, 2);
    if (!next) continue;
    const score = minimax(next, depth - 1, false, -Infinity, Infinity);
    if (score > best) {
      best = score;
      column = c;
    }
  }
  return column;
}
