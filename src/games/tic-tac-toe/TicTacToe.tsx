import { useObservation } from "../../shared/Observation";
import { useMemo, useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useAI } from "../../shared/useAI";
import AIWorker from "./ai.worker?worker";
import { winner, initialContinuous, placeMark } from "./rules";
export default function TicTacToe() {
  const { watching } = useObservation();
  const [state, setState] = useState(initialContinuous),
    [mode, setMode] = useState<"ai" | "local">("ai"),
    [started, setStarted] = useState(false),
    [continuous, setContinuous] = useState(false);
  const win = winner(state.board),
    draw = !continuous && state.board.every(Boolean) && !win,
    over = Boolean(win || draw);
  const input = useMemo(() => ({ state, continuous }), [state, continuous]);
  const { busy, error } = useAI<typeof input, number>(
    AIWorker,
    input,
    started && (watching || (mode === "ai" && state.turn === "O")) && !over,
    (i) => setState((s) => placeMark(s, i, continuous) || s),
  );
  return (
    <GameLayout
      id="tic-tac-toe"
      started={started}
      onStart={() => setStarted(true)}
      onReset={() => {
        setState(initialContinuous());
        setStarted(false);
      }}
      mode={mode}
      setMode={setMode}
      menu={
        <label className="field-label">
          Tipo de partida
          <select
            value={continuous ? "continuous" : "classic"}
            onChange={(e) => setContinuous(e.target.value === "continuous")}
          >
            <option value="classic">Clásica · tablero de nueve casillas</option>
            <option value="continuous">
              Continua · tres marcas por jugador
            </option>
          </select>
        </label>
      }
      status={
        error ||
        (win
          ? "Gana " + win.mark
          : draw
            ? "Empate: ¡bien defendido!"
            : busy
              ? "La IA está pensando…"
              : "Turno de " +
                state.turn +
                (continuous && state.queues[state.turn].length === 3
                  ? " · desaparece la marca más antigua"
                  : ""))
      }
      rules="Alinea tres marcas en horizontal, vertical o diagonal. X comienza. En el modo continuo cada jugador conserva hasta tres marcas: al poner la cuarta en una casilla vacía desaparece su marca más antigua, antes de comprobar la victoria. La marca que desaparecerá se ve atenuada. No hay empate por tablero lleno ni por repetición; se sigue hasta que alguien gane. La IA clásica calcula el final; la continua busca varias jugadas por adelantado."
    >
      <div className="tic-board">
        {state.board.map((mark, i) => (
          <button
            key={i}
            aria-label={"Casilla " + (i + 1) + (mark ? ", " + mark : ", vacía")}
            disabled={
              !started ||
              Boolean(mark) ||
              over ||
              watching ||
              (mode === "ai" && state.turn === "O")
            }
            className={
              (mark || "") +
              (win?.line.includes(i) ? " winning" : "") +
              (continuous &&
              !over &&
              mark === state.turn &&
              state.queues[state.turn].length === 3 &&
              state.queues[state.turn][0] === i
                ? " expiring"
                : "")
            }
            onClick={() => setState((s) => placeMark(s, i, continuous) || s)}
          >
            {mark === "X" ? (
              <svg viewBox="0 0 100 100">
                <path d="M26 26l48 48m0-48L26 74" />
              </svg>
            ) : mark === "O" ? (
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="28" />
              </svg>
            ) : (
              <span />
            )}
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
