import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useObservation, useAutoplay } from "../../shared/Observation";
import { normalizeWord, fiveLetterWords } from "../../shared/words";
import { secretWord, feedback, validGuess, choose, type Row } from "./rules";
export default function WordGuess() {
  const { watching } = useObservation();
  const [secret, setSecret] = useState(secretWord),
    [history, setHistory] = useState<Row[]>([]),
    [text, setText] = useState(""),
    [message, setMessage] = useState(""),
    [started, setStarted] = useState(false);
  const win = history.at(-1)?.word === secret,
    over = win || history.length === 6;
  const submit = (raw: string) => {
    const word = normalizeWord(raw);
    if (!validGuess(word)) {
      setMessage("Usa una palabra de cinco letras del vocabulario disponible.");
      return;
    }
    setHistory((h) => [...h, { word, feedback: feedback(secret, word) }]);
    setText("");
    setMessage("");
  };
  useAutoplay(started && watching && !over, history, () => {
    const w = choose(history);
    if (w) submit(w);
  });
  return (
    <GameLayout
      id="adivina-la-palabra"
      started={started}
      onReset={() => setStarted(false)}
      onStart={() => {
        setSecret(secretWord());
        setHistory([]);
        setText("");
        setMessage("");
        setStarted(true);
      }}
      status={
        over
          ? win
            ? "¡Palabra encontrada!"
            : "La palabra era " + secret
          : message || "Cinco letras · seis intentos"
      }
      rules="Verde: letra y lugar correctos. Ocre: la letra existe en otro lugar. Gris: no queda una copia de esa letra. En palabras con letras repetidas, las pistas consumen cada copia una sola vez. Vocabulario local; puedes consultar las palabras admitidas antes de enviar."
    >
      <div className="word-table">
        <div className="word-rows">
          {Array.from({ length: 6 }, (_, r) => (
            <div key={r}>
              {Array.from({ length: 5 }, (_, c) => (
                <span key={c} className={history[r]?.feedback[c] || ""}>
                  {history[r]?.word[c] || ""}
                </span>
              ))}
            </div>
          ))}
        </div>
        <form
          className="word-entry"
          onSubmit={(e) => {
            e.preventDefault();
            if (started && !over) submit(text);
          }}
        >
          <input
            aria-label="Tu palabra"
            autoComplete="off"
            maxLength={5}
            value={text}
            onChange={(e) => setText(normalizeWord(e.target.value))}
            disabled={over}
          />
          <button disabled={over || text.length !== 5}>Probar</button>
        </form>
        <details className="word-lexicon">
          <summary>Vocabulario admitido</summary>
          <p>{fiveLetterWords.join(" · ")}</p>
        </details>
      </div>
    </GameLayout>
  );
}
