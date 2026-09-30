export type Puzzle = { givens: number[]; solution: number[] };
export function valid(board: number[], index: number, value: number): boolean {
  const r = Math.floor(index / 9),
    c = index % 9;
  for (let i = 0; i < 81; i++)
    if (
      i !== index &&
      board[i] === value &&
      (Math.floor(i / 9) === r ||
        i % 9 === c ||
        (Math.floor(Math.floor(i / 9) / 3) === Math.floor(r / 3) &&
          Math.floor((i % 9) / 3) === Math.floor(c / 3)))
    )
      return false;
  return true;
}
export function solutions(input: number[], limit = 2): number {
  const b = [...input];
  if (b.some((v, i) => v && !valid(b, i, v))) return 0;
  let count = 0;
  function search() {
    if (count >= limit) return;
    let chosen = -1,
      choices: number[] = [];
    for (let i = 0; i < 81; i++)
      if (!b[i]) {
        const opts = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => valid(b, i, v));
        if (!opts.length) return;
        if (chosen === -1 || opts.length < choices.length) {
          chosen = i;
          choices = opts;
          if (opts.length === 1) break;
        }
      }
    if (chosen === -1) {
      count++;
      return;
    }
    for (const v of choices) {
      b[chosen] = v;
      search();
      b[chosen] = 0;
      if (count >= limit) return;
    }
  }
  search();
  return count;
}
function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function generate(holes = 42): Puzzle {
  const groups = () =>
      shuffle([0, 1, 2]).flatMap((g) =>
        shuffle([0, 1, 2]).map((i) => g * 3 + i),
      ),
    rows = groups(),
    cols = groups(),
    numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const solution = rows.flatMap((r) =>
      cols.map((c) => numbers[(r * 3 + Math.floor(r / 3) + c) % 9]),
    ),
    givens = [...solution];
  let removed = 0;
  for (const i of shuffle(Array.from({ length: 81 }, (_, i) => i))) {
    if (removed >= holes) break;
    const v = givens[i];
    givens[i] = 0;
    if (solutions(givens, 2) === 1) removed++;
    else givens[i] = v;
  }
  return { givens, solution };
}
export const complete = (b: number[]) =>
  b.every((v, i) => v > 0 && valid(b, i, v));
