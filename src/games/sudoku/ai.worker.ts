import { solve } from "./solver";
self.onmessage = (e) => {
  const board = e.data as number[],
    solution = solve(board);
  self.postMessage(
    solution
      ? {
          index: board.findIndex((n) => !n),
          value: solution[board.findIndex((n) => !n)],
        }
      : null,
  );
};
