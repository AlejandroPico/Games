import {
  useRoomState,
  useTableRoom,
  SeatOptions,
} from "../../shared/TableRoom";
import GameLayout from "../../shared/GameLayout";
import { useObservation, useAutoplay } from "../../shared/Observation";
import {
  initial,
  bluff,
  vote,
  nextRound,
  aiBluff,
  aiVote,
  entry,
} from "./rules";
export default function Dictionary() {
  const room = useTableRoom();
  const { watching } = useObservation();
  const [state, setState] = useRoomState("state", initial),
    [humans, setHumans] = useRoomState("humans", 1),
    [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai"),
    [players, setPlayers] = useRoomState("players", 3),
    [started, setStarted] = useRoomState("started", false),
    [text, setText] = useRoomState("text", "");
  const ai =
    watching ||
    room.machine(
      state.turn,
      mode === "ai" && state.turn >= Math.min(humans, players),
    );
  useAutoplay(
    started && ai && (state.phase === "bluff" || state.phase === "vote"),
    state,
    () => {
      setState(
        (s) =>
          (s.phase === "bluff"
            ? bluff(s, aiBluff(s))
            : vote(
                s,
                aiVote(
                  s.word,
                  s.choices.map((c) => c.text),
                  s.choices.flatMap((c, i) =>
                    !c.true && c.owners.includes(s.turn) ? [i] : [],
                  ),
                ),
              )) || s,
      );
      setText("");
    },
  );
  useAutoplay(started && watching && state.phase === "result", state, () =>
    setState((s) => nextRound(s) || s),
  );
  return (
    <GameLayout
      roomTurn={
        state.phase === "result" || state.phase === "over" ? 0 : state.turn
      }
      roomPlayers={players}
      privateTable={state.phase === "bluff" || state.phase === "vote"}
      id="el-diccionario"
      started={started}
      mode={mode}
      setMode={(m) => {
        setMode(m);
        setHumans(m === "local" ? players : 1);
      }}
      onReset={() => setStarted(false)}
      onStart={() => {
        setState(initial(players));
        setText("");
        setStarted(true);
      }}
      menu={
        <>
          {" "}
          <SeatOptions
            count={players}
            mode={watching ? "solo" : mode}
            humans={Math.min(humans, players)}
            onHumans={(n) => {
              setHumans(n);
              setMode(n === players ? "local" : "ai");
            }}
          />
          <label className="field-label">
            Participantes
            <select
              value={players}
              disabled={room.online}
              onChange={(e) => setPlayers(Number(e.target.value))}
            >
              {[2, 3, 4].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </>
      }
      status={
        state.phase === "over"
          ? "Final · " + state.scores.join(" / ")
          : "Ronda " +
            state.round +
            " · " +
            (state.phase === "bluff"
              ? "jugador " + (state.turn + 1) + ": inventa una definición"
              : state.phase === "vote"
                ? "jugador " + (state.turn + 1) + ": vota"
                : "resultado")
      }
      stats={<span className="small-score">{state.scores.join(" / ")}</span>}
      rules="Juego de engaño con definiciones originales. Cada participante inventa una definición, se mezcla con la verdadera y todos votan. No puedes votar tu propia definición falsa. Acertar vale dos puntos; cada voto que recibe tu engaño vale uno. Cinco rondas. Si escribes exactamente la definición verdadera, ambas se fusionan. La IA conoce parte de su vocabulario y usa una heurística en el resto; no recibe la marca de respuesta verdadera."
      controls={
        state.phase === "result" && (
          <button
            onClick={() => {
              setState((s) => nextRound(s) || s);
              setText("");
            }}
          >
            Siguiente palabra
          </button>
        )
      }
    >
      <div className="word-table">
        <div className="dictionary-word">{state.word}</div>
        {state.phase === "bluff" ? (
          <form
            className="dictionary-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!ai) {
                const n = bluff(state, text);
                if (n) {
                  setState(n);
                  setText("");
                }
              }
            }}
          >
            <label>
              Inventa una definición
              <textarea
                minLength={10}
                maxLength={240}
                disabled={ai}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </label>
            <button disabled={ai || text.trim().length < 10}>
              Guardar en secreto
            </button>
          </form>
        ) : (
          <div className="definition-options">
            {state.choices.map((c, i) => (
              <button
                key={i}
                className={
                  (state.phase === "result" || state.phase === "over") && c.true
                    ? "correct"
                    : ""
                }
                disabled={
                  ai ||
                  state.phase !== "vote" ||
                  (!c.true && c.owners.includes(state.turn))
                }
                onClick={() => setState((s) => vote(s, i) || s)}
              >
                <span>{i + 1}</span>
                {c.text}
                {(state.phase === "result" || state.phase === "over") && (
                  <small>
                    {c.true
                      ? "VERDADERA"
                      : "Autor: " +
                        c.owners.map((p) => p + 1).join(", ") +
                        " · votos: " +
                        state.votes.filter((v) => v === i).length}
                  </small>
                )}
              </button>
            ))}
          </div>
        )}
        {(state.phase === "result" || state.phase === "over") && (
          <p>{entry(state.word)[1]}</p>
        )}
      </div>
    </GameLayout>
  );
}
