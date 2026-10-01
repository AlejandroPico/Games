import { useRoomState, useTableRoom } from "../../shared/TableRoom";
import GameLayout from "../../shared/GameLayout";
import { usePieceDrag } from "../../shared/usePieceDrag";
import { useObservation } from "../../shared/Observation";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
import {
  initial,
  play,
  pass,
  exchange,
  multiplier,
  values,
  lexicon,
  type Placement,
} from "./rules";
export default function Crosswords() {
  const room = useTableRoom();
  const { watching } = useObservation();
  const [state, setState] = useRoomState("state", initial),
    [started, setStarted] = useRoomState("started", false),
    [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai"),
    [placements, setPlacements] = useRoomState<Placement[]>("placements", []),
    [tile, setTile] = useRoomState<number | null>("tile", null),
    [message, setMessage] = useRoomState("message", "");
  const ai =
      watching || room.machine(state.turn, mode === "ai" && state.turn === 1),
    rack = state.racks[state.turn],
    used: number[] = [];
  for (const p of placements) {
    const j = rack.findIndex((c, i) => c === p.letter && !used.includes(i));
    if (j >= 0) used.push(j);
  }
  const place = (slot: number, i: number) => {
    if (
      state.board[i] ||
      placements.some((p) => p.i === i) ||
      used.includes(slot)
    )
      return false;
    setPlacements((p) => [...p, { i, letter: rack[slot] }]);
    setTile(null);
    return true;
  };
  const drag = usePieceDrag<number>({
    canDrag: (i) => started && !ai && !state.over && !used.includes(i),
    onStart: setTile,
    onDrop: (slot, e) => !!e && place(slot, Number(e.dataset.drop)),
  });
  const { busy, error } = useAI(
    Worker,
    state,
    started && ai && !state.over,
    (ps: Placement[] | null) => {
      setState((s) => (ps ? play(s, ps) || s : exchange(s) || pass(s) || s));
    },
  );
  return (
    <GameLayout
      roomTurn={state.turn}
      privateTable={!state.over}
      id="cruzapalabras"
      started={started}
      mode={mode}
      setMode={setMode}
      onReset={() => setStarted(false)}
      onStart={() => {
        setState(initial());
        setPlacements([]);
        setTile(null);
        setMessage("");
        setStarted(true);
      }}
      status={
        error ||
        (state.over
          ? state.message
          : busy
            ? "La IA busca palabras…"
            : "Jugador " +
              (state.turn + 1) +
              " · " +
              (message || state.message))
      }
      stats={
        <span className="small-score">
          {state.scores.join(" / ")} · mazo {state.bag.length}
        </span>
      }
      rules="Juego original de palabras cruzadas en 9×9, con siete letras en el atril. Usa el vocabulario compacto mostrado en la mesa. La primera palabra cruza el centro; después todas se conectan con lo existente. Coloca en una sola fila o columna, sin huecos, y confirma. Cada palabra horizontal y vertical creada debe estar admitida. Multiplicadores solo para letras recién puestas; siete letras dan 50 puntos extra. Cuatro pases o cambios seguidos terminan; también agotar mazo y atril. No es el reglamento completo de Scrabble."
      controls={
        <>
          <button
            disabled={ai || !placements.length}
            onClick={() => {
              const n = play(state, placements);
              if (n) {
                setState(n);
                setPlacements([]);
                setMessage("");
              } else
                setMessage("Revisa conexión, línea, huecos y vocabulario.");
            }}
          >
            Confirmar
          </button>
          <button
            disabled={!placements.length}
            onClick={() => {
              setPlacements([]);
              setTile(null);
            }}
          >
            Retirar letras
          </button>
          <button
            disabled={ai || state.over || !!placements.length}
            onClick={() => setState((s) => pass(s) || s)}
          >
            Pasar
          </button>
          <button
            disabled={
              ai || state.over || state.bag.length < 7 || !!placements.length
            }
            onClick={() => setState((s) => exchange(s) || s)}
          >
            Cambiar atril
          </button>
        </>
      }
    >
      <div className="crossword-table">
        <div className="crossword-board">
          {state.board.map((c, i) => {
            const p = placements.find((p) => p.i === i),
              letter = c || p?.letter,
              [lm, wm] = multiplier(i);
            return (
              <button
                key={i}
                data-drop={i}
                aria-label={
                  "Casilla " +
                  (Math.floor(i / 9) + 1) +
                  ", " +
                  ((i % 9) + 1) +
                  (letter ? ", " + letter : "")
                }
                disabled={!started || ai || state.over || !!c}
                className={
                  "word-square " +
                  (wm > 1 ? "word-bonus" : lm > 1 ? "letter-bonus" : "") +
                  (p ? " proposed" : "")
                }
                onClick={() => {
                  if (p) {
                    setPlacements((ps) => ps.filter((x) => x.i !== i));
                    return;
                  }
                  if (tile !== null) place(tile, i);
                }}
              >
                {letter ? (
                  <>
                    {letter}
                    <small>{values[letter] || 1}</small>
                  </>
                ) : wm > 1 ? (
                  "2P"
                ) : lm > 1 ? (
                  lm + "L"
                ) : (
                  ""
                )}
              </button>
            );
          })}
        </div>
        <div className="letter-rack">
          {rack.map((c, i) => (
            <button
              key={i}
              {...drag.bind(i)}
              data-draggable=""
              className={tile === i ? "selected" : ""}
              disabled={ai || state.over || used.includes(i)}
              onClick={() => {
                if (!drag.suppressClick()) setTile(i);
              }}
            >
              {used.includes(i) ? "" : c}
              <small>{used.includes(i) ? "" : values[c] || 1}</small>
            </button>
          ))}
        </div>
        <details className="word-lexicon">
          <summary>Vocabulario admitido</summary>
          <p>{lexicon.join(" · ")}</p>
        </details>
      </div>
    </GameLayout>
  );
}
