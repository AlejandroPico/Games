import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const network = vi.hoisted(() => {
  class Events {
    handlers = new Map<string, ((...args: any[]) => void)[]>();
    on(name: string, fn: (...args: any[]) => void) {
      this.handlers.set(name, [...(this.handlers.get(name) || []), fn]);
      return this;
    }
    emit(name: string, ...args: any[]) {
      for (const fn of this.handlers.get(name) || []) fn(...args);
    }
    removeAllListeners() {
      this.handlers.clear();
    }
  }
  class Connection extends Events {
    open = true;
    other!: Connection;
    send(message: unknown) {
      const copy = structuredClone(message);
      queueMicrotask(() => {
        if (this.other.open) this.other.emit("data", copy);
      });
    }
    close() {
      if (!this.open) return;
      this.open = false;
      this.emit("close");
      if (this.other.open) {
        this.other.open = false;
        this.other.emit("close");
      }
    }
  }
  const peers = new Map<string, FakePeer>();
  let serial = 0;
  class FakePeer extends Events {
    id: string;
    constructor(id?: string) {
      super();
      this.id = id || "guest-" + ++serial;
      peers.set(this.id, this);
      queueMicrotask(() => this.emit("open", this.id));
    }
    connect(id: string) {
      const target = peers.get(id)!,
        a = new Connection(),
        b = new Connection();
      a.other = b;
      b.other = a;
      queueMicrotask(() => {
        if (!target) {
          this.emit("error", { type: "peer-unavailable" });
          return;
        }
        target.emit("connection", b);
        a.emit("open");
      });
      return a;
    }
    destroy() {
      peers.delete(this.id);
    }
  }
  return { FakePeer, peers };
});
vi.mock("peerjs", () => ({ default: network.FakePeer }));
import { TablePeer } from "../src/shared/TablePeer";
import { TableStore, type Seat } from "../src/shared/room-model";
const sessions: TablePeer[] = [];
function open(
  host: boolean,
  store: TableStore,
  seats: Seat[],
  code = "ABCD2345",
) {
  const peer = new TablePeer("ludo", code, store, host, seats);
  sessions.push(peer);
  return peer;
}
async function settle() {
  for (let i = 0; i < 16; i++) await Promise.resolve();
}
beforeEach(() => network.peers.clear());
afterEach(() => {
  for (const peer of sessions.splice(0)) peer.destroy();
});
describe("room transport", () => {
  it("connects all five friends in a six-seat table and accepts seat six moves", async () => {
    const seats: Seat[] = [
      "local",
      "remote",
      "remote",
      "remote",
      "remote",
      "remote",
    ];
    const host = new TableStore();
    host.ensure("position", { turn: 0, ply: 0 });
    open(true, host, seats);
    const guests = Array.from({ length: 5 }, () => new TableStore());
    for (const guest of guests) open(false, guest, seats);
    await settle();
    expect(host.view.ready).toBe(true);
    expect(guests.map((g) => g.view.seat)).toEqual([1, 2, 3, 4, 5]);
    host.setTurn(5, true);
    await settle();
    guests[4].set("position", { turn: 0, ply: 1 });
    await settle();
    expect(host.values.position).toEqual({ turn: 0, ply: 1 });
    for (const guest of guests)
      expect(guest.values.position).toEqual(host.values.position);
  });
  it("assigns distinct remote seats and waits for all friends in a mixed four-player room", async () => {
    const seats: Seat[] = ["local", "remote", "ai", "remote"],
      host = new TableStore(),
      one = new TableStore(),
      two = new TableStore();
    host.ensure("state", { turn: 0 });
    open(true, host, seats);
    open(false, one, seats);
    await settle();
    expect(host.view.ready).toBe(false);
    expect(one.view.seat).toBe(1);
    open(false, two, seats);
    await settle();
    expect(host.view.ready).toBe(true);
    expect(two.view.seat).toBe(3);
    expect(one.view.connected).toEqual([1, 3]);
    host.setTurn(3, true);
    await settle();
    two.set("state", { turn: 0, played: 3 });
    await settle();
    expect(host.values.state).toEqual({ turn: 0, played: 3 });
    expect(one.values.state).toEqual(host.values.state);
    expect(two.values.state).toEqual(host.values.state);
  });
  it("refuses excess guests, pauses on departure and resynchronizes a replacement", async () => {
    const seats: Seat[] = ["local", "remote"],
      host = new TableStore(),
      friend = new TableStore();
    host.ensure("state", { move: 0 });
    open(true, host, seats);
    const peer = open(false, friend, seats);
    await settle();
    const excess = new TableStore();
    open(false, excess, seats);
    await settle();
    expect(excess.view.message).toBe("La sala está completa.");
    expect(excess.view.ready).toBe(false);
    peer.destroy();
    await settle();
    expect(host.view.ready).toBe(false);
    host.set("state", { move: 9 });
    host.flush();
    const returning = new TableStore();
    open(false, returning, seats);
    await settle();
    expect(host.view.ready).toBe(true);
    expect(returning.view.seat).toBe(1);
    expect(returning.values.state).toEqual({ move: 9 });
  });
  it("resynchronizes rejected actions and delivers restart requests", async () => {
    const seats: Seat[] = ["local", "remote"],
      host = new TableStore(),
      friend = new TableStore();
    host.ensure("state", { move: 0 });
    open(true, host, seats);
    const peer = open(false, friend, seats);
    await settle();
    // Simulate a delayed client proposing after the turn has already changed.
    host.setTurn(1, true);
    await settle();
    friend.set("state", { move: 1 });
    host.setTurn(0, true);
    await settle();
    expect(friend.values.state).toEqual({ move: 0 });
    expect(host.values.state).toEqual({ move: 0 });
    peer.requestRestart();
    await settle();
    expect(host.view.message).toContain("El jugador 2 pide una nueva partida");
  });
  it("destroy is idempotent and cannot clear callbacks of a newer session", async () => {
    const host = new TableStore(),
      seats: Seat[] = ["local", "remote"],
      old = open(true, host, seats);
    old.destroy();
    const newer = open(true, host, seats, "NEW12345");
    old.destroy();
    await settle();
    expect(host.onSnapshot).not.toBeNull();
    newer.destroy();
    expect(host.onSnapshot).toBeNull();
  });
});
