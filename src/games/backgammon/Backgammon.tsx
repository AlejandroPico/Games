import { useRoomState, useTableRoom } from "../../shared/TableRoom";
import { useMemo } from "react";
import GameLayout from "../../shared/GameLayout";
import Die from "../../shared/Die";
import { useObservation, useAutoplay } from "../../shared/Observation";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
import { usePieceDrag } from "../../shared/usePieceDrag";
import {
  initial,
  roll,
  play,
  legalMoves,
  offerDouble,
  acceptDouble,
  pips,
  type Move,
} from "./rules";
export default function Backgammon() {
  const room = useTableRoom();
  const { watching } = useObservation();
  const [state, setState] = useRoomState("state", initial),
    [started, setStarted] = useRoomState("started", false),
    [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai"),
    [source, setSource] = useRoomState<number | null>("source", null),
    [die, setDie] = useRoomState<number | null>("die", null);
  const actor = state.phase === "double" ? 3 - state.turn : state.turn,
    ai = watching || room.machine(actor - 1, mode === "ai" && actor === 2),
    legal = useMemo(() => legalMoves(state), [state]);
  useAutoplay(
    started &&
      ai &&
      (state.phase === "roll" ||
        state.phase === "opening" ||
        state.phase === "double"),
    state,
    () =>
      setState((s) =>
        s.phase === "double"
          ? acceptDouble(s, pips(s, 3 - s.turn) < pips(s, s.turn) + 35) || s
          : roll(s) || s,
      ),
  );
  const { busy, error } = useAI(
    Worker,
    state,
    started && ai && state.phase === "move",
    (m: Move | null) => {
      if (m) setState((s) => play(s, m) || s);
    },
  );
  const drag = usePieceDrag<number>({
    canDrag: (from) =>
      started &&
      !ai &&
      state.phase === "move" &&
      legal.some((m) => m.from === from),
    onStart: setSource,
    onDrop: (from, target) => {
      if (!target || ai) return false;
      const to = Number(target.dataset.drop);
      const m = legal.find(
        (m) =>
          m.from === from && m.to === to && (die === null || m.die === die),
      );
      if (!m) return false;
      setState((s) => play(s, m) || s);
      setSource(null);
      setDie(null);
      return true;
    },
  });
  const choose = (to: number) => {
    if (drag.suppressClick() || ai || !started) return;
    const m = legal.find(
      (m) =>
        m.from === source && m.to === to && (die === null || m.die === die),
    );
    if (m) {
      setState((s) => play(s, m) || s);
      setSource(null);
      setDie(null);
    } else setSource(to);
  };
  const top = [...Array.from({ length: 12 }, (_, i) => 12 + i)],
    bottom = Array.from({ length: 12 }, (_, i) => 11 - i);
  const point = (i: number, upper: boolean) => (
    <button
      key={i}
      data-drop={i}
      aria-label={
        "Punto " +
        (i + 1) +
        ": " +
        Math.abs(state.points[i]) +
        " " +
        (state.points[i] >= 0 ? "claras" : "oscuras")
      }
      disabled={!started || ai || state.phase !== "move"}
      className={
        "gammon-point " +
        (upper ? "top" : "bottom") +
        (source === i ? " selected" : "") +
        (legal.some(
          (m) =>
            m.from === source && m.to === i && (die === null || m.die === die),
        )
          ? " legal"
          : "")
      }
      onClick={() => choose(i)}
    >
      <small>{i + 1}</small>
      <div>
        {Array.from(
          { length: Math.min(5, Math.abs(state.points[i])) },
          (_, j) => (
            <i
              key={j}
              {...drag.bind(i)}
              className={state.points[i] > 0 ? "light" : "dark"}
            >
              {j === 4 && Math.abs(state.points[i]) > 5
                ? Math.abs(state.points[i])
                : ""}
            </i>
          ),
        )}
      </div>
    </button>
  );
  return (
    <GameLayout
      roomTurn={actor - 1}
      id="backgammon"
      started={started}
      mode={mode}
      setMode={setMode}
      onReset={() => setStarted(false)}
      onStart={() => {
        setState(initial());
        setSource(null);
        setDie(null);
        setStarted(true);
      }}
      status={
        error ||
        (state.winner
          ? "Jugador " + state.winner + " · " + state.message
          : busy
            ? "La IA calcula…"
            : "Jugador " + actor + " · " + state.message)
      }
      stats={<span className="small-score">Cubo {state.cube}</span>}
      rules="Quince fichas por bando. Las claras avanzan de 24 a 1; las oscuras, de 1 a 24. Debes usar el máximo de dados posible y, si solo se puede usar uno de dos distintos, el mayor. Un doble permite cuatro movimientos. Entra primero desde la barra. Retira solo cuando todas tus fichas estén en tu casa. Incluye cubo hasta 64, gammon y backgammon; es una partida independiente, sin reglas de match ni Crawford."
      controls={
        state.phase === "double" ? (
          <>
            <button
              disabled={ai}
              onClick={() => setState((s) => acceptDouble(s, true) || s)}
            >
              Aceptar ×2
            </button>
            <button
              disabled={ai}
              onClick={() => setState((s) => acceptDouble(s, false) || s)}
            >
              Rechazar
            </button>
          </>
        ) : (
          <>
            <button
              disabled={
                ai || !(state.phase === "roll" || state.phase === "opening")
              }
              onClick={() => setState((s) => roll(s) || s)}
            >
              Lanzar dados
            </button>
            <button
              disabled={ai || !offerDouble(state)}
              onClick={() => setState((s) => offerDouble(s) || s)}
            >
              Ofrecer doblaje
            </button>
          </>
        )
      }
    >
      <div className="gammon-table">
        <div className="gammon-points">{top.map((i) => point(i, true))}</div>
        <div className="gammon-middle">
          <button
            disabled={ai || !state.bar[state.turn - 1]}
            className={source === -1 ? "selected" : ""}
            {...drag.bind(-1)}
            onClick={() => {
              if (!drag.suppressClick()) setSource(-1);
            }}
          >
            Barra {state.bar.join(" / ")}
          </button>
          <div className="gammon-dice">
            {state.dice.map((v, i) => (
              <button
                key={i}
                className={die === v ? "selected" : ""}
                disabled={ai}
                aria-label={"Usar dado " + v}
                onClick={() => setDie(die === v ? null : v)}
              >
                <Die value={v} />
              </button>
            ))}
          </div>
          <button
            disabled={
              ai || !legal.some((m) => m.from === source && m.to === 24)
            }
            data-drop={24}
            onClick={() => choose(24)}
          >
            Retirar {state.off.join(" / ")}
          </button>
        </div>
        <div className="gammon-points">
          {bottom.map((i) => point(i, false))}
        </div>
        <div className="gammon-pips">
          Distancia: claras {pips(state, 1)} · oscuras {pips(state, 2)}
        </div>
      </div>
    </GameLayout>
  );
}
