import { useEffect, useRef, useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useObservation, useAutoplay } from "../../shared/Observation";
import {
  initial,
  submit,
  nextRound,
  choose,
  categories,
  acceptedWords,
} from "./rules";
export default function Basta() {
  const { watching } = useObservation();
  const [state, setState] = useState(initial),
    [mode, setMode] = useState<"ai" | "local">("ai"),
    [started, setStarted] = useState(false),
    [values, setValues] = useState<string[]>(Array(4).fill("")),
    [seconds, setSeconds] = useState(60);
  const ai = watching || (mode === "ai" && state.turn === 1);
  const send = () => {
    setState((s) => submit(s, values) || s);
    setValues(Array(4).fill(""));
    setSeconds(60);
  };
  const sendRef = useRef(send);
  sendRef.current = send;
  useAutoplay(started && ai && state.phase === "write", state, () => {
    setState(
      (s) =>
        submit(
          s,
          categories.map((c) => choose(c, s.letter)),
        ) || s,
    );
    setValues(Array(4).fill(""));
    setSeconds(60);
  });
  useAutoplay(started && watching && state.phase === "result", state, () =>
    setState((s) => nextRound(s) || s),
  );
  useEffect(() => {
    if (!started || ai || state.phase !== "write") return;
    const timer = setTimeout(() => {
      if (seconds <= 1) sendRef.current();
      else setSeconds((v) => v - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [started, ai, state, seconds]);
  return (
    <GameLayout
      id="basta-tutti-frutti"
      started={started}
      mode={mode}
      setMode={setMode}
      onReset={() => setStarted(false)}
      onStart={() => {
        setState(initial());
        setValues(Array(4).fill(""));
        setSeconds(60);
        setStarted(true);
      }}
      status={
        state.phase === "over"
          ? "Final · " + state.scores.join(" / ") + " puntos"
          : "Ronda " +
            state.round +
            " · letra " +
            state.letter +
            " · " +
            (state.phase === "write"
              ? "jugador " + (state.turn + 1) + " · " + seconds + " s"
              : "resultados")
      }
      rules="Cinco rondas, cuatro categorías y sesenta segundos por participante. Vocabulario de validación local visible en la ayuda de la mesa; no se pretende validar todos los nombres o países existentes. Una respuesta correcta vale 10; si otro escribe la misma, vale 5; vacía o no admitida vale 0. En local se escribe por turnos sin ver el formulario del anterior. Aquí Basta y Tutti Frutti son el mismo juego."
      stats={<span className="small-score">{state.scores.join(" / ")}</span>}
      controls={
        state.phase === "result" && (
          <button onClick={() => setState((s) => nextRound(s) || s)}>
            Siguiente ronda
          </button>
        )
      }
    >
      <div className="word-table">
        <div className="basta-letter">{state.letter}</div>
        {state.phase === "write" ? (
          <form
            className="basta-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!ai) send();
            }}
          >
            {categories.map((c, i) => (
              <label key={c}>
                {c}
                <input
                  disabled={ai}
                  autoComplete="off"
                  value={values[i]}
                  onChange={(e) =>
                    setValues((v) =>
                      v.map((s, j) => (j === i ? e.target.value : s)),
                    )
                  }
                />
              </label>
            ))}
            <button disabled={ai}>¡Basta!</button>
          </form>
        ) : (
          <table className="word-results">
            <thead>
              <tr>
                <th>Jugador</th>
                {categories.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {state.forms.map((f, p) => (
                <tr key={p}>
                  <th>{p + 1}</th>
                  {f.map((w, c) => (
                    <td key={c}>{w || "—"}</td>
                  ))}
                  <td>{state.scores[p]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <details className="word-lexicon">
          <summary>Respuestas admitidas</summary>
          {categories.map((c) => (
            <p key={c}>
              <strong>{c}:</strong> {acceptedWords(c).join(" · ")}
            </p>
          ))}
        </details>
      </div>
    </GameLayout>
  );
}
