import { describe, it, expect, vi, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import * as Morris from "../src/games/molino-nine-men-s-morris/rules";
import * as Shax from "../src/games/shax/rules";
import * as Tsoro from "../src/games/tsoro-yematatu/rules";
import * as Mu from "../src/games/mu-torere/rules";
import * as Bagh from "../src/games/bagh-chal-movimiento-de-tigres/rules";
import * as Fan from "../src/games/fanorona/rules";
import * as Sura from "../src/games/surakarta/rules";
import * as Tafl from "../src/games/tafl-hnefatafl/rules";
import * as Halma from "../src/games/halma/rules";
import * as Awale from "../src/games/awale/rules";
import * as Ur from "../src/games/ur-juego-real-de-ur/rules";
import * as Senet from "../src/games/senet/rules";
import * as Oca from "../src/games/juego-de-la-oca/rules";
import * as Sugo from "../src/games/sugoroku/rules";
import * as Pachisi from "../src/games/pachisi/rules";
import * as Yut from "../src/games/yut-nori/rules";
import * as Nyout from "../src/games/nyout/rules";
import { traditionalIds } from "../src/games/categoryCompletion";
import { games } from "../src/games/registry";
import { guides } from "../src/shared/guides";
import IdentityArt, { identityIds } from "../src/shared/IdentityArt";
import IdeaArt from "../src/shared/IdeaArt";
import { supportsFriends } from "../src/shared/playModes";
import { TableStore } from "../src/shared/room-model";
import type {
  AbstractPosition,
  BoardAction,
  BoardEngine,
} from "../src/shared/AbstractTable";
const seed = (n: number) => () => {
  n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
  return n / 4294967296;
};
afterEach(() => vi.restoreAllMocks());
const engines = {
  Morris,
  Shax,
  Tsoro,
  Mu,
  Bagh,
  Fan,
  Sura,
  Tafl,
  Halma,
  Awale,
  Ur,
  Senet,
  Oca,
  Sugo,
  Pachisi,
  Yut,
  Nyout,
};
describe("Traditional inventory and presentation", () => {
  it("completes every pending traditional entry with guides, rooms and own scene", () => {
    expect(traditionalIds).toHaveLength(17);
    expect(
      games.filter((g) => g.category === "Tradicionales" && !g.ready),
    ).toEqual([]);
    for (const id of traditionalIds) {
      expect(supportsFriends(id), id).toBe(true);
      expect(guides[id].length, id).toBeGreaterThanOrEqual(4);
      expect(
        guides[id].flat().join(" ").split(/\s+/).length,
        id,
      ).toBeGreaterThan(200);
      expect(identityIds).toContain(id);
    }
  });
  it("does not disguise identical SVG scenes with only identifiers or colors", () => {
    const drawings = identityIds.map((id) =>
      renderToStaticMarkup(createElement(IdentityArt, { id }))
        .replace(/data-artwork="[^"]*"/g, "")
        .replace(/id="[^"]*"/g, "")
        .replace(/url\(#[^)]*\)/g, "")
        .replace(/#[a-f0-9]{3,8}/gi, ""),
    );
    expect(new Set(drawings).size).toBe(identityIds.length);
    for (const svg of drawings) {
      expect(svg).not.toContain("()");
      expect(svg.length).toBeGreaterThan(500);
    }
  });
  it("gives every disabled catalogue idea its own nonempty composition", () => {
    const pending = games.filter((g) => !g.ready);
    const drawings = pending.map(({ id, category }) =>
      renderToStaticMarkup(createElement(IdeaArt, { id, category }))
        .replace(/id="[^"]*"/g, "")
        .replace(/url\(#[^)]*\)/g, "")
        .replace(/#[a-f0-9]{3,8}/gi, ""),
    );
    expect(new Set(drawings).size).toBe(pending.length);
    drawings.forEach((svg, i) =>
      expect(svg.length, pending[i].name).toBeGreaterThan(500),
    );
  });
});
describe("Placement and movement rules", () => {
  it("Morris completes a mill and captures before changing actor", () => {
    const s = Morris.initial();
    s.pieces[0] = s.pieces[1] = 0;
    s.pieces[8] = 1;
    s.reserve = [7, 8];
    const n = Morris.apply(s, { from: -1, to: 2, tool: 0 });
    expect(n.turn).toBe(0);
    expect(n.capture).toBe(true);
    const next = Morris.apply(n, { from: -1, to: 8, tool: 1 });
    expect(next.turn).toBe(1);
    expect(next.pieces[8]).toBe(-1);
  });
  it("Morris protects mill stones unless all opponents are in mills", () => {
    const s = Morris.initial();
    s.capture = true;
    [8, 9, 10, 16].forEach((i) => (s.pieces[i] = 1));
    expect(Morris.actions(s).map((a) => a.to)).toEqual([16]);
    s.pieces[16] = -1;
    expect(Morris.actions(s).map((a) => a.to)).toEqual([8, 9, 10]);
  });
  it("Morris permits flight only with exactly three remaining", () => {
    const s = Morris.initial();
    s.reserve = [0, 0];
    [0, 1, 2].forEach((i) => (s.pieces[i] = 0));
    expect(Morris.actions(s)).toContainEqual({ from: 0, to: 20, tool: 0 });
    s.pieces[3] = 0;
    expect(Morris.actions(s)).not.toContainEqual({ from: 0, to: 20, tool: 0 });
  });
  it("Shax records placement mills without removing pieces", () => {
    const s = Shax.initial();
    s.pieces[0] = s.pieces[1] = 0;
    s.reserve[0] = 10;
    const n = Shax.apply(s, { from: -1, to: 2, tool: 0 });
    expect(n.first).toBe(0);
    expect(n.capture).toBe(0);
    expect(n.turn).toBe(1);
  });
  it("Shax performs both opening removals and returns to first jare actor", () => {
    const s = Shax.initial();
    s.pieces = Array.from({ length: 24 }, (_, i) => i % 2);
    s.reserve = [0, 0];
    s.capture = 2;
    s.first = 0;
    s.opening = 0;
    const n = Shax.apply(s, { from: -1, to: 1, tool: 1 });
    expect(n.turn).toBe(1);
    expect(n.capture).toBe(1);
    const x = Shax.apply(n, { from: -1, to: 0, tool: 1 });
    expect(x.turn).toBe(0);
    expect(x.capture).toBe(0);
    expect(x.opening).toBe(-1);
  });
  it("Shax forces an opening move when opponent is trapped", () => {
    const s = Shax.initial();
    s.reserve = [0, 0];
    s.pieces = Array(24).fill(0);
    [0, 1, 2].forEach((i) => (s.pieces[i] = 1));
    s.pieces[20] = -1;
    s.freeFor = 1;
    expect(
      Shax.actions(s).every((a) => {
        const n = Shax.apply(s, a);
        return Shax.actions({ ...n, turn: 1, freeFor: -1 }).length > 0;
      }),
    ).toBe(true);
  });
  it("Tsoro allows moving to the empty point even without adjacency", () => {
    const s = Tsoro.initial();
    s.pieces = [0, 1, 0, 1, 0, 1, -1];
    s.reserve = [0, 0];
    expect(Tsoro.actions(s)).toContainEqual({ from: 0, to: 6, tool: 0 });
  });
  it("Tsoro recognizes each complete line", () => {
    for (const line of Tsoro.lines) {
      const s = Tsoro.initial();
      s.pieces[line[0]] = s.pieces[line[1]] = 0;
      s.reserve = [1, 3];
      expect(Tsoro.apply(s, { from: -1, to: line[2], tool: 0 }).winner).toBe(0);
    }
  });
  it("Mu opening never leaves the opponent without an answer", () => {
    const s = Mu.initial();
    for (const a of Mu.actions(s))
      expect(Mu.actions(Mu.apply(s, a)).length).toBeGreaterThan(0);
    expect(Mu.actions(s).length).toBeLessThan(4);
  });
  it("Bagh Chal captures one goat and five captures win", () => {
    const s = Bagh.initial();
    s.turn = 1;
    s.pieces[1] = 0;
    s.caught = 4;
    const n = Bagh.apply(s, { from: 0, to: 2, tool: 0 });
    expect(n.pieces[1]).toBe(-1);
    expect(n.caught).toBe(5);
    expect(n.winner).toBe(1);
    expect(n.pieces[2]).toBe(1);
  });
  it("Bagh Chal has no diagonal at weak points and goats cannot jump", () => {
    expect(Bagh.adjacent(1, 7)).toBe(false);
    const s = Bagh.initial();
    s.goats = 0;
    s.pieces[1] = 0;
    s.pieces[2] = 1;
    expect(Bagh.actions(s)).not.toContainEqual({ from: 1, to: 3, tool: 0 });
  });
});
describe("Capture, jumps and sowing", () => {
  it("Fanorona offers separate approach and withdrawal; quiet moves are disallowed", () => {
    const s = Fan.initial();
    s.pieces = Array(45).fill(-1);
    s.pieces[20] = 0;
    s.pieces[23] = s.pieces[24] = s.pieces[19] = 1;
    const a = { from: 20, to: 21, tool: 1 },
      w = { from: 20, to: 21, tool: 2 };
    expect(Fan.victims(s, a)).toEqual([]);
    s.pieces[22] = 1;
    expect(Fan.victims(s, a)).toEqual([22, 23, 24]);
    expect(Fan.victims(s, w)).toEqual([19]);
    expect(Fan.actions(s).every((a) => a.tool > 0)).toBe(true);
    expect(Fan.apply(s, a).pieces[19]).toBe(1);
  });
  it("Fanorona chains forbid same direction and revisiting origins", () => {
    const s = Fan.initial();
    s.pieces = Array(45).fill(-1);
    s.pieces[20] = 0;
    s.pieces[22] = 1;
    s.pieces[29] = 1;
    s.chain = 20;
    s.visited = [21];
    s.direction = "0,1";
    expect(Fan.actions(s).some((a) => a.to === 21)).toBe(false);
    expect(Fan.actions(s).some((a) => a.from === 20 && a.to === 29)).toBe(
      false,
    );
    expect(Fan.actions(s)).toContainEqual({
      from: -1,
      to: -1,
      tool: 3,
      label: "Terminar captura",
    });
  });
  it("Surakarta captures only along a clear rail with a loop", () => {
    const s = Sura.initial();
    s.pieces = Array(36).fill(-1);
    s.pieces[7] = 0;
    s.pieces[8] = 1;
    expect(Sura.captures(s, 7)).toContain(8);
    s.pieces[6] = s.pieces[1] = s.pieces[13] = 0;
    expect(Sura.captures(s, 7)).not.toContain(8);
  });
  it("Tafl moves through the throne but only the king may stop there", () => {
    const s = Tafl.initial();
    s.pieces = Array(121).fill(-1);
    s.pieces[58] = 0;
    s.pieces[82] = 2;
    const a = Tafl.actions(s);
    expect(a).not.toContainEqual({ from: 58, to: 60, tool: 0 });
    expect(a).toContainEqual({ from: 58, to: 61, tool: 0 });
  });
  it("Tafl king escapes at a corner and ordinary defender is sandwiched", () => {
    const s = Tafl.initial();
    s.pieces = Array(121).fill(-1);
    s.pieces[5] = 2;
    s.turn = 1;
    expect(Tafl.apply(s, { from: 5, to: 0, tool: 0 }).winner).toBe(1);
    const x = Tafl.initial();
    x.pieces = Array(121).fill(-1);
    x.pieces[60] = 2;
    x.pieces[24] = 0;
    x.pieces[37] = 0;
    x.pieces[25] = 1;
    expect(Tafl.apply(x, { from: 37, to: 26, tool: 0 }).pieces[25]).toBe(-1);
  });
  it("Halma has nineteen or thirteen counters, and preserves them during jump chains", () => {
    expect(Halma.initial().pieces.filter((v) => v === 0)).toHaveLength(19);
    expect(Halma.initial(4).pieces.filter((v) => v === 2)).toHaveLength(13);
    const s = Halma.initial();
    s.pieces = Array(256).fill(-1);
    s.pieces[100] = 0;
    s.pieces[101] = 1;
    s.pieces[103] = 1;
    const n = Halma.apply(s, { from: 100, to: 102, tool: 1 });
    expect(n.turn).toBe(0);
    expect(n.pieces[101]).toBe(1);
    expect(Halma.actions(n)).toContainEqual({ from: 102, to: 104, tool: 1 });
    expect(Halma.actions(n).some((a) => a.to === 100)).toBe(false);
  });
  it("Halma cannot leave the target camp", () => {
    const s = Halma.initial();
    s.pieces = Array(256).fill(-1);
    s.pieces[255] = 0;
    expect(
      Halma.actions(s).every((a) => Halma.camp(16, 1, 2).includes(a.to)),
    ).toBe(true);
  });
  it("Awale forces feeding and never loses seeds across captures", () => {
    const s = Awale.initial();
    s.seeds = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
    expect(Awale.actions(s).map((a) => a.to)).toEqual([5]);
    for (let i = 0, n = Awale.initial(); i < 300 && n.winner === null; i++) {
      n = Awale.automatic(n);
      expect(
        n.seeds.reduce((a, b) => a + b, 0) +
          n.scores.reduce((a, b) => a + b, 0),
      ).toBe(48);
    }
  });
  it("Awale cancels a grand-slam capture and skips origin over full laps", () => {
    const s = Awale.initial();
    s.seeds = [3, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0];
    const n = Awale.apply(s, { from: -1, to: 5, tool: 0 });
    expect(n.seeds[6]).toBe(2);
    expect(n.scores[0]).toBe(0);
    const x = Awale.initial();
    x.seeds[0] = 12;
    expect(Awale.apply(x, { from: -1, to: 0, tool: 0 }).seeds[0]).toBe(0);
  });
});
describe("Traditional racing phases", () => {
  it("Ur lets multiple pieces leave and refuses occupation of the central rosette", () => {
    const s = Ur.initial();
    s.phase = "move";
    s.roll = 1;
    s.pieces[0] = [14, 13, -1, -1, -1, -1, -1];
    const n = Ur.apply(s, { from: 6, to: 24, tool: 2 });
    expect(n.scores[0]).toBe(2);
    s.roll = 4;
    s.pieces[0][1] = 3;
    s.pieces[1][0] = 7;
    expect(Ur.actions(s).some((a) => a.tool === 2)).toBe(false);
  });
  it("Ur bonus rolls retain actor and exact exit is mandatory", () => {
    const s = Ur.initial();
    s.phase = "move";
    s.roll = 4;
    const n = Ur.apply(s, { from: -1, to: 0, tool: 1 });
    expect(n.turn).toBe(0);
    expect(n.phase).toBe("roll");
    s.pieces[0] = Array(7).fill(13);
    expect(Ur.actions(s).some((a) => a.to === 24)).toBe(false);
  });
  it("Senet requires house 26, recovers water pieces and special exact rolls", () => {
    const s = Senet.initial();
    s.phase = "move";
    s.roll = 2;
    s.pieces[0][0] = 24;
    expect(Senet.destination(s, 0)).toBe(-1);
    s.pieces[0][0] = -2;
    expect(Senet.destination(s, 0)).toBe(14);
    s.pieces[1][0] = 14;
    expect(Senet.destination(s, 0)).toBe(-1);
    s.pieces[0][0] = 27;
    expect(Senet.destination(s, 0)).toBe(-1);
    s.roll = 3;
    expect(Senet.destination(s, 0)).toBe(30);
  });
  it("Senet swaps opponents rather than sending them to reserve", () => {
    const s = Senet.initial();
    s.phase = "move";
    s.roll = 1;
    const n = Senet.apply(s, { from: 0, to: 1, tool: 1 });
    expect(n.pieces[0][0]).toBe(1);
    expect(n.pieces[1][0]).toBe(0);
  });
  it("Oca goose after an overshoot continues backwards without an infinite loop", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const s = Oca.initial();
    s.positions[0] = 59;
    const n = Oca.apply(s, { from: -1, to: -1, tool: 0 });
    expect(n.positions[0]).toBe(51);
    expect(n.turn).toBe(0);
  });
  it("Oca transfers well detention and reduces prison waiting", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const s = Oca.initial();
    s.positions[0] = 29;
    s.well = 1;
    s.positions[1] = 31;
    const n = Oca.apply(s, { from: -1, to: -1, tool: 0 });
    expect(n.well).toBe(0);
    expect(n.turn).toBe(1);
    expect(Oca.apply(n, { from: -1, to: -1, tool: 0 }).positions[1]).not.toBe(
      31,
    );
  });
  it("Sugoroku applies the landing arrow after reflection", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.7);
    const s = Sugo.initial();
    s.positions[0] = 28;
    expect(Sugo.apply(s, { from: -1, to: -1, tool: 0 }).positions[0]).toBe(20);
  });
  it("Pachisi six cauris differ from the Spanish parchis die", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const n = Pachisi.apply(Pachisi.initial(), { from: -1, to: -1, tool: 0 });
    expect(n.roll).toBe(25);
    expect(n.grace).toBe(true);
    expect(Pachisi.routes[0]).toHaveLength(82);
    expect(new Set(Pachisi.routes[0].slice(7, 75)).size).toBe(68);
  });
  it("Pachisi requires grace for later entries and exact return; team wins together", () => {
    const s = Pachisi.initial();
    s.phase = "move";
    s.roll = 3;
    s.started[0] = true;
    expect(Pachisi.actions(s).filter((a) => a.tool !== 99)).toEqual([]);
    s.grace = true;
    expect(Pachisi.actions(s).some((a) => a.tool === 1)).toBe(true);
    s.pieces[0] = [82, 82, 82, 80];
    s.pieces[2] = [82, 82, 82, 82];
    s.roll = 2;
    const a = Pachisi.actions(s).find((a) => a.tool === 4)!;
    expect(Pachisi.apply(s, a).winner).toBe(0);
  });
  it("Yut and Nyout accumulate 4/5 throws before moving", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    for (const e of [Yut, Nyout]) {
      const n = e.apply(e.initial(), { from: -1, to: -1, tool: 0 });
      expect(n.throws).toEqual([5]);
      expect(n.phase).toBe("roll");
      expect(n.turn).toBe(0);
    }
  });
  it("Yut captured groups give another cast; Nyout does not", () => {
    for (const [e, bonus] of [
      [Yut, true],
      [Nyout, false],
    ] as const) {
      const s = e.initial();
      s.phase = "move";
      s.throws = [2];
      s.pieces[1][0] = { node: 2, route: 0, index: 1 };
      s.pieces[1][1] = { node: 2, route: 0, index: 1 };
      const a = e.actions(s).find((a) => a.to === 2)!;
      const n = e.apply(s, a);
      expect(n.pieces[1].slice(0, 2).every((p) => p.node === -1)).toBe(true);
      expect(n.turn).toBe(bonus ? 0 : 1);
      expect(n.phase).toBe("roll");
    }
  });
  it("Stacked horses move together and may overshoot exit", () => {
    const s = Yut.initial();
    s.phase = "move";
    s.throws = [3];
    s.pieces[0][0] = { node: 0, route: 0, index: 19 };
    s.pieces[0][1] = { node: 0, route: 0, index: 19 };
    const a = Yut.actions(s).find((a) => a.to === 29)!;
    const n = Yut.apply(s, a);
    expect(n.scores[0]).toBe(2);
  });
  it("Yut shortcut requires landing, not merely passing the corner", () => {
    const s = Yut.initial();
    s.phase = "move";
    s.throws = [4];
    s.pieces[0][0] = { node: 4, route: 0, index: 3 };
    expect(
      Yut.actions(s)
        .filter((a) => a.from === 4)
        .every((a) => (a.tool - 1) % 10 === 0),
    ).toBe(true);
    s.pieces[0][0] = { node: 5, route: 0, index: 4 };
    expect(
      Yut.actions(s).some((a) => a.from === 5 && (a.tool - 1) % 10 === 1),
    ).toBe(true);
    expect(Yut.options(s.pieces[0][0])).not.toContain(3);
    expect(Yut.options({ node: 24, route: 1, index: 7 })).toContain(3);
    expect(Nyout.options({ node: 15, route: 1, index: 10 })).toContain(3);
  });
});
describe("Automated matches and room serialization", () => {
  for (const [name, raw] of Object.entries(engines))
    it(
      name + " validates, survives serialization and reaches a final state",
      () => {
        vi.spyOn(Math, "random").mockImplementation(seed(917));
        const e = raw as unknown as BoardEngine<AbstractPosition>,
          players = name === "Pachisi" ? 4 : 2;
        let s = e.initial(players, 0);
        for (let i = 0; i < 6000 && s.winner === null; i++) {
          const before = JSON.stringify(s),
            legal = e.actions(s);
          expect(legal.length, name + " step " + i).toBeGreaterThan(0);
          const next = e.automatic(structuredClone(s));
          expect(JSON.stringify(s)).toBe(before);
          expect(next.step).toBeGreaterThan(s.step);
          expect(next.turn).toBeGreaterThanOrEqual(0);
          expect(next.turn).toBeLessThan(players);
          expect(next.scores.every(Number.isFinite)).toBe(true);
          const view = e.board(next);
          expect(new Set(view.cells.map((c) => c.key)).size).toBe(
            view.cells.length,
          );
          expect(view.cells.filter((c) => !c.void).length).toBeGreaterThan(0);
          s = JSON.parse(JSON.stringify(next));
        }
        expect(
          s.winner,
          name + " stuck after " + s.step + " actions: " + JSON.stringify(s),
        ).not.toBeNull();
        expect(e.actions(s)).toEqual([]);
        expect(e.apply(s, { from: 999, to: 999, tool: 999 })).toBe(s);
      },
      120000,
    );
  it("retains capture actor across room patches and hands control to the remote seat", async () => {
    const h = new TableStore(),
      g = new TableStore();
    h.view = {
      ...h.view,
      online: true,
      host: true,
      ready: true,
      seats: ["local", "remote"],
      turn: 0,
      started: true,
    };
    const s = Morris.initial();
    s.pieces[0] = s.pieces[1] = 0;
    s.pieces[8] = 1;
    s.reserve = [7, 8];
    h.ensure("position", s);
    h.onSnapshot = (s) => g.receive(s, 1);
    const cap = Morris.apply(s, { from: -1, to: 2, tool: 0 });
    h.set("position", cap);
    h.setTurn(cap.turn, true);
    await Promise.resolve();
    expect((g.values.position as Morris.State).turn).toBe(0);
    expect(g.view.turn).toBe(0);
    const next = Morris.apply(cap, { from: -1, to: 8, tool: 1 });
    h.set("position", next);
    h.setTurn(next.turn, true);
    await Promise.resolve();
    expect((g.values.position as Morris.State).turn).toBe(1);
    expect(g.view.turn).toBe(1);
  });
});
