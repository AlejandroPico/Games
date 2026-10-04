import { describe, it, expect } from "vitest";
import {
  initialContinuous,
  placeMark,
  winner,
  bestContinuousMove,
  type ContinuousState,
} from "../src/games/tic-tac-toe/rules";
import { games } from "../src/games/registry";
const play = (indices: number[], continuous = true) =>
  indices.reduce((s, i) => {
    const next = placeMark(s, i, continuous);
    expect(next).not.toBeNull();
    return next!;
  }, initialContinuous());
describe("Tres en raya continuo", () => {
  it("retira la primera X al colocar la cuarta y conserva el orden de las restantes", () => {
    const s = play([0, 1, 2, 3, 4, 6, 8]);
    expect(s.board[0]).toBeNull();
    expect(s.queues.X).toEqual([2, 4, 8]);
    expect(s.queues.O).toEqual([1, 3, 6]);
    expect(winner(s.board)).toBeNull();
  });
  it("cada jugador retira solo su propia marca más antigua", () => {
    const s = play([0, 1, 2, 3, 4, 6, 8, 5]);
    expect(s.board[1]).toBeNull();
    expect(s.queues.O).toEqual([3, 6, 5]);
    expect(s.queues.X).toEqual([2, 4, 8]);
  });
  it("comprueba la victoria después de retirar la marca caducada", () => {
    const s = play([0, 3, 1, 4, 8, 6, 2]);
    expect(winner(s.board)).toBeNull();
    expect(s.board[0]).toBeNull();
  });
  it("permite ganar con las tres marcas que quedan", () => {
    const s = play([7, 3, 0, 5, 1, 8, 2]);
    expect(winner(s.board)?.line).toEqual([0, 1, 2]);
    expect(s.board[7]).toBeNull();
    expect(placeMark(s, 7)).toBeNull();
  });
  it("la versión clásica no retira ninguna marca", () => {
    const s = play([0, 1, 2, 3, 4, 6, 8], false);
    expect(s.board[0]).toBe("X");
    expect(s.queues.X).toHaveLength(4);
  });
  it("rechaza casillas ocupadas sin caducar la primera marca", () => {
    const s = play([0, 1, 2, 3, 4, 6]);
    const before = structuredClone(s);
    expect(placeMark(s, 0)).toBeNull();
    expect(s).toEqual(before);
  });
  it("reutiliza una casilla que quedó libre sin mutar el estado anterior", () => {
    const s = play([0, 1, 2, 3, 4, 6, 8]);
    const next = placeMark(s, 0)!;
    expect(next.board[0]).toBe("O");
    expect(s.board[0]).toBeNull();
    expect(next.queues.O).toEqual([3, 6, 0]);
  });
  it("el rival automático ve una victoria inmediata teniendo en cuenta la retirada", () => {
    const s: ContinuousState = {
      board: ["O", "O", null, "X", null, "X", null, "O", "X"],
      queues: { X: [3, 5, 8], O: [7, 0, 1] },
      turn: "O",
    };
    const index = bestContinuousMove(s, 5);
    expect(index).toBe(2);
    expect(winner(placeMark(s, index)!.board)?.mark).toBe("O");
  });
  it("el rival evita completar una falsa línea con una marca que desaparece", () => {
    const s: ContinuousState = {
      board: ["O", "O", null, "X", null, "X", null, "O", "X"],
      queues: { X: [3, 5, 8], O: [0, 1, 7] },
      turn: "O",
    };
    const index = bestContinuousMove(s, 6);
    expect(placeMark(s, index)).not.toBeNull();
    expect(winner(placeMark(s, 2)!.board)).toBeNull();
  });
  it("sigue ofreciendo jugadas legales en partidas de larga duración", () => {
    let s = play([0, 1, 2, 3, 4, 6]);
    for (let n = 0; n < 50 && !winner(s.board); n++) {
      const i =
        s.turn === "O"
          ? bestContinuousMove(s, 4)
          : s.board.findIndex((v) => !v);
      s = placeMark(s, i)!;
      expect(s).not.toBeNull();
      expect(s.queues.X.length).toBeLessThanOrEqual(3);
      expect(s.queues.O.length).toBeLessThanOrEqual(3);
      expect(s.board.filter(Boolean).length).toBeLessThanOrEqual(6);
    }
  });
});
describe("Colección ampliada", () => {
  it("preserva los juegos disponibles e impide registrar dos rutas con el mismo id", () => {
    expect(games.filter((g) => g.ready).map((g) => g.id)).toEqual(
      expect.arrayContaining([
        "chess",
        "connect-four",
        "tic-tac-toe",
        "reversi",
        "checkers",
        "mancala",
        "battleship",
        "solitaire",
        "minesweeper",
        "sudoku",
        "2048",
        "memory",
        "go",
        "ludo",
      ]),
    );
    expect(new Set(games.map((g) => g.id)).size).toBe(games.length);
  });
  it("conserva las variantes propuestas y categorías del listado", () => {
    expect(games.find((g) => g.id === "nonogramas-picross")?.ready).toBe(true);
    expect(games.find((g) => g.id === "quoridor")?.ready).toBe(true);
    expect(games.find((g) => g.id === "backgammon")?.ready).toBe(true);
    expect(new Set(games.map((g) => g.category))).toContain("Roles ocultos");
  });
});
