import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  useCallback,
  type ReactNode,
  type SetStateAction,
  type Dispatch,
  type Context as ReactContext,
} from "react";
import { TableStore, type Seat } from "./room-model";
import { TablePeer, roomCode, cleanCode } from "./TablePeer";
import { Link, LogOut, Globe, Copy } from "lucide-react";
import { supportsTableRoom } from "./playModes";
type Room = {
  store: TableStore;
  peer: TablePeer | null;
  selected: boolean;
  setSelected: (v: boolean) => void;
  open: (host: boolean, code: string, seats: Seat[]) => void;
  leave: () => void;
  game: string;
  initialCode: string;
};
// Keep the provider identity during development refreshes of these shared hooks.
const Context: ReactContext<Room | null> =
  import.meta.hot?.data.tableContext ?? createContext<Room | null>(null);
if (import.meta.hot) import.meta.hot.data.tableContext = Context;
export function TableRoomProvider({
  game,
  children,
}: {
  game: string;
  children: ReactNode;
}) {
  const [store] = useState(() => new TableStore()),
    [peer, setPeer] = useState<TablePeer | null>(null),
    [selected, setSelected] = useState(
      () =>
        supportsTableRoom(game) &&
        !!new URLSearchParams(location.hash.split("?")[1] || "").get("room"),
    );
  const initialCode = cleanCode(
    new URLSearchParams(location.hash.split("?")[1] || "").get("room") || "",
  );
  useEffect(() => () => peer?.destroy(), [peer]);
  const leave = () => {
    peer?.destroy();
    setPeer(null);
    store.disconnect();
    setSelected(false);
  };
  const open = (host: boolean, code: string, seats: Seat[]) => {
    peer?.destroy();
    setPeer(new TablePeer(game, code, store, host, seats));
    setSelected(true);
  };
  return (
    <Context.Provider
      value={{
        store,
        peer,
        selected,
        setSelected,
        open,
        leave,
        game,
        initialCode,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useTableRoom() {
  const room = useContext(Context)!;
  const view = useSyncExternalStore(room.store.subscribe, room.store.readView);
  return {
    ...room,
    ...view,
    machine: (turn: number, fallback: boolean) =>
      room.store.machine(turn, fallback),
    canAct: (turn = view.turn) =>
      !view.online ||
      (view.ready &&
        (view.host
          ? view.seats[turn] === "local"
          : turn === view.seat && view.turn === view.seat)),
    runner: !view.online || (view.host && view.ready),
  };
}
export function useRoomState<T>(
  key: string,
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const room = useContext(Context)!;
  const [first] = useState(initial);
  room.store.ensure(key, first);
  const value = useSyncExternalStore(
    room.store.subscribe,
    () => room.store.values[key] as T,
  );
  const set = useCallback(
    (next: SetStateAction<T>) => room.store.set(key, next),
    [room.store, key],
  );
  return [value, set];
}
export function SeatOptions({
  count,
  mode,
  humans,
  onHumans,
}: {
  count: number;
  mode: string;
  humans?: number;
  onHumans?: (n: number) => void;
}) {
  const room = useTableRoom();
  if (room.selected || count <= 2 || mode === "solo" || !onHumans) return null;
  const seats: Seat[] = room.localConfigured
    ? room.seats
    : Array.from({ length: count }, (_, i) =>
        i < (mode === "local" ? count : (humans ?? 1)) ? "local" : "ai",
      );
  return (
    <>
      <label className="field-label">
        Personas en este dispositivo
        <select
          value={seats.filter((s) => s === "local").length}
          onChange={(e) => {
            const n = Number(e.target.value);
            room.store.setLocalSeats(
              Array.from({ length: count }, (_, i) => (i < n ? "local" : "ai")),
            );
            onHumans(n);
          }}
        >
          {Array.from({ length: count }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
              {i + 1 < count ? ` · ${count - i - 1} IA` : " · sin IA"}
            </option>
          ))}
        </select>
      </label>
      <div className="room-seats" aria-label="Reparto de jugadores locales">
        {seats.map((s, i) => (
          <label key={i}>
            Jugador {i + 1}
            <select
              aria-label={`Jugador local ${i + 1}`}
              value={s}
              disabled={i === 0}
              onChange={(e) => {
                const next = seats.map((v, j) =>
                  j === i ? (e.target.value as Seat) : v,
                );
                room.store.setLocalSeats(next);
                onHumans(next.filter((v) => v === "local").length);
              }}
            >
              <option value="local">Persona en este dispositivo</option>
              <option value="ai">Inteligencia artificial</option>
            </select>
          </label>
        ))}
      </div>
    </>
  );
}
export function RoomSetup({
  players,
  onLocal,
}: {
  players: number;
  onLocal: () => void;
}) {
  const r = useTableRoom(),
    [code, setCode] = useState(r.initialCode),
    [note, setNote] = useState(""),
    [slots, setSlots] = useState<Seat[]>(
      Array.from({ length: players }, (_, i) =>
        i === 0 ? "local" : i === 1 ? "remote" : "ai",
      ),
    );
  useEffect(() => {
    if (!r.online)
      setSlots(
        Array.from({ length: players }, (_, i) =>
          i === 0 ? "local" : i === 1 ? "remote" : "ai",
        ),
      );
  }, [players, r.online]);
  const share =
    location.origin + location.pathname + "#" + r.game + "?room=" + r.code;
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNote("Copiado.");
    } catch {
      setNote("Selecciona el código o el enlace para copiarlo.");
    }
  };
  return (
    <section className="table-room-setup" aria-label="Sala con amigos">
      <p className="setup-note">
        Una persona crea la sala. Los amigos entran con el código o el enlace.
        Mantén abierta esta pestaña durante la partida.
      </p>
      {!r.online ? (
        <>
          <div className="room-seats">
            {slots.map((s, i) => (
              <label key={i}>
                Jugador {i + 1}
                <select
                  aria-label={`Puesto ${i + 1}`}
                  value={s}
                  disabled={i === 0}
                  onChange={(e) =>
                    setSlots((a) =>
                      a.map((v, j) => (i === j ? (e.target.value as Seat) : v)),
                    )
                  }
                >
                  <option value="local">Este dispositivo</option>
                  {i > 0 && (
                    <>
                      <option value="remote">Amigo online</option>
                      <option value="ai">Inteligencia artificial</option>
                    </>
                  )}
                </select>
              </label>
            ))}
          </div>
          <button
            className="primary full"
            disabled={!slots.includes("remote")}
            onClick={() => {
              onLocal();
              r.open(true, roomCode(), slots);
            }}
          >
            <Globe size={18} /> Crear sala
          </button>
          <label className="field-label">
            Código de sala
            <input
              aria-label="Código de sala"
              autoComplete="off"
              value={code}
              maxLength={16}
              onChange={(e) => setCode(cleanCode(e.target.value))}
            />
          </label>
          <button
            className="secondary full"
            disabled={cleanCode(code).length !== 8}
            onClick={() => {
              onLocal();
              r.open(false, cleanCode(code), slots);
            }}
          >
            Entrar en sala
          </button>
        </>
      ) : (
        <>
          <strong className="room-code" aria-label="Código de tu sala">
            {r.code}
          </strong>
          <div className="room-share">
            <button onClick={() => copy(r.code)}>
              <Copy size={16} /> Copiar código
            </button>
            <button onClick={() => copy(share)}>
              <Link size={16} /> Copiar enlace
            </button>
          </div>
          <ul className="room-roster">
            {r.seats.map((s, i) => (
              <li key={i}>
                Jugador {i + 1} ·{" "}
                {s === "ai"
                  ? "IA"
                  : s === "local"
                    ? "Anfitrión / local"
                    : r.connected.includes(i)
                      ? "Amigo conectado"
                      : "Esperando amigo"}
                {!r.host && r.seat === i ? " · tú" : ""}
              </li>
            ))}
          </ul>
          <p role="status">{r.message}</p>
          <button className="text-button" onClick={r.leave}>
            <LogOut size={16} /> Salir de la sala
          </button>
        </>
      )}
      {note && <p role="status">{note}</p>}
    </section>
  );
}
export function RoomControls() {
  const r = useTableRoom();
  if (!r.online) return null;
  return (
    <span className="room-controls">
      <Globe size={15} />
      <span>
        {r.host
          ? "Sala " + r.code
          : r.seat < 0
            ? "Conectando…"
            : "Jugador " + (r.seat + 1)}
      </span>
      <button
        className="icon-button"
        aria-label="Salir de la sala"
        onClick={r.leave}
      >
        <LogOut size={16} />
      </button>
    </span>
  );
}
