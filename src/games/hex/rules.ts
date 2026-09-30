export type State = {
  board: number[];
  size: number;
  turn: number;
  colors: number[];
  moves: number;
  winner: number;
  swapped: boolean;
};
export const initial = (size = 9): State => ({
  board: Array(size * size).fill(0),
  size,
  turn: 1,
  colors: [1, 2],
  moves: 0,
  winner: 0,
  swapped: false,
});
export function neighbors(i: number, n: number) {
  const r = Math.floor(i / n),
    c = i % n;
  return [
    [r + 1, c],
    [r - 1, c],
    [r, c + 1],
    [r, c - 1],
    [r - 1, c + 1],
    [r + 1, c - 1],
  ]
    .filter(([r, c]) => r >= 0 && r < n && c >= 0 && c < n)
    .map(([r, c]) => r * n + c);
}
export function connected(board: number[], n: number, color: number): boolean {
  const queue = board.flatMap((v, i) =>
      v === color && (color === 1 ? Math.floor(i / n) === 0 : i % n === 0)
        ? [i]
        : [],
    ),
    seen = new Set(queue);
  for (let k = 0; k < queue.length; k++) {
    const i = queue[k];
    if (color === 1 ? Math.floor(i / n) === n - 1 : i % n === n - 1)
      return true;
    for (const j of neighbors(i, n))
      if (board[j] === color && !seen.has(j)) {
        seen.add(j);
        queue.push(j);
      }
  }
  return false;
}
export function play(s: State, i: number): State | null {
  if (
    !Number.isInteger(i) ||
    i < 0 ||
    i >= s.board.length ||
    s.board[i] ||
    s.winner
  )
    return null;
  const board = [...s.board],
    color = s.colors[s.turn - 1];
  board[i] = color;
  return {
    ...s,
    board,
    turn: 3 - s.turn,
    moves: s.moves + 1,
    winner: connected(board, s.size, color) ? s.turn : 0,
  };
}
export function swap(s: State): State | null {
  return s.moves === 1 && !s.swapped && s.turn === 2
    ? { ...s, colors: [s.colors[1], s.colors[0]], turn: 1, swapped: true }
    : null;
}
export function distance(board: number[], n: number, color: number): number {
  const costs = board.map((v) => (v === color ? 0 : v === 0 ? 1 : 1e4)),
    dist = Array(n * n).fill(Infinity),
    seen = new Set<number>();
  for (let i = 0; i < n * n; i++)
    if (color === 1 ? Math.floor(i / n) === 0 : i % n === 0) dist[i] = costs[i];
  for (let k = 0; k < n * n; k++) {
    let i = -1;
    for (let j = 0; j < n * n; j++)
      if (!seen.has(j) && (i < 0 || dist[j] < dist[i])) i = j;
    if (i < 0) break;
    seen.add(i);
    if (color === 1 ? Math.floor(i / n) === n - 1 : i % n === n - 1)
      return dist[i];
    for (const j of neighbors(i, n))
      dist[j] = Math.min(dist[j], dist[i] + costs[j]);
  }
  return Infinity;
}
export function bestMove(s: State): number | "swap" {
  const color = s.colors[s.turn - 1];
  if (s.moves === 1 && !s.swapped) {
    const i = s.board.findIndex(Boolean),
      r = Math.floor(i / s.size),
      c = i % s.size;
    if (
      Math.abs(r - (s.size - 1) / 2) + Math.abs(c - (s.size - 1) / 2) <
      s.size / 2
    )
      return "swap";
  }
  let best = -Infinity,
    chosen = -1;
  for (let i = 0; i < s.board.length; i++)
    if (!s.board[i]) {
      const n = play(s, i)!,
        enemy = play({ ...s, turn: 3 - s.turn }, i)!;
      const score = n.winner
        ? 1e6
        : enemy.winner
          ? 1e5
          : distance(n.board, s.size, 3 - color) * 8 -
            distance(n.board, s.size, color) * 10 -
            Math.abs(Math.floor(i / s.size) - s.size / 2) * 0.01;
      if (score > best) {
        best = score;
        chosen = i;
      }
    }
  return chosen;
}
