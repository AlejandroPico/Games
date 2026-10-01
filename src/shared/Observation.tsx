import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTableRoom } from "./TableRoom";
import { Eye, Pause, Play } from "lucide-react";

type Observation = {
  watching: boolean;
  paused: boolean;
  delay: number;
  setWatching: (v: boolean) => void;
  setPaused: (v: boolean) => void;
  setDelay: (v: number) => void;
};
const Context = createContext<Observation>({
  watching: false,
  paused: false,
  delay: 900,
  setWatching: () => {},
  setPaused: () => {},
  setDelay: () => {},
});
export function ObservationProvider({ children }: { children: ReactNode }) {
  const [watching, setWatching] = useState(false),
    [paused, setPaused] = useState(false),
    [delay, setDelay] = useState(900);
  return (
    <Context.Provider
      value={{
        watching,
        paused,
        delay,
        setWatching: (v) => {
          setWatching(v);
          setPaused(false);
        },
        setPaused,
        setDelay,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useObservation = () => useContext(Context);
export function ObservationChoice({
  disabled = false,
  onChoose,
}: {
  disabled?: boolean;
  onChoose?: () => void;
}) {
  const o = useObservation();
  return (
    <button
      type="button"
      disabled={disabled}
      className={o.watching ? "selected" : ""}
      aria-pressed={o.watching}
      onClick={() => {
        onChoose?.();
        o.setWatching(!o.watching);
      }}
    >
      <Eye size={20} /> Solo inteligencia artificial
    </button>
  );
}
export function ObservationControls() {
  const o = useObservation();
  if (!o.watching) return null;
  return (
    <div className="observation-controls">
      <span>Solo IA</span>
      <button
        className="icon-button"
        aria-label={o.paused ? "Continuar la IA" : "Pausar la IA"}
        onClick={() => o.setPaused(!o.paused)}
      >
        {o.paused ? <Play size={18} /> : <Pause size={18} />}
      </button>
      <select
        aria-label="Velocidad de la IA"
        value={o.delay}
        onChange={(e) => o.setDelay(Number(e.target.value))}
      >
        <option value={350}>Rápida</option>
        <option value={900}>Normal</option>
        <option value={1800}>Lenta</option>
      </select>
    </div>
  );
}
/** A cancellable, paced action. Its key changes only when a position changes. */
export function useAutoplay(
  enabled: boolean,
  key: unknown,
  action: () => void,
  normalDelay = 600,
) {
  const o = useObservation(),
    callback = useRef(action);
  callback.current = action;
  const room = useTableRoom();
  const active = enabled && (!o.watching || !o.paused) && room.runner,
    delay = o.watching ? o.delay : normalDelay;
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => callback.current(), delay);
    return () => clearTimeout(timer);
  }, [active, key, delay]);
}
