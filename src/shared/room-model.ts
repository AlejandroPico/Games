export type Seat = "local" | "remote" | "ai";
export const MAX_TABLE_SEATS = 8;
export type RoomView = {
  online: boolean;
  host: boolean;
  seat: number;
  code: string;
  ready: boolean;
  seats: Seat[];
  connected: number[];
  turn: number;
  message: string;
  revision: number;
  started: boolean;
  localConfigured: boolean;
};
export type Snapshot = { values: Record<string, unknown>; view: RoomView };
export type Proposal = { base: number; patch: Record<string, unknown> };
const initialView = (): RoomView => ({
  online: false,
  host: true,
  seat: 0,
  code: "",
  ready: true,
  seats: ["local", "ai"],
  connected: [],
  turn: 0,
  message: "",
  revision: 0,
  started: false,
  localConfigured: false,
});
const plain = (v: unknown): v is Record<string, unknown> =>
  !!v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.getPrototypeOf(v) === Object.prototype;
export function safePatch(value: unknown): value is Record<string, unknown> {
  if (!plain(value) || Object.keys(value).length > 60) return false;
  if (
    Object.keys(value).some(
      (k) =>
        !/^\w{1,40}$/.test(k) ||
        ["__proto__", "prototype", "constructor"].includes(k),
    )
  )
    return false;
  try {
    const text = JSON.stringify(value);
    return text.length <= 1000000 && !text.includes('"__proto__"');
  } catch {
    return false;
  }
}
export function ownsTurn(view: RoomView, seat = view.seat) {
  if (!view.online) return true;
  if (!view.ready) return false;
  return view.host
    ? view.seats[view.turn] === "local"
    : view.turn === seat && view.seats[seat] === "remote";
}
/** One transaction per event, ordered by the host. No browser DOM is transmitted. */
export class TableStore {
  values: Record<string, unknown> = {};
  view = initialView();
  private listeners = new Set<() => void>();
  private pending: Record<string, unknown> = {};
  private base = 0;
  private queued = false;
  private optimistic = false;
  private sent: Record<string, unknown> = {};
  private deferred: Record<string, unknown> = {};
  private confirmed: Snapshot | null = null;
  onSnapshot: ((s: Snapshot) => void) | null = null;
  onProposal: ((p: Proposal) => void) | null = null;
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  readView = () => this.view;
  notify = () => {
    for (const fn of this.listeners) fn();
  };
  ensure(key: string, value: unknown) {
    if (!(key in this.values)) this.values[key] = value;
  }
  set(key: string, update: unknown | ((v: unknown) => unknown)) {
    if (this.view.online && !this.view.host && !ownsTurn(this.view)) return;
    const next =
      typeof update === "function"
        ? (update as (v: unknown) => unknown)(this.values[key])
        : update;
    if (Object.is(next, this.values[key])) return;
    if (this.view.online && !this.view.host && this.optimistic) {
      this.values = { ...this.values, [key]: next };
      this.deferred[key] = next;
      this.notify();
      return;
    }
    if (!this.queued) {
      this.base = this.view.revision;
      this.queued = true;
      queueMicrotask(() => this.flush());
    }
    this.values = { ...this.values, [key]: next };
    this.pending[key] = next;
    this.notify();
  }
  flush() {
    if (!this.queued) return;
    this.queued = false;
    const patch = this.pending;
    this.pending = {};
    if (!Object.keys(patch).length) return;
    if (this.view.online && !this.view.host) {
      this.optimistic = true;
      this.sent = patch;
      this.onProposal?.({ base: this.base, patch });
      return;
    }
    this.view = { ...this.view, revision: this.view.revision + 1 };
    this.notify();
    this.onSnapshot?.(this.snapshot());
  }
  snapshot(): Snapshot {
    return { values: this.values, view: this.view };
  }
  configure(changes: Partial<RoomView>, broadcast = true) {
    this.view = { ...this.view, ...changes };
    this.notify();
    if (broadcast && this.view.host) this.onSnapshot?.(this.snapshot());
  }
  setTurn(turn: number, started: boolean) {
    if (this.view.online && !this.view.host) return;
    if (this.view.turn === turn && this.view.started === started) return;
    this.configure({ turn, started });
  }
  setCount(n: number) {
    if (this.view.online || this.view.seats.length === n) return;
    this.configure(
      {
        seats: Array.from({ length: n }, (_, i) => this.view.seats[i] || "ai"),
      },
      false,
    );
  }
  preset(mode: "ai" | "local", n: number) {
    this.configure(
      {
        seats: Array.from({ length: n }, (_, i) =>
          mode === "local" || i === 0 ? "local" : "ai",
        ),
      },
      false,
    );
  }
  machine(turn: number, fallback: boolean) {
    return this.view.online || this.view.localConfigured
      ? this.view.seats[turn] === "ai"
      : fallback;
  }
  setLocalSeats(seats: Seat[]) {
    if (
      this.view.online ||
      seats.length < 2 ||
      seats.length > MAX_TABLE_SEATS ||
      seats[0] !== "local" ||
      seats.some((s) => s !== "local" && s !== "ai")
    )
      return;
    this.configure({ seats, localConfigured: true }, false);
  }
  accept(seat: number, proposal: Proposal): boolean {
    this.flush();
    if (
      !this.view.online ||
      !this.view.host ||
      !this.view.ready ||
      proposal.base !== this.view.revision ||
      seat !== this.view.turn ||
      this.view.seats[seat] !== "remote" ||
      !safePatch(proposal.patch) ||
      Object.keys(proposal.patch).some((k) => !(k in this.values))
    )
      return false;
    this.values = { ...this.values, ...proposal.patch };
    this.view = { ...this.view, revision: this.view.revision + 1 };
    this.notify();
    this.onSnapshot?.(this.snapshot());
    return true;
  }
  receive(s: Snapshot, seat: number) {
    if (
      !s ||
      !s.view ||
      s.view.online !== true ||
      !safePatch(s.values) ||
      !Array.isArray(s.view.seats) ||
      s.view.seats.length < 2 ||
      s.view.seats.length > MAX_TABLE_SEATS ||
      !s.view.seats.every((v) => ["local", "remote", "ai"].includes(v)) ||
      !Number.isInteger(seat) ||
      s.view.seats[seat] !== "remote" ||
      !Number.isInteger(s.view.turn) ||
      s.view.turn < 0 ||
      s.view.turn >= s.view.seats.length ||
      !Number.isSafeInteger(s.view.revision) ||
      s.view.revision < this.view.revision
    )
      return;
    this.confirmed = s;
    this.view = { ...s.view, host: false, seat };
    if (
      this.optimistic &&
      s.view.revision === this.base &&
      ownsTurn(this.view)
    ) {
      this.values = { ...s.values, ...this.sent, ...this.deferred };
      this.notify();
      return;
    }
    const deferred = ownsTurn(this.view) ? this.deferred : {};
    this.deferred = {};
    this.sent = {};
    this.optimistic = false;
    this.values = { ...s.values };
    for (const [key, value] of Object.entries(deferred)) this.set(key, value);
    this.notify();
  }
  rejected(s: Snapshot, seat: number) {
    this.optimistic = false;
    this.sent = {};
    this.deferred = {};
    this.receive(s, seat);
  }
  disconnect() {
    this.onSnapshot = null;
    this.onProposal = null;
    this.optimistic = false;
    this.sent = {};
    this.deferred = {};
    this.pending = {};
    this.queued = false;
    if (this.confirmed) {
      this.values = { ...this.confirmed.values };
      this.confirmed = null;
    }
    this.configure(
      {
        ...initialView(),
        seats: this.view.seats.map((v) => (v === "remote" ? "local" : v)),
      },
      false,
    );
  }
}
