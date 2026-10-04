import { TableStore, ownsTurn } from "../src/shared/room-model";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import IdeaArt from "../src/shared/IdeaArt";
import { describe, it, expect, vi, afterEach } from "vitest";
import { games } from "../src/games/registry";
import { supportsFriends } from "../src/shared/playModes";
import { cardGuides } from "../src/shared/cardGuides";
import { deck, spanishDeck, deadwood } from "../src/shared/cardData";
import type { Card } from "../src/shared/cards";
import * as g0 from "../src/games/poker-texas-hold-em/rules";
import * as g1 from "../src/games/chinchon/rules";
import * as g2 from "../src/games/tute/rules";
import * as g3 from "../src/games/truco-argentino-uruguayo/rules";
import * as g4 from "../src/games/rummy-continental/rules";
import * as g5 from "../src/games/bridge/rules";
import * as g6 from "../src/games/cribbage/rules";
import * as g7 from "../src/games/hearts-corazones/rules";
import * as g8 from "../src/games/spades-picas/rules";
import * as g9 from "../src/games/durak/rules";
import * as g10 from "../src/games/euchre/rules";
import * as g11 from "../src/games/canasta/rules";
import * as g12 from "../src/games/gin-rummy/rules";
import * as g13 from "../src/games/mau-mau/rules";
import * as g14 from "../src/games/briscola-chiamata/rules";
import * as g15 from "../src/games/tarot-frances/rules";
const entries = [
  { id: "poker-texas-hold-em", choices: [2, 3, 4, 5, 6], rules: g0 },
  { id: "chinchon", choices: [2, 3, 4], rules: g1 },
  { id: "tute", choices: [4], rules: g2 },
  { id: "truco-argentino-uruguayo", choices: [2], rules: g3 },
  { id: "rummy-continental", choices: [2, 3, 4], rules: g4 },
  { id: "bridge", choices: [4], rules: g5 },
  { id: "cribbage", choices: [2], rules: g6 },
  { id: "hearts-corazones", choices: [4], rules: g7 },
  { id: "spades-picas", choices: [4], rules: g8 },
  { id: "durak", choices: [2], rules: g9 },
  { id: "euchre", choices: [4], rules: g10 },
  { id: "canasta", choices: [2], rules: g11 },
  { id: "gin-rummy", choices: [2], rules: g12 },
  { id: "mau-mau", choices: [2, 3, 4], rules: g13 },
  { id: "briscola-chiamata", choices: [5], rules: g14 },
  { id: "tarot-frances", choices: [4], rules: g15 },
];
// Heterogeneous serialized game positions are intentionally exercised through their common rule contract.
interface Rules {
  initial: (n: number) => any;
  actions: (s: any) => { key: string; label: string }[];
  apply: (s: any, key: string) => any;
  automatic: (s: any) => any;
  view: (s: any) => any;
}
afterEach(() => vi.restoreAllMocks());
describe("Complete card tables", () => {
  for (const e of entries) {
    it(e.id + " has a ready route, guide and friends mode", () => {
      expect(games.find((g) => g.id === e.id)?.ready).toBe(true);
      expect(supportsFriends(e.id)).toBe(true);
      expect(cardGuides[e.id]).toHaveLength(4);
    });
    for (const n of e.choices)
      it(
        e.id +
          " completes " +
          n +
          " seats without mutating input or deadlocking",
        () => {
          const r = e.rules as Rules;
          for (let seed = 1; seed <= 3; seed++) {
            let v = seed * 9949;
            vi.spyOn(Math, "random").mockImplementation(() => {
              v = (v * 1664525 + 1013904223) >>> 0;
              return v / 2 ** 32;
            });
            let s = r.initial(n);
            for (let t = 0; s.winner === null && t < 4000; t++) {
              expect(s.turn).toBeGreaterThanOrEqual(0);
              expect(s.turn).toBeLessThan(n);
              expect(
                r.actions(s).length,
                "legal actions at step " + s.step,
              ).toBeGreaterThan(0);
              expect(r.apply(s, "invalid-command")).toBe(s);
              const before = JSON.stringify(s),
                next = r.automatic(s);
              expect(JSON.stringify(s), "original position unchanged").toBe(
                before,
              );
              expect(
                JSON.stringify(next),
                "AI makes progress at " + s.step,
              ).not.toBe(before);
              s = JSON.parse(JSON.stringify(next));
            }
            expect(s.winner, "match completes").not.toBeNull();
            expect(s.scores).toHaveLength(n);
            expect(s.scores.every(Number.isFinite)).toBe(true);
          }
        },
        20000,
      );
  }
});
const C = (rank: number, suit = 0, id = rank + suit * 20): Card => ({
  rank,
  suit,
  id,
  up: true,
});
describe("Rules and edge cases", () => {
  it("cribbage counts the 29 hand, multiple runs and crib flush", () => {
    expect(g6.handScore([C(5, 0), C(5, 1), C(5, 2), C(11, 3)], C(5, 3))).toBe(
      29,
    );
    expect(g6.handScore([C(2, 0), C(3, 1), C(3, 2), C(4, 3)], C(9, 0))).toBe(
      12,
    );
    const h = [C(1, 1), C(2, 1), C(8, 1), C(13, 1)],
      s = C(10, 0);
    expect(g6.handScore(h, s) - g6.handScore(h, s, true)).toBe(4);
  });
  it("pegging scores unordered runs, pairs, fifteens and 31", () => {
    expect(g6.pegScore([C(3), C(1), C(2)])).toBe(3);
    expect(g6.pegScore([C(5), C(5), C(5)])).toBe(8);
    expect(g6.pegScore([C(10), C(10), C(10), C(1)])).toBe(2);
  });
  it("poker wheel, kickers and seven-card best selection", () => {
    const royal = [10, 11, 12, 13, 1].map((x) => C(x)),
      wheel = [1, 2, 3, 4, 5].map((x, i) => C(x, i % 4)),
      six = [2, 3, 4, 5, 6].map((x, i) => C(x, i % 4));
    expect(g0.rankFive(royal)).toBeGreaterThan(
      g0.rankFive([C(8), C(8, 1), C(8, 2), C(8, 3), C(1)]),
    );
    expect(g0.rankFive(six)).toBeGreaterThan(g0.rankFive(wheel));
    expect(g0.rankHand([...royal, C(2, 1), C(3, 2)])).toBe(g0.rankFive(royal));
  });
  it("poker all-in pots preserve every chip", () => {
    let s = g0.initial(4);
    for (let t = 0; s.winner === null && t < 200; t++) {
      const a = g0.actions(s),
        all = a.filter((a) => a.key.startsWith("raise:")).at(-1);
      s = g0.apply(s, all?.key || "call");
    }
    expect(s.winner).not.toBeNull();
    expect(s.chips.reduce((a, b) => a + b, 0)).toBe(400);
  });
  it("bridge actor controlling dummy differs from physical seat", () => {
    let s = g5.apply(g5.initial(), "bid:4");
    for (let i = 0; i < 3; i++) s = g5.apply(s, "pass");
    expect(s.declarer).toBe(0);
    expect(s.handTurn).toBe(1);
    s = g5.apply(s, g5.actions(s)[0].key);
    expect(s.handTurn).toBe(2);
    expect(s.turn).toBe(0);
    expect(g5.view(s).actor).toBe(2);
  });
  it("bridge scoring: 3NT, vulnerable-free doubles and slams", () => {
    expect(g5.contractScore(3, 4, 1, 9)).toBe(400);
    expect(g5.contractScore(4, 3, 1, 10)).toBe(420);
    expect(g5.contractScore(6, 3, 1, 12)).toBe(980);
    expect(g5.contractScore(2, 2, 2, 6)).toBe(-300);
  });
  it("left bower must follow its effective trump suit", () => {
    const s = g10.initial();
    s.phase = "play";
    s.trump = 1;
    s.turn = 0;
    s.hands[0] = [C(11, 2), C(1, 0)];
    s.trick = [{ p: 3, c: C(9, 1) }];
    expect(g10.effective(C(11, 2), s)).toBe(1);
    expect(g10.legal(s)).toEqual([C(11, 2)]);
  });
  it("hearts begins with 2 clubs and cannot lead unbroken hearts", () => {
    const s = g7.initial();
    s.phase = "play";
    s.turn = 0;
    s.hands[0] = [C(2, 3), C(1, 1), C(1, 0)];
    expect(g7.legal(s)).toEqual([C(2, 3)]);
    s.last = [{ p: 0, c: C(2, 3) }];
    expect(g7.legal(s).every((c) => c.suit !== 1)).toBe(true);
  });
  it("Durak defense requires same higher suit or trump", () => {
    expect(g9.beats(C(8, 1), C(9, 1), 0)).toBe(true);
    expect(g9.beats(C(8, 1), C(6, 0), 0)).toBe(true);
    expect(g9.beats(C(8, 0), C(1, 1), 0)).toBe(false);
  });
  it("Truco 33 envido and special ace ranks", () => {
    expect(g3.envido([C(7, 1), C(6, 1), C(12, 0)])).toBe(33);
    expect(g3.strength(C(1, 2))).toBeGreaterThan(g3.strength(C(1, 3)));
  });
  it("Truco and Durak responses belong to the defender", () => {
    const t = g3.apply(g3.initial(), "truco");
    expect(t.phase).toBe("respond");
    expect(t.turn).toBe(1);
    let d = g9.initial();
    const p = d.turn;
    d = g9.apply(d, g9.actions(d)[0].key);
    expect(d.phase).toBe("defend");
    expect(d.turn).toBe(1 - p);
  });
  it("rummy partition does not reuse a card and ace cannot wrap", () => {
    expect(deadwood([C(1), C(2), C(3), C(3, 1), C(3, 2)]).value).toBe(3);
    expect(deadwood([C(13), C(1), C(2)]).value).toBe(13);
  });
  it("tarot trumping, overtrumping and Excuse", () => {
    const s = g15.initial();
    s.phase = "play";
    s.turn = 0;
    s.hands[0] = [C(4, 4), C(12, 4), C(0, 5), C(1, 2)];
    s.trick = [
      { p: 1, c: C(5, 1) },
      { p: 2, c: C(8, 4) },
    ];
    expect(g15.legal(s)).toEqual([C(0, 5), C(12, 4)]);
    expect(g15.tarotDeck()).toHaveLength(78);
  });
  it("tarot reveals the dog only for Prise and Garde", () => {
    for (const bid of [1, 2, 3, 4]) {
      let s = g15.initial();
      const dog = [...s.dog];
      s = g15.apply(s, "bid:" + bid);
      for (let i = 0; i < 3; i++) s = g15.apply(s, "pass");
      expect(s.revealedDog).toEqual(bid <= 2 ? dog : []);
      expect(
        g15.view(s).table.filter((c) => c.label.startsWith("Perro revelado:")),
      ).toHaveLength(bid <= 2 ? 6 : 0);
    }
  });
  it("secret Briscola partner is not exposed before playing called card", () => {
    let s = g14.initial();
    s = g14.apply(s, "bid:61");
    for (let i = 0; i < 4; i++) s = g14.apply(s, "pass");
    s = g14.apply(s, g14.actions(s)[0].key);
    expect(s.revealed).toBe(false);
    expect(g14.view(s).notes.join(" ")).toContain("por revelar");
    expect(g14.view(s).notes.join(" ")).not.toContain("socio J");
  });
});

