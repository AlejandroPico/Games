export type Piece = {
  side: number;
  kind: "king" | "rook" | "knight" | "elephant" | "minister" | "pawn";
};
export type Move = { from: number; to: number };
export type State = {
  board: (Piece | null)[];
  turn: number;
  winner: number | null;
  draw: boolean;
  quiet: number;
  history: string[];
  ply: number;
};
export const symbols: Record<Piece["kind"], string> = {
  king: "♚",
  rook: "♜",
  knight: "♞",
  elephant: "♝",
  minister: "♛",
  pawn: "♟",
};
export function initial(): State {
  const board: (Piece | null)[] = Array(64).fill(null),
    row: Piece["kind"][] = [
      "rook",
      "knight",
      "elephant",
      "minister",
      "king",
      "elephant",
      "knight",
      "rook",
    ];
  for (let i = 0; i < 8; i++) {
    board[i] = { side: 1, kind: row[i] };
    board[8 + i] = { side: 1, kind: "pawn" };
    board[48 + i] = { side: 0, kind: "pawn" };
    board[56 + i] = { side: 0, kind: row[i] };
  }
  return {
    board,
    turn: 0,
    winner: null,
    draw: false,
    quiet: 0,
    history: [],
    ply: 0,
  };
}
export function attacks(board: (Piece | null)[], from: number): number[] {
  const p = board[from];
  if (!p) return [];
  const row = Math.floor(from / 8),
    col = from % 8,
    out: number[] = [];
  let dirs: number[][] = [];
  if (p.kind === "pawn")
    dirs = [
      [p.side === 0 ? -1 : 1, -1],
      [p.side === 0 ? -1 : 1, 1],
    ];
  if (p.kind === "king")
    dirs = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
  if (p.kind === "minister")
    dirs = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
  if (p.kind === "elephant")
    dirs = [
      [-2, -2],
      [-2, 2],
      [2, -2],
      [2, 2],
    ];
  if (p.kind === "knight")
    dirs = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];
  if (p.kind === "rook")
    dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
  for (const [dr, dc] of dirs)
    for (let k = 1; k <= (p.kind === "rook" ? 7 : 1); k++) {
      const r = row + dr * k,
        c = col + dc * k;
      if (r < 0 || c < 0 || r > 7 || c > 7) break;
      const i = r * 8 + c;
      out.push(i);
      if (board[i]) break;
    }
  return out;
}
export function check(board: (Piece | null)[], side: number) {
  const king = board.findIndex((p) => p?.side === side && p.kind === "king");
  return (
    king < 0 ||
    board.some(
      (p, i) => p && p.side !== side && attacks(board, i).includes(king),
    )
  );
}
const apply = (board: (Piece | null)[], m: Move) => {
  const b = board.map((p) => (p ? { ...p } : null)),
    p = b[m.from]!;
  b[m.from] = null;
  b[m.to] = p;
  if (p.kind === "pawn" && (m.to < 8 || m.to >= 56)) p.kind = "minister";
  return b;
};
export function legal(s: State): Move[] {
  const result: Move[] = [];
  if (s.winner !== null || s.draw) return result;
  for (let from = 0; from < 64; from++) {
    const p = s.board[from];
    if (!p || p.side !== s.turn) continue;
    const targets =
      p.kind === "pawn"
        ? [
            from + (p.side === 0 ? -8 : 8),
            ...attacks(s.board, from).filter(
              (i) => s.board[i]?.side === 1 - p.side,
            ),
          ]
        : attacks(s.board, from);
    for (const to of targets) {
      if (
        to < 0 ||
        to >= 64 ||
        s.board[to]?.side === p.side ||
        s.board[to]?.kind === "king" ||
        (p.kind === "pawn" && to % 8 === from % 8 && s.board[to])
      )
        continue;
      if (!check(apply(s.board, { from, to }), p.side))
        result.push({ from, to });
    }
  }
  return result;
}
export function move(s: State, m: Move): State {
  if (!legal(s).some((a) => a.from === m.from && a.to === m.to)) return s;
  const x: State = {
    ...s,
    board: apply(s.board, m),
    turn: 1 - s.turn,
    quiet: s.board[m.to] || s.board[m.from]?.kind === "pawn" ? 0 : s.quiet + 1,
    history: [...s.history],
    ply: s.ply + 1,
  };
  const key =
    x.board.map((p) => (p ? `${p.side}${p.kind}` : "-")).join("|") +
    "/" +
    x.turn;
  x.history.push(key);
  if (!legal(x).length) {
    if (check(x.board, x.turn)) x.winner = s.turn;
    else x.draw = true;
  } else if (
    x.board.every((p) => !p || p.kind === "king") ||
    x.quiet >= 100 ||
    x.history.filter((k) => k === key).length >= 3
  )
    x.draw = true;
  return x;
}
export function automatic(s: State): State {
  const worth = {
    king: 0,
    rook: 5,
    knight: 3,
    elephant: 1.5,
    minister: 1.5,
    pawn: 1,
  };
  let best = s,
    score = -Infinity;
  for (const m of legal(s)) {
    const x = move(s, m),
      p = s.board[m.from]!,
      risk = x.board.some(
        (p, i) => p?.side === x.turn && attacks(x.board, i).includes(m.to),
      ),
      v =
        x.winner === s.turn
          ? 10000
          : (s.board[m.to] ? worth[s.board[m.to]!.kind] * 10 : 0) -
            (risk ? worth[p.kind] * 6 : 0) +
            (check(x.board, x.turn) ? 2 : 0) +
            Math.random() * 0.2;
    if (v > score) {
      score = v;
      best = x;
    }
  }
  return best;
}
