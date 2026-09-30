import Peer, { type DataConnection } from "peerjs";
export type WireMessage = {
  v: 1;
  type: "hello" | "move" | "resign" | "offer" | "accept" | "decline" | "claim";
  before?: string;
  ply?: number;
  from?: string;
  to?: string;
  promotion?: string;
};
export class RoomPeer {
  peer: Peer;
  connection: DataConnection | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private hello = false;
  constructor(
    public code: string,
    public host: boolean,
    private onStatus: (s: string) => void,
    private onReady: () => void,
    private onData: (m: WireMessage) => void,
    private onClose: () => void,
  ) {
    onStatus(host ? "Creando sala…" : "Buscando sala…");
    this.peer = host ? new Peer("games-chess-v1-" + code) : new Peer();
    this.timer = setTimeout(() => {
      onStatus("No se ha podido conectar. Prueba otra sala o red.");
      this.destroy();
      onClose();
    }, 25000);
    this.peer.on("open", () => {
      if (host) {
        clearTimeout(this.timer);
        onStatus("Sala abierta. Comparte el código y espera a tu rival.");
      } else {
        this.bind(
          this.peer.connect("games-chess-v1-" + code, { reliable: true }),
        );
      }
    });
    this.peer.on("connection", (conn) => {
      if (!host || this.connection) {
        conn.on("open", () => conn.close());
        return;
      }
      this.bind(conn);
    });
    this.peer.on("error", () => {
      onStatus("La sala no está disponible o esta red impide la conexión.");
      this.destroy();
      onClose();
    });
    this.peer.on("disconnected", () => {
      onStatus("Se ha perdido la conexión con el servicio de salas.");
      onClose();
    });
  }
  private bind(conn: DataConnection) {
    this.connection = conn;
    conn.on("open", () => {
      this.send({ v: 1, type: "hello" });
      this.onStatus("Verificando conexión…");
    });
    conn.on("data", (data) => {
      if (!data || typeof data !== "object") return;
      const m = data as WireMessage;
      if (m.v !== 1) return;
      if (m.type === "hello" && !this.hello) {
        this.hello = true;
        clearTimeout(this.timer);
        this.onStatus("Rival conectado. ¡Que empiece la partida!");
        this.onReady();
      } else if (
        this.hello &&
        ["move", "resign", "offer", "accept", "decline", "claim"].includes(
          m.type,
        )
      )
        this.onData(m);
    });
    conn.on("close", () => {
      this.onStatus("Tu rival se ha desconectado. La partida se ha detenido.");
      this.onClose();
    });
    conn.on("error", () => {
      this.onStatus("Conexión interrumpida. La partida se ha detenido.");
      this.onClose();
    });
  }
  send(message: WireMessage) {
    if (this.connection?.open) this.connection.send(message);
  }
  destroy() {
    clearTimeout(this.timer);
    this.connection?.removeAllListeners();
    this.connection?.close();
    this.peer.removeAllListeners();
    this.peer.destroy();
  }
}
