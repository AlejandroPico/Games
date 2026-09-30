import { searchMove } from "../../shared/search";
export type Move = { path: number[]; captures: number[]; board: number[] };
export type State = {
  board: number[];
  turn: number;
  quiet: number;
  seen: string[];
  ending: number | null;
};
export const owner = (v: number) => (!v ? 0 : v % 2 ? 1 : 2);
export const position = (b: number[], p: number) => b.join(",") + ":" + p;
export function initial(): State {
  const board = Array.from({ length: 100 }, (_, i) => {
    const r = Math.floor(i / 10);
    return (r + (i % 10)) % 2 ? (r < 4 ? 2 : r > 5 ? 1 : 0) : 0;
  });
  return { board, turn: 1, quiet: 0, seen: [position(board, 1)], ending: null };
}
export function moves(b: number[], p: number): Move[] {
  const captures: Move[] = [];
  function walk(board: number[], pos: number, path: number[], taken: number[]) {
    const piece = board[pos],
      r = Math.floor(pos / 10),
      c = pos % 10;
    let found = false;
    for (const dr of [-1, 1])
      for (const dc of [-1, 1]) {
        let rr = r + dr,
          cc = c + dc,
          enemy = -1;
        while (rr >= 0 && rr < 10 && cc >= 0 && cc < 10) {
          const at = rr * 10 + cc,
            v = board[at];
          if (v) {
            if (enemy !== -1 || owner(v) === p || taken.includes(at)) break;
            enemy = at;
          } else if (enemy !== -1) {
            found = true;
            const next = [...board];
            next[pos] = 0;
            next[at] = piece;
            walk(next, at, [...path, at], [...taken, enemy]);
            if (piece <= 2) break;
          } else if (piece <= 2) break;
          if (piece <= 2 && enemy !== -1 && Math.abs(rr - r) > 1) break;
          rr += dr;
          cc += dc;
        }
      }
    if (!found && taken.length) {
      const final = [...board];
      taken.forEach((i) => (final[i] = 0));
      if (
        piece <= 2 &&
        (p === 1 ? Math.floor(pos / 10) === 0 : Math.floor(pos / 10) === 9)
      )
        final[pos] = piece + 2;
      captures.push({ path, captures: taken, board: final });
    }
  }
  for (let i = 0; i < 100; i++) if (owner(b[i]) === p) walk(b, i, [i], []);
  if (captures.length) {
    const max = Math.max(...captures.map((m) => m.captures.length));
    return captures.filter((m) => m.captures.length === max);
  }
  const result: Move[] = [];
  for (let i = 0; i < 100; i++)
    if (owner(b[i]) === p) {
      const r = Math.floor(i / 10),
        c = i % 10,
        v = b[i];
      for (const dr of v > 2 ? [-1, 1] : [p === 1 ? -1 : 1])
        for (const dc of [-1, 1]) {
          let rr = r + dr,
            cc = c + dc;
          while (rr >= 0 && rr < 10 && cc >= 0 && cc < 10 && !b[rr * 10 + cc]) {
            const to = rr * 10 + cc,
              next = [...b];
            next[i] = 0;
            next[to] = v <= 2 && (p === 1 ? rr === 0 : rr === 9) ? v + 2 : v;
            result.push({ path: [i, to], captures: [], board: next });
            if (v <= 2) break;
            rr += dr;
            cc += dc;
          }
        }
    }
  return result;
}
function endingLimit(b: number[]): number | null {
  const groups = [1, 2].map((p) => b.filter((v) => owner(v) === p));
  for (let p = 0; p < 2; p++)
    if (groups[p].length === 1 && groups[p][0] > 2) {
      const other = groups[1 - p];
      if (other.length <= 2 && other.some((v) => v > 2)) return 10;
      if (other.length === 3 && other.some((v) => v > 2)) return 32;
    }
  return null;
}
export function apply(s: State, m: Move): State {
  const v = s.board[m.path[0]],
    turn = 3 - s.turn,
    limit = endingLimit(m.board);
  return {
    board: m.board,
    turn,
    quiet: m.captures.length || v <= 2 ? 0 : s.quiet + 1,
    seen: [...s.seen, position(m.board, turn)],
    ending:
      limit === null
        ? s.ending === null
          ? null
          : s.ending - 1
        : Math.min(limit, s.ending === null ? limit : s.ending - 1),
  };
}
export function result(s: State): string | null {
  if (!moves(s.board, s.turn).length)
    return "Ganan " + (s.turn === 1 ? "negras" : "blancas");
  if (
    s.quiet >= 50 ||
    s.seen.filter((k) => k === position(s.board, s.turn)).length >= 3 ||
    s.ending === 0
  )
    return "Tablas";
  return null;
}
export function bestMove(s: State, depth = 3) {
  return searchMove(s, {
    legal: (p) => (result(p) ? [] : moves(p.board, p.turn)),
    terminal: (p) => {
      const end = result(p);
      return end === "Tablas"
        ? 0
        : end
          ? p.turn === 1
            ? 100000
            : -100000
          : null;
    },
    next: apply,
    turn: (p) => p.turn,
    depth,
    limit: 22000,
    value: (p) =>
      p.board.reduce(
        (n, v, i) =>
          n +
          (!v
            ? 0
            : (owner(v) === 2 ? 1 : -1) *
              (v > 2
                ? 330
                : 100 +
                  (owner(v) === 2
                    ? Math.floor(i / 10)
                    : 9 - Math.floor(i / 10)) *
                    2)),
        0,
      ),
  });
}
