import { useRoomState, useTableRoom } from "../../shared/TableRoom";
import { useObservation, useAutoplay } from "../../shared/Observation";
import { useMemo } from "react";
import GameLayout from "../../shared/GameLayout";
import Overlay from "../../shared/Overlay";
import { useAI } from "../../shared/useAI";
import { usePieceDrag } from "../../shared/usePieceDrag";
import Worker from "./ai.worker?worker";
import {
  initial,
  legal,
  apply,
  result,
  checked,
  key,
  owner,
  names,
  redSymbols,
  blackSymbols,
  type Move,
} from "./rules";
export default function Xiangqi() {
  const room = useTableRoom();
  const { watching } = useObservation();
  const [state, setState] = useRoomState("state", initial),
    [started, setStarted] = useRoomState("started", false),
    [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai"),
    [depth, setDepth] = useRoomState("depth", 2),
    [selected, setSelected] = useRoomState<number | null>("selected", null),
    [outcome, setOutcome] = useRoomState("outcome", ""),
    [confirm, setConfirm] = useRoomState("confirm", false);
  const options = useMemo(() => legal(state), [state]),
    over = outcome || result(state),
    review = over === "Repetición · revisión",
    input = useMemo(() => ({ state, depth }), [state, depth]);
  useAutoplay(started && watching && review, state, () =>
    setOutcome("Tablas acordadas por repetición en modo observación"),
  );
  const commit = (m: Move) => {
    setState((s) => apply(s, m));
    setSelected(null);
  };
  const { busy, error } = useAI(
    Worker,
    input,
    started &&
      (watching ||
        room.machine(state.turn - 1, mode === "ai" && state.turn === 2)) &&
      !over &&
      !confirm,
    (m: Move | null) => {
      if (m) commit(m);
    },
  );
  const canPlay =
    started &&
    !over &&
    !busy &&
    !(
      watching ||
      room.machine(state.turn - 1, mode === "ai" && state.turn === 2)
    );
  const select = (i: number) => {
    const m = options.find((m) => m.from === selected && m.to === i);
    if (m) commit(m);
    else setSelected(owner(state.board[i]) === state.turn ? i : null);
  };
  const drag = usePieceDrag<number>({
    canDrag: (i) => canPlay && owner(state.board[i]) === state.turn,
    onStart: setSelected,
    elements: (_, e) => [e.querySelector<HTMLElement>("span")!],
    onDrop: (from, e) => {
      const m = options.find(
        (m) => m.from === from && m.to === Number(e?.dataset.drop),
      );
      if (!m) return false;
      commit(m);
      return true;
    },
  });
  return (
    <GameLayout
      roomTurn={state.turn - 1}
      id="xiangqi-ajedrez-chino"
      started={started}
      onStart={() => setStarted(true)}
      onReset={() => {
        setState(initial());
        setStarted(false);
        setSelected(null);
        setOutcome("");
        setConfirm(false);
      }}
      mode={mode}
      setMode={setMode}
      menu={
        <label className="field-label">
          Dificultad
          <select
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
          >
            <option value={1}>Iniciación</option>
            <option value={2}>Club</option>
            <option value={3}>Desafío</option>
          </select>
        </label>
      }
      status={
        error ||
        over ||
        (busy
          ? "Negras están pensando…"
          : "Turno de " +
            (state.turn === 1 ? "rojas" : "negras") +
            (checked(state) ? " · jaque" : ""))
      }
      controls={
        review ? (
          <>
            <button onClick={() => setOutcome("Tablas por acuerdo")}>
              Aceptar tablas
            </button>
            <button
              onClick={() =>
                setState((s) => ({
                  ...s,
                  history: [{ key: key(s), mover: 0, check: false }],
                }))
              }
            >
              Continuar variando
            </button>
          </>
        ) : (
          <button disabled={!!over} onClick={() => setConfirm(true)}>
            Rendirse
          </button>
        )
      }
      rules="Xiangqi: rojas comienzan en una cuadrícula de 9×10 intersecciones. El general y los consejeros permanecen en el palacio. Los elefantes no cruzan el río y se bloquean en el punto intermedio. Un caballo se bloquea por su pata. El cañón mueve como el carro pero necesita exactamente una pieza intermedia para capturar. Los soldados avanzan y, tras cruzar el río, pueden mover lateralmente. Los generales nunca pueden quedar frente a frente sin una pieza entre ellos. Jaque mate y falta de jugadas son derrota. Tablas tras 50 movimientos por jugador sin captura; el jaque perpetuo unilateral pierde. Esta edición casual pausa otras repeticiones para acordar tablas o continuar variando: no automatiza el arbitraje completo WXF de persecuciones. Arrastra o selecciona las piezas; IA de búsqueda limitada, sin reloj."
    >
      <div className="eastern-board xiangqi-board">
        <div className="river-label" aria-hidden="true">
          楚河 · 漢界
        </div>
        {state.board.map((v, i) => (
          <button
            key={i}
            {...drag.bind(i)}
            data-draggable={owner(v) === state.turn ? "" : undefined}
            data-drop={i}
            aria-label={
              "Fila " +
              (Math.floor(i / 9) + 1) +
              ", columna " +
              ((i % 9) + 1) +
              (v
                ? ", " + names[Math.abs(v)] + " " + (v > 0 ? "rojo" : "negro")
                : ", vacía")
            }
            disabled={!canPlay}
            className={
              (selected === i ? "selected " : "") +
              (options.some((m) => m.from === selected && m.to === i)
                ? "legal"
                : "")
            }
            onClick={() => {
              if (!drag.suppressClick()) select(i);
            }}
          >
            {v !== 0 && (
              <span className={"xiangqi-piece " + (v > 0 ? "red" : "black")}>
                {(v > 0 ? redSymbols : blackSymbols)[Math.abs(v)]}
              </span>
            )}
          </button>
        ))}
      </div>
      {confirm && (
        <Overlay title="Confirmar rendición" onClose={() => setConfirm(false)}>
          <p>La partida terminará a favor del rival.</p>
          <button
            className="primary full"
            onClick={() => {
              setOutcome(
                "Ganan " +
                  (mode === "ai" || state.turn === 1 ? "negras" : "rojas") +
                  " por rendición",
              );
              setConfirm(false);
            }}
          >
            Rendirse
          </button>
        </Overlay>
      )}
    </GameLayout>
  );
}
