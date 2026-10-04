import { describe, it, expect, vi, afterEach } from "vitest";
import { games } from "../src/games/registry";
import { supportsFriends } from "../src/shared/playModes";
import { collectionGuides } from "../src/shared/collectionGuides";
import { TableStore, ownsTurn } from "../src/shared/room-model";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import IdeaArt from "../src/shared/IdeaArt";
import * as game0 from "../src/games/tierras-de-losetas/rules";
import * as game1 from "../src/games/el-mercado-de-joyas/rules";
import * as game2 from "../src/games/la-villa-agricola/rules";
import * as game3 from "../src/games/isla-de-monstruos/rules";
import * as game4 from "../src/games/el-gran-bazar/rules";
import * as game5 from "../src/games/diseno-de-mosaicos/rules";
import * as game6 from "../src/games/observatorio-de-aves/rules";
import * as game7 from "../src/games/terraformacion-planetaria/rules";
import * as game8 from "../src/games/lineas-de-produccion/rules";
import * as game9 from "../src/games/expedicion-arqueologica/rules";
import * as game10 from "../src/games/el-laberinto-magico/rules";
import * as game11 from "../src/games/subasta-de-propiedades/rules";
import * as game12 from "../src/games/el-fabricante-de-alfombras/rules";
import * as game13 from "../src/games/viaje-en-el-tiempo/rules";
import * as game14 from "../src/games/invasion-de-clanes/rules";
import * as game15 from "../src/games/descarte-explosivo/rules";
import * as game16 from "../src/games/mineros-saboteadores/rules";
import * as game17 from "../src/games/lobo-aldea/rules";
import * as game18 from "../src/games/la-resistencia-avalon/rules";
import * as game19 from "../src/games/guerra-de-cartas-de-energia/rules";
import * as game20 from "../src/games/combates-del-espacio/rules";
import * as game21 from "../src/games/dominio-de-reino/rules";
import * as game22 from "../src/games/cartas-suicidas/rules";
import * as game23 from "../src/games/el-estafador-de-cartas/rules";
import * as game24 from "../src/games/duelo-de-cartas-en-la-corte/rules";
import * as game25 from "../src/games/comercio-de-alubias/rules";
import * as game26 from "../src/games/el-ladron-de-guante-blanco/rules";
import * as game27 from "../src/games/cartas-del-purgatorio/rules";
import * as game28 from "../src/games/senores-de-la-guerra/rules";
import * as game29 from "../src/games/nonogramas-picross/rules";
import * as game30 from "../src/games/crucigramas-interactivos/rules";
import * as game31 from "../src/games/bloques-deslizantes/rules";
import * as game32 from "../src/games/puzle-de-tuberias/rules";
import * as game33 from "../src/games/cruces-numericos-kakuro/rules";
import * as game34 from "../src/games/rutas-de-luces-lights-out/rules";
import * as game35 from "../src/games/puentes-fluviales-hashiwokakero/rules";
import * as game36 from "../src/games/laberintos-generativos/rules";
// The public rule contract is exercised across heterogeneous positions.
interface Rules {
  initial: (n: number) => any;
  actions: (s: any) => { key: string; label: string }[];
  apply: (s: any, key: string) => any;
  automatic: (s: any) => any;
  view: (s: any) => any;
  scene: (s: any) => any;
}
interface PuzzleRules {
  initial: (n: number) => any;
  apply: (s: any, key: string) => any;
  automatic: (s: any) => any;
  view: (s: any, tool: string) => any;
}
const tables = [
    { id: "tierras-de-losetas", rules: game0 as Rules, choices: [2, 3, 4] },
    { id: "el-mercado-de-joyas", rules: game1 as Rules, choices: [2, 3, 4] },
    { id: "la-villa-agricola", rules: game2 as Rules, choices: [2, 3, 4] },
    { id: "isla-de-monstruos", rules: game3 as Rules, choices: [2, 3, 4] },
    { id: "el-gran-bazar", rules: game4 as Rules, choices: [2, 3, 4] },
    { id: "diseno-de-mosaicos", rules: game5 as Rules, choices: [2, 3, 4] },
    { id: "observatorio-de-aves", rules: game6 as Rules, choices: [2, 3, 4] },
    {
      id: "terraformacion-planetaria",
      rules: game7 as Rules,
      choices: [2, 3, 4],
    },
    { id: "lineas-de-produccion", rules: game8 as Rules, choices: [2, 3, 4] },
    {
      id: "expedicion-arqueologica",
      rules: game9 as Rules,
      choices: [2, 3, 4],
    },
    { id: "el-laberinto-magico", rules: game10 as Rules, choices: [2, 3, 4] },
    {
      id: "subasta-de-propiedades",
      rules: game11 as Rules,
      choices: [2, 3, 4],
    },
    {
      id: "el-fabricante-de-alfombras",
      rules: game12 as Rules,
      choices: [2, 3, 4],
    },
    { id: "viaje-en-el-tiempo", rules: game13 as Rules, choices: [2, 3, 4] },
    { id: "invasion-de-clanes", rules: game14 as Rules, choices: [2, 3, 4] },
    { id: "descarte-explosivo", rules: game15 as Rules, choices: [2, 3, 4] },
    {
      id: "mineros-saboteadores",
      rules: game16 as Rules,
      choices: [3, 4, 5, 6],
    },
    { id: "lobo-aldea", rules: game17 as Rules, choices: [6, 7, 8] },
    { id: "la-resistencia-avalon", rules: game18 as Rules, choices: [5, 6] },
    { id: "guerra-de-cartas-de-energia", rules: game19 as Rules, choices: [2] },
    { id: "combates-del-espacio", rules: game20 as Rules, choices: [2, 3, 4] },
    { id: "dominio-de-reino", rules: game21 as Rules, choices: [2, 3, 4] },
    { id: "cartas-suicidas", rules: game22 as Rules, choices: [2, 3, 4] },
    {
      id: "el-estafador-de-cartas",
      rules: game23 as Rules,
      choices: [2, 3, 4],
    },
    {
      id: "duelo-de-cartas-en-la-corte",
      rules: game24 as Rules,
      choices: [2, 3, 4],
    },
    { id: "comercio-de-alubias", rules: game25 as Rules, choices: [2, 3, 4] },
    {
      id: "el-ladron-de-guante-blanco",
      rules: game26 as Rules,
      choices: [2, 3, 4],
    },
    { id: "cartas-del-purgatorio", rules: game27 as Rules, choices: [2, 3, 4] },
    { id: "senores-de-la-guerra", rules: game28 as Rules, choices: [2, 3, 4] },
  ],
  puzzles = [
    {
      id: "nonogramas-picross",
      rules: game29 as PuzzleRules,
      sizes: [5, 8, 10],
    },
    {
      id: "crucigramas-interactivos",
      rules: game30 as PuzzleRules,
      sizes: [9, 11],
    },
    { id: "bloques-deslizantes", rules: game31 as PuzzleRules, sizes: [3, 4] },
    { id: "puzle-de-tuberias", rules: game32 as PuzzleRules, sizes: [4, 6, 8] },
    {
      id: "cruces-numericos-kakuro",
      rules: game33 as PuzzleRules,
      sizes: [7, 10],
    },
    {
      id: "rutas-de-luces-lights-out",
      rules: game34 as PuzzleRules,
      sizes: [3, 5, 7],
    },
    {
      id: "puentes-fluviales-hashiwokakero",
      rules: game35 as PuzzleRules,
      sizes: [3, 5],
    },
    {
      id: "laberintos-generativos",
      rules: game36 as PuzzleRules,
      sizes: [9, 15, 21],
    },
  ];
