import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useObservation } from "../../shared/Observation";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
import { initial, play } from "./rules";
export default function Gomoku() {
  const { watching } = useObservation();
  const [state, setState] = useState(initial),
    [started, setStarted] = useState(false),
    [mode, setMode] = useState<"ai" | "local">("ai");
  const over = Boolean(state.winner),
    ai = watching || (mode === "ai" && state.turn === 2);
  const { busy, error } = useAI(
    Worker,
    state,
    started && ai && !over,
    (i: number) => setState((s) => play(s, i) || s),
  );
  return (
    <GameLayout
      id="gomoku"
      mode={mode}
      setMode={setMode}
      started={started}
      onReset={() => setStarted(false)}
      onStart={() => {
        setState(initial());
        setStarted(true);
      }}
      status={
        error ||
        (over
          ? state.winner === 3
            ? "Empate"
            : "Ganan " + (state.winner === 1 ? "negras" : "blancas")
          : busy
            ? "La IA piensa…"
            : "Turno de " + (state.turn === 1 ? "negras" : "blancas"))
      }
      stats={
        state.pente ? (
          <span className="small-score">
            Capturas {state.captures.join(" / ")}
          </span>
        ) : undefined
      }
      rules="Gomoku libre: cinco o más piedras consecutivas en horizontal, vertical o diagonal ganan. No hay capturas, prohibiciones de doble tres ni apertura Swap2; esas son otras variantes."
    >
      <div
        className="five-board"
        style={{
          gridTemplateColumns: "repeat(" + state.size + ",1fr)",
          gridTemplateRows: "repeat(" + state.size + ",1fr)",
        }}
      >
        {state.board.map((v, i) => (
          <button
            key={i}
            aria-label={
              "Intersección " +
              (Math.floor(i / state.size) + 1) +
              ", " +
              ((i % state.size) + 1) +
              (v ? ", " + (v === 1 ? "negra" : "blanca") : "")
            }
            disabled={!started || ai || over || Boolean(v)}
            onClick={() => setState((s) => play(s, i) || s)}
            className={state.line.includes(i) ? "winning" : ""}
          >
            {v > 0 && (
              <span className={v === 1 ? "stone black" : "stone white"} />
            )}
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
