export type Grid = number[][];
export type Direction = "left" | "right" | "up" | "down";
export function spawn(b: Grid, random = Math.random): Grid {
  const empty = b.flatMap((row, r) =>
    row.map((v, c) => (!v ? [r, c] : null)).filter((v): v is number[] => !!v),
  );
  if (!empty.length) return b;
  const [r, c] = empty[Math.floor(random() * empty.length)],
    next = b.map((row) => [...row]);
  next[r][c] = random() < 0.9 ? 2 : 4;
  return next;
}
export const initial = () =>
  spawn(spawn(Array.from({ length: 4 }, () => Array(4).fill(0))));
export function slide(
  b: Grid,
  d: Direction,
): { board: Grid; score: number; changed: boolean } {
  const next = b.map((row) => [...row]);
  let score = 0;
  for (let line = 0; line < 4; line++) {
    const coords = Array.from({ length: 4 }, (_, i) =>
      d === "left"
        ? [line, i]
        : d === "right"
          ? [line, 3 - i]
          : d === "up"
            ? [i, line]
            : [3 - i, line],
    );
    const values = coords.map(([r, c]) => b[r][c]).filter(Boolean),
      merged: number[] = [];
    for (let i = 0; i < values.length; i++) {
      if (values[i] === values[i + 1]) {
        merged.push(values[i] * 2);
        score += values[i] * 2;
        i++;
      } else merged.push(values[i]);
    }
    while (merged.length < 4) merged.push(0);
    coords.forEach(([r, c], i) => (next[r][c] = merged[i]));
  }
  return {
    board: next,
    score,
    changed: next.some((row, r) => row.some((v, c) => v !== b[r][c])),
  };
}
export const over = (b: Grid) =>
  (["left", "right", "up", "down"] as Direction[]).every(
    (d) => !slide(b, d).changed,
  );
export function suggest(b: Grid): Direction {
  const dirs: Direction[] = ["left", "down", "right", "up"];
  let best = -Infinity,
    choice: Direction = "left";
  function evaluate(board: Grid) {
    let value = 0,
      max = Math.max(...board.flat());
    board.forEach((row, r) =>
      row.forEach((v, c) => {
        if (!v) value += 300;
        else {
          value += Math.log2(v) * 2;
          if (c < 3 && board[r][c + 1])
            value -= Math.abs(Math.log2(v) - Math.log2(board[r][c + 1])) * 8;
          if (r < 3 && board[r + 1][c])
            value -= Math.abs(Math.log2(v) - Math.log2(board[r + 1][c])) * 8;
        }
      }),
    );
    if ([board[0][0], board[0][3], board[3][0], board[3][3]].includes(max))
      value += Math.log2(max) * 25;
    return value;
  }
  for (const d of dirs) {
    const next = slide(b, d);
    if (!next.changed) continue;
    const score =
      evaluate(next.board) +
      next.score * 2 +
      Math.max(...dirs.map((dd) => evaluate(slide(next.board, dd).board))) *
        0.4;
    if (score > best) {
      best = score;
      choice = d;
    }
  }
  return choice;
}
