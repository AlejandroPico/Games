import { useObservation } from "../../shared/Observation";
import AIWorker from "./ai.worker?worker";
import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useAI } from "../../shared/useAI";
import { initial, sow, legal, type State } from "./rules";
export default function Mancala() {
  const { watching } = useObservation();
  const [state, setState] = useState(initial),
    [started, setStarted] = useState(false),
    [mode, setMode] = useState<"ai" | "local">("ai");
  const { busy, error } = useAI<State, number>(
    AIWorker,
    state,
    started && (watching || (mode === "ai" && state.turn === 2)) && !state.over,
    (pit) => {
      const next = sow(state, pit);
      if (next) setState(next);
    },
  );
  const status = state.over
    ? state.pits[6] === state.pits[13]
      ? "Empate"
      : state.pits[6] > state.pits[13]
        ? "Gana el jugador 1"
        : "Gana " + (mode === "ai" ? "la IA" : "el jugador 2")
    : busy
      ? "La IA está sembrando…"
      : "Turno del jugador " + state.turn;
  const pit = (i: number) => (
    <button
      key={i}
      disabled={
        !started ||
        busy ||
        !legal(state).includes(i) ||
        watching ||
        (mode === "ai" && state.turn === 2)
      }
      aria-label={
        "Cuenco " +
        (i < 6 ? i + 1 : i - 6) +
        ", jugador " +
        (i < 6 ? 1 : 2) +
        ", " +
        state.pits[i] +
        " semillas"
      }
      className={
        "mancala-pit " + (legal(state).includes(i) && started ? "legal" : "")
      }
      onClick={() => {
        const next = sow(state, i);
        if (next) setState(next);
      }}
    >
      <div>
        {Array.from({ length: Math.min(state.pits[i], 14) }, (_, j) => (
          <i
            key={j}
            style={{
              left: 18 + ((j * 19) % 62) + "%",
              top: 17 + ((j * 29) % 61) + "%",
              background: ["#dcaf70", "#9a6652", "#799793", "#c7be91"][j % 4],
            }}
          />
        ))}
      </div>
      <b>{state.pits[i]}</b>
    </button>
  );
  return (
    <GameLayout
      id="mancala"
      started={started}
      onStart={() => setStarted(true)}
      onReset={() => {
        setState(initial());
        setStarted(false);
      }}
      mode={mode}
      setMode={setMode}
      status={error || status}
      stats={
        <div className="score-pair">
          <span>
            Jugador 1 <b>{state.pits[6]}</b>
          </span>
          <span>
            {mode === "ai" ? "IA" : "Jugador 2"} <b>{state.pits[13]}</b>
          </span>
        </div>
      }
      rules="Variante Kalah: toma todas las semillas de un cuenco de tu lado y repártelas en sentido antihorario, una por cuenco. Saltas el almacén rival. Si la última cae en tu almacén, repites. Si cae en un cuenco vacío tuyo, capturas las semillas del opuesto y la última. Cuando un lado queda vacío, el otro recoge sus semillas. Gana quien tenga más."
    >
      <div className="mancala-table">
        <div className="mancala-store">
          <span>J2</span>
          <strong>{state.pits[13]}</strong>
        </div>
        <div className="mancala-pits">
          <div>{[12, 11, 10, 9, 8, 7].map(pit)}</div>
          <div>{[0, 1, 2, 3, 4, 5].map(pit)}</div>
        </div>
        <div className="mancala-store">
          <span>J1</span>
          <strong>{state.pits[6]}</strong>
        </div>
      </div>
      <div className="stage-caption">
        Semilla a semilla, una estrategia milenaria.
      </div>
    </GameLayout>
  );
}
