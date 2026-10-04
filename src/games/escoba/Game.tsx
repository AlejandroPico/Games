import { useState, useEffect } from "react";
import GameLayout from "../../shared/GameLayout";
import CardFace from "../../shared/CardFace";
import PrivateHand from "../../shared/PrivateHand";
import {
  useMatch,
  useMatchAI,
  PlayerSelect,
  ScoreStrip,
} from "../../shared/useMatch";
import { initial, combinations, move, automatic, value } from "./rules";
import { label } from "../../shared/cards";
export default function Escoba() {
  const [target, setTarget] = useState(21),
    [chosen, choose] = useState<number | null>(null),
    [picks, setPicks] = useState<number[]>([]);
  const m = useMatch((n) => initial(n, target)),
    s = m.state,
    ai = useMatchAI(m, s.turn, s.winner !== null, automatic);
  useEffect(() => {
    choose(null);
    setPicks([]);
  }, [s.ply, m.started]);
  const card = chosen !== null ? s.hands[s.turn][chosen] : undefined;
  const choices = card ? combinations(s.table, card) : [],
    valid =
      !!card &&
      ((!choices.length && !picks.length) ||
        choices.some(
          (c) => c.length === picks.length && c.every((i) => picks.includes(i)),
        ));
  return (
    <GameLayout
      id="escoba"
      started={m.started}
      onStart={() => {
        choose(null);
        setPicks([]);
        m.start();
      }}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      roomPlayers={m.players}
      privateTable
      status={
        s.winner !== null
          ? `Gana J${s.winner + 1}`
          : `J${s.turn + 1} · mano ${s.round} · mazo ${s.stock.length}`
      }
      rules="Captura cartas que sumen quince con la carta jugada. Sota vale ocho, caballo nueve y rey diez. Se puntúan cartas, oros, sietes, siete de oros y escobas."
      menu={
        <>
          <PlayerSelect value={m.players} onChange={m.setPlayers} />
          {m.seats}
          <label>
            Objetivo
            <select value={target} onChange={(e) => setTarget(+e.target.value)}>
              <option value={11}>11 puntos</option>
              <option value={21}>21 puntos</option>
            </select>
          </label>
        </>
      }
      controls={
        <>
          <button
            disabled={ai || !valid}
            onClick={() => {
              m.setState((x) => move(x, chosen!, picks));
              choose(null);
              setPicks([]);
            }}
          >
            Jugar selección
            {card
              ? ` · suma ${value(card) + picks.reduce((v, i) => v + (s.table[i] ? value(s.table[i]) : 0), 0)}`
              : ""}
          </button>
          {choices.length > 0 && (
            <button onClick={() => setPicks(choices[0])}>
              Seleccionar captura válida
            </button>
          )}
        </>
      }
    >
      <div className="card-game-table">
        <ScoreStrip scores={s.scores} turn={s.turn} />
        <small>{s.summary}</small>
        <div className="repertoire-hand table-cards">
          {s.table.map((c, i) => (
            <button
              key={c.id}
              className={picks.includes(i) ? "chosen" : ""}
              aria-label={label(c, true)}
              onClick={() =>
                setPicks(
                  picks.includes(i)
                    ? picks.filter((k) => k !== i)
                    : [...picks, i],
                )
              }
            >
              <CardFace card={c} spanish />
            </button>
          ))}
        </div>
        <PrivateHand
          token={String(s.ply)}
          conceal={m.mode === "local" && !m.room.online && !ai}
        >
          <div className="repertoire-hand">
            {s.hands[s.turn].map((c, i) => (
              <button
                key={c.id}
                disabled={ai || s.winner !== null}
                className={chosen === i ? "chosen" : ""}
                aria-label={label(c, true)}
                onClick={() => {
                  choose(i);
                  setPicks([]);
                }}
              >
                <CardFace card={c} spanish />
              </button>
            ))}
          </div>
        </PrivateHand>
      </div>
    </GameLayout>
  );
}
