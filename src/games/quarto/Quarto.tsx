import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
import QuartoPiece from "./QuartoPiece";
import { initial, apply, pieceName, type Action } from "./rules";
export default function Quarto() {
  const [state, setState] = useState(() => initial()),
    [started, setStarted] = useState(false),
    [mode, setMode] = useState<"ai" | "local">("ai"),
    [automatic, setAutomatic] = useState(true),
    [message, setMessage] = useState("");
  const over = state.winner !== null,
    canPlay = started && !over && !(mode === "ai" && state.turn === 2);
  const move = (a: Action) => {
    const n = apply(state, a);
    if (n) {
      setState(n);
      setMessage("");
    } else setMessage("No hay una alineación que permita cantar Quarto.");
  };
  const { busy, error } = useAI(
    Worker,
    state,
    started && mode === "ai" && state.turn === 2 && !over,
    (a: Action | null) => {
      if (a) move(a);
    },
  );
  return (
    <GameLayout
      id="quarto"
      started={started}
      onStart={() => {
        setState(initial(automatic));
        setStarted(true);
      }}
      onReset={() => {
        setStarted(false);
        setMessage("");
      }}
      mode={mode}
      setMode={setMode}
      menu={
        <label className="field-label">
          Reconocer victoria
          <select
            value={automatic ? "auto" : "manual"}
            onChange={(e) => setAutomatic(e.target.value === "auto")}
          >
            <option value="auto">Anunciar Quarto automáticamente</option>
            <option value="manual">Hay que cantar Quarto</option>
          </select>
        </label>
      }
      status={
        error ||
        message ||
        (over
          ? state.winner === 0
            ? "Empate"
            : "Gana jugador " + state.winner
          : busy
            ? "La IA está eligiendo…"
            : "Jugador " +
              state.turn +
              " · " +
              (state.phase === "gift"
                ? "elige una pieza para el rival"
                : "coloca la pieza recibida"))
      }
      controls={
        <>
          {state.held !== null && (
            <span className="held-quarto">
              <QuartoPiece piece={state.held} />
              <small>Pieza recibida</small>
            </span>
          )}
          {!automatic && (
            <button
              disabled={!canPlay}
              onClick={() => move({ kind: "claim", value: 0 })}
            >
              ¡Quarto!
            </button>
          )}
          {!automatic &&
            state.pending &&
            state.board.every((v) => v !== null) && (
              <button
                disabled={!canPlay}
                onClick={() => move({ kind: "pass", value: 0 })}
              >
                Pasar sin cantar
              </button>
            )}
        </>
      }
      rules="Quarto: dieciséis piezas únicas combinan claro/oscuro, redondo/cuadrado, alto/bajo y hueco/macizo. En tu turno eliges la pieza que el rival debe colocar; después el rival te entrega la siguiente. Gana quien coloca cuatro piezas con al menos un atributo común en una fila, columna o diagonal, aunque las anteriores las haya puesto otra persona. En modo automático el sistema anuncia Quarto por ti. En modo manual debes cantar Quarto antes de entregar la siguiente pieza; si lo olvidas el rival puede cantarlo antes de colocar. Si ambos lo pasan por alto, ese alineamiento deja de contar. Sin cuadrados adicionales. IA táctica que aprovecha victorias y evita regalar piezas que completan líneas."
    >
      <div className="quarto-table">
        <div className="quarto-board">
          {state.board.map((v, i) => (
            <button
              key={i}
              aria-label={
                "Casilla " +
                (i + 1) +
                (v !== null ? ", pieza " + pieceName(v) : ", vacía")
              }
              disabled={!canPlay || state.phase !== "place" || v !== null}
              onClick={() => move({ kind: "place", value: i })}
            >
              {v !== null && <QuartoPiece piece={v} />}
            </button>
          ))}
        </div>
        <div className="quarto-reserve">
          <small>ENTREGA UNA PIEZA</small>
          <div>
            {Array.from({ length: 16 }, (_, v) => (
              <button
                key={v}
                aria-label={"Entregar pieza " + pieceName(v)}
                disabled={
                  !canPlay ||
                  state.phase !== "gift" ||
                  !state.available.includes(v)
                }
                className={state.available.includes(v) ? "" : "used"}
                onClick={() => move({ kind: "gift", value: v })}
              >
                <QuartoPiece piece={v} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
