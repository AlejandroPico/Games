import { useRoomState, useTableRoom } from "../../shared/TableRoom";
import GameLayout from "../../shared/GameLayout";
import { useObservation, useAutoplay } from "../../shared/Observation";
import { initial, play, required, legal, choose, concede } from "./rules";
export default function WordChain() {
  const room = useTableRoom();
  const { watching } = useObservation();
  const [state, setState] = useRoomState("state", initial),
    [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai"),
    [started, setStarted] = useRoomState("started", false),
    [text, setText] = useRoomState("text", ""),
    [message, setMessage] = useRoomState("message", "");
  const over = state.winner !== null,
    ai =
      watching || room.machine(state.turn, mode === "ai" && state.turn === 1);
  const submit = (w: string) => {
    const n = play(state, w);
    if (n) {
      setState(n);
      setText("");
      setMessage("");
    } else
      setMessage(
        "Debe empezar por la misma sílaba y estar en el vocabulario, sin repetir.",
      );
  };
  useAutoplay(started && ai && !over, state, () => {
    const w = choose(state);
    if (w) submit(w);
    else setState(concede(state));
  });
  return (
    <GameLayout
      roomTurn={state.turn}
      id="palabras-encadenadas"
      started={started}
      mode={mode}
      setMode={setMode}
      onReset={() => setStarted(false)}
      onStart={() => {
        setState(initial());
        setText("");
        setMessage("");
        setStarted(true);
      }}
      status={
        over
          ? "Gana el jugador " + (state.winner! + 1)
          : message ||
            "Jugador " +
              (state.turn + 1) +
              " · empieza por " +
              (required(state) || "cualquier sílaba")
      }
      rules="La primera sílaba de la nueva palabra debe coincidir exactamente con la última de la anterior: GATO → TOMATE → TELA → LANA. No basta con empezar por las mismas letras si la sílaba es distinta. Se usa un vocabulario local silabeado; no se admiten repeticiones. Pierde quien se rinde o queda sin palabras admitidas."
    >
      <div className="word-table">
        <ol className="word-history">
          {state.words.map((w, i) => (
            <li key={i}>
              <span>{(i % 2) + 1}</span>
              {w}
            </li>
          ))}
        </ol>
        <form
          className="word-entry"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ai && !over) submit(text);
          }}
        >
          <input
            list="chain-words"
            aria-label="Palabra encadenada"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={over || ai}
          />
          <datalist id="chain-words">
            {legal(state).map((w) => (
              <option key={w.word} value={w.word} />
            ))}
          </datalist>
          <button disabled={over || ai}>Encadenar</button>
        </form>
        <button disabled={over || ai} onClick={() => setState(concede(state))}>
          Me rindo
        </button>
        <details className="word-lexicon">
          <summary>Palabras y sílabas disponibles</summary>
          <p>
            {legal(state)
              .map((w) => w.syllables.join("·"))
              .join(" / ")}
          </p>
        </details>
      </div>
    </GameLayout>
  );
}
