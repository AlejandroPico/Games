import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import HandCards from "../../shared/HandCards";
import { initial, total, insurance, act, canSplit } from "./rules";
export default function Blackjack() {
  const [bet, setBet] = useState(20),
    [soft17, setSoft17] = useState(false),
    [state, setState] = useState(() => initial()),
    [started, setStarted] = useState(false);
  const hand = state.hands[state.active],
    play = state.phase === "play",
    over = state.phase === "over";
  const take = (a: Parameters<typeof act>[1]) => {
    const n = act(state, a);
    if (n) setState(n);
  };
  return (
    <GameLayout
      id="blackjack-21"
      started={started}
      onStart={() => {
        setState(initial(bet, soft17));
        setStarted(true);
      }}
      onReset={() => setStarted(false)}
      menu={
        <>
          <p className="rules-copy">
            Práctica con fichas virtuales. No se usa dinero.
          </p>
          <label className="field-label">
            Fichas por mano
            <select
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} fichas
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Regla del crupier
            <select
              value={soft17 ? "hit" : "stand"}
              onChange={(e) => setSoft17(e.target.value === "hit")}
            >
              <option value="stand">Se planta en 17 blando</option>
              <option value="hit">Pide en 17 blando</option>
            </select>
          </label>
        </>
      }
      status={
        state.phase === "insurance"
          ? "El crupier muestra un as: ¿seguro?"
          : over
            ? state.message
            : "Tu mano " + (state.active + 1) + " · " + total(hand.cards).value
      }
      stats={<span className="small-score">Fichas virtuales {state.bank}</span>}
      controls={
        state.phase === "insurance" ? (
          <>
            <button onClick={() => setState(insurance(state, false))}>
              Sin seguro
            </button>
            <button
              disabled={state.bank < hand.bet / 2}
              onClick={() => setState(insurance(state, true))}
            >
              Seguro · {hand.bet / 2}
            </button>
          </>
        ) : over ? (
          <button
            disabled={state.bank < bet}
            onClick={() =>
              setState(initial(bet, soft17, Math.random, state.bank))
            }
          >
            Siguiente mano · {bet}
          </button>
        ) : (
          <>
            <button disabled={!play} onClick={() => take("hit")}>
              Pedir
            </button>
            <button disabled={!play} onClick={() => take("stand")}>
              Plantarse
            </button>
            <button
              disabled={
                !play || hand.cards.length !== 2 || state.bank < hand.bet
              }
              onClick={() => take("double")}
            >
              Doblar
            </button>
            <button disabled={!canSplit(state)} onClick={() => take("split")}>
              Separar
            </button>
            <button
              disabled={!play || hand.split || hand.cards.length !== 2}
              onClick={() => take("surrender")}
            >
              Rendirse
            </button>
          </>
        )
      }
      rules="Blackjack de práctica con fichas virtuales, sin dinero. Seis barajas barajadas al comienzo de cada mano. As vale 1 u 11; figuras 10. El crupier comprueba blackjack antes de jugar. Seguro por la mitad de la apuesta cuando muestra as, paga 2:1 si tiene blackjack. Blackjack natural paga 3:2; otras victorias 1:1 y los empates devuelven fichas. Puedes doblar con las dos primeras cartas, también tras separar. Se separan cartas del mismo rango, hasta cuatro manos. Ases separados reciben una sola carta y no se vuelven a separar; un 21 tras separar no es blackjack natural. Rendición tardía antes de pedir, devuelve media apuesta. El crupier pide por debajo de 17; puedes elegir si pide en 17 blando. Siguiente mano conserva las fichas; Nueva partida reinicia la práctica con los mismos ajustes."
    >
      <div className="blackjack-table">
        <div className="dealer-hand">
          <small>
            CRUPIER · {over ? total(state.dealer).value : "carta tapada"}
          </small>
          <HandCards
            cards={state.dealer.map((c, i) => ({ ...c, up: over || i === 0 }))}
          />
        </div>
        <div className="blackjack-hands">
          {state.hands.map((h, i) => (
            <div
              key={i}
              className={i === state.active && !over ? "active-hand" : ""}
            >
              <small>
                MANO {i + 1} · {total(h.cards).value} · {h.bet} fichas
              </small>
              <HandCards cards={h.cards} />
            </div>
          ))}
        </div>
        <span className="felt-inscription">BLACKJACK · 3:2</span>
      </div>
    </GameLayout>
  );
}
