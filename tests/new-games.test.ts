import { describe, it, expect } from "vitest";
import * as Tic from "../src/games/tic-tac-toe/rules";
import * as Rev from "../src/games/reversi/rules";
import * as Checkers from "../src/games/checkers/rules";
import * as Kalah from "../src/games/mancala/rules";
import * as Sea from "../src/games/battleship/rules";
import * as Mines from "../src/games/minesweeper/rules";
import * as Memory from "../src/games/memory/rules";
import * as Tiles from "../src/games/2048/rules";
import * as Sudoku from "../src/games/sudoku/rules";
import * as Cards from "../src/games/solitaire/rules";
describe("Tic tac toe", () => {
  it("detects rows and diagonals", () => {
    expect(
      Tic.winner(["X", "X", "X", null, null, null, null, null, null])?.mark,
    ).toBe("X");
    expect(
      Tic.winner(["O", null, null, null, "O", null, null, null, "O"])?.mark,
    ).toBe("O");
    expect(Tic.winner(Array(9).fill(null))).toBeNull();
  });
  it("AI wins and blocks", () => {
    expect(
      Tic.bestMove(["O", "O", null, "X", "X", null, null, null, null]),
    ).toBe(2);
    expect(
      Tic.bestMove(["X", "X", null, null, "O", null, null, null, null]),
    ).toBe(2);
  });
  it("AI cannot lose against any sequence of human moves", () => {
    function visit(b: Tic.Board): void {
      for (let i = 0; i < 9; i++) {
        if (b[i]) continue;
        const next = [...b];
        next[i] = "X";
        expect(Tic.winner(next)?.mark).not.toBe("X");
        if (next.every(Boolean) || Tic.winner(next)) continue;
        next[Tic.bestMove(next)] = "O";
        if (!next.every(Boolean) && !Tic.winner(next)) visit(next);
      }
    }
    visit(Array(9).fill(null));
  });
});
describe("Reversi", () => {
  it("starts with four discs and four legal black moves", () => {
    const b = Rev.initial();
    expect(Rev.count(b, 1)).toBe(2);
    expect(Rev.moves(b, 1)).toHaveLength(4);
  });
  it("flips without mutating input", () => {
    const b = Rev.initial(),
      n = Rev.play(b, 2, 3, 1)!;
    expect(Rev.count(n, 1)).toBe(4);
    expect(Rev.count(b, 1)).toBe(2);
    expect(n[3][3]).toBe(1);
  });
  it("rejects moves not enclosing discs", () => {
    expect(Rev.play(Rev.initial(), 0, 0, 1)).toBeNull();
  });
  it("flips all eight directions", () => {
    const b = Array.from({ length: 8 }, () => Array(8).fill(0));
    for (const [dr, dc] of [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ]) {
      b[3 + dr][3 + dc] = 2;
      b[3 + dr * 2][3 + dc * 2] = 1;
    }
    expect(Rev.flips(b, 3, 3, 1)).toHaveLength(8);
  });
  it("AI returns a legal move and passes when blocked", () => {
    const b = Rev.initial();
    expect(Rev.moves(b, 2)).toContainEqual(Rev.bestMove(b, 3));
    expect(
      Rev.bestMove(Array.from({ length: 8 }, () => Array(8).fill(1))),
    ).toBeNull();
  });
});
describe("English checkers", () => {
  it("starts with twelve men per side and seven legal opening moves", () => {
    const b = Checkers.initial();
    expect(b.filter((v) => v === 1)).toHaveLength(12);
    expect(b.filter((v) => v === 2)).toHaveLength(12);
    expect(Checkers.moves(b, 1)).toHaveLength(7);
  });
  it("forces captures and multiple jumps", () => {
    const b = Array(64).fill(0);
    b[42] = 1;
    b[33] = 2;
    b[17] = 2;
    b[60] = 1;
    const m = Checkers.moves(b, 1);
    expect(m).toHaveLength(1);
    expect(m[0].path).toEqual([42, 24, 10]);
    expect(m[0].captures).toEqual([33, 17]);
    expect(m[0].board[33]).toBe(0);
  });
  it("men cannot capture backward, kings can", () => {
    const b = Array(64).fill(0);
    b[26] = 1;
    b[35] = 2;
    expect(Checkers.moves(b, 1).every((m) => !m.captures.length)).toBe(true);
    b[26] = 3;
    expect(Checkers.moves(b, 1)[0].path).toEqual([26, 44]);
  });
  it("crowning ends the capture sequence", () => {
    const b = Array(64).fill(0);
    b[17] = 1;
    b[10] = 2;
    b[12] = 2;
    const m = Checkers.moves(b, 1);
    expect(m[0].path).toEqual([17, 3]);
    expect(m[0].board[3]).toBe(3);
  });
  it("AI chooses a legal move", () => {
    const b = Checkers.initial();
    expect(Checkers.moves(b, 2).map((m) => m.path)).toContainEqual(
      Checkers.bestMove(b, 3)?.path,
    );
  });
});
describe("Kalah mancala", () => {
  it("starts with 48 stones and prevents sowing the rival side", () => {
    const s = Kalah.initial();
    expect(s.pits.reduce((a, b) => a + b)).toBe(48);
    expect(Kalah.legal(s)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(Kalah.sow(s, 7)).toBeNull();
  });
  it("gives an extra turn for an own-store finish", () => {
    expect(Kalah.sow(Kalah.initial(), 2)?.turn).toBe(1);
  });
  it("captures the last own seed and opposite seeds", () => {
    const s: Kalah.State = { pits: Array(14).fill(0), turn: 1, over: false };
    s.pits[0] = 1;
    s.pits[11] = 3;
    s.pits[3] = 2;
    s.pits[9] = 2;
    const n = Kalah.sow(s, 0)!;
    expect(n.pits[6]).toBe(4);
    expect(n.pits[11]).toBe(0);
    expect(n.pits[1]).toBe(0);
  });
  it("skips the rival store and conserves seeds", () => {
    const s = Kalah.initial();
    s.pits[5] = 15;
    const n = Kalah.sow(s, 5)!;
    expect(n.pits[13]).toBe(0);
    expect(n.pits.reduce((a, b) => a + b)).toBe(s.pits.reduce((a, b) => a + b));
  });
  it("sweeps the remaining side at the end", () => {
    const s: Kalah.State = { pits: Array(14).fill(0), turn: 1, over: false };
    s.pits[5] = 1;
    s.pits[7] = 3;
    const n = Kalah.sow(s, 5)!;
    expect(n.over).toBe(true);
    expect(n.pits[13]).toBe(3);
    expect(n.pits[6]).toBe(1);
  });
  it("AI chooses its own pit", () => {
    const s = Kalah.initial();
    s.turn = 2;
    expect(Kalah.legal(s)).toContain(Kalah.bestMove(s, 4));
  });
});
describe("Battleship", () => {
  it("places every ship without overlap", () => {
    for (let t = 0; t < 10; t++) {
      const f = Sea.createFleet();
      Sea.lengths.forEach((n, id) =>
        expect(f.filter((v) => v === id)).toHaveLength(n),
      );
      expect(f.filter((v) => v >= 0)).toHaveLength(17);
    }
  });
  it("handles misses, hits, sinking and repeated shots", () => {
    const f = Array(100).fill(-1);
    f[0] = f[1] = 4;
    let s = Array(100).fill(0);
    expect(Sea.fire(f, s, 10)?.hit).toBe(false);
    s = Sea.fire(f, s, 0)!.shots;
    expect(s[0]).toBe(2);
    expect(Sea.fire(f, s, 0)).toBeNull();
    const result = Sea.fire(f, s, 1)!;
    expect(result.sunk).toBe(4);
    expect(result.shots[0]).toBe(3);
    expect(Sea.defeated(f, result.shots)).toBe(true);
  });
  it("AI targets visible hits, without fleet input", () => {
    const s = Array(100).fill(0);
    s[44] = 2;
    expect([34, 43, 45, 54]).toContain(Sea.target(s, [2]));
  });
  it("AI never repeats a shot", () => {
    const s = Array(100).fill(1);
    s[91] = 0;
    expect(Sea.target(s)).toBe(91);
  });
});
describe("Minesweeper", () => {
  it("guarantees safe first click and its neighbors", () => {
    const b = Mines.generate(9, 10, 40);
    expect(b.filter((c) => c.mine)).toHaveLength(10);
    [40, ...Mines.neighbors(40, 9)].forEach((i) =>
      expect(b[i].mine).toBe(false),
    );
  });
  it("numbers exactly count adjacent mines", () => {
    const b = Mines.generate(9, 10, 40);
    b.forEach((c, i) =>
      expect(c.number).toBe(
        Mines.neighbors(i, 9).filter((j) => b[j].mine).length,
      ),
    );
  });
  it("flood fills but respects flags", () => {
    const b = Mines.empty(3);
    b[0].flag = true;
    const n = Mines.reveal(b, 4, 3);
    expect(n[0].open).toBe(false);
    expect(n.filter((c) => c.open)).toHaveLength(8);
  });
  it("requires matching flag count to chord", () => {
    const b = Mines.empty(3);
    b[4] = { mine: false, number: 1, open: true, flag: false };
    expect(Mines.chord(b, 4, 3)).toBe(b);
  });
  it("deduces hints without hidden mine values", () => {
    const b = Mines.empty(2);
    b[0] = { mine: false, number: 3, open: true, flag: false };
    expect(Mines.hint(b, 2)?.type).toBe("mine");
    b[0].number = 0;
    expect(Mines.hint(b, 2)?.type).toBe("safe");
  });
  it("wins only when every safe cell is open", () => {
    const b = Mines.empty(2);
    b[0].mine = true;
    expect(Mines.won(b)).toBe(false);
    b.slice(1).forEach((c) => (c.open = true));
    expect(Mines.won(b)).toBe(true);
  });
});
describe("Memory", () => {
  it("shuffles exactly eight pairs", () => {
    const d = Memory.deck();
    expect(d).toHaveLength(16);
    Memory.icons
      .slice(0, 8)
      .forEach((icon) => expect(d.filter((v) => v === icon)).toHaveLength(2));
  });
  it("AI selects known pairs and matches", () => {
    expect(Memory.choice({ 0: "A", 4: "A" }, [0, 1, 4, 5])).toBe(0);
    expect(Memory.choice({ 0: "A", 4: "A" }, [1, 4, 5], 0)).toBe(4);
  });
  it("AI cannot select unavailable cards", () => {
    expect(Memory.choice({ 0: "A", 4: "A" }, [3])).toBe(3);
  });
});
describe("2048", () => {
  it("merges each tile once", () => {
    const b = [
        [2, 2, 2, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      n = Tiles.slide(b, "left");
    expect(n.board[0]).toEqual([4, 4, 0, 0]);
    expect(n.score).toBe(8);
    expect(b[0]).toEqual([2, 2, 2, 2]);
  });
  it("merges in direction order", () => {
    const b = [
      [2, 2, 4, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(Tiles.slide(b, "right").board[0]).toEqual([0, 0, 4, 4]);
  });
  it("moves vertically and reports no-ops", () => {
    const b = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(Tiles.slide(b, "down").board[3][0]).toBe(4);
    expect(
      Tiles.slide(
        [
          [2, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        "left",
      ).changed,
    ).toBe(false);
  });
  it("detects locked boards but allows merges", () => {
    const b = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    expect(Tiles.over(b)).toBe(true);
    b[0][1] = 2;
    expect(Tiles.over(b)).toBe(false);
  });
  it("spawns only in an empty cell and offers legal suggestions", () => {
    const b = [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(Tiles.spawn(b).flat().filter(Boolean)).toHaveLength(2);
    expect(Tiles.slide(b, Tiles.suggest(b)).changed).toBe(true);
  });
});
describe("Sudoku", () => {
  it.each([36, 44, 50])(
    "generates a unique puzzle at %s requested holes",
    (holes) => {
      const p = Sudoku.generate(holes);
      expect(Sudoku.complete(p.solution)).toBe(true);
      expect(Sudoku.solutions(p.givens)).toBe(1);
      p.givens.forEach((v, i) => {
        if (v) expect(v).toBe(p.solution[i]);
      });
    },
  );
  it("rejects row, column and box duplicates", () => {
    const b = Array(81).fill(0);
    b[0] = 1;
    expect(Sudoku.valid(b, 1, 1)).toBe(false);
    expect(Sudoku.valid(b, 9, 1)).toBe(false);
    expect(Sudoku.valid(b, 10, 1)).toBe(false);
    expect(Sudoku.valid(b, 40, 1)).toBe(true);
  });
  it("rejects full invalid grids", () => {
    expect(Sudoku.complete(Array(81).fill(1))).toBe(false);
    expect(Sudoku.solutions(Array(81).fill(1))).toBe(0);
  });
});
describe("Klondike solitaire", () => {
  it("deals all 52 cards without duplication and exposes column tops", () => {
    const s = Cards.initial(),
      all = [...s.stock, ...s.columns.flat()];
    expect(all).toHaveLength(52);
    expect(new Set(all.map((c) => c.suit + "-" + c.rank)).size).toBe(52);
    expect(s.stock).toHaveLength(24);
    s.columns.forEach((c, i) => {
      expect(c).toHaveLength(i + 1);
      expect(c.at(-1)?.up).toBe(true);
      expect(c.slice(0, -1).every((v) => !v.up)).toBe(true);
    });
  });
  it("draws three and recycles in original order", () => {
    let s = Cards.initial(3);
    const top = s.stock.at(-1)!;
    s = Cards.drawCards(s);
    expect(s.waste[0].rank).toBe(top.rank);
    expect(s.waste).toHaveLength(3);
    while (s.stock.length) s = Cards.drawCards(s);
    const first = s.waste[0];
    s = Cards.drawCards(s);
    expect(s.waste).toHaveLength(0);
    expect(s.stock.at(-1)?.rank).toBe(first.rank);
  });
  it("accepts only aces into correctly suited foundations", () => {
    const s = Cards.initial();
    s.waste = [{ suit: 1, rank: 1, up: true }];
    const source: Cards.Source = { kind: "waste", pile: 0, index: 0 };
    expect(
      Cards.move(s, source, { kind: "foundation", pile: 1 })?.foundations[1],
    ).toHaveLength(1);
    expect(Cards.move(s, source, { kind: "foundation", pile: 0 })).toBeNull();
    s.waste[0].rank = 2;
    expect(Cards.move(s, source, { kind: "foundation", pile: 1 })).toBeNull();
  });
  it("requires kings in empty columns and alternating colors", () => {
    const s = Cards.initial();
    s.columns[0] = [];
    s.waste = [{ suit: 0, rank: 12, up: true }];
    const source: Cards.Source = { kind: "waste", pile: 0, index: 0 };
    expect(Cards.move(s, source, { kind: "column", pile: 0 })).toBeNull();
    s.waste[0].rank = 13;
    expect(Cards.move(s, source, { kind: "column", pile: 0 })).not.toBeNull();
    s.columns[0] = [{ suit: 3, rank: 13, up: true }];
    s.waste[0].rank = 12;
    expect(Cards.move(s, source, { kind: "column", pile: 0 })).toBeNull();
    s.waste[0].suit = 1;
    expect(Cards.move(s, source, { kind: "column", pile: 0 })).not.toBeNull();
  });
  it("moves valid sequences and exposes covered cards", () => {
    const s = Cards.initial();
    s.columns[0] = [
      { suit: 0, rank: 4, up: false },
      { suit: 1, rank: 7, up: true },
      { suit: 0, rank: 6, up: true },
    ];
    s.columns[1] = [{ suit: 0, rank: 8, up: true }];
    const n = Cards.move(
      s,
      { kind: "column", pile: 0, index: 1 },
      { kind: "column", pile: 1 },
    )!;
    expect(n.columns[1]).toHaveLength(3);
    expect(n.columns[0][0].up).toBe(true);
    expect(s.columns[0][0].up).toBe(false);
  });
  it("rejects non-top waste cards and invalid sequences", () => {
    const s = Cards.initial();
    s.waste = [
      { suit: 0, rank: 5, up: true },
      { suit: 0, rank: 4, up: true },
    ];
    expect(Cards.moving(s, { kind: "waste", pile: 0, index: 0 })).toHaveLength(
      0,
    );
    s.columns[0] = s.waste;
    expect(Cards.moving(s, { kind: "column", pile: 0, index: 0 })).toHaveLength(
      0,
    );
  });
  it("produces only legal hints", () => {
    for (let i = 0; i < 5; i++) {
      const s = Cards.initial(),
        h = Cards.hint(s);
      if (h && typeof h !== "string")
        expect(Cards.move(s, h.source, h.target)).not.toBeNull();
    }
  });
});
