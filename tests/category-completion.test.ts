import { describe, it, expect, vi, afterEach } from "vitest";
import * as Pig from "../src/games/pig-el-cerdo/rules";
import * as F from "../src/games/farkle-diez-mil/rules";
import * as Z from "../src/games/dados-zombie/rules";
import * as C from "../src/games/craps-dados-de-casino/rules";
import * as H from "../src/games/hazard/rules";
import * as Crown from "../src/games/crown-and-anchor/rules";
import * as Ceelo from "../src/games/cee-lo/rules";
import * as Bunco from "../src/games/bunco/rules";
import * as Sichuan from "../src/games/sichuan-dice/rules";
import * as P from "../src/games/dados-mentirosos-perudo/rules";
import * as L from "../src/games/liar-s-dice-estilo-casino/rules";
import * as Q from "../src/games/quoridor/rules";
import * as O from "../src/games/onitama/rules";
import * as D from "../src/games/dvonn/rules";
import * as Y from "../src/games/yinsh/rules";
import * as Hive from "../src/games/la-colmena/rules";
import * as Blocks from "../src/games/bloques-geometricos/rules";
import * as Quilt from "../src/games/construccion-de-colchas/rules";
import * as Glass from "../src/games/ventanas-de-catedral/rules";
import * as Who from "../src/games/adivina-quien/rules";
import * as Alchemy from "../src/games/deduccion-alquimica/rules";
import * as Murder from "../src/games/el-asesino-de-la-mansion/rules";
import * as Network from "../src/games/codigo-de-redes/rules";
import * as Spy from "../src/games/el-intruso/rules";
import * as Pictures from "../src/games/pistas-abstractas/rules";
import * as Timeline from "../src/games/linea-de-tiempo/rules";
import { categoryCompletionIds } from "../src/games/categoryCompletion";
import { games } from "../src/games/registry";
import { supportsFriends } from "../src/shared/playModes";
import { TableStore } from "../src/shared/room-model";
const seed = (n: number) => () => {
  n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
  return n / 4294967296;
};
afterEach(() => vi.restoreAllMocks());
describe("Dice rules and challenge phases", () => {
  it("Pig loses only the turn bank on one", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const s = Pig.initial();
    s.bank = 19;
    s.scores[0] = 24;
    const x = Pig.apply(s, "roll");
    expect(x.bank).toBe(0);
    expect(x.scores[0]).toBe(24);
    expect(x.turn).toBe(1);
  });
  it("Pig banking reaches the chosen target", () => {
    const s = Pig.initial(2, 50);
    s.scores[0] = 30;
    s.bank = 20;
    expect(Pig.apply(s, "bank").winner).toBe(0);
  });
  it.each([
    [[], 0],
    [[1], 100],
    [[5], 50],
    [[2], 0],
    [[1, 1, 1], 1000],
    [[6, 6, 6], 600],
    [[2, 2, 2, 2], 400],
    [[1, 2, 3, 4, 5, 6], 1500],
    [[2, 2, 3, 3, 4, 4], 1500],
    [[1, 2], 0],
  ] as [number[], number][])("Farkle scores %j as %i", (d, p) =>
    expect(F.score(d)).toBe(p),
  );
  it("Farkle rejects banking before the initial 500", () => {
    const s = F.initial();
    s.bank = 450;
    expect(F.actions(s).some((a) => a.key === "bank")).toBe(false);
  });
  it("Farkle gives exactly the other players a final turn", () => {
    const s = F.initial(2, 2000);
    s.bank = 2000;
    let x = F.apply(s, "bank");
    expect(x.final).toBe(1);
    x.bank = 500;
    x = F.apply(x, "bank");
    expect(x.winner).toBe(0);
  });
  it("Zombie has exactly thirteen colored dice and counts the symbol distribution", () => {
    const s = Z.initial();
    expect(s.bag).toHaveLength(13);
    expect(s.bag.filter((c) => c === 0)).toHaveLength(6);
    vi.spyOn(Math, "random").mockReturnValue(0);
    const x = Z.apply(s, "roll");
    expect(x.bank).toBe(3);
    expect(x.dice).toEqual([1, 1, 1]);
  });
  it("Craps establishes a point and loses it only on seven", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.2);
    let s = C.apply(C.initial(), "roll");
    expect(s.point).toBe(4);
    vi.mocked(Math.random).mockReturnValueOnce(0).mockReturnValueOnce(0.9);
    s = C.apply(s, "roll");
    expect(s.point).toBe(0);
    expect(s.scores[0]).toBe(9);
  });
  it.each([
    [7, 11, 1],
    [7, 12, -1],
    [6, 12, 1],
    [8, 12, 1],
    [5, 11, -1],
    [9, 12, -1],
    [5, 5, 1],
    [7, 6, 0],
  ])("Hazard main %i with %i resolves %i", (m, d, v) =>
    expect(H.opening(m, d)).toBe(v),
  );
  it("Crown and Anchor pays three matches with fictitious credits", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(Crown.apply(Crown.initial(), "1").scores[0]).toBe(13);
  });
  it.each([
    [[4, 5, 6], 200],
    [[1, 2, 3], -1],
    [[6, 6, 6], 106],
    [[2, 2, 5], 5],
    [[2, 4, 6], 0],
  ] as [number[], number][])("Cee-lo ranks %j", (d, v) =>
    expect(Ceelo.rank(d)).toBe(v),
  );
  it("Bunco awards a team round, not a personal 21-point win", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const x = Bunco.apply(Bunco.initial(), "roll");
    expect(x.round).toBe(2);
    expect(x.scores).toEqual([1, 0, 1, 0]);
  });
  it("Sichuan closes only a valid sum without merging turns", () => {
    let s = Sichuan.initial();
    s.phase = "choose";
    s.dice = [3, 4];
    const x = Sichuan.apply(s, "1,6");
    expect(x.tiles[0]).not.toContain(1);
    expect(x.tiles[0]).not.toContain(6);
    expect(x.turn).toBe(0);
    expect(Sichuan.apply(s, "1,2")).toBe(s);
  });
  it("Perudo validates wild-one conversion and initial private hand", () => {
    const s = P.initial();
    expect(s.dice).toEqual(s.hands[0]);
    s.bid = { count: 5, face: 4, actor: 0 };
    expect(P.legalBid(s, 2, 1)).toBe(false);
    expect(P.legalBid(s, 3, 1)).toBe(true);
    s.bid = { count: 3, face: 1, actor: 0 };
    expect(P.legalBid(s, 6, 4)).toBe(false);
    expect(P.legalBid(s, 7, 4)).toBe(true);
  });
  it("Perudo routes challenge then new round to the actual loser", () => {
    const s = P.initial();
    s.hands = [
      [2, 2, 2, 2, 2],
      [3, 3, 3, 3, 3],
    ];
    s.bid = { count: 5, face: 2, actor: 0 };
    s.turn = 1;
    const x = P.apply(s, "dudo");
    expect(x.scores[1]).toBe(4);
    expect(x.turn).toBe(1);
    expect(x.phase).toBe("reveal");
    expect(P.apply(x, "next").dice).toHaveLength(4);
  });
  it("Palifico disables wilds and fixes the face for multi-die seats", () => {
    const s = P.initial();
    s.palifico = true;
    s.bid = { count: 2, face: 3, actor: 0 };
    expect(P.legalBid(s, 3, 4)).toBe(false);
    s.scores[0] = 1;
    expect(P.legalBid(s, 3, 4)).toBe(true);
  });
  it("Poker dice distinguishes full, straight and five identical", () => {
    expect(L.rank([2, 2, 2, 3, 3])).toBe(5);
    expect(L.rank([2, 3, 4, 5, 6])).toBe(4);
    expect(L.rank([1, 1, 1, 1, 1])).toBe(7);
  });
});
describe("Abstract legal movement", () => {
  it("Blocks rejects malformed remote placements without mutating the board", () => {
    const s = Blocks.initial(2, 14);
    for (const a of [
      { from: -1, to: 0, tool: 9999 },
      { from: -1, to: 0.5, tool: 0 },
      { from: -1, to: 196, tool: 0 },
      { from: 4, to: 0, tool: 0 },
      { from: -1, to: -2, tool: -1 },
    ])
      expect(Blocks.apply(s, a)).toBe(s);
  });
  it("Quoridor jumps a pawn and can diagonally bypass a blocked jump", () => {
    const s = Q.initial();
    s.pawns = [40, 31];
    expect(Q.actions(s).some((a) => a.from === 40 && a.to === 22)).toBe(true);
    s.walls = [{ r: 2, c: 3, h: true }];
    const a = Q.actions(s).filter((a) => !a.tool);
    expect(a.some((a) => a.to === 30)).toBe(true);
    expect(a.some((a) => a.to === 32)).toBe(true);
    expect(a.some((a) => a.to === 22)).toBe(false);
  });
  it("Quoridor rejects intersecting, overlapping and sealed routes", () => {
    const s = Q.initial();
    s.walls = [{ r: 3, c: 3, h: true }];
    expect(Q.wallLegal(s, 3, 3, false)).toBe(false);
    expect(Q.wallLegal(s, 3, 4, true)).toBe(false);
    s.walls = [
      { r: 0, c: 0, h: true },
      { r: 0, c: 2, h: true },
      { r: 0, c: 4, h: true },
      { r: 0, c: 6, h: true },
    ];
    expect(Q.wallLegal(s, 0, 7, false)).toBe(false);
  });
  it("Onitama exchanges the used card and wins by taking a master", () => {
    const s = O.initial();
    s.cells = Array(25).fill(0);
    s.cells[12] = 2;
    s.cells[2] = 4;
    s.hands[0] = [0, 1];
    s.middle = 2;
    const x = O.apply(s, { from: 12, to: 2, tool: 0 });
    expect(x.winner).toBe(0);
    expect(x.middle).toBe(0);
    expect(x.hands[0][0]).toBe(2);
  });
  it("DVONN has 49 cells and 3 red cores plus 23 pieces per side", () => {
    let s = D.initial();
    for (let i = 0; i < 49; i++) s = D.apply(s, { from: -1, to: i, tool: 0 });
    expect(s.phase).toBe("move");
    expect(s.turn).toBe(0);
    expect(s.stacks.flat().filter((v) => v === 2)).toHaveLength(3);
    expect(s.stacks.flat().filter((v) => v === 0)).toHaveLength(23);
    expect(s.stacks.flat().filter((v) => v === 1)).toHaveLength(23);
  });
  it("DVONN purges disconnected stacks but preserves the red core", () => {
    const s = D.initial();
    s.stacks = s.stacks.map(() => []);
    s.stacks[0] = [2];
    s.stacks[48] = [0, 1];
    D.purge(s);
    expect(s.stacks[0]).toEqual([2]);
    expect(s.stacks[48]).toEqual([]);
  });
  it("YINSH has 85 intersections and resolves a row then a ring with the scoring actor", () => {
    const s = Y.initial();
    expect(s.rings).toHaveLength(85);
    s.phase = "row";
    s.turn = 1;
    s.mover = 1;
    s.resume = 0;
    const row = Y.coords
      .map((c, i) => ({ c, i }))
      .filter((v) => v.c[1] === 0)
      .slice(0, 5)
      .map((v) => v.i);
    row.forEach((i) => (s.markers[i] = 1));
    s.rings[80] = 1;
    const a = Y.actions(s)[0];
    let x = Y.apply(s, a);
    expect(x.phase).toBe("remove");
    expect(x.turn).toBe(1);
    x = Y.apply(x, { from: -1, to: 80, tool: 0 });
    expect(x.scores[1]).toBe(1);
    expect(x.turn).toBe(0);
  });
  it("Hive prevents splitting the hive and forces the queen on the fourth own turn", () => {
    const s = Hive.initial(),
      c = Hive.encode;
    s.hive = {
      [c(0, 0)]: [{ owner: 0, bug: 0 }],
      [c(1, 0)]: [{ owner: 0, bug: 1 }],
      [c(2, 0)]: [{ owner: 1, bug: 0 }],
    };
    expect(Hive.destinations(s, c(1, 0))).toEqual([]);
    const x = Hive.initial();
    x.turns[0] = 3;
    expect(Hive.actions(x).every((a) => a.tool === 0)).toBe(true);
  });
  it("Hive grasshopper jumps a continuous occupied ray", () => {
    const s = Hive.initial(),
      c = Hive.encode;
    s.hive = {
      [c(0, 0)]: [{ owner: 0, bug: 2 }],
      [c(1, 0)]: [{ owner: 0, bug: 0 }],
      [c(2, 0)]: [{ owner: 1, bug: 0 }],
    };
    expect(Hive.destinations(s, c(0, 0))).toContain(c(3, 0));
  });
  it("Blocks enumerates all 21 free polyominoes and forbids own edge contact", () => {
    const s = Blocks.initial(2, 14);
    expect(Blocks.shapes).toHaveLength(21);
    let x = Blocks.apply(s, { from: -1, to: 0, tool: 0 });
    x.turn = 0;
    expect(Blocks.placement(x, 1, 8)).toBeNull();
    expect(Blocks.placement(x, 15, 8)).not.toBeNull();
  });
  it("Quilt rejects overlaps and schedules the participant furthest behind", () => {
    const s = Quilt.initial(2, 6),
      a = Quilt.actions(s).find((a) => a.to >= 0)!;
    const x = Quilt.apply(s, a);
    expect(x.turn).toBe(1);
    x.turn = 0;
    expect(Quilt.placement(x, a.to, a.tool)).toBeNull();
  });
  it("Cathedral obeys edge entry and orthogonal color/value restrictions", () => {
    const s = Glass.initial();
    s.restrictions.fill(null);
    s.pool = [{ color: 1, value: 3 }];
    expect(Glass.legal(s, 7, 0)).toBe(false);
    expect(Glass.legal(s, 0, 0)).toBe(true);
    s.windows[0][0] = { color: 1, value: 4 };
    expect(Glass.legal(s, 1, 0)).toBe(false);
    expect(Glass.legal(s, 6, 0)).toBe(true);
  });
});
describe("Deduction phases and information limits", () => {
  it("Who filters accurately and wrong identification loses", () => {
    const s = Who.initial();
    s.secrets = [0, 23];
    const x = Who.apply(s, "ask:hair:3");
    expect(x.candidates[0].every((i) => Who.people[i].hair === 3)).toBe(true);
    expect(Who.apply(s, "guess:0").winner).toBe(1);
  });
  it("Alchemy retains the true solution among candidates without reading it", () => {
    let s = Alchemy.initial();
    for (let i = 0; i < 5; i++)
      s = Alchemy.apply(s, "mix:" + i + ":" + (i + 1));
    expect(Alchemy.candidates(s)).toContainEqual(s.solution);
    const t = structuredClone(s);
    t.solution = [7, 6, 5, 4, 3, 2];
    expect(Alchemy.candidates(t)).toEqual(Alchemy.candidates(s));
  });
  it("Murder changes actor to the refuter and delivers a card only to the questioner notes", () => {
    const s = Murder.initial(3);
    s.solution = [5, 11, 17];
    s.hands = [
      [0, 6],
      [1, 7],
      [2, 8],
    ];
    s.notes = s.hands.map((a) => a.slice());
    const x = Murder.apply(s, "suggest:1,7,12");
    expect(x.turn).toBe(1);
    expect(x.phase).toBe("refute");
    const y = Murder.apply(x, "show:1");
    expect(y.turn).toBe(0);
    expect(y.notes[0]).toContain(1);
    expect(y.notes[2]).not.toContain(1);
  });
  it("Networks conceals the code for guessing seats and rotates to the proper partner", () => {
    const s = Network.initial();
    let x = Network.apply(s, "clue:1:naturaleza");
    expect(x.turn).toBe(2);
    expect(Network.view(x).cards.every((c) => !c.color)).toBe(true);
    const i = x.roles.indexOf(2);
    x = Network.apply(x, "guess:" + i);
    expect(x.turn).toBe(1);
    expect(x.phase).toBe("clue");
  });
  it("Networks ends immediately on the dangerous card", () => {
    let s = Network.apply(Network.initial(), "clue:1:naturaleza");
    expect(Network.apply(s, "guess:" + s.roles.indexOf(3)).winner).toBe(1);
  });
  it("Pictures submits all hands before voting and prevents voting your own", () => {
    let s = Pictures.initial(3);
    s = Pictures.apply(s, "clue:" + s.hands[0][0] + ":bosque");
    s = Pictures.apply(s, "submit:" + s.hands[1][0]);
    s = Pictures.apply(s, "submit:" + s.hands[2][0]);
    expect(s.phase).toBe("vote");
    expect(s.turn).toBe(1);
    expect(
      Pictures.actions(s).every(
        (a) => s.table[+a.key.split(":")[1]].owner !== 1,
      ),
    ).toBe(true);
  });
  it("Intruder passes the response to a different actor and keeps votes private", () => {
    const s = Spy.initial();
    const x = Spy.apply(s, "ask:0");
    expect(x.turn).toBe(1);
    expect(x.phase).toBe("answer");
    const y = Spy.apply(x, "yes");
    expect(y.phase).toBe("question");
    expect(y.answers[0].actor).toBe(1);
    expect(Spy.view(y).notes.join("")).not.toContain("Votos:");
  });
  it("Timeline allows equal dates and returns another card after a wrong placement", () => {
    const s = Timeline.initial();
    s.line = [1];
    s.hands[0] = [0, 2];
    const count = s.deck.length;
    const x = Timeline.apply(s, "0:1");
    expect(x.scores[0]).toBe(0);
    expect(x.deck.length).toBe(count - 1);
    expect(Timeline.valid(s, 2, 1)).toBe(true);
  });
});
const simulations = [
  ["Pig", Pig, 2, 50],
  ["Farkle", F, 2, 2000],
  ["Zombie", Z, 3, 8],
  ["Craps", C, 2, 3],
  ["Hazard", H, 3, 3],
  ["Crown", Crown, 2, 3],
  ["Cee-lo", Ceelo, 3, 3],
  ["Bunco", Bunco, 4, 6],
  ["Sichuan", Sichuan, 2, 1],
  ["Perudo", P, 3, 5],
  ["Poker dice", L, 3, 5],
  ["Onitama", O, 2, 5],
  ["Quoridor", Q, 2, 9],
  ["DVONN", D, 2, 0],
  ["YINSH", Y, 2, 0],
  ["Hive", Hive, 2, 0],
  ["Blocks", Blocks, 2, 14],
  ["Quilt", Quilt, 2, 6],
  ["Glass", Glass, 2, 0],
  ["Who", Who, 2, 0],
  ["Alchemy", Alchemy, 2, 0],
  ["Murder", Murder, 3, 0],
  ["Networks", Network, 4, 0],
  ["Pictures", Pictures, 3, 0],
  ["Intruder", Spy, 4, 0],
  ["Timeline", Timeline, 3, 0],
] as const;
describe("Full paced AI games terminate with valid actors", () => {
  for (const [name, engine, n, size] of simulations)
    it(
      name,
      () => {
        vi.spyOn(Math, "random").mockImplementation(seed(54));
        const e = engine as unknown as {
          initial: (
            n: number,
            size: number,
          ) => {
            turn: number;
            winner: number | null;
            step: number;
            scores: number[];
          };
          automatic: (s: any) => any;
        };
        let s = e.initial(n, size);
        for (let step = 0; step < 3000 && s.winner === null; step++) {
          const before = s;
          s = e.automatic(s);
          expect(s.step).toBeGreaterThan(before.step);
          expect(s.turn).toBeGreaterThanOrEqual(0);
          expect(s.turn).toBeLessThan(n);
          expect(s.scores.every(Number.isFinite)).toBe(true);
        }
        expect(s.winner).not.toBeNull();
      },
      60000,
    );
});
describe("Category integration", () => {
  it("covers every pending entry of the requested categories", () => {
    for (const g of games.filter((g) =>
      ["Deducción", "Dados", "Abstractos"].includes(g.category),
    ))
      expect(g.ready, g.id).toBe(true);
    expect(categoryCompletionIds).toHaveLength(26);
  });
  for (const id of categoryCompletionIds)
    it(id + " supports online friends", () =>
      expect(supportsFriends(id)).toBe(true),
    );
  it("transmits a changed refutation actor as a room transaction", async () => {
    const host = new TableStore(),
      guest = new TableStore();
    host.view = {
      ...host.view,
      online: true,
      host: true,
      ready: true,
      seats: ["local", "remote", "ai"],
      turn: 0,
      started: true,
    };
    host.ensure("position", Murder.initial(3));
    host.onSnapshot = (s) => guest.receive(s, 1);
    host.set("position", (s: any) => ({ ...s, turn: 1, phase: "refute" }));
    host.setTurn(1, true);
    await Promise.resolve();
    expect(guest.view.turn).toBe(1);
    expect((guest.values.position as Murder.State).phase).toBe("refute");
  });
});
