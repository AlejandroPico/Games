import { describe, it, expect } from "vitest";
import { Chess } from "chess.js";
import {
  automaticOutcome,
  drawClaim,
  repetitionCount,
  timeoutOutcome,
  canPossiblyMate,
} from "../src/games/chess/rules";
describe("Standard chess and FIDE draw adjudication", () => {
  it("has 20 initial legal moves and preserves perft depth 3", () => {
    const g = new Chess();
    function perft(depth: number): number {
      if (!depth) return 1;
      let n = 0;
      for (const m of g.moves()) {
        g.move(m);
        n += perft(depth - 1);
        g.undo();
      }
      return n;
    }
    expect(g.moves()).toHaveLength(20);
    expect(perft(3)).toBe(8902);
  }, 15000); // Perft enumerates 8,902 positions; allow slower shared CPUs.
  it("rejects moving into check and pinned moves", () => {
    const g = new Chess("4r1k1/8/8/8/8/8/4R3/4K3 w - - 0 1");
    expect(() => g.move({ from: "e2", to: "a2" })).toThrow();
  });
  it("castles on both sides, including moving the rook", () => {
    for (const [to, rook] of [
      ["g1", "f1"],
      ["c1", "d1"],
    ] as const) {
      const g = new Chess("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
      g.move({ from: "e1", to });
      expect(g.get(to)?.type).toBe("k");
      expect(g.get(rook)?.type).toBe("r");
    }
  });
  it("cannot castle through attack or after the king moves", () => {
    const g = new Chess("4kr2/8/8/8/8/8/8/R3K2R w KQ - 0 1");
    expect(g.moves()).not.toContain("O-O");
    const h = new Chess("4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1");
    h.move("Kf1");
    h.move("Kf7");
    h.move("Ke1");
    h.move("Ke8");
    expect(h.moves()).not.toContain("O-O");
    expect(h.moves()).not.toContain("O-O-O");
  });
  it("en passant removes the captured pawn and expires after one move", () => {
    const g = new Chess();
    ["e4", "a6", "e5", "d5", "exd6"].forEach((m) => g.move(m));
    expect(g.get("d5")).toBeUndefined();
    expect(g.get("d6")?.type).toBe("p");
    const h = new Chess();
    ["e4", "a6", "e5", "d5", "Nf3", "a5"].forEach((m) => h.move(m));
    expect(h.moves()).not.toContain("exd6");
  });
  it("disallows en passant when it exposes the king", () => {
    const g = new Chess("4k3/8/8/r4pPK/8/8/8/8 w - f6 0 1");
    expect(g.moves({ square: "g5" })).not.toContain("gxf6");
  });
  it.each(["q", "r", "b", "n"] as const)("promotes to %s", (promotion) => {
    const g = new Chess("7k/P7/8/8/8/8/8/7K w - - 0 1");
    g.move({ from: "a7", to: "a8", promotion });
    expect(g.get("a8")?.type).toBe(promotion);
  });
  it("recognizes Fool’s mate", () => {
    const g = new Chess();
    ["f3", "e5", "g4", "Qh4#"].forEach((m) => g.move(m));
    expect(automaticOutcome(g)).toEqual({
      result: "0-1",
      reason: "Jaque mate",
    });
  });
  it("detects stalemate", () => {
    expect(
      automaticOutcome(new Chess("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1"))?.reason,
    ).toBe("Rey ahogado");
  });
  it.each([
    "8/8/8/8/8/8/4k3/7K w - - 0 1",
    "8/8/8/8/8/8/4k3/5B1K w - - 0 1",
    "8/8/8/8/8/8/4k3/5N1K w - - 0 1",
  ])("detects dead material %s", (fen) => {
    expect(automaticOutcome(new Chess(fen))?.result).toBe("1/2-1/2");
  });
  it("does not automatically end at threefold repetition", () => {
    const g = new Chess();
    for (let i = 0; i < 2; i++)
      ["Nf3", "Nf6", "Ng1", "Ng8"].forEach((m) => g.move(m));
    expect(repetitionCount(g)).toBe(3);
    expect(drawClaim(g)).toBe("Triple repetición");
    expect(automaticOutcome(g)).toBeNull();
  });
  it("ends automatically at fivefold repetition", () => {
    const g = new Chess();
    for (let i = 0; i < 4; i++)
      ["Nf3", "Nf6", "Ng1", "Ng8"].forEach((m) => g.move(m));
    expect(automaticOutcome(g)?.reason).toBe("Quíntuple repetición");
  });
  it("supports a claim using an intended move without modifying the game", () => {
    const g = new Chess();
    ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1"].forEach((m) => g.move(m));
    const before = g.fen(),
      history = g.history();
    expect(drawClaim(g, { from: "f6", to: "g8" })).toBe("Triple repetición");
    expect(g.fen()).toBe(before);
    expect(g.history()).toEqual(history);
  });
  it("distinguishes claimable 50 moves from automatic 75 moves", () => {
    const g = new Chess("7k/8/8/8/8/8/8/R5K1 w - - 100 80");
    expect(drawClaim(g)).toBe("Regla de los 50 movimientos");
    expect(automaticOutcome(g)).toBeNull();
    g.load("7k/8/8/8/8/8/8/R5K1 w - - 150 80");
    expect(automaticOutcome(g)?.reason).toBe("Regla de los 75 movimientos");
  });
  it("checkmate takes precedence over the 75-move rule", () => {
    const g = new Chess("7k/6Q1/6K1/8/8/8/8/8 b - - 150 80");
    expect(automaticOutcome(g)?.reason).toBe("Jaque mate");
  });
  it("captures and pawn moves reset the halfmove clock", () => {
    const g = new Chess("7k/8/8/8/8/8/P7/R5K1 w - - 99 80");
    g.move("a3");
    expect(drawClaim(g)).toBeNull();
  });
  it("draws a flag fall if the opponent has only a bare king", () => {
    const g = new Chess("7k/8/8/8/8/8/P7/6K1 w - - 0 1");
    expect(timeoutOutcome(g, "w").result).toBe("1/2-1/2");
    expect(timeoutOutcome(g, "b").result).toBe("1-0");
  });
  it("does not declare two knights vs king dead: cooperative mate exists", () => {
    const g = new Chess("7k/8/8/8/8/8/8/NN4K1 w - - 0 1");
    expect(automaticOutcome(g)).toBeNull();
    expect(canPossiblyMate(g, "w")).toBe(true);
  });
  it("round trips PGN while preserving repetitions and castling rights", () => {
    const g = new Chess();
    ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8"].forEach((m) =>
      g.move(m),
    );
    const h = new Chess();
    h.loadPgn(g.pgn());
    expect(h.fen()).toBe(g.fen());
    expect(repetitionCount(h)).toBe(3);
  });
});

import { resignationOutcome } from "../src/games/chess/rules";
it("resignation is drawn if the rival is a bare king", () => {
  const g = new Chess("7k/8/8/8/8/8/P7/6K1 w - - 0 1");
  expect(resignationOutcome(g, "w").result).toBe("1/2-1/2");
  expect(resignationOutcome(g, "b").result).toBe("1-0");
});
