import { describe, it, expect, vi } from "vitest";
import { TableStore, safePatch, ownsTurn } from "../src/shared/room-model";
import { deck, icons, choice } from "../src/games/memory/rules";
import {
  initialContinuous as initial,
  placeMark as play,
} from "../src/games/tic-tac-toe/rules";

function table() {
  const host = new TableStore();
  host.ensure("board", Array(9).fill(null));
  host.ensure("turn", 0);
  host.ensure("started", false);
  host.configure({
    online: true,
    host: true,
    ready: true,
    seats: ["local", "remote", "ai", "remote"],
    turn: 1,
    connected: [1, 3],
  });
  return host;
}
describe("authoritative rooms", () => {
  it("supports non-consecutive local humans and keeps roles on restart", () => {
    const s = new TableStore();
    s.setCount(4);
    s.setLocalSeats(["local", "ai", "local", "ai"]);
    expect(s.machine(1, false)).toBe(true);
    expect(s.machine(2, true)).toBe(false);
    s.setTurn(0, false);
    s.setTurn(0, true);
    expect(s.view.seats).toEqual(["local", "ai", "local", "ai"]);
    s.configure({ online: true });
    s.setLocalSeats(["local", "local"]);
    expect(s.view.seats).toHaveLength(4);
  });
  it("batches all parts of a move into one versioned transaction", async () => {
    const host = table(),
      guest = new TableStore();
    guest.receive(host.snapshot(), 1);
    const proposals = vi.fn();
    guest.onProposal = proposals;
    guest.set("board", ["X", null, null, null, null, null, null, null, null]);
    guest.set("turn", 2);
    expect(proposals).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(proposals).toHaveBeenCalledTimes(1);
    const p = proposals.mock.calls[0][0];
    expect(Object.keys(p.patch)).toEqual(["board", "turn"]);
    expect(host.accept(1, p)).toBe(true);
    expect(host.view.revision).toBe(1);
    expect(host.values.turn).toBe(2);
    guest.receive(host.snapshot(), 1);
    expect(guest.values).toEqual(host.values);
  });
  it("ignores input out of turn", async () => {
    const host = table(),
      guest = new TableStore();
    guest.receive(host.snapshot(), 3);
    guest.set("turn", 2);
    await Promise.resolve();
    expect(guest.values.turn).toBe(0);
    expect(guest.view.turn).toBe(1);
  });
  it("buffers rapid typing and submitting while an earlier draft is in flight", async () => {
    const host = table();
    host.ensure("text", "");
    host.ensure("history", []);
    const guest = new TableStore();
    guest.receive(host.snapshot(), 1);
    const proposals = vi.fn();
    guest.onProposal = proposals;
    guest.set("text", "A");
    guest.flush();
    guest.set("text", "ALEJANDRO");
    guest.set("history", ["ALEJANDRO"]);
    guest.set("text", "");
    expect(proposals).toHaveBeenCalledTimes(1);
    // An unrelated same-revision roster update must not erase the local draft.
    guest.receive(host.snapshot(), 1);
    expect(guest.values.history).toEqual(["ALEJANDRO"]);
    expect(host.accept(1, proposals.mock.calls[0][0])).toBe(true);
    guest.receive(host.snapshot(), 1);
    await Promise.resolve();
    expect(proposals).toHaveBeenCalledTimes(2);
    expect(host.accept(1, proposals.mock.calls[1][0])).toBe(true);
    guest.receive(host.snapshot(), 1);
    expect(guest.values.history).toEqual(["ALEJANDRO"]);
    expect(guest.values.text).toBe("");
    expect(guest.values).toEqual(host.values);
  });
  it("discards queued input when the canonical turn moves to someone else", () => {
    const host = table();
    host.ensure("text", "");
    const guest = new TableStore();
    guest.receive(host.snapshot(), 1);
    guest.set("text", "first");
    guest.flush();
    guest.set("text", "queued");
    host.set("text", "first");
    host.flush();
    host.setTurn(0, true);
    guest.receive(host.snapshot(), 1);
    expect(guest.values.text).toBe("first");
  });
  it("rejects obsolete, wrong-seat and unknown-state proposals without changing the board", () => {
    const host = table(),
      before = host.values;
    expect(host.accept(3, { base: 0, patch: { turn: 3 } })).toBe(false);
    expect(host.accept(1, { base: 5, patch: { turn: 2 } })).toBe(false);
    expect(host.accept(1, { base: 0, patch: { alien: true } })).toBe(false);
    expect(host.values).toBe(before);
  });
  it("pauses every seat and AI when a participant is missing", () => {
    const host = table();
    host.configure({ ready: false });
    expect(ownsTurn(host.view)).toBe(false);
    expect(host.accept(1, { base: 0, patch: { turn: 2 } })).toBe(false);
    host.configure({ ready: true, turn: 2 });
    expect(host.machine(2, false)).toBe(true);
    expect(ownsTurn(host.view)).toBe(false);
    host.configure({ turn: 0 });
    expect(ownsTurn(host.view)).toBe(true);
  });
  it("restores canonical state on rejection and never accepts an older snapshot", () => {
    const host = table(),
      guest = new TableStore();
    guest.receive(host.snapshot(), 1);
    guest.set("turn", 2);
    guest.flush();
    guest.rejected(host.snapshot(), 1);
    expect(guest.values.turn).toBe(0);
    const old = host.snapshot();
    host.set("turn", 3);
    host.flush();
    guest.receive(host.snapshot(), 1);
    guest.receive(old, 1);
    expect(guest.values.turn).toBe(3);
  });
  it("leaving discards an unacknowledged optimistic move and releases callbacks", () => {
    const host = table(),
      guest = new TableStore();
    guest.receive(host.snapshot(), 1);
    guest.set("turn", 2);
    guest.flush();
    guest.disconnect();
    expect(guest.values.turn).toBe(0);
    expect(guest.view.online).toBe(false);
    expect(guest.onProposal).toBeNull();
  });
  it("syncs actual legal moves, including consecutive turns across multiple state fields", () => {
    const host = table();
    host.values = { state: initial(), started: true };
    host.configure({ turn: 0 });
    const first = play(host.values.state as ReturnType<typeof initial>, 0)!;
    host.set("state", first);
    host.flush();
    host.setTurn(1, true);
    const guest = new TableStore();
    guest.receive(host.snapshot(), 1);
    guest.onProposal = (p) => {
      expect(host.accept(1, p)).toBe(true);
      host.setTurn(0, true);
      guest.receive(host.snapshot(), 1);
    };
    const second = play(guest.values.state as ReturnType<typeof initial>, 4)!;
    guest.set("state", second);
    guest.flush();
    expect(host.values.state).toEqual(second);
    expect(guest.values.state).toEqual(second);
    expect(guest.view.turn).toBe(0);
  });
  it("rejects oversized or dangerous payloads", () => {
    expect(safePatch({ text: "x".repeat(1000001) })).toBe(false);
    expect(safePatch(JSON.parse('{"__proto__":{"polluted":true}}'))).toBe(
      false,
    );
    expect(safePatch({ constructor: 3 })).toBe(false);
    expect(safePatch([])).toBe(false);
    expect(safePatch({ state: { board: [0, 1, 2], turn: 1 } })).toBe(true);
  });
});
describe("expandable pairs", () => {
  it.each([8, 12, 18, 24, 32])(
    "deals %i distinct pairs, exactly twice each",
    (n) => {
      const cards = deck(n),
        counts = new Map<string, number>();
      for (const c of cards) counts.set(c, (counts.get(c) || 0) + 1);
      expect(cards).toHaveLength(n * 2);
      expect(counts.size).toBe(n);
      expect([...counts.values()].every((v) => v === 2)).toBe(true);
    },
  );
  it("has 32 distinguishable symbols and enforces its supported range", () => {
    expect(new Set(icons).size).toBe(32);
    expect(() => deck(33)).toThrow(RangeError);
    expect(() => deck(2.5)).toThrow(RangeError);
  });
  it("AI uses revealed memory even on the largest table", () => {
    expect(choice({ 12: "☀", 63: "☀" }, [0, 12, 33, 63], 12)).toBe(63);
    expect([0, 33]).toContain(choice({ 12: "☀", 63: "☀" }, [0, 33], 12));
  });
});
