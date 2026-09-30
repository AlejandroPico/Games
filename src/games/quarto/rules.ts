export type State = {
  board: (number | null)[];
  available: number[];
  held: number | null;
  turn: number;
  phase: "gift" | "place";
  winner: number | null;
  pending: number[] | null;
  automatic: boolean;
};
export type Action = {
  kind: "gift" | "place" | "claim" | "pass";
  value: number;
};
export const lines = [
  ...Array.from({ length: 4 }, (_, r) => [0, 1, 2, 3].map((c) => r * 4 + c)),
  ...Array.from({ length: 4 }, (_, c) => [0, 1, 2, 3].map((r) => r * 4 + c)),
  [0, 5, 10, 15],
  [3, 6, 9, 12],
];
export const initial = (automatic = true): State => ({
  board: Array(16).fill(null),
  available: Array.from({ length: 16 }, (_, i) => i),
  held: null,
  turn: 1,
  phase: "gift",
  winner: null,
  pending: null,
  automatic,
});
export function common(pieces: number[]): number {
  return pieces.length === 4
    ? (pieces.reduce((a, b) => a & b, 15) |
        ~pieces.reduce((a, b) => a | b, 0)) &
        15
    : 0;
}
export function winning(
  board: (number | null)[],
  at?: number,
): number[] | null {
  return (
    lines.find(
      (l) =>
        (at === undefined || l.includes(at)) &&
        l.every((i) => board[i] !== null) &&
        common(l.map((i) => board[i]!)),
    ) || null
  );
}
export function apply(s: State, a: Action): State | null {
  if (s.winner !== null) return null;
  if (a.kind === "claim") return s.pending ? { ...s, winner: s.turn } : null;
  if (a.kind === "pass") {
    if (!s.pending || s.held !== null || s.board.some((v) => v === null))
      return null;
    return s.phase === "gift"
      ? { ...s, phase: "place", turn: 3 - s.turn }
      : { ...s, pending: null, winner: 0 };
  }
  if (a.kind === "gift") {
    if (s.phase !== "gift" || !s.available.includes(a.value)) return null;
    return {
      ...s,
      available: s.available.filter((i) => i !== a.value),
      held: a.value,
      turn: 3 - s.turn,
      phase: "place",
    };
  }
  if (
    s.phase !== "place" ||
    s.held === null ||
    a.value < 0 ||
    a.value > 15 ||
    s.board[a.value] !== null
  )
    return null;
  const board = [...s.board];
  board[a.value] = s.held;
  const pending = winning(board, a.value),
    full = board.every((v) => v !== null);
  return {
    ...s,
    board,
    held: null,
    phase: "gift",
    pending,
    winner: pending && s.automatic ? s.turn : full && !pending ? 0 : null,
  };
}
function winsWith(s: State, piece: number) {
  return s.board
    .map((v, i) => {
      if (v !== null) return false;
      const b = [...s.board];
      b[i] = piece;
      return !!winning(b, i);
    })
    .filter(Boolean).length;
}
export function bestMove(s: State): Action | null {
  if (s.winner !== null) return null;
  if (s.pending) return { kind: "claim", value: 0 };
  if (s.phase === "gift") {
    let best = s.available[0],
      danger = Infinity;
    for (const piece of s.available) {
      const n = winsWith(s, piece);
      if (n < danger) {
        danger = n;
        best = piece;
      }
    }
    return { kind: "gift", value: best };
  }
  let best = -1,
    score = -Infinity;
  for (let i = 0; i < 16; i++)
    if (s.board[i] === null) {
      const n = apply(s, { kind: "place", value: i })!;
      if (n.pending) return { kind: "place", value: i };
      const safe = n.available.filter((p) => !winsWith(n, p)).length,
        quality =
          safe * 10 + (i === 5 || i === 6 || i === 9 || i === 10 ? 1 : 0);
      if (quality > score) {
        score = quality;
        best = i;
      }
    }
  return best >= 0 ? { kind: "place", value: best } : null;
}
export const pieceName = (v: number) =>
  (v & 1 ? "oscura" : "clara") +
  ", " +
  (v & 2 ? "cuadrada" : "redonda") +
  ", " +
  (v & 4 ? "alta" : "baja") +
  ", " +
  (v & 8 ? "hueca" : "maciza");
