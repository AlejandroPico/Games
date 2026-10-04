import Peer, { type DataConnection } from "peerjs";
import {
  TableStore,
  type Snapshot,
  type Proposal,
  type Seat,
  safePatch,
  MAX_TABLE_SEATS,
} from "./room-model";
const protocol = 2;
const prefix = (game: string, code: string) =>
  `games-table-v${protocol}-${game}-${code}`;
export const roomCode = () => {
  const data = new Uint8Array(8);
  crypto.getRandomValues(data);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(data, (n) => alphabet[n % alphabet.length]).join("");
};
export const cleanCode = (text: string) =>
  text
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
type Message = {
  v: number;
  game: string;
  type: string;
  seat?: number;
  snapshot?: Snapshot;
  proposal?: Proposal;
  text?: string;
};
export class TablePeer {
  private peer: Peer;
  private connections = new Map<number, DataConnection>();
  private pendingConnections = new Set<DataConnection>();
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private destroyed = false;
  constructor(
    private game: string,
    code: string,
    private store: TableStore,
    host: boolean,
    seats: Seat[],
  ) {
    store.configure(
      {
        online: true,
        host,
        ready: false,
        code,
        seats,
        connected: [],
        seat: host ? 0 : -1,
        message: host ? "Creando sala…" : "Buscando sala…",
      },
      false,
    );
    this.peer = host ? new Peer(prefix(game, code)) : new Peer();
    store.onSnapshot = (s) => {
      if (host)
        for (const [seat, conn] of this.connections)
          this.send(conn, { type: "snapshot", snapshot: s, seat });
    };
    store.onProposal = (p) => {
      if (!host) {
        const conn = this.connections.get(0);
        if (conn) this.send(conn, { type: "proposal", proposal: p });
      }
    };
    this.peer.on("open", () => {
      if (host) {
        store.configure({
          message: "Sala abierta. Comparte el código o el enlace.",
          ready: false,
        });
        this.updateReady();
      } else
        this.bindGuest(
          this.peer.connect(prefix(game, code), { reliable: true }),
        );
    });
    this.peer.on("connection", (conn) => {
      if (host) this.bindHost(conn);
      else conn.close();
    });
    this.peer.on("error", (e) => {
      if (this.destroyed) return;
      store.configure(
        {
          ready: false,
          message:
            e.type === "unavailable-id"
              ? "Este código ya está en uso. Crea otra sala."
              : "No se pudo conectar a la sala. Comprueba el código y la conexión.",
        },
        false,
      );
    });
    this.peer.on("disconnected", () => {
      if (!this.destroyed)
        store.configure({
          ready: false,
          message: "Se perdió el servicio de salas. La partida se ha detenido.",
        });
    });
  }
  private timeout(fn: () => void, ms = 25000) {
    const t = setTimeout(() => {
      this.timers.delete(t);
      fn();
    }, ms);
    this.timers.add(t);
    return t;
  }
  private send(conn: DataConnection, part: Omit<Message, "v" | "game">) {
    if (conn.open) conn.send({ v: protocol, game: this.game, ...part });
  }
  private parse(data: unknown): Message | null {
    if (!data || typeof data !== "object") return null;
    const m = data as Message;
    if (
      m.v !== protocol ||
      m.game !== this.game ||
      ![
        "hello",
        "welcome",
        "snapshot",
        "proposal",
        "reject",
        "request-restart",
        "refused",
      ].includes(m.type)
    )
      return null;
    try {
      if (JSON.stringify(m).length > 1100000) return null;
    } catch {
      return null;
    }
    return m;
  }
  private updateReady() {
    const connected = [...this.connections.keys()].sort();
    const missing = this.store.view.seats.some(
      (s, i) => s === "remote" && !connected.includes(i),
    );
    this.store.configure({
      connected,
      ready: !missing,
      message: missing
        ? "Esperando a tus amigos. La mesa se pausa hasta que estén todos."
        : "Todos conectados. El anfitrión puede empezar.",
    });
  }
  private bindHost(conn: DataConnection) {
    this.pendingConnections.add(conn);
    let seat = -1,
      hello = false;
    const timer = this.timeout(() => {
      if (!hello) conn.close();
    });
    conn.on("data", (data) => {
      const m = this.parse(data);
      if (!m) return;
      if (m.type === "hello" && !hello) {
        seat = this.store.view.seats.findIndex(
          (s, i) => s === "remote" && !this.connections.has(i),
        );
        if (seat < 0) {
          this.send(conn, { type: "refused", text: "La sala está completa." });
          this.timeout(() => conn.close(), 300);
          return;
        }
        hello = true;
        clearTimeout(timer);
        this.timers.delete(timer);
        this.pendingConnections.delete(conn);
        this.connections.set(seat, conn);
        this.store.flush();
        this.send(conn, {
          type: "welcome",
          seat,
          snapshot: this.store.snapshot(),
        });
        this.updateReady();
      } else if (
        hello &&
        m.type === "proposal" &&
        m.proposal &&
        Number.isSafeInteger(m.proposal.base) &&
        safePatch(m.proposal.patch)
      ) {
        if (!this.store.accept(seat, m.proposal))
          this.send(conn, {
            type: "reject",
            snapshot: this.store.snapshot(),
            seat,
          });
      } else if (hello && m.type === "request-restart") {
        this.store.configure({
          message: `El jugador ${seat + 1} pide una nueva partida. El anfitrión puede reiniciarla.`,
        });
      }
    });
    const close = () => {
      clearTimeout(timer);
      this.timers.delete(timer);
      this.pendingConnections.delete(conn);
      if (seat >= 0 && this.connections.get(seat) === conn)
        this.connections.delete(seat);
      if (!this.destroyed) this.updateReady();
    };
    conn.on("close", close);
    conn.on("error", close);
  }
  private bindGuest(conn: DataConnection) {
    this.connections.set(0, conn);
    let welcomed = false;
    const timer = this.timeout(() => {
      if (!welcomed)
        this.store.configure(
          {
            ready: false,
            message: "La sala no responde. Prueba otra sala o red.",
          },
          false,
        );
    });
    conn.on("open", () => this.send(conn, { type: "hello" }));
    conn.on("data", (data) => {
      const m = this.parse(data);
      if (!m) return;
      if (m.type === "refused") {
        this.store.configure(
          { ready: false, message: m.text || "No se puede entrar." },
          false,
        );
        return;
      }
      if (
        ["welcome", "snapshot", "reject"].includes(m.type) &&
        m.snapshot &&
        Number.isInteger(m.seat) &&
        m.seat! >= 1 &&
        m.seat! < MAX_TABLE_SEATS
      ) {
        welcomed = true;
        clearTimeout(timer);
        this.timers.delete(timer);
        if (m.type === "reject") this.store.rejected(m.snapshot, m.seat!);
        else this.store.receive(m.snapshot, m.seat!);
      }
    });
    const close = () => {
      if (!this.destroyed)
        this.store.configure(
          {
            ready: false,
            message:
              "El anfitrión se ha desconectado. La partida se ha detenido.",
          },
          false,
        );
    };
    conn.on("close", close);
    conn.on("error", close);
  }
  requestRestart() {
    const c = this.connections.get(0);
    if (c) this.send(c, { type: "request-restart" });
  }
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const t of this.timers) clearTimeout(t);
    for (const c of [
      ...this.connections.values(),
      ...this.pendingConnections,
    ]) {
      c.removeAllListeners();
      c.close();
    }
    this.connections.clear();
    this.pendingConnections.clear();
    this.peer.removeAllListeners();
    this.peer.destroy();
    this.store.onSnapshot = null;
    this.store.onProposal = null;
  }
}
