import { describe, it, expect, vi, afterEach } from "vitest";
import * as H from "../src/games/torres-de-hanoi/rules";
import * as M from "../src/games/buscaminas-hexagonal/rules";
import * as W from "../src/games/sopa-de-letras-dinamica/rules";
import * as S from "../src/games/santorini/rules";
import * as C from "../src/games/damas-chinas/rules";
import * as P from "../src/games/patolli/rules";
import * as CH from "../src/games/chaturanga/rules";
import * as I from "../src/games/inu/rules";
import * as CI from "../src/games/cinquillo/rules";
import * as E from "../src/games/escoba/rules";
import * as B from "../src/games/belote/rules";
import * as R from "../src/games/rutas-de-vapor/rules";
import * as D from "../src/games/draft-de-maravillas/rules";
import * as N from "../src/games/reserva-de-naturaleza/rules";
import * as CA from "../src/games/construccion-de-castillos/rules";
import * as F from "../src/games/futbol-de-mesa-con-cartas/rules";
import * as X from "../src/games/mensajes-cruzados/rules";
import { repertoireIds } from "../src/shared/RepertoireArt";
import { games } from "../src/games/registry";
import { guides } from "../src/shared/guides";
import { supportsFriends } from "../src/shared/playModes";
import { TableStore } from "../src/shared/room-model";
const seed = (n: number) => () => {
  n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
  return n / 4294967296;
};
afterEach(() => vi.restoreAllMocks());
describe("Repertoire registration and individual modes", () => {
  it("has a real specific guide for every newly playable entry", () => {
    expect(repertoireIds).toHaveLength(17);
    for (const id of repertoireIds) {
      expect(games.find((g) => g.id === id)?.ready).toBe(true);
      expect(guides[id].length).toBeGreaterThanOrEqual(4);
      expect(supportsFriends(id)).toBe(
        ![
          "torres-de-hanoi",
          "buscaminas-hexagonal",
          "sopa-de-letras-dinamica",
        ].includes(id),
      );
    }
  });
});
describe("Hanoi solver", () => {
  it.each([3, 5, 8, 10])("solves %i discs optimally", (n) => {
    let s = H.initial(n);
    for (let i = 0; i < 2 ** n - 1; i++) {
      const m = H.nextMove(s);
      expect(m).not.toBeNull();
      const next = H.move(s, ...m!);
      expect(next).not.toBe(s);
      s = next;
    }
    expect(s.won).toBe(true);
    expect(s.moves).toBe(2 ** n - 1);
    expect(H.nextMove(s)).toBeNull();
  });
  it("solves arbitrary legal positions and rejects larger-on-smaller", () => {
    let s = H.move(H.initial(5), 0, 1);
    s = H.move(s, 0, 2);
    expect(H.move(s, 2, 1)).toBe(s);
    for (let i = 0; i < 50 && !s.won; i++) s = H.move(s, ...H.nextMove(s)!);
    expect(s.won).toBe(true);
  });
});
describe("Hexagonal mines and generated words", () => {
  it("has six reciprocal neighbors without wrapping", () => {
    expect(M.neighbors(12, 5)).toHaveLength(6);
    expect(M.neighbors(0, 5)).toHaveLength(2);
    for (let i = 0; i < 25; i++)
      for (const j of M.neighbors(i, 5)) expect(M.neighbors(j, 5)).toContain(i);
  });
  it.each([7, 9, 12, 16])(
    "protects the first click and all neighbors at size %i",
    (n) => {
      const s = M.reveal(M.initial(n, Math.floor(n * n * 0.22)), 0);
      expect(s.board.filter((v) => v === -1)).toHaveLength(s.mines);
      for (const i of [0, ...M.neighbors(0, n)])
        expect(s.board[i]).not.toBe(-1);
      expect(s.lost).toBe(false);
    },
  );
  it("AI only observes visible numbers, rather than hidden layout", () => {
    const s = {
      ...M.initial(3, 1),
      seeded: true,
      board: [0, 1, -1, 0, 1, 1, 0, 0, 0],
      open: [0],
      flags: [],
    };
    vi.spyOn(Math, "random").mockReturnValue(0.2);
    const first = M.automatic(s);
    const other = M.automatic({
      ...s,
      board: s.board.map((v, i) => (s.open.includes(i) ? v : 9)),
    });
    expect(first.open).toEqual(other.open);
  });
  it.each([8, 10, 12, 16])(
    "actually embeds every listed word in size %i",
    (n) => {
      for (const theme of Object.keys(W.themes)) {
        let s = W.initial(n, theme);
        expect(s.words.length).toBeGreaterThan(5);
        for (let k = 0; k < s.words.length; k++) {
          const x = W.automatic(s);
          expect(x.found.length).toBe(s.found.length + 1);
          s = x;
        }
        expect(s.found.length).toBe(s.words.length);
      }
    },
  );
  it("rejects bent paths and accepts reverse direction", () => {
    expect(W.trace(0, 7, 5)).toEqual([]);
    const s = {
      n: 3,
      grid: ["S", "O", "L", "A", "B", "C", "D", "E", "F"],
      words: ["SOL"],
      found: [],
    };
    expect(W.find(s, 2, 0).found[0].word).toBe("SOL");
  });
});
describe("Santorini base rules", () => {
  it("places two workers per side and returns turn to J1", () => {
    let s = S.initial();
    for (const i of [0, 4, 20, 24]) s = S.place(s, i);
    expect(s.workers).toEqual([
      [0, 4],
      [20, 24],
    ]);
    expect(s.phase).toBe("move");
    expect(s.turn).toBe(0);
  });
  it("forbids domes and jumps over more than one level", () => {
    const s = {
      ...S.initial(),
      phase: "move" as const,
      workers: [
        [6, 0],
        [24, 20],
      ],
    };
    s.levels[7] = 2;
    s.levels[11] = 4;
    expect(S.moves(s, 6)).not.toContain(7);
    expect(S.moves(s, 6)).not.toContain(11);
  });
  it("wins upon ascent from two to three without a build", () => {
    const s = {
      ...S.initial(),
      phase: "move" as const,
      workers: [
        [6, 0],
        [24, 20],
      ],
    };
    s.levels[6] = 2;
    s.levels[7] = 3;
    const x = S.walk(s, 6, 7);
    expect(x.winner).toBe(0);
    expect(S.build(x, 8)).toBe(x);
  });
  it("permits building in the vacated space and changes actor only after build", () => {
    let s = S.initial();
    for (const i of [0, 4, 20, 24]) s = S.place(s, i);
    s = S.walk(s, 0, 6);
    expect(s.turn).toBe(0);
    s = S.build(s, 0);
    expect(s.levels[0]).toBe(1);
    expect(s.turn).toBe(1);
  });
  it("AI completes a legal finite game", () => {
    let s = S.initial();
    for (let k = 0; k < 500 && s.winner === null; k++) {
      const x = S.automatic(s);
      expect(x).not.toBe(s);
      s = x;
    }
    expect(s.winner).not.toBeNull();
  });
});
describe("Chinese checkers and Patolli", () => {
  it.each([2, 3, 4, 6])(
    "has 121 unique star cells and ten marbles for each of %i seats",
    (n) => {
      const s = C.initial(n);
      expect(C.cells).toHaveLength(121);
      expect(new Set(C.cells.map((c) => `${c.q},${c.r}`)).size).toBe(121);
      for (let p = 0; p < n; p++)
        expect(s.board.filter((v) => v === p)).toHaveLength(10);
    },
  );
  it("supports jumps without captures and preserves marble counts", () => {
    let s = C.initial(2);
    for (let k = 0; k < 120 && !s.draw && s.winner === null; k++) {
      const x = C.automatic(s);
      expect(x).not.toBe(s);
      for (let p = 0; p < 2; p++)
        expect(x.board.filter((v) => v === p)).toHaveLength(10);
      s = x;
    }
  });
  it("has a 52-square unique cross track, exact finish and one-only entry", () => {
    expect(P.track).toHaveLength(52);
    expect(new Set(P.track.map((p) => p.join(","))).size).toBe(52);
    let s = P.initial(2);
    expect(P.options({ ...s, roll: 2 })).toHaveLength(0);
    s = { ...s, roll: 1 };
    s = P.move(s, 0);
    expect(s.pieces[0][0]).toBe(0);
    const end = {
      ...s,
      turn: 0,
      roll: 3,
      pieces: [[49, -1, -1, -1, -1, -1], s.pieces[1]],
    };
    expect(P.move(end, 0).pieces[0][0]).toBe(52);
    expect(P.move({ ...end, roll: 4 }, 0)).toEqual({ ...end, roll: 4 });
  });
  it("captures outside protected entries and never duplicates pieces", () => {
    const s = {
      ...P.initial(2),
      roll: 1,
      pieces: [
        [3, -1, -1, -1, -1, -1],
        [43, -1, -1, -1, -1, -1],
      ],
    };
    const x = P.move(s, 0);
    expect(x.pieces[1][0]).toBe(-1);
  });
});
describe("Chaturanga and Inu", () => {
  it("implements the elephant leap, one-step minister and pawn", () => {
    let s = CH.initial();
    expect(CH.attacks(s.board, 58)).toContain(40);
    expect(CH.attacks(s.board, 59)).toEqual([50, 52]);
    expect(CH.legal(s).some((m) => m.from === 48 && m.to === 32)).toBe(false);
  });
  it("does not permit moving a pinned rook off the king file", () => {
    const s = CH.initial();
    s.board = Array(64).fill(null);
    s.board[60] = { side: 0, kind: "king" };
    s.board[0] = { side: 1, kind: "king" };
    s.board[4] = { side: 1, kind: "rook" };
    s.board[52] = { side: 0, kind: "rook" };
    expect(CH.legal(s).some((m) => m.from === 52 && m.to === 53)).toBe(false);
  });
  it("promotes a soldier to minister", () => {
    const s = CH.initial();
    s.board = Array(64).fill(null);
    s.board[60] = { side: 0, kind: "king" };
    s.board[7] = { side: 1, kind: "king" };
    s.board[8] = { side: 0, kind: "pawn" };
    expect(CH.move(s, { from: 8, to: 0 }).board[0]?.kind).toBe("minister");
  });
  it.each([4, 6, 8])(
    "Inu seeker locates all secrets on size %i using public deductions",
    (n) => {
      for (let secret = 0; secret < n * n; secret++) {
        let s = I.hide(I.initial(n), secret);
        while (s.winner === null) s = I.automatic(s);
        expect(s.winner).toBe(1);
      }
    },
  );
  it("Inu chooser does not inspect the secret", () => {
    const a = I.hide(I.initial(6), 0),
      b = I.hide(I.initial(6), 35);
    expect(I.automatic(a).clues[0].type).toBe(I.automatic(b).clues[0].type);
    expect(I.automatic(a).clues[0].value).toBe(I.automatic(b).clues[0].value);
  });
});
describe("Spanish card games", () => {
  it.each([2, 3, 4])(
    "Cinquillo terminates with card conservation for %i seats",
    (n) => {
      vi.spyOn(Math, "random").mockImplementation(seed(n));
      let s = CI.initial(n);
      expect(s.hands[s.turn].some((c) => c.suit === 0 && c.rank === 5)).toBe(
        true,
      );
      for (let k = 0; k < 150 && s.winner === null; k++) {
        s = CI.automatic(s);
        const cards = [...s.hands.flat(), ...s.table];
        expect(cards.length).toBe(40);
        expect(new Set(cards.map((c) => c.id)).size).toBe(40);
      }
      expect(s.winner).not.toBeNull();
    },
  );
  it("Cinquillo cannot skip a gap or pass with a legal card", () => {
    const s = CI.initial(2);
    expect(CI.move(s, -1)).toBe(s);
    const c = s.hands[s.turn].find((c) => c.rank !== 5)!;
    expect(CI.legal(s)).not.toContain(s.hands[s.turn].indexOf(c));
  });
  it("Escoba uses face-card values and offers multiple capture sets", () => {
    const card = (rank: number, id = rank) => ({ id, rank, suit: 0, up: true });
    expect(E.value(card(10))).toBe(8);
    expect(E.value(card(11))).toBe(9);
    expect(E.value(card(12))).toBe(10);
    expect(
      E.combinations([card(1), card(3), card(4), card(7)], card(4)),
    ).toEqual(
      expect.arrayContaining([
        [0, 1, 3],
        [2, 3],
      ]),
    );
  });
  it.each([2, 3, 4])(
    "Escoba completes a match preserving forty cards for %i seats",
    (n) => {
      vi.spyOn(Math, "random").mockImplementation(seed(90 + n));
      let s = E.initial(n, 5);
      for (let k = 0; k < 1200 && s.winner === null; k++) {
        const x = E.automatic(s);
        expect(x).not.toBe(s);
        s = x;
        const cards = [
          ...s.hands.flat(),
          ...s.stock,
          ...s.table,
          ...s.captured.flat(),
        ];
        expect(cards.length).toBe(40);
        expect(new Set(cards.map((c) => c.id)).size).toBe(40);
      }
      expect(s.winner).not.toBeNull();
    },
  );
});
describe("Belote obligations and phases", () => {
  it("completes all hands after taking, and conserves 32 cards", () => {
    let s = B.initial();
    s = B.bid(s, s.up.suit);
    expect(s.phase).toBe("play");
    expect(s.hands.map((h) => h.length)).toEqual([8, 8, 8, 8]);
    expect(s.stock).toHaveLength(0);
    expect(new Set(s.hands.flat().map((c) => c.id)).size).toBe(32);
  });
  it("passes through two rounds and rotates dealer on all-pass", () => {
    let s = B.initial();
    for (let k = 0; k < 8; k++) s = B.bid(s, -1);
    expect(s.dealer).toBe(1);
    expect(s.turn).toBe(2);
    expect(s.bid).toBe(0);
  });
  it("has 152 card points per pack, plus last-trick ten", () => {
    const start = B.initial();
    const s = B.bid(start, start.up.suit);
    expect(
      s.hands.flat().reduce((v, c) => v + B.cardPoints(c, s.trump), 0),
    ).toBe(152);
  });
  it("requires trumping an opponent, but allows discarding on a winning partner", () => {
    const start = B.initial();
    const s = B.bid(start, start.up.suit);
    s.turn = 2;
    s.trump = 0;
    s.trick = [{ player: 1, card: { id: 1, rank: 1, suit: 1, up: true } }];
    s.hands[2] = [
      { id: 2, rank: 7, suit: 0, up: true },
      { id: 3, rank: 1, suit: 2, up: true },
    ];
    expect(B.legal(s)).toEqual([0]);
    s.trick[0].player = 0;
    expect(B.legal(s)).toEqual([0, 1]);
  });
  it("requires overtrumping when trump is led", () => {
    const start = B.initial();
    const s = B.bid(start, start.up.suit);
    s.turn = 1;
    s.trump = 0;
    s.trick = [{ player: 0, card: { id: 1, rank: 1, suit: 0, up: true } }];
    s.hands[1] = [
      { id: 2, rank: 9, suit: 0, up: true },
      { id: 3, rank: 7, suit: 0, up: true },
    ];
    expect(B.legal(s)).toEqual([0]);
  });
  it("AI bidding and trick play reach the team match result", () => {
    vi.spyOn(Math, "random").mockImplementation(seed(42));
    let s = B.initial();
    for (let k = 0; k < 1500 && s.winner === null; k++) {
      const x = B.automatic(s);
      expect(x).not.toBe(s);
      s = x;
      expect(s.turn).toBeGreaterThanOrEqual(0);
      expect(s.turn).toBeLessThan(4);
    }
    expect(s.winner).not.toBeNull();
  });
});
describe("Original eurogame adaptations", () => {
  it("railway connectivity excludes enemy tracks and wild cards consume two visible draws", () => {
    let s = R.initial(2);
    s.owners[0] = 0;
    s.owners[1] = 1;
    expect(R.connected(s, 0, 0, 1)).toBe(true);
    expect(R.connected(s, 0, 0, 2)).toBe(false);
    s.market[0] = 4;
    s = R.draw(s, 0);
    expect(s.turn).toBe(1);
    expect(s.draws).toBe(0);
  });
  it("cannot claim a route in the middle of a two-card draw", () => {
    const s = R.initial(2);
    s.hands[0] = [0, 0, 0];
    const x = { ...s, draws: 1 };
    expect(R.claim(x, 0)).toBe(x);
  });
  it.each([2, 4])("railway AI reaches final scoring with %i seats", (n) => {
    vi.spyOn(Math, "random").mockImplementation(seed(20 + n));
    let s = R.initial(n);
    for (let k = 0; k < 350 && !s.winner; k++) {
      const x = R.automatic(s);
      expect(x).not.toBe(s);
      s = x;
    }
    expect(s.winner).not.toBeNull();
  });
  it.each([3, 4])(
    "draft resolves only after all %i choices and completes exactly three eras",
    (n) => {
      let s = D.initial(n);
      const x = D.choose(s, 0, "sell");
      expect(x.cities[0].coins).toBe(6);
      expect(x.turn).toBe(1);
      for (let k = 0; k < 18 * n && !s.winner; k++) {
        const next = D.automatic(s);
        expect(next).not.toBe(s);
        s = next;
      }
      expect(s.age).toBe(3);
      expect(s.winner).not.toBeNull();
      expect(s.cities.every((c) => c.coins >= 0)).toBe(true);
    },
  );
  it("nature refuses habitats across row edges and awards action strength before row reset", () => {
    let s = N.initial(2);
    expect(N.act(s, 2, 3, 0)).toBe(s);
    s = N.act(s, 2, 0, 1);
    expect(s.zoos[0].land.filter((c) => c.terrain === 1)).toHaveLength(3);
    expect(s.zoos[0].coins).toBe(9);
    expect(s.zoos[0].row[0]).toBe(2);
  });
  it.each([2, 4])("nature reaches a terminal score with %i seats", (n) => {
    let s = N.initial(n);
    for (let k = 0; k < 30 * n && !s.winner; k++) {
      const x = N.automatic(s);
      expect(x).not.toBe(s);
      s = x;
    }
    expect(s.winner).not.toBeNull();
    expect(s.zoos.every((z) => z.coins >= 0)).toBe(true);
  });
  it("castles use two actions per actor and worker cost is real", () => {
    let s = CA.initial(2);
    s = CA.act(s, "workers", 0);
    expect(s.turn).toBe(0);
    expect(s.dice.length).toBe(1);
    s = CA.act(s, "workers", 0);
    expect(s.turn).toBe(1);
    expect(s.estates[0].workers).toBe(7);
  });
  it.each([2, 4])(
    "castles finish after at most ten rounds with %i seats",
    (n) => {
      let s = CA.initial(n);
      for (let k = 0; k < 20 * n && !s.winner; k++) {
        const x = CA.automatic(s);
        expect(x).not.toBe(s);
        s = x;
      }
      expect(s.winner).not.toBeNull();
      expect(
        s.estates.every((e) => e.workers >= 0 && e.reserve.length <= 3),
      ).toBe(true);
    },
  );
});
describe("Football and messages", () => {
  it("football gives the opponent the defense phase and records the random outcome", () => {
    let s = F.initial();
    const i = F.legal(s)[0];
    s = F.play(s, i);
    expect(s.turn).toBe(1);
    expect(s.phase).toBe("defend");
    s = F.play(s, 0);
    expect(s.phase).toBe("attack");
    expect(s.roll).toBeGreaterThanOrEqual(1);
    expect(s.hands.map((h) => h.length)).toEqual([5, 5]);
  });
  it("football AI finishes rather than looping endlessly", () => {
    let s = F.initial();
    for (let k = 0; k < 40 && !s.winner; k++) s = F.automatic(s);
    expect(s.winner).not.toBeNull();
  });
  it("message phases route to the actual sender, teammate, and interceptor", () => {
    let s = X.initial();
    s = X.automatic(s);
    expect(s.turn).toBe(2);
    expect(s.phase).toBe("receive");
    s = X.automatic(s);
    expect(s.turn).toBe(1);
    expect(s.phase).toBe("intercept");
    s = X.automatic(s);
    expect(s.history.length).toBe(1);
    expect(s.turn).toBe(1);
    expect(s.phase).toBe("encode");
  });
  it("does not leak secret keywords to the intercepting AI", () => {
    const s = X.automatic(X.automatic(X.initial()));
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const a = X.automatic(s),
      b = X.automatic({
        ...s,
        words: [
          [11, 10, 9, 8],
          [7, 6, 5, 4],
        ],
      });
    expect(a.history[0].intercept).toEqual(b.history[0].intercept);
  });
  it("rejects direct keyword clues and repeated code digits", () => {
    const s = X.initial();
    expect(
      X.encode(s, [X.dictionary[s.words[0][0]].word, "otra", "tercera"]),
    ).toBe(s);
    expect(X.validCode([1, 1, 2])).toBe(false);
  });
  it("message AI ends in at most eight rounds", () => {
    let s = X.initial();
    for (let k = 0; k < 24 && !s.winner; k++) s = X.automatic(s);
    expect(s.winner).not.toBeNull();
  });
});
describe("Shared online state on multi-phase tables", () => {
  it.each(["santorini", "football", "messages", "belote", "draft"])(
    "synchronizes full state and real actor for %s",
    async (game) => {
      const variants = {
        santorini: { initial: S.initial, step: S.automatic, count: 2 },
        football: { initial: F.initial, step: F.automatic, count: 2 },
        messages: { initial: X.initial, step: X.automatic, count: 4 },
        belote: { initial: B.initial, step: B.automatic, count: 4 },
        draft: { initial: () => D.initial(3), step: D.automatic, count: 3 },
      };
      const v = variants[game as keyof typeof variants],
        host = new TableStore(),
        guest = new TableStore();
      let state: any = v.initial();
      host.ensure("position", state);
      host.configure({
        online: true,
        host: true,
        ready: true,
        seats: Array.from({ length: v.count }, (_, i) =>
          i === 0 ? "local" : "remote",
        ),
        connected: Array.from({ length: v.count - 1 }, (_, i) => i + 1),
      });
      for (let k = 0; k < 8; k++) {
        host.setTurn(state.turn, true);
        const actor = state.turn;
        guest.receive(host.snapshot(), actor || 1);
        const next = (v.step as (s: any) => any)(state);
        if (actor === 0) {
          host.set("position", next);
          host.flush();
        } else {
          guest.onProposal = (p) => expect(host.accept(actor, p)).toBe(true);
          guest.set("position", next);
          await Promise.resolve();
        }
        state = next;
        host.setTurn(state.turn, true);
        guest.receive(host.snapshot(), actor || 1);
        expect(guest.values.position).toEqual(state);
        expect(guest.view.turn).toBe(state.turn);
      }
    },
  );
});