describe("Online actor and shared room lifecycle", () => {
  for (const e of entries)
    it(
      e.id + " completes mixed seats and restarts without losing the room",
      async () => {
        const rules = e.rules as Rules,
          n = e.choices.at(-1)!,
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
        let t = 0;
        while ((host.values.position as any).winner === null && t++ < 4000) {
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
        expect(host.view.seats).toEqual(seats);
        expect(host.values.started).toBe(true);
        expect((host.values.position as any).step).toBe(0);
      },
      20000,
    );
});
it("every card tile has a distinct recognizable illustration", () => {
  const art = entries.map((e) =>
    renderToStaticMarkup(
      createElement(IdeaArt, { id: e.id, category: "Cartas" }),
    )
      .replace(/id="[^"]+"/g, 'id="x"')
      .replace(/url\(#[^)]+\)/g, "url(#x)"),
  );
  expect(new Set(art).size).toBe(entries.length);
});
it("gin layoff extends a run at both ends without losing opponent groups", () => {
  expect(
    g12.laidOffValue([C(2, 1), C(6, 1), C(13, 0)], [C(3, 1), C(4, 1), C(5, 1)]),
  ).toBe(10);
});
it("tute four kings after a captured trick ends the deal for that partnership", () => {
  const s = g2.initial();
  s.turn = 0;
  s.tricks[0] = 1;
  s.hands[0] = [0, 1, 2, 3].map((su) => C(12, su));
  expect(g2.actions(s).some((a) => a.key === "tute")).toBe(true);
  expect(g2.apply(s, "tute").winner).toBe(0);
});
it("canasta cannot empty a hand before forming a canasta", () => {
  const s = g11.initial();
  s.phase = "meld";
  s.turn = 0;
  s.hands[0] = [C(1, 0), C(1, 1), C(1, 2)];
  expect(g11.actions(s).every((a) => !a.key.startsWith("meld:"))).toBe(true);
});
