import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useObservation, useAutoplay } from "../../shared/Observation";
import { alphabet } from "../../shared/words";
import { initial, guess, misses, won, finished, choose } from "./rules";
export default function Hangman() {
  const { watching } = useObservation();
  const [state, setState] = useState(initial),
    [started, setStarted] = useState(false),
    [limit, setLimit] = useState(6);
  const over = finished(state),
    mask = [...state.word].map((c) => (state.guessed.includes(c) ? c : ""));
  useAutoplay(started && watching && !over, state, () => {
    const c = choose(mask, state.guessed, state.category);
    if (c) setState((s) => guess(s, c) || s);
  });
  return (
    <GameLayout
      id="el-ahorcado"
      started={started}
      onStart={() => {
        setState(initial(limit));
        setStarted(true);
      }}
      onReset={() => setStarted(false)}
      status={
        over
          ? won(state)
            ? "¡Palabra descubierta!"
            : "La palabra era " + state.word
          : state.category +
            " · " +
            misses(state) +
            " de " +
            state.limit +
            " fallos"
      }
      menu={
        <label className="field-label">
          Fallos permitidos
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={6}>6 · clásico</option>
            <option value={8}>8 · relajado</option>
          </select>
        </label>
      }
      rules="Una palabra del vocabulario local y una categoría como pista. Las vocales acentuadas se escriben sin tilde; Ñ es independiente de N. Ganas al revelar todas las letras. Esta edición individual permite seis u ocho errores."
    >
      <div className="word-table">
        <svg
          className="hangman-drawing"
          viewBox="0 0 240 170"
          aria-hidden="true"
        >
          <path d="M20 150H180M50 150V15H150V35" />
          <g>
            {misses(state) > 0 && <circle cx="150" cy="52" r="17" />}
            {misses(state) > 1 && <path d="M150 69V112" />}
            {misses(state) > 2 && <path d="M150 78L125 96" />}
            {misses(state) > 3 && <path d="M150 78L175 96" />}
            {misses(state) > 4 && <path d="M150 112L128 142" />}
            {misses(state) > 5 && <path d="M150 112L172 142" />}
          </g>
        </svg>
        <div className="masked-word" aria-label="Palabra">
          {mask.map((c, i) => (
            <span key={i}>{c || (over ? state.word[i] : "_")}</span>
          ))}
        </div>
        <div className="letter-keyboard">
          {alphabet.map((c) => (
            <button
              key={c}
              disabled={!started || over || state.guessed.includes(c)}
              className={
                state.guessed.includes(c)
                  ? state.word.includes(c)
                    ? "correct"
                    : "absent"
                  : ""
              }
              onClick={() => setState((s) => guess(s, c) || s)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
