import { shuffled } from "../../shared/cards";
export type State = {
  size: number;
  mines: number;
  board: number[];
  open: number[];
  flags: number[];
  lost: boolean;
  won: boolean;
  seeded: boolean;
};
export const initial = (size: number, mines: number): State => ({
  size,
  mines,
  board: Array(size * size).fill(0),
  open: [],
  flags: [],
  lost: false,
  won: false,
  seeded: false,
});
export function neighbors(i: number, n: number) {
  const r = Math.floor(i / n),
    c = i % n;
  return [
    [r, c - 1],
    [r, c + 1],
    [r - 1, c],
    [r + 1, c],
    [r - 1, c + 1],
    [r + 1, c - 1],
  ]
    .filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n)
    .map(([a, b]) => a * n + b);
}
export function reveal(s: State, i: number): State {
  if (
    s.lost ||
    s.won ||
    s.flags.includes(i) ||
    s.open.includes(i) ||
    i < 0 ||
    i >= s.board.length
  )
    return s;
  const x = structuredClone(s);
  if (!x.seeded) {
    const safe = [i, ...neighbors(i, x.size)];
    const cells = shuffled(
      x.board.map((_, k) => k).filter((k) => !safe.includes(k)),
    );
    cells.slice(0, x.mines).forEach((k) => (x.board[k] = -1));
    x.board = x.board.map((v, k) =>
      v === -1
        ? -1
        : neighbors(k, x.size).filter((j) => x.board[j] === -1).length,
    );
    x.seeded = true;
  }
  if (x.board[i] === -1) {
    x.lost = true;
    x.open.push(i);
    return x;
  }
  const queue = [i],
    seen = new Set(x.open);
  while (queue.length) {
    const k = queue.pop()!;
    if (seen.has(k) || x.flags.includes(k)) continue;
    seen.add(k);
    if (x.board[k] === 0) queue.push(...neighbors(k, x.size));
  }
  x.open = [...seen];
  x.won = x.open.length === x.board.length - x.mines;
  return x;
}
export function flag(s: State, i: number): State {
  return s.lost || s.won || s.open.includes(i)
    ? s
    : {
        ...s,
        flags: s.flags.includes(i)
          ? s.flags.filter((k) => k !== i)
          : [...s.flags, i],
      };
}
/** Only visible counts and flags are used. No peeking at unrevealed mines. */
export function automatic(s: State): State {
  if (!s.seeded) return reveal(s, Math.floor(s.board.length / 2));
  for (const i of s.open) {
    const adjacent = neighbors(i, s.size),
      unknown = adjacent.filter(
        (k) => !s.open.includes(k) && !s.flags.includes(k),
      ),
      remaining =
        s.board[i] - adjacent.filter((k) => s.flags.includes(k)).length;
    if (unknown.length && remaining === 0) return reveal(s, unknown[0]);
    if (unknown.length && remaining === unknown.length)
      return flag(s, unknown[0]);
  }
  const unknown = s.board
    .map((_, i) => i)
    .filter((i) => !s.open.includes(i) && !s.flags.includes(i));
  return unknown.length
    ? reveal(s, unknown[Math.floor(Math.random() * unknown.length)])
    : s;
}
