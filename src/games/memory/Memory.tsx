import { useObservation, useAutoplay } from "../../shared/Observation";
import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { deck, choice } from "./rules";
export default function Memory() {
  const { watching } = useObservation();
  const [cards, setCards] = useState(deck),
    [matched, setMatched] = useState<number[]>([]),
    [flipped, setFlipped] = useState<number[]>([]),
    [known, setKnown] = useState<Record<number, string>>({}),
    [turn, setTurn] = useState(1),
    [scores, setScores] = useState([0, 0]),
    [started, setStarted] = useState(false),
    [mode, setMode] = useState<"solo" | "ai" | "local">("solo"),
    [rounds, setRounds] = useState(0);
  const over = matched.length === cards.length;
  const reveal = (i: number) => {
    if (flipped.includes(i) || matched.includes(i) || flipped.length >= 2)
      return;
    setKnown((k) => ({ ...k, [i]: cards[i] }));
    setFlipped((f) => [...f, i]);
  };
  useAutoplay(
    started && flipped.length === 2,
    flipped,
    () => {
      setRounds((r) => r + 1);
      if (cards[flipped[0]] === cards[flipped[1]]) {
        setMatched((m) => [...m, ...flipped]);
        setScores((s) => s.map((v, i) => (i === turn - 1 ? v + 1 : v)));
      } else if (watching || mode !== "solo") setTurn((t) => 3 - t);
      setFlipped([]);
    },
    700,
  );
  useAutoplay(
    started &&
      !over &&
      (watching || (mode === "ai" && turn === 2)) &&
      flipped.length < 2,
    flipped,
    () => {
      const i = choice(
        known,
        cards
          .map((_, i) => i)
          .filter((i) => !matched.includes(i) && !flipped.includes(i)),
        flipped[0],
      );
      if (i >= 0) reveal(i);
    },
    400,
  );
  return (
    <GameLayout
      id="memory"
      started={started}
      onStart={() => setStarted(true)}
      onReset={() => {
        setCards(deck());
        setMatched([]);
        setFlipped([]);
        setKnown({});
        setTurn(1);
        setScores([0, 0]);
        setRounds(0);
        setStarted(false);
      }}
      menu={
        <label className="field-label">
          Cómo jugar
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
          >
            <option value="solo">Un jugador · a tu ritmo</option>
            <option value="ai">Contra la IA · memoria compartida</option>
            <option value="local">Dos jugadores · por turnos</option>
          </select>
        </label>
      }
      status={
        over
          ? !watching && mode === "solo"
            ? "¡Todas las parejas encontradas!"
            : scores[0] === scores[1]
              ? "Empate"
              : scores[0] > scores[1]
                ? "Gana el jugador 1"
                : mode === "ai"
                  ? "Gana la IA"
                  : "Gana el jugador 2"
          : mode === "ai" && turn === 2
            ? "La IA recuerda sus cartas…"
            : "Encuentra una pareja" +
              (mode === "solo" ? "" : " · jugador " + turn)
      }
      stats={
        <div className="score-pair">
          <span>
            {mode === "solo" ? "Parejas" : "Jugador 1"} <b>{scores[0]}</b>
          </span>
          <span>
            {mode === "solo" ? "Intentos" : mode === "ai" ? "IA" : "Jugador 2"}{" "}
            <b>{mode === "solo" ? rounds : scores[1]}</b>
          </span>
        </div>
      }
      rules="Da la vuelta a dos cartas y encuentra símbolos iguales. Una pareja te permite repetir turno; un fallo pasa el turno en partidas de dos jugadores. En solitario, busca todas las parejas con pocos intentos. La IA solo recuerda las cartas que se han mostrado, sin mirar cartas ocultas."
    >
      <div className="memory-board">
        {cards.map((icon, i) => {
          const visible = flipped.includes(i) || matched.includes(i);
          return (
            <button
              key={i}
              disabled={
                !started ||
                over ||
                flipped.length >= 2 ||
                matched.includes(i) ||
                (mode === "ai" && turn === 2)
              }
              className={
                (visible ? "revealed" : "") +
                (matched.includes(i) ? " matched" : "")
              }
              aria-label={
                "Carta " + (i + 1) + (visible ? ", " + icon : ": oculta")
              }
              onClick={() => reveal(i)}
            >
              <span className="card-back" aria-hidden={visible}>
                g.
              </span>
              <span className="card-front" aria-hidden={!visible}>
                {visible ? icon : ""}
              </span>
            </button>
          );
        })}
      </div>
      <div className="stage-caption">
        Recuerda el momento. Encuentra la pareja.
      </div>
    </GameLayout>
  );
}
