export type FiveState = {
  board: number[];
  size: number;
  turn: number;
  captures: number[];
  winner: number;
  line: number[];
  pente: boolean;
};
const dirs = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];
export function initialFive(size: number, pente = false): FiveState {
  return {
    board: Array(size * size).fill(0),
    size,
    turn: 1,
    captures: [0, 0],
    winner: 0,
    line: [],
    pente,
  };
}
export function playFive(s: FiveState, i: number): FiveState | null {
  if (
    !Number.isInteger(i) ||
    i < 0 ||
    i >= s.board.length ||
    s.board[i] ||
    s.winner
  )
    return null;
  const board = [...s.board],
    captures = [...s.captures],
    r = Math.floor(i / s.size),
    c = i % s.size;
  board[i] = s.turn;
  const at = (rr: number, cc: number) =>
    rr >= 0 && rr < s.size && cc >= 0 && cc < s.size
      ? board[rr * s.size + cc]
      : -1;
  if (s.pente)
    for (const [dr, dc] of dirs)
      for (const sign of [-1, 1]) {
        const rr = dr * sign,
          cc = dc * sign;
        if (
          at(r + rr, c + cc) === 3 - s.turn &&
          at(r + 2 * rr, c + 2 * cc) === 3 - s.turn &&
          at(r + 3 * rr, c + 3 * cc) === s.turn
        ) {
          board[(r + rr) * s.size + c + cc] = 0;
          board[(r + 2 * rr) * s.size + c + 2 * cc] = 0;
          captures[s.turn - 1]++;
        }
      }
  let line: number[] = [];
  for (const [dr, dc] of dirs) {
    const chain = [i];
    for (const sign of [-1, 1])
      for (let k = 1; at(r + k * dr * sign, c + k * dc * sign) === s.turn; k++)
        chain.push((r + k * dr * sign) * s.size + c + k * dc * sign);
    if (chain.length >= 5) line = chain;
  }
  return {
    ...s,
    board,
    captures,
    turn: 3 - s.turn,
    winner:
      line.length || captures[s.turn - 1] >= 5
        ? s.turn
        : board.every(Boolean)
          ? 3
          : 0,
    line,
  };
}
function pattern(s: FiveState, i: number, p: number) {
  const r = Math.floor(i / s.size),
    c = i % s.size,
    at = (rr: number, cc: number) =>
      rr >= 0 && rr < s.size && cc >= 0 && cc < s.size
        ? s.board[rr * s.size + cc]
        : -1;
  let score = 0;
  for (const [dr, dc] of dirs) {
    let n = 1,
      open = 0;
    for (const sign of [-1, 1]) {
      let k = 1;
      while (at(r + dr * k * sign, c + dc * k * sign) === p) {
        n++;
        k++;
      }
      if (at(r + dr * k * sign, c + dc * k * sign) === 0) open++;
    }
    score +=
      n >= 5 ? 1e8 : open === 0 ? 0 : Math.pow(12, n) * (open === 2 ? 4 : 1);
  }
  return score;
}
export function bestFive(s: FiveState): number {
  if (s.winner) return -1;
  if (!s.board.some(Boolean)) return Math.floor(s.board.length / 2);
  const options = s.board.flatMap((v, i) =>
    !v &&
    s.board.some(
      (x, j) =>
        x &&
        Math.abs(Math.floor(i / s.size) - Math.floor(j / s.size)) <= 2 &&
        Math.abs((i % s.size) - (j % s.size)) <= 2,
    )
      ? [i]
      : [],
  );
  const ranked = options
    .map((i) => {
      const own = playFive(s, i)!,
        enemy = playFive({ ...s, turn: 3 - s.turn }, i)!;
      return {
        i,
        score:
          own.winner === s.turn
            ? 1e12
            : enemy.winner === 3 - s.turn
              ? 1e11
              : pattern(s, i, s.turn) +
                pattern(s, i, 3 - s.turn) * 1.1 +
                (own.captures[s.turn - 1] - s.captures[s.turn - 1]) * 4500,
      };
    })
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.i ?? -1;
}
