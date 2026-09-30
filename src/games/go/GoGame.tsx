import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useAI } from "../../shared/useAI";
import AIWorker from "./ai.worker?worker";
import { initial, play, pass, group, score, type State } from "./rules";
export default function GoGame() {
  const [size, setSize] = useState(9),
    [state, setState] = useState(() => initial()),
    [started, setStarted] = useState(false),
    [mode, setMode] = useState<"ai" | "local">("ai"),
    [dead, setDead] = useState<number[]>([]),
    [approved, setApproved] = useState<number[]>([]),
    [notice, setNotice] = useState("");
  const { busy, error } = useAI<State, number | null>(
    AIWorker,
    state,
    started && mode === "ai" && state.turn === 2 && state.phase === "play",
    (i) => setState((s) => (i === null ? pass(s) : play(s, i) || pass(s))),
  );
  const result = score(state, dead),
    winner = result.points[0] > result.points[1] ? "Negras" : "Blancas";
  const click = (i: number) => {
    if (
      !started ||
      state.phase === "over" ||
      busy ||
      (mode === "ai" && state.turn === 2 && state.phase === "play")
    )
      return;
    if (state.phase === "scoring") {
      if (!state.board[i]) return;
      const indices = [...group(state.board, i, state.size).stones];
      setDead((v) =>
        v.includes(i)
          ? v.filter((k) => !indices.includes(k))
          : [...v, ...indices],
      );
      setApproved([]);
      return;
    }
    const next = play(state, i);
    if (next) {
      setState(next);
      setNotice("");
    } else
      setNotice("Jugada ilegal: ocupación, suicidio o repetición del tablero.");
  };
  const confirm = () => {
    if (mode === "ai" || approved.length === 1) {
      setState((s) => ({ ...s, phase: "over" }));
      return;
    }
    setApproved([1]);
  };
  return (
    <GameLayout
      id="go"
      started={started}
      onStart={() => {
        setState(initial(size));
        setDead([]);
        setApproved([]);
        setStarted(true);
      }}
      onReset={() => {
        setStarted(false);
        setNotice("");
      }}
      mode={mode}
      setMode={setMode}
      menu={
        <label className="field-label">
          Tablero
          <select
            aria-label="Tamaño del tablero"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            <option value={9}>9 × 9</option>
            <option value={13}>13 × 13</option>
            <option value={19}>19 × 19</option>
          </select>
        </label>
      }
      status={
        error ||
        notice ||
        (state.phase === "over"
          ? winner +
            " ganan · " +
            result.points.map((v) => v.toFixed(1)).join(" / ")
          : state.phase === "scoring"
            ? "Recuento: marca los grupos muertos"
            : busy
              ? "Blancas están pensando…"
              : "Turno de " + (state.turn === 1 ? "negras" : "blancas"))
      }
      stats={
        <div className="score-pair">
          <span>● {state.captured[0]} capturas</span>
          <span>○ {state.captured[1]} capturas</span>
        </div>
      }
      controls={
        state.phase === "play" ? (
          <button
            className="secondary"
            disabled={busy || (mode === "ai" && state.turn === 2)}
            onClick={() => {
              setState(pass(state));
              setNotice("");
            }}
          >
            Pasar
          </button>
        ) : state.phase === "scoring" ? (
          <>
            <span>
              ● {result.points[0]} · ○ {result.points[1]}
            </span>
            <button
              className="secondary"
              onClick={() => {
                setState((s) => ({ ...s, passes: 0, phase: "play" }));
                setDead([]);
                setApproved([]);
              }}
            >
              Continuar jugando
            </button>
            <button className="primary" onClick={confirm}>
              {mode === "local"
                ? approved.length
                  ? "Blancas: confirmar"
                  : "Negras: confirmar"
                : "Confirmar recuento"}
            </button>
          </>
        ) : (
          <span>Komi: 7,5 · puntuación por área</span>
        )
      }
      rules="Go con puntuación por área, komi de 7,5 y superko posicional: no puedes repetir un tablero anterior ni suicidar un grupo. Rodea piedras sin libertades para capturarlas. Dos pases abren el recuento: marca grupos muertos de común acuerdo y confirma; si hay dudas, continúa jugando y captura los grupos discutidos. Las capturas se muestran, pero no suman aparte en la puntuación por área. En solitario tú revisas el recuento; la IA es un rival de iniciación."
    >
      <div
        className="go-board"
        style={{ "--go-size": state.size } as React.CSSProperties}
      >
        {state.board.map((v, i) => (
          <button
            key={i}
            className={
              "go-point " +
              (v === 1 ? "black" : v === 2 ? "white" : "") +
              (dead.includes(i) ? " dead" : "") +
              (state.last === i ? " last" : "") +
              (result.territory[i] && state.phase !== "play"
                ? " territory-" + result.territory[i]
                : "")
            }
            aria-label={
              "Fila " +
              (Math.floor(i / state.size) + 1) +
              ", columna " +
              ((i % state.size) + 1) +
              (v ? ", piedra " + (v === 1 ? "negra" : "blanca") : ", vacía") +
              (dead.includes(i) ? ", muerta" : "")
            }
            onClick={() => click(i)}
            disabled={!started || state.phase === "over" || busy}
          >
            <span />
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
