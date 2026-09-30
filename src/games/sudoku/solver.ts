import { valid } from "./rules";
export function solve(input: number[]): number[] | null {
  const board = [...input];
  if (board.some((v, i) => v && !valid(board, i, v))) return null;
  function search(): boolean {
    let slot = -1,
      choices: number[] = [];
    for (let i = 0; i < 81; i++)
      if (!board[i]) {
        const options = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) =>
          valid(board, i, v),
        );
        if (!options.length) return false;
        if (slot < 0 || options.length < choices.length) {
          slot = i;
          choices = options;
          if (options.length === 1) break;
        }
      }
    if (slot < 0) return true;
    for (const n of choices) {
      board[slot] = n;
      if (search()) return true;
    }
    board[slot] = 0;
    return false;
  }
  return search() ? board : null;
}
