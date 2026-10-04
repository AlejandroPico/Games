import { useRoomState, useTableRoom, SeatOptions } from "./TableRoom";
import { useAutoplay, useObservation } from "./Observation";
import { useRef, useEffect, type ReactNode } from "react";
/** Shared lifecycle only. Every game's moves and rules remain in its own module. */
export function useMatch<T>(
  initial: (players: number) => T,
  defaultPlayers = 2,
) {
  const [state, setState] = useRoomState<T>("position", () =>
    initial(defaultPlayers),
  );
  const [started, setStarted] = useRoomState("started", false);
  const [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai");
  const [players, setPlayers] = useRoomState("players", defaultPlayers);
  const [humans, setHumans] = useRoomState("humans", 1);
  const room = useTableRoom(),
    observation = useObservation();
  const machine = (actor: number) =>
    observation.watching ||
    room.machine(actor, mode === "ai" && actor >= humans);
  return {
    state,
    setState,
    started,
    mode,
    setMode,
    players,
    setPlayers,
    humans,
    setHumans,
    machine,
    room,
    start: () => {
      setState(initial(players));
      setStarted(true);
    },
    reset: () => setStarted(false),
    seats: (
      <SeatOptions
        count={players}
        mode={observation.watching ? "solo" : mode}
        humans={humans}
        onHumans={setHumans}
      />
    ),
  };
}
export function useMatchAI<T>(
  match: ReturnType<typeof useMatch<T>>,
  actor: number,
  finished: boolean,
  move: (state: T) => T,
  workerFactory?: () => Worker,
) {
  const ai = match.machine(actor);
  const worker = useRef<Worker | null>(null),
    observation = useObservation();
  useEffect(
    () => () => {
      worker.current?.terminate();
      worker.current = null;
    },
    [
      match.state,
      match.started,
      ai,
      finished,
      observation.paused,
      observation.delay,
      match.room.runner,
    ],
  );
  useAutoplay(match.started && !finished && ai, match.state, () => {
    if (!workerFactory) {
      match.setState((s) => move(s));
      return;
    }
    const original = match.state;
    try {
      const current = workerFactory();
      worker.current = current;
      current.onmessage = (e: MessageEvent<T>) => {
        if (worker.current !== current) return;
        match.setState((s) => (s === original ? e.data : s));
        current.terminate();
        worker.current = null;
      };
      current.onerror = () => {
        if (worker.current === current) {
          current.terminate();
          worker.current = null;
          match.setState((s) => (s === original ? move(s) : s));
        }
      };
      current.postMessage(original);
    } catch {
      match.setState((s) => (s === original ? move(s) : s));
    }
  });
  return ai;
}
export function PlayerSelect({
  value,
  onChange,
  choices = [2, 3, 4],
}: {
  value: number;
  onChange: (n: number) => void;
  choices?: number[];
}) {
  return (
    <label>
      Participantes
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {choices.map((n) => (
          <option key={n} value={n}>
            {n} participantes
          </option>
        ))}
      </select>
    </label>
  );
}
export function ScoreStrip({
  scores,
  turn,
  children,
}: {
  scores: (number | null)[];
  turn?: number;
  children?: ReactNode;
}) {
  return (
    <div className="repertoire-scores">
      {scores.map((score, i) => (
        <span key={i} className={turn === i ? "active" : ""}>
          J{i + 1} <b>{score ?? "—"}</b>
        </span>
      ))}
      {children}
    </div>
  );
}
