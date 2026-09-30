export type Board = number[];
export type Move = { path: number[]; captures: number[]; board: Board };
const owner = (v: number) => (v === 0 ? 0 : v % 2 ? 1 : 2);
export function initial(): Board {
  return Array.from({ length: 64 }, (_, i) => {
    const r = Math.floor(i / 8),
      c = i % 8;
    return (r + c) % 2 ? (r < 3 ? 2 : r > 4 ? 1 : 0) : 0;
  });
}
export function moves(b: Board, p: number): Move[] {
  const jumps: Move[] = [];
  function capture(
    board: Board,
    pos: number,
    path: number[],
    captures: number[],
  ) {
    const v = board[pos],
      r = Math.floor(pos / 8),
      c = pos % 8,
      dirs = v > 2 ? [-1, 1] : [p === 1 ? -1 : 1];
    let found = false;
    for (const dr of dirs)
      for (const dc of [-1, 1]) {
        const rr = r + 2 * dr,
          cc = c + 2 * dc,
          mr = r + dr,
          mc = c + dc;
        if (rr < 0 || rr > 7 || cc < 0 || cc > 7) continue;
        const mid = mr * 8 + mc,
          to = rr * 8 + cc;
        if (owner(board[mid]) === 3 - p && !board[to]) {
          found = true;
          const next = [...board];
          next[pos] = 0;
          next[mid] = 0;
          const crown = v <= 2 && (p === 1 ? rr === 0 : rr === 7);
          next[to] = crown ? v + 2 : v;
          const newPath = [...path, to],
            newCaptures = [...captures, mid];
          if (crown)
            jumps.push({ path: newPath, captures: newCaptures, board: next });
          else capture(next, to, newPath, newCaptures);
        }
      }
    if (!found && captures.length) jumps.push({ path, captures, board });
  }
  for (let i = 0; i < 64; i++) if (owner(b[i]) === p) capture(b, i, [i], []);
  if (jumps.length) return jumps;
  const result: Move[] = [];
  for (let i = 0; i < 64; i++)
    if (owner(b[i]) === p) {
      const v = b[i],
        r = Math.floor(i / 8),
        c = i % 8;
      for (const dr of v > 2 ? [-1, 1] : [p === 1 ? -1 : 1])
        for (const dc of [-1, 1]) {
          const rr = r + dr,
            cc = c + dc;
          if (rr < 0 || rr > 7 || cc < 0 || cc > 7 || b[rr * 8 + cc]) continue;
          const to = rr * 8 + cc,
            next = [...b];
          next[i] = 0;
          next[to] = v <= 2 && (p === 1 ? rr === 0 : rr === 7) ? v + 2 : v;
          result.push({ path: [i, to], captures: [], board: next });
        }
    }
  return result;
}
export function bestMove(b: Board, depth = 5, player = 2): Move | null {
  function evaluate(board: Board) {
    return board.reduce(
      (score, v, i) =>
        score +
        (!v
          ? 0
          : (owner(v) === 2 ? 1 : -1) *
            (v > 2
              ? 180
              : 100 +
                (owner(v) === 2 ? Math.floor(i / 8) : 7 - Math.floor(i / 8)) *
                  3)),
      0,
    );
  }
  function search(
    board: Board,
    p: number,
    d: number,
    a: number,
    z: number,
  ): number {
    const options = moves(board, p);
    if (!options.length) return p === 2 ? -100000 - d : 100000 + d;
    if (!d) return evaluate(board);
    let best = p === 2 ? -Infinity : Infinity;
    for (const m of options) {
      const score = search(m.board, 3 - p, d - 1, a, z);
      if (p === 2) {
        best = Math.max(best, score);
        a = Math.max(a, best);
      } else {
        best = Math.min(best, score);
        z = Math.min(z, best);
      }
      if (a >= z) break;
    }
    return best;
  }
  let chosen: Move | null = null,
    value = player === 2 ? -Infinity : Infinity;
  for (const m of moves(b, player)) {
    const score = search(m.board, 3 - player, depth - 1, -Infinity, Infinity);
    if (player === 2 ? score > value : score < value) {
      value = score;
      chosen = m;
    }
  }
  return chosen;
}
