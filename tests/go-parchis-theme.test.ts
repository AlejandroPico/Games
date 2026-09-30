import { describe, it, expect } from "vitest";
import * as go from "../src/games/go/rules";
import * as p from "../src/games/ludo/rules";
import { solarHours, automaticTheme } from "../src/shared/theme";
const goBoard = (board: number[], turn: go.Player = 1): go.State => ({
  ...go.initial(Math.sqrt(board.length)),
  board,
  turn,
  history: [board.join("")],
});
const ludo = (tokens: number[][]): p.State => ({
  ...p.initial(tokens.length),
  tokens,
  phase: "move",
  steps: 4,
  die: 4,
});
describe("Go · area and positional superko", () => {
  it("starts empty and alternates", () => {
    const s = go.play(go.initial(9), 40)!;
    expect(s.board[40]).toBe(1);
    expect(s.turn).toBe(2);
    expect(s.last).toBe(40);
  });
  it("rejects occupied and out of range", () => {
    const s = go.play(go.initial(9), 0)!;
    expect(go.play(s, 0)).toBeNull();
    expect(go.play(s, -1)).toBeNull();
  });
  it("counts connected stones and unique liberties", () => {
    const s = goBoard([1, 1, 0, 1, 0, 0, 0, 0, 0]);
    expect(go.group(s.board, 0, 3).stones.size).toBe(3);
    expect(go.group(s.board, 0, 3).liberties.size).toBe(3);
  });
  it("captures a group with no liberty", () => {
    const s = goBoard([0, 1, 0, 1, 2, 1, 0, 0, 0]);
    const next = go.play(s, 7)!;
    expect(next.board[4]).toBe(0);
    expect(next.captured).toEqual([1, 0]);
    expect(s.board[4]).toBe(2);
  });
  it("captures multiple neighboring groups", () => {
    const s = goBoard([1, 2, 1, 2, 0, 0, 1, 0, 0]);
    const next = go.play(s, 4)!;
    expect(next.captured[0]).toBe(2);
  });
  it("rejects suicide", () =>
    expect(go.play(goBoard([0, 2, 0, 2, 0, 2, 0, 2, 0]), 4)).toBeNull());
  it("allows capture that creates a liberty", () => {
    const s = goBoard([1, 2, 1, 2, 0, 2, 1, 2, 1]);
    expect(go.play(s, 4)?.captured[0]).toBe(4);
  });
  it("forbids immediate ko recapture", () => {
    const b = Array(25).fill(0);
    [8, 14, 18].forEach((i) => (b[i] = 1));
    [7, 11, 17, 13].forEach((i) => (b[i] = 2));
    const s = go.play(goBoard(b), 12)!;
    expect(s.board[13]).toBe(0);
    expect(go.play(s, 13)).toBeNull();
  });
  it("forbids any historical board repetition", () => {
    const s = go.initial(3),
      next = go.play(s, 4)!;
    expect(
      go.play({ ...s, history: [...s.history, next.board.join("")] }, 4),
    ).toBeNull();
  });
  it("two passes open scoring and cannot place stones", () => {
    const s = go.pass(go.pass(go.initial()));
    expect(s.phase).toBe("scoring");
    expect(go.play(s, 0)).toBeNull();
  });
  it("a play resets consecutive passes", () =>
    expect(go.play(go.pass(go.initial()), 40)?.passes).toBe(0));
  it("area includes stones and enclosed empty points", () =>
    expect(
      go.score(goBoard([1, 1, 1, 1, 0, 1, 1, 1, 1]), [], 0).points,
    ).toEqual([9, 0]));
  it("mixed-border regions are neutral", () =>
    expect(
      go.score(goBoard([1, 0, 0, 0, 0, 0, 0, 0, 2]), [], 0).points,
    ).toEqual([1, 1]));
  it("removes agreed dead stones for area scoring", () =>
    expect(
      go.score(goBoard([1, 1, 1, 1, 2, 1, 1, 1, 1]), [4], 0).points,
    ).toEqual([9, 0]));
  it("white receives komi", () =>
    expect(go.score(go.initial(9)).points).toEqual([0, 7.5]));
  it("AI returns a legal move", () => {
    const s = { ...go.initial(9), turn: 2 as go.Player };
    const i = go.bestMove(s);
    expect(i).not.toBeNull();
    expect(go.play(s, i!)).not.toBeNull();
  });
});
describe("Parchís · one die individual", () => {
  it("starts with four pieces at home", () =>
    expect(
      p
        .initial()
        .tokens.flat()
        .every((v) => v === -1),
    ).toBe(true));
  it("exits only with five", () => {
    expect(p.roll(p.initial(), 4).phase).toBe("roll");
    const s = p.roll(p.initial(), 5);
    expect(p.legalMoves(s)).toEqual([0, 1, 2, 3]);
    expect(p.move(s, 0).tokens[0][0]).toBe(0);
  });
  it("requires available exit on five", () => {
    const s = p.roll(
      {
        ...p.initial(),
        tokens: [
          [3, -1, -1, -1],
          [-1, -1, -1, -1],
          [-1, -1, -1, -1],
          [-1, -1, -1, -1],
        ],
      },
      5,
    );
    expect(p.legalMoves(s)).toEqual([1, 2, 3]);
  });
  it("six becomes seven only without pieces at home", () => {
    expect(
      p.roll(
        {
          ...p.initial(),
          tokens: [
            [0, 10, 20, 30],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
          ],
        },
        6,
      ).steps,
    ).toBe(7);
    expect(
      p.roll(
        {
          ...p.initial(),
          tokens: [
            [0, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
          ],
        },
        6,
      ).steps,
    ).toBe(6);
  });
  it("six repeats even if no piece can move", () => {
    const s = p.roll(p.initial(), 6);
    expect(s.turn).toBe(0);
    expect(s.sixes).toBe(1);
  });
  it("third six sends the piece moved on second six home", () => {
    let s = {
      ...p.initial(),
      tokens: [
        [1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
      ],
    };
    s = p.move(p.roll(s, 6), 0);
    s = p.move(p.roll(s, 6), 0);
    s = p.roll(s, 6);
    expect(s.tokens[0][0]).toBe(-1);
    expect(s.turn).toBe(1);
  });
  it("third six exempts private corridor", () => {
    const s = p.roll(
      {
        ...p.initial(),
        tokens: [
          [65, -1, -1, -1],
          [-1, -1, -1, -1],
          [-1, -1, -1, -1],
          [-1, -1, -1, -1],
        ],
        sixes: 2,
        lastMoved: 0,
      },
      6,
    );
    expect(s.tokens[0][0]).toBe(65);
  });
  it("barriers block opponents and owners", () => {
    const s = ludo([
      [0, -1, -1, -1],
      [54, 54, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
    ]);
    expect(p.legalMoves(s)).not.toContain(0);
  });
  it("requires opening own barrier on six", () => {
    const s = p.roll(
      {
        ...p.initial(),
        tokens: [
          [0, 0, 10, 20],
          [-1, -1, -1, -1],
          [-1, -1, -1, -1],
          [-1, -1, -1, -1],
        ],
      },
      6,
    );
    expect(p.legalMoves(s)).toEqual([0, 1]);
  });
  it("mixed safe occupancy is not a barrier", () => {
    const s = {
      ...ludo([
        [0, -1, -1, -1],
        [58, -1, -1, -1],
        [41, -1, -1, -1],
        [-1, -1, -1, -1],
      ]),
      steps: 8,
      die: 8,
    };
    expect(p.legalMoves(s)).toContain(0);
  });
  it("cannot finish on a full safe square", () => {
    const s = {
      ...ludo([
        [0, -1, -1, -1],
        [58, -1, -1, -1],
        [41, -1, -1, -1],
        [-1, -1, -1, -1],
      ]),
      steps: 7,
    };
    expect(p.legalMoves(s)).not.toContain(0);
  });
  it("capture returns opponent home and awards twenty", () => {
    const s = {
      ...ludo([
        [0, -1, -1, -1],
        [57, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
      ]),
      steps: 6,
      die: 6,
      repeat: true,
    };
    const next = p.move(s, 0);
    expect(next.tokens[1][0]).toBe(-1);
    expect(next.steps).toBe(20);
    expect(next.bonus).toBe(true);
    expect(next.turn).toBe(0);
  });
  it("safe square protects opponent", () => {
    const s = {
      ...ludo([
        [2, 10, 15, 20],
        [58, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
      ]),
      steps: 5,
      die: 5,
    };
    const next = p.move(s, 0);
    expect(next.tokens[1][0]).toBe(58);
    expect(next.tokens[0][0]).toBe(7);
  });
  it("exit captures latest opponent on occupied start", () => {
    const s = {
      ...ludo([
        [-1, -1, -1, -1],
        [51, -1, -1, -1],
        [34, -1, -1, -1],
        [-1, -1, -1, -1],
      ]),
      die: 5,
      steps: 5,
      arrival: [
        [0, 0, 0, 0],
        [1, 0, 0, 0],
        [2, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    };
    const next = p.move(s, 0);
    expect(next.tokens[1][0]).toBe(51);
    expect(next.tokens[2][0]).toBe(-1);
  });
  it("home requires exact count", () => {
    const s = ludo([
      [70, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
    ]);
    expect(p.legalMoves(s)).not.toContain(0);
  });
  it("goal awards ten using another piece", () => {
    const s = {
      ...ludo([
        [67, 10, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
      ]),
      steps: 4,
    };
    const next = p.move(s, 0);
    expect(next.tokens[0][0]).toBe(71);
    expect(next.steps).toBe(10);
    expect(p.legalMoves(next)).toEqual([1]);
  });
  it("last goal ends game", () => {
    const s = {
      ...ludo([
        [71, 71, 71, 70],
        [-1, -1, -1, -1],
      ]),
      steps: 1,
      die: 1,
    };
    const next = p.move(s, 3);
    expect(next.phase).toBe("over");
    expect(next.winner).toBe(0);
  });
  it("two-player colors are opposite", () => {
    expect(p.offset(1, 2)).toBe(34);
    expect(p.physical(63, 1, 2)).toBe(29);
    expect(p.physical(64, 1, 2)).toBeNull();
  });
  it("AI selects a legal piece", () => {
    const s = p.roll(p.initial(), 5);
    expect(p.legalMoves(s)).toContain(p.bestMove(s));
  });
});
describe("Automatic illumination", () => {
  it("uses night at midnight and day at noon", () => {
    expect(automaticTheme(new Date(2026, 8, 30, 0))).toBe("night");
    expect(automaticTheme(new Date(2026, 8, 30, 12))).toBe("day");
  });
  it("seasonal summer day is longer than winter", () => {
    const a = solarHours(new Date(2026, 5, 21)),
      b = solarHours(new Date(2026, 11, 21));
    expect(a[1] - a[0]).toBeGreaterThan(b[1] - b[0]);
  });
  it("handles polar day and night", () => {
    const location = { latitude: 89, longitude: 0 };
    expect(automaticTheme(new Date(2026, 5, 21, 0), location)).toBe("day");
    expect(automaticTheme(new Date(2026, 11, 21, 12), location)).toBe("night");
  });
  it("uses afternoon near sunset", () =>
    expect(automaticTheme(new Date(2026, 2, 21, 17))).toBe("afternoon"));
});