function seed(n: number) {
  vi.spyOn(Math, "random").mockImplementation(() => {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    return n / 2 ** 32;
  });
}
afterEach(() => vi.restoreAllMocks());
describe("New competitive tables", () => {
  for (const { id, rules, choices } of tables) {
    it(
      id +
        " finishes serialized automatic matches at each supported seat count",
      () => {
        seed(1453);
        for (const n of choices) {
          let s = rules.initial(n),
            steps = 0;
          while (s.winner === null && steps++ < 1300) {
            expect(s.turn).toBeGreaterThanOrEqual(0);
            expect(s.turn).toBeLessThan(n);
            expect(s.scores).toHaveLength(n);
            expect(s.scores.every(Number.isFinite)).toBe(true);
            const before = JSON.stringify(s),
              options = rules.actions(s);
            expect(
              options.length,
              id + " no action at " + steps,
            ).toBeGreaterThan(0);
            expect(rules.apply(s, "invalid action")).toBe(s);
            const next = rules.automatic(s);
            expect(JSON.stringify(s)).toBe(before);
            expect(JSON.stringify(next), id + " stalled at " + steps).not.toBe(
              before,
            );
            s = JSON.parse(JSON.stringify(next));
          }
          expect(s.winner, id + " incomplete after " + steps).not.toBeNull();
          expect(s.scores.every(Number.isFinite)).toBe(true);
          expect(rules.actions(s)).toEqual([]);
        }
      },
      20000,
    );
    it(id + " has playable route, own guide and real friends mode", () => {
      expect(games.find((g) => g.id === id)?.ready).toBe(true);
      expect(supportsFriends(id)).toBe(true);
      expect(collectionGuides[id].length).toBeGreaterThanOrEqual(4);
    });
  }
});
describe("Individual logic solvers", () => {
  for (const { id, rules, sizes } of puzzles) {
    it(
      id + " solves generated boards at every size without a hidden answer",
      () => {
        seed(3409);
        for (const n of sizes) {
          let s = rules.initial(n),
            step = 0;
          expect(s.size).toBe(n);
          expect(rules.apply(s, "invalid action")).toBe(s);
          while (s.winner === null && step++ < 800) {
            const before = JSON.stringify(s),
              next = rules.automatic(s);
            expect(JSON.stringify(s)).toBe(before);
            expect(
              JSON.stringify(next),
              id + " stalled at " + step + " size " + n,
            ).not.toBe(before);
            s = JSON.parse(JSON.stringify(next));
          }
          expect(s.winner, id + " unfinished size " + n).toBe(0);
        }
        expect(supportsFriends(id)).toBe(false);
      },
      30000,
    );
  }
});
describe("Actual phases and rule edge cases", () => {
  it("Avalon requires strict majority and gives evil victory on five rejected proposals", () => {
    let s = game18.initial(5);
    for (let round = 0; round < 5; round++) {
      s = game18.apply(s, game18.actions(s)[0].key);
      for (let i = 0; i < 5; i++) s = game18.apply(s, i < 2 ? "yes" : "no");
    }
    expect(s.winner).not.toBeNull();
    expect(s.outcome).toContain("Mal");
  });
  it("Avalon secret mission passes the actor to the actual next team member and exposes only sabotage total", () => {
    let s = game18.initial(5);
    s.roles = ["Merlín", "Asesino", "Esbirro", "Leal", "Leal"];
    s = game18.apply(s, "team:0,3");
    for (let i = 0; i < 5; i++) s = game18.apply(s, "yes");
    expect(s.turn).toBe(0);
    expect(game18.actions(s).some((a) => a.key === "fail")).toBe(false);
    s = game18.apply(s, "success");
    expect(s.turn).toBe(3);
    s = game18.apply(s, "success");
    expect(s.success).toBe(1);
    expect(s.journal.at(-1)).toContain("0 sabotajes");
  });
  it("Avalon three successes starts assassination at the assassin seat", () => {
    let s = game18.initial(5);
    s.roles = ["Merlín", "Asesino", "Esbirro", "Leal", "Leal"];
    for (const team of ["team:0,3", "team:0,3,4", "team:0,3"]) {
      s = game18.apply(s, team);
      for (let i = 0; i < 5; i++) s = game18.apply(s, "yes");
      while (s.phase === "mission") s = game18.apply(s, "success");
    }
    expect(s.phase).toBe("assassinate");
    expect(s.turn).toBe(1);
    s = game18.apply(s, "kill:0");
    expect(s.outcome).toContain("Mal");
  });
  it("wolves, healer and seer have independent actors; death occurs only at dawn", () => {
    let s = game17.initial(6);
    s.roles = ["Lobo", "Lobo", "Vidente", "Sanador", "Aldeano", "Aldeano"];
    s.turn = 0;
    s = game17.apply(s, "2");
    expect(s.turn).toBe(1);
    s = game17.apply(s, "2");
    expect(s.turn).toBe(3);
    s = game17.apply(s, "4");
    expect(s.turn).toBe(2);
    expect(s.alive[2]).toBe(true);
    s = game17.apply(s, "0");
    expect(s.alive[2]).toBe(false);
    expect(s.phase).toBe("vote");
    expect(s.vision[2][0].wolf).toBe(true);
  });
  it("energy duel waits for the defender and shield blocks three before their ordinary turn", () => {
    let s = game19.initial(2);
    s.hands = [[0], [1]];
    s = game19.apply(s, "play:0");
    expect(s.turn).toBe(1);
    expect(s.phase).toBe("defend");
    s = game19.apply(s, "block:0");
    expect(s.health).toEqual([20, 20]);
    expect(s.turn).toBe(1);
    expect(s.phase).toBe("play");
  });
  it("market sealed bids are private until the last player responds and tie priority rotates", () => {
    let s = game4.initial(3);
    s.lot = 0;
    s = game4.apply(s, "5");
    expect(s.history).toEqual([]);
    expect(game4.view(s).notes[1]).toContain("puja entregada");
    expect(game4.view(s).notes[1]).not.toContain("5");
    s = game4.apply(s, "5");
    expect(s.round).toBe(1);
    s = game4.apply(s, "1");
    expect(s.goods[0][0]).toBe(1);
    expect(s.coins).toEqual([9, 14, 14]);
    expect(s.turn).toBe(1);
  });
  it("court spy writes private knowledge without including the rival card in public log", () => {
    let s = game24.initial(2);
    s.hands = [[2, 4], [8]];
    s = game24.apply(s, "play:0,1,0");
    expect(s.intel[0]).toEqual([{ target: 1, card: 8 }]);
    expect(s.journal.join(" ")).not.toContain("Princesa");
  });
  it("bean sale changes actor to recipient and rejection keeps the seller market intact", () => {
    let s = game25.initial(2);
    s.phase = "market";
    s.offer = [0];
    s.fields[1][0] = { kind: 0, count: 2 };
    const before = JSON.stringify(s.offer);
    s = game25.apply(s, "trade:0,1,0");
    expect(s.turn).toBe(1);
    expect(s.phase).toBe("respond");
    s = game25.apply(s, "reject");
    expect(s.turn).toBe(0);
    expect(JSON.stringify(s.offer)).toBe(before);
    expect(game25.actions(s).some((a) => a.key === "trade:0,1,0")).toBe(false);
  });
  it("bean sale acceptance transfers payment and plants only with consent", () => {
    let s = game25.initial(2);
    s.phase = "market";
    s.offer = [0, 1];
    s.fields[1][0] = { kind: 0, count: 2 };
    s = game25.apply(s, "trade:0,1,0");
    expect(s.fields[1][0].count).toBe(2);
    s = game25.apply(s, "accept");
    expect(s.fields[1][0].count).toBe(3);
    expect(s.scores).toEqual([1, -1]);
    expect(s.turn).toBe(0);
  });
  it("liar empty hand does not win until each opponent accepts or challenges", () => {
    let s = game23.initial(3);
    s.hands[0] = [2];
    s = game23.apply(s, "claim:0,2");
    expect(s.winner).toBeNull();
    s = game23.apply(s, "trust");
    expect(s.winner).toBeNull();
    s = game23.apply(s, "trust");
    expect(s.winner).toBe(0);
  });
  it("tiles keep actor during pick and forbid isolated placements", () => {
    let s = game0.initial(2);
    s = game0.apply(s, "pick:0");
    expect(s.turn).toBe(0);
    expect(game0.apply(s, "place:0")).toBe(s);
    s = game0.apply(s, "place:14");
    expect(s.turn).toBe(1);
  });
  it("Lights Out repeated click restores board, corners affect only three cells", () => {
    let s = game34.initial(5);
    const before = [...s.lights];
    s = game34.apply(s, "0");
    expect(s.lights.filter((v, i) => v !== before[i])).toHaveLength(3);
    s = game34.apply(s, "0");
    expect(s.lights).toEqual(before);
  });
  it("nonogram clues enforce separated runs and generator has unique solution", () => {
    seed(42);
    const s = game29.initial(8);
    expect(game29.clues([1, 1, 0, 1, 0])).toEqual([2, 1]);
    expect(game29.solve(s.rows, s.cols, 2)).toHaveLength(1);
  });
  it("Kakuro distinct-digit rule rejects matching sums with repeated digits", () => {
    let s = game33.initial(7);
    for (const r of s.runs) for (const i of r.cells) s.values[i] = 2;
    expect(game33.valid(s)).toBe(false);
    expect(game33.solutions(s, 2)).toHaveLength(1);
  });
  it("Hashi requires global connection as well as every degree", () => {
    const s = game35.initial(3);
    s.edges.forEach((e) => (e.count = 0));
    expect(game35.valid(s)).toBe(false);
    const solved = game35.solution(s);
    expect(solved).toHaveLength(s.edges.length);
    s.edges.forEach((e, i) => (e.count = solved[i]));
    expect(game35.valid(s)).toBe(true);
  });
  it("pipe win requires no boundary leakage and complete network", () => {
    const s = game32.initial(4),
      answer = game32.solution(s);
    expect(answer).toHaveLength(16);
    s.pipes = answer;
    expect(game32.solved(s)).toBe(true);
    s.pipes[0] |= 1;
    expect(game32.solved(s)).toBe(false);
  });
  it("sliding puzzle cannot move a nonneighbor of the blank", () => {
    const s = game31.initial(3),
      z = s.tiles.indexOf(0),
      far = s.tiles.findIndex(
        (_, i) =>
          Math.abs((i % 3) - (z % 3)) +
            Math.abs(Math.floor(i / 3) - Math.floor(z / 3)) >
          1,
      );
    expect(game31.apply(s, String(far))).toBe(s);
  });
});
describe("Shared transport and original artwork", () => {
  it("every newly enabled game retains a structurally distinct illustration", () => {
    const ids = [...tables, ...puzzles].map((g) => g.id);
    const drawings = ids.map((id) =>
      renderToStaticMarkup(createElement(IdeaArt, { id, category: "" }))
        .replace(/id="[^"]*"/g, "")
        .replace(/url\(#[^)]*\)/g, "")
        .replace(/#[a-f0-9]{3,8}/gi, ""),
    );
    expect(new Set(drawings).size).toBe(ids.length);
    drawings.forEach((svg, i) =>
      expect(svg.length, ids[i]).toBeGreaterThan(500),
    );
  });
  for (const item of tables) {
    it(
      item.id +
        " synchronizes a complete mixed local, remote and AI match and preserves seats on restart",
      async () => {
        seed(1993);
        const rules = item.rules,
          n = item.choices.at(-1)!,
          host = new TableStore();
        const seats = Array.from({ length: n }, (_, i) =>
          i === 0 ? "local" : i % 2 ? "remote" : "ai",
        ) as ("local" | "remote" | "ai")[];
        host.ensure("position", rules.initial(n));
        host.ensure("started", true);
        host.configure({
          online: true,
          host: true,
          ready: true,
          seats,
          connected: seats.flatMap((s, i) => (s === "remote" ? [i] : [])),
        });
        let count = 0;
        while (
          (host.values.position as any).winner === null &&
          count++ < 1300
        ) {
          const s = host.values.position as any;
          host.setTurn(s.turn, true);
          if (seats[s.turn] === "remote") {
            const guest = new TableStore();
            guest.receive(JSON.parse(JSON.stringify(host.snapshot())), s.turn);
            expect(ownsTurn(guest.view)).toBe(true);
            let accepted = false;
            guest.onProposal = (p) => {
              accepted = host.accept(s.turn, p);
            };
            guest.set("position", rules.automatic(guest.values.position));
            guest.flush();
            expect(accepted).toBe(true);
          } else {
            expect(host.machine(s.turn, false)).toBe(seats[s.turn] === "ai");
            host.set("position", rules.automatic(s));
            host.flush();
          }
          await Promise.resolve();
          expect((host.values.position as any).step).toBeGreaterThan(s.step);
        }
        expect((host.values.position as any).winner).not.toBeNull();
        host.set("position", rules.initial(n));
        host.flush();
        host.setTurn(0, true);
        expect(host.view.seats).toEqual(seats);
        expect(host.values.started).toBe(true);
        expect((host.values.position as any).step).toBe(0);
      },
      20000,
    );
  }
});
