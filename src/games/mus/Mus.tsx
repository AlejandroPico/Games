import { useEffect, useState } from "react";
import GameLayout from "../../shared/GameLayout";
import HandCards from "../../shared/HandCards";
import {
  initial,
  act,
  aiAction,
  lances,
  eligible,
  pairProfile,
  gamePoints,
  type Action,
} from "./rules";
const playerNames = ["Tú", "Rival 1", "Compañero", "Rival 2"];
export default function Mus() {
  const [state, setState] = useState(() => initial()),
    [eight, setEight] = useState(true),
    [target, setTarget] = useState(40),
    [mode, setMode] = useState("ai"),
    [started, setStarted] = useState(false),
    [selected, setSelected] = useState<number[]>([]),
    [amount, setAmount] = useState(2),
    [revealed, setRevealed] = useState("");
  const over = state.phase === "over",
    show = over || state.phase === "showdown",
    human = mode === "local" || state.turn === 0,
    view = mode === "local" ? state.turn : 0,
    context =
      state.round + ":" + state.phase + ":" + state.lance + ":" + state.turn,
    visible = mode === "ai" || revealed === context || show;
  const move = (a: Action) => {
    const n = act(state, a);
    if (n) {
      setState(n);
      setSelected([]);
    }
  };
  useEffect(() => {
    if (!started || human || show) return;
    const timer = setTimeout(
      () => setState((s) => act(s, aiAction(s)) || s),
      420,
    );
    return () => clearTimeout(timer);
  }, [state, started, human, show]);
  const canAct = human && visible && !show,
    lc = lances(state)[state.lance] || "recuento";
  const nextHand = () => {
    setState(
      initial(
        eight,
        target,
        Math.random,
        state.scores,
        (state.mano + 1) % 4,
        state.round + 1,
      ),
    );
    setSelected([]);
    setRevealed("");
  };
  return (
    <GameLayout
      id="mus"
      started={started}
      onStart={() => {
        setState(initial(eight, target));
        setStarted(true);
      }}
      onReset={() => {
        setStarted(false);
        setSelected([]);
        setRevealed("");
      }}
      menu={
        <>
          <p className="rules-copy">
            Dos parejas. Tú y tu compañero os enfrentáis al equipo rival.
            Envites de tantos, sin dinero.
          </p>
          <label className="field-label">
            Jugadores
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="ai">Tú y tres inteligencias artificiales</option>
              <option value="local">Cuatro jugadores locales</option>
            </select>
          </label>
          <label className="field-label">
            Baraja
            <select
              value={eight ? "8" : "4"}
              onChange={(e) => setEight(e.target.value === "8")}
            >
              <option value="8">Ocho reyes · treses reyes, doses ases</option>
              <option value="4">Cuatro reyes</option>
            </select>
          </label>
          <label className="field-label">
            Tantos para ganar un juego
            <select
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
            >
              <option value={30}>30 tantos</option>
              <option value={40}>40 tantos</option>
            </select>
          </label>
        </>
      }
      status={
        over
          ? state.message
          : show
            ? "Recuento de la mano"
            : state.phase === "mus"
              ? "Mus · habla jugador " + (state.turn + 1)
              : state.phase === "discard"
                ? "Descarte · jugador " + (state.turn + 1)
                : lc.toUpperCase() + " · habla jugador " + (state.turn + 1)
      }
      stats={
        <span className="small-score">
          {state.scores[0]} — {state.scores[1]}
        </span>
      }
      controls={
        show ? (
          !over ? (
            <button onClick={nextHand}>Siguiente mano</button>
          ) : (
            <span>El juego ha terminado.</span>
          )
        ) : mode === "local" && !visible ? (
          <button onClick={() => setRevealed(context)}>
            Mostrar mano de jugador {view + 1}
          </button>
        ) : !human ? (
          <span>La IA está decidiendo…</span>
        ) : state.phase === "mus" ? (
          <>
            <button onClick={() => move({ type: "mus" })}>Mus</button>
            <button onClick={() => move({ type: "cut" })}>No hay mus</button>
          </>
        ) : state.phase === "discard" ? (
          <button
            disabled={!selected.length}
            onClick={() => move({ type: "discard", indices: selected })}
          >
            Descartar {selected.length || ""}
          </button>
        ) : (
          <>
            <button disabled={!canAct} onClick={() => move({ type: "pass" })}>
              {state.offer ? "No quiero" : "Paso"}
            </button>
            {state.offer !== 0 && (
              <button disabled={!canAct} onClick={() => move({ type: "want" })}>
                Quiero
              </button>
            )}
            {state.offer !== -1 && (
              <>
                <input
                  className="mus-amount"
                  aria-label="Incremento del envite"
                  type="number"
                  min="2"
                  max="999"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      Math.max(2, Math.min(999, Number(e.target.value) || 2)),
                    )
                  }
                />
                <button
                  disabled={!canAct}
                  onClick={() => move({ type: "bid", amount })}
                >
                  {state.offer ? "Subir" : "Envidar"}
                </button>
                <button
                  disabled={!canAct}
                  onClick={() => move({ type: "bid", amount: -1 })}
                >
                  Órdago
                </button>
              </>
            )}
          </>
        )
      }
      rules="Mus por parejas: jugadores 1 y 3 contra 2 y 4. Una partida es un juego a 30 o 40 tantos. Ocho reyes convierte treses en reyes y doses en ases; también puedes elegir cuatro reyes. Se reparten cuatro cartas. Si todos dicen Mus se descartan al menos una y se reponen, reciclando descartes si hace falta; en la primera mano, mus corrido rota la mano. No hay mus abre Grande, Chica, Pares y Juego (o Punto si nadie suma 31). Empates favorecen al primero en orden de mano. Duples supera medias y pareja; Juego: 31, 32, 40, 37, 36, 35, 34, 33. Envido abre con al menos dos tantos; puedes subir o lanzar órdago. Quiero acepta; No quiero concede un tanto al abrir o el envite anterior al revocar. Órdago aceptado resuelve el juego inmediatamente. Envites aceptados se cuentan al mostrar cartas, en orden de lances. Grande y Chica sin apuesta dan uno; se añaden premios de pares (1, 2, 3) y juego (31 da 3, otros 2) de ambos miembros de la pareja ganadora; Punto da uno adicional. Sin deje ni señas. La IA decide con su mano y la información pública, sin consultar la mano del compañero."
    >
      <div className="mus-table">
        <div className="mus-opponents">
          {[0, 1, 2, 3]
            .filter((p) => p !== view)
            .map((p) => (
              <div key={p}>
                <small>
                  {mode === "ai" ? playerNames[p] : "Jugador " + (p + 1)}
                  {state.phase === "bet" && (lc === "pares" || lc === "juego")
                    ? " · " +
                      (eligible(state, lc).includes(p) ? "tiene" : "no tiene")
                    : ""}
                </small>
                <HandCards cards={state.hands[p]} spanish hidden={!show} />
              </div>
            ))}
        </div>
        <div className="mus-center">
          <div className="mus-teams">
            <span>
              Equipo 1<b>{state.scores[0]}</b>
            </span>
            <span>
              Equipo 2<b>{state.scores[1]}</b>
            </span>
          </div>
          <div className="mus-lances">
            {lances(state).map((l, i) => (
              <span key={l} className={i === state.lance ? "active" : ""}>
                {l}
              </span>
            ))}
          </div>
          <p>
            {show
              ? state.message
              : state.message || "Mano: jugador " + (state.mano + 1)}
          </p>
        </div>
        <div className="mus-hand">
          <small>
            {mode === "ai" ? "TU MANO" : "JUGADOR " + (view + 1)}
            {show
              ? " · " +
                (pairProfile(state.hands[view], eight)[0]
                  ? "pares"
                  : "sin pares") +
                " · suma " +
                gamePoints(state.hands[view], eight)
              : ""}
          </small>
          <HandCards
            cards={state.hands[view]}
            spanish
            hidden={!visible}
            selected={selected}
            disabled={!canAct || state.phase !== "discard"}
            onCard={(i) =>
              setSelected((s) =>
                s.includes(i) ? s.filter((j) => j !== i) : [...s, i],
              )
            }
          />
        </div>
      </div>
    </GameLayout>
  );
}
