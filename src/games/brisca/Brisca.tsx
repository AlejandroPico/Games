import { useRoomState, useTableRoom } from "../../shared/TableRoom";
import { useObservation, useAutoplay } from "../../shared/Observation";
import GameLayout from "../../shared/GameLayout";
import CardFace from "../../shared/CardFace";
import HandCards from "../../shared/HandCards";
import { label, spanishSuits } from "../../shared/cards";
import {
  initial,
  play,
  collect,
  winner,
  swap,
  exchangeIndex,
  aiMove,
} from "./rules";
export default function Brisca() {
  const room = useTableRoom();
  const { watching } = useObservation();
  const [state, setState] = useRoomState("state", () => initial()),
    [started, setStarted] = useRoomState("started", false),
    [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai"),
    [exchange, setExchange] = useRoomState("exchange", false),
    [revealed, setRevealed] = useRoomState("revealed", "");
  const privacyKey =
      state.turn + ":" + state.trick.length + ":" + state.stock.length,
    reveal = revealed === privacyKey;
  const over = state.hands.every((h) => !h.length) && !state.trick.length,
    baza = winner(state),
    actor = state.trick.length === 2 ? baza : state.turn,
    human = !watching && !room.machine(actor, mode === "ai" && actor === 1);
  useAutoplay(
    started &&
      !over &&
      (watching || room.machine(actor, mode === "ai" && actor === 1)),
    state,
    () => {
      if (state.trick.length === 2) setState((s) => collect(swap(s) || s));
      else
        setState(
          (s) =>
            play(s, aiMove(s.hands[s.turn], s.trick[0]?.card, s.suit)) || s,
        );
    },
  );
  return (
    <GameLayout
      roomTurn={state.trick.length === 2 ? baza : state.turn}
      privateTable={!over}
      id="brisca"
      started={started}
      onStart={() => {
        setState(initial(exchange));
        setStarted(true);
      }}
      onReset={() => {
        setStarted(false);
        setRevealed("");
      }}
      mode={mode}
      setMode={setMode}
      menu={
        <label className="field-label">
          Cambio de triunfo
          <select
            value={exchange ? "yes" : "no"}
            onChange={(e) => setExchange(e.target.value === "yes")}
          >
            <option value="no">Sin intercambio</option>
            <option value="yes">7 o 2 antes de robar tras ganar baza</option>
          </select>
        </label>
      }
      status={
        over
          ? state.scores[0] === state.scores[1]
            ? "Empate"
            : state.scores[0] > state.scores[1]
              ? "Gana el jugador 1"
              : "Gana el jugador 2"
          : baza >= 0
            ? "Baza para el jugador " + (baza + 1)
            : "Turno de " +
              (state.turn === 0
                ? "jugador 1"
                : mode === "ai"
                  ? "la IA"
                  : "jugador 2")
      }
      stats={
        <span className="small-score">
          {state.scores[0]} — {state.scores[1]}
        </span>
      }
      controls={
        baza >= 0 ? (
          <>
            <button
              disabled={room.machine(baza, mode === "ai" && baza === 1)}
              onClick={() => setState(collect(state))}
            >
              Recoger baza
            </button>
            {exchange && (
              <button
                disabled={
                  exchangeIndex(state) < 0 ||
                  room.machine(baza, mode === "ai" && baza === 1)
                }
                onClick={() => {
                  const n = swap(state);
                  if (n) setState(n);
                }}
              >
                Cambiar triunfo
              </button>
            )}
          </>
        ) : mode === "local" && !reveal ? (
          <button disabled={over} onClick={() => setRevealed(privacyKey)}>
            Mostrar mano de jugador {state.turn + 1}
          </button>
        ) : (
          <span>
            Mazo · {state.stock.length + (state.trump ? 1 : 0)} cartas
          </span>
        )
      }
      rules="Brisca individual con baraja española de cuarenta cartas y tres cartas por mano. Puedes jugar cualquier carta, sin obligación de asistir al palo. Gana el triunfo más alto; si no hay triunfo gana la más alta del palo de salida. Orden: as, tres, rey, caballo, sota, siete, seis, cinco, cuatro, dos. Puntúan 11, 10, 4, 3 y 2 las cinco primeras; el resto 0. Quien gana recoge la baza, roba primero y vuelve a salir; la carta de triunfo se roba al final. Vence quien suma más tantos de los 120 disponibles; 60–60 es empate. Modalidad opcional: el ganador puede cambiar el siete por un triunfo que puntúa o el dos por uno que no puntúa, antes de robar. La IA usa solo su mano, la carta de salida y el triunfo; no conoce tus cartas. En juego local se tapa la mano hasta Mostrar."
    >
      <div className="brisca-table">
        <div className="brisca-stock">
          <span>TRIUNFO · {spanishSuits[state.suit]}</span>
          {state.trump ? (
            <div className="table-card">
              <CardFace card={state.trump} spanish />
            </div>
          ) : (
            <span>En juego</span>
          )}
          <small>{state.stock.length + (state.trump ? 1 : 0)} por robar</small>
        </div>
        <div className="trick-cards">
          {state.trick.map((t) => (
            <div key={t.p}>
              <small>
                {t.p === 0 ? "Jugador 1" : mode === "ai" ? "IA" : "Jugador 2"}
              </small>
              <div className="table-card">
                <CardFace card={t.card} spanish />
              </div>
            </div>
          ))}
        </div>
        <div className="brisca-hand">
          <small>{human ? "Tu mano" : "Turno del rival"}</small>
          <HandCards
            cards={state.hands[actor]}
            spanish
            hidden={!human || (mode === "local" && !reveal)}
            disabled={!started || over || state.trick.length === 2}
            onCard={(i) => setState(play(state, i) || state)}
          />
        </div>
      </div>
    </GameLayout>
  );
}
