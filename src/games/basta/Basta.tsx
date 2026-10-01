import { useRoomState, useTableRoom } from "../../shared/TableRoom";
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
  const room = useTableRoom();
  const { watching } = useObservation();
  const [state, setState] = useRoomState("state", initial),
    [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai"),
    [started, setStarted] = useRoomState("started", false),
    [values, setValues] = useRoomState<string[]>("values", Array(4).fill("")),
    [seconds, setSeconds] = useState(60),
    [deadline, setDeadline] = useRoomState(
      "deadline",
      () => Date.now() + 60000,
    );
  const ai =
    watching || room.machine(state.turn, mode === "ai" && state.turn === 1);
  const send = () => {
    setState((s) => submit(s, values) || s);
    setValues(Array(4).fill(""));
    setSeconds(60);
    setDeadline(Date.now() + 60000);
  };
  const sendRef = useRef(send);
  const pausedAt = useRef<number | null>(null);
  useEffect(() => {
    if (!room.online || !started || state.phase !== "write") {
      pausedAt.current = null;
      return;
    }
    if (!room.ready) {
      pausedAt.current ??= Date.now();
      return;
    }
    if (pausedAt.current !== null && room.host) {
      const elapsed = Date.now() - pausedAt.current;
      pausedAt.current = null;
      setDeadline((d) => d + elapsed);
    }
  }, [room.online, room.ready, room.host, started, state.phase, setDeadline]);
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
    setDeadline(Date.now() + 60000);
  });
  const advance = () => {
    setState((s) => nextRound(s) || s);
    setValues(Array(4).fill(""));
    setSeconds(60);
    setDeadline(Date.now() + 60000);
  };
  useAutoplay(started && watching && state.phase === "result", state, advance);
  useEffect(() => {
    if (
      !started ||
      ai ||
      state.phase !== "write" ||
      (room.online && !room.ready)
    )
      return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(remaining);
      if (!remaining && room.runner) sendRef.current();
    }, 250);
    return () => clearInterval(timer);
  }, [
    started,
    ai,
    state,
    seconds,
    room.runner,
    room.ready,
    room.online,
    deadline,
  ]);
  return (
    <GameLayout
      roomTurn={state.phase === "write" ? state.turn : 0}
      privateTable={state.phase === "write"}
      id="basta-tutti-frutti"
      started={started}
      mode={mode}
      setMode={setMode}
      onReset={() => setStarted(false)}
      onStart={() => {
        setState(initial());
        setValues(Array(4).fill(""));
        setSeconds(60);
        setDeadline(Date.now() + 60000);
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
          <button onClick={advance}>Siguiente ronda</button>
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
