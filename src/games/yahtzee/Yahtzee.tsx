import { useObservation, useAutoplay } from "../../shared/Observation";
import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import Die from "../../shared/Die";
import {
  initial,
  roll,
  score,
  total,
  value,
  choices,
  finished,
  categories,
  aiHolds,
  aiCategory,
} from "./rules";
export default function Yahtzee() {
  const { watching } = useObservation();
  const [opponent, setOpponent] = useState("solo"),
    [state, setState] = useState(() => initial()),
    [started, setStarted] = useState(false);
  const over = finished(state),
    ai = watching || (opponent === "ai" && state.turn === 1),
    allowed = choices(state),
    joker =
      state.dice.every((v) => v === state.dice[0]) &&
      state.sheets[state.turn][11] !== null;
  useAutoplay(started && ai && !over, state, () => {
    if (state.rolls === 3) setState((s) => score(s, aiCategory(s)) || s);
    else
      setState((s) => roll({ ...s, held: s.rolls ? aiHolds(s) : s.held }) || s);
  });
  return (
    <GameLayout
      id="yahtzee-la-generala"
      started={started}
      onStart={() => {
        setState(initial(!watching && opponent === "solo" ? 1 : 2));
        setStarted(true);
      }}
      onReset={() => setStarted(false)}
      menu={
        <label className="field-label">
          Jugadores
          <select
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
          >
            <option value="solo">En solitario</option>
            <option value="ai">Contra la IA</option>
            <option value="local">Dos jugadores locales</option>
          </select>
        </label>
      }
      status={
        over
          ? "Final · " +
            state.sheets
              .map((_, i) => (i === 0 ? "Tú" : "Rival") + " " + total(state, i))
              .join(" — ")
          : ai
            ? "La IA está jugando…"
            : "Jugador " + (state.turn + 1) + " · " + state.rolls + "/3 tiradas"
      }
      controls={
        <>
          <button
            disabled={over || ai || state.rolls === 3}
            onClick={() => setState(roll(state) || state)}
          >
            Tirar dados
          </button>
          <span>
            {state.rolls
              ? "Pulsa un dado para conservarlo."
              : "Hasta tres tiradas por turno."}
          </span>
        </>
      }
      rules="Dados con puntuación Yahtzee: cinco dados, hasta tres tiradas por turno, conservando los que elijas. Anota obligatoriamente una casilla libre, incluso con cero puntos. Unos a seises suman sus caras; 63 puntos arriba dan 35 de bonificación. Trío y póker suman todos los dados; full 25, escalera de cuatro 30, escalera de cinco 40, cinco iguales 50; Azar suma todo. Cinco iguales adicionales con Yahtzee ya anotado a 50 dan 100 extra. Comodín: si Yahtzee ya estaba usado, anota primero el número correspondiente arriba si está libre; si no, una casilla inferior libre (full y escaleras puntúan su valor fijo); si no queda ninguna, otra casilla superior. El comodín también se aplica si Yahtzee se tachó a cero, pero sin bonificación. Se termina al completar la hoja. IA heurística y modo local."
    >
      <div className="yahtzee-table">
        <div className="dice-tray">
          {state.dice.map((v, i) => (
            <button
              key={i}
              className={state.held[i] ? "held" : ""}
              aria-label={
                "Dado " +
                (i + 1) +
                ": " +
                v +
                (state.held[i] ? ", conservado" : "")
              }
              aria-pressed={state.held[i]}
              disabled={!started || !state.rolls || over || ai}
              onClick={() =>
                setState((s) => ({
                  ...s,
                  held: s.held.map((h, j) => (i === j ? !h : h)),
                }))
              }
            >
              <Die value={v} />
            </button>
          ))}
        </div>
        <div className="dice-scorecard">
          {categories.map((name, i) => (
            <button
              key={i}
              disabled={!started || ai || !allowed.includes(i)}
              onClick={() => setState(score(state, i) || state)}
            >
              <span>{name}</span>
              {state.sheets.map((sheet, p) => (
                <b key={p} className={p === state.turn ? "current" : ""}>
                  {sheet[i] !== null
                    ? sheet[i]
                    : p === state.turn && state.rolls
                      ? "+" + value(state.dice, i, joker)
                      : "—"}
                </b>
              ))}
            </button>
          ))}
          <div>
            <strong>Total</strong>
            {state.sheets.map((_, p) => (
              <b key={p}>{total(state, p)}</b>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
