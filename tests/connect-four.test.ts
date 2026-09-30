import { describe, it, expect } from "vitest";
import {
  emptyGrid,
  drop,
  winningLine,
  bestMove,
} from "../src/games/connect-four/rules";
describe("Connect Four", () => {
  it("obeys gravity without mutating the input", () => {
    const g = emptyGrid(),
      h = drop(g, 3, 1)!;
    expect(h[5][3]).toBe(1);
    expect(g[5][3]).toBe(0);
  });
  it("rejects full and invalid columns", () => {
    let g = emptyGrid();
    for (let i = 0; i < 6; i++) g = drop(g, 0, 1)!;
    expect(drop(g, 0, 2)).toBeNull();
    expect(drop(g, -1, 1)).toBeNull();
    expect(drop(g, 7, 1)).toBeNull();
  });
  it.each([
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ])("detects four in direction %s %s", (dr, dc) => {
    const g = emptyGrid(),
      c = dc === -1 ? 4 : 1;
    for (let i = 0; i < 4; i++) g[1 + dr * i][c + dc * i] = 1;
    expect(winningLine(g)?.player).toBe(1);
    expect(winningLine(g)?.cells).toHaveLength(4);
  });
  it("does not mistake three for four", () => {
    const g = emptyGrid();
    g[5][0] = g[5][1] = g[5][2] = 1;
    expect(winningLine(g)).toBeNull();
  });
  it("AI finishes its own winning line", () => {
    const g = emptyGrid();
    g[5][0] = g[5][1] = g[5][2] = 2;
    expect(bestMove(g, 4)).toBe(3);
  });
  it("AI blocks an immediate threat", () => {
    const g = emptyGrid();
    g[5][0] = g[5][1] = g[5][2] = 1;
    expect(bestMove(g, 4)).toBe(3);
  });
  it("prefers the center for an opening", () => {
    expect(bestMove(emptyGrid(), 4)).toBe(3);
  });
  it("never chooses a full column", () => {
    const g = emptyGrid();
    g.forEach((row) => (row[3] = 1));
    expect(bestMove(g, 4)).not.toBe(3);
  });
});
