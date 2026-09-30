import { useMemo, useState } from "react";
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
  impasse,
  owner,
  base,
  names,
  symbols,
  type Move,
} from "./rules";
export default function Shogi() {
  const [state, setState] = useState(initial),
    [started, setStarted] = useState(false),
    [mode, setMode] = useState<"ai" | "local">("ai"),
    [depth, setDepth] = useState(2),
    [selected, setSelected] = useState<number | null>(null),
    [drop, setDrop] = useState<number | null>(null),
    [promotion, setPromotion] = useState<Move[]>([]),
    [decision, setDecision] = useState(""),
    [overridden, setOverridden] = useState("");
  const options = useMemo(() => legal(state), [state]),
    over = overridden || result(state),
    input = useMemo(() => ({ state, depth }), [state, depth]);
  const commit = (m: Move) => {
    setState((s) => apply(s, m));
    setSelected(null);
    setDrop(null);
    setPromotion([]);
  };
  const { busy, error } = useAI(
    Worker,
    input,
    started && mode === "ai" && state.turn === 2 && !over && !decision,
    (m: Move | null) => {
      if (m) commit(m);
    },
  );
  const canPlay =
    started && !over && !busy && !(mode === "ai" && state.turn === 2);
  const select = (i: number) => {
    if (!canPlay) return;
    const candidates = options.filter(
      (m) =>
        m.to === i && (drop ? m.drop === drop : m.from === selected && !m.drop),
    );
    if (candidates.length > 1) setPromotion(candidates);
    else if (candidates.length) commit(candidates[0]);
    else {
      setDrop(null);
      setSelected(owner(state.board[i]) === state.turn ? i : null);
    }
  };
  const drag = usePieceDrag<{ from: number; drop?: number }>({
    canDrag: (s) =>
      canPlay &&
      (s.drop
        ? state.hands[state.turn - 1][s.drop] > 0
        : owner(state.board[s.from]) === state.turn),
    onStart: (s) => {
      setSelected(s.drop ? null : s.from);
      setDrop(s.drop || null);
    },
    elements: (_, e) => [e.querySelector<HTMLElement>(".shogi-piece") || e],
    onDrop: (source, e) => {
      if (!e) return false;
      const ms = options.filter(
        (m) =>
          m.to === Number(e.dataset.drop) &&
          (source.drop
            ? m.drop === source.drop
            : m.from === source.from && !m.drop),
      );
      if (!ms.length) return false;
      if (ms.length > 1) setPromotion(ms);
      else commit(ms[0]);
      return true;
    },
  });
  return (
    <GameLayout
      id="shogi-ajedrez-japones"
      started={started}
      onStart={() => setStarted(true)}
      onReset={() => {
        setState(initial());
        setStarted(false);
        setSelected(null);
        setDrop(null);
        setPromotion([]);
        setOverridden("");
        setDecision("");
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
          ? "Gote está pensando…"
          : "Turno de " +
            (state.turn === 1 ? "Sente" : "Gote") +
            (checked(state) ? " · jaque" : ""))
      }
      controls={
        <>
          <div className="shogi-hands">
            {[1, 2].map((p) => (
              <div key={p}>
                <small>{p === 1 ? "Sente" : "Gote"}</small>
                {state.hands[p - 1].map((n, t) =>
                  n > 0 && t > 0 ? (
                    <button
                      key={t}
                      {...drag.bind({ from: -1, drop: t })}
                      data-draggable={p === state.turn ? "" : undefined}
                      aria-label={
                        "Reintroducir " +
                        names[t] +
                        ", " +
                        n +
                        " en reserva de " +
                        (p === 1 ? "Sente" : "Gote")
                      }
                      disabled={!canPlay || p !== state.turn}
                      className={
                        drop === t && p === state.turn ? "selected" : ""
                      }
                      onClick={() => {
                        if (!drag.suppressClick()) {
                          setSelected(null);
                          setDrop(t);
                        }
                      }}
                    >
                      <span className="shogi-piece">{symbols[t]}</span>
                      <b>{n}</b>
                    </button>
                  ) : null,
                )}
                {!state.hands[p - 1].some(Boolean) && <span>sin capturas</span>}
              </div>
            ))}
          </div>
          <button
            disabled={!impasse(state) || !!over}
            onClick={() => setDecision("impasse")}
          >
            Impasse
          </button>
          <button disabled={!!over} onClick={() => setDecision("resign")}>
            Rendirse
          </button>
        </>
      }
      rules="Shogi, tablero 9×9. Sente empieza. Las capturas pasan a tu reserva sin promoción y se pueden reintroducir como una jugada. Selecciona una pieza para ver destinos o arrástrala; selecciona una reserva para colocarla. Promociona al salir, entrar o mover dentro de las tres filas rivales; la promoción de peón, lanza y caballo es obligatoria cuando no podrían mover. No se permite otro peón sin promocionar en la misma columna ni dar mate con un peón recién reintroducido. No puedes dejar a tu rey en jaque. Cuatro repeticiones requieren otra partida; pierde quien fuerza jaque perpetuo. Impasse, con ambos reyes en campo rival y sin jaque, permite un recuento consensuado a 24 puntos (torres y alfiles valen 5, otras piezas 1). IA de búsqueda limitada, sin reloj de competición."
    >
      <div className="eastern-board shogi-board">
        {state.board.map((v, i) => (
          <button
            key={i}
            {...drag.bind({ from: i })}
            data-draggable={owner(v) === state.turn ? "" : undefined}
            data-drop={i}
            aria-label={
              "Fila " +
              (Math.floor(i / 9) + 1) +
              ", columna " +
              ((i % 9) + 1) +
              (v
                ? ", " +
                  names[base(v)] +
                  (Math.abs(v) > 8 ? " promocionado" : "") +
                  " de " +
                  (v > 0 ? "Sente" : "Gote")
                : ", vacía")
            }
            disabled={!canPlay}
            className={
              (selected === i ? "selected " : "") +
              (options.some(
                (m) =>
                  m.to === i &&
                  (drop ? m.drop === drop : m.from === selected && !m.drop),
              )
                ? "legal"
                : "")
            }
            onClick={() => {
              if (!drag.suppressClick()) select(i);
            }}
          >
            {v !== 0 && (
              <span
                className={
                  "shogi-piece " +
                  (v < 0 ? "opponent " : "") +
                  (Math.abs(v) > 8 ? "promoted" : "")
                }
              >
                {symbols[Math.abs(v)]}
              </span>
            )}
          </button>
        ))}
      </div>
      {promotion.length > 0 && (
        <Overlay title="Promoción" onClose={() => setPromotion([])}>
          <p>La pieza puede ascender en este movimiento.</p>
          {promotion.map((m, i) => (
            <button key={i} className="primary full" onClick={() => commit(m)}>
              {m.promote ? "Promocionar" : "Conservar pieza"}
            </button>
          ))}
        </Overlay>
      )}
      {decision && (
        <Overlay
          title={
            decision === "impasse"
              ? "Recuento de impasse"
              : "Confirmar rendición"
          }
          onClose={() => setDecision("")}
        >
          <p>
            {decision === "impasse"
              ? impasse(state) + ". Ambos jugadores deben aceptar el recuento."
              : "Gana " +
                (mode === "ai" || state.turn === 1 ? "Gote" : "Sente") +
                "."}
          </p>
          <button
            className="primary full"
            onClick={() => {
              setOverridden(
                decision === "impasse"
                  ? impasse(state)!
                  : "Gana " +
                      (mode === "ai" || state.turn === 1 ? "Gote" : "Sente") +
                      " por rendición",
              );
              setDecision("");
            }}
          >
            {decision === "impasse"
              ? "Aceptar ambos el recuento"
              : "Confirmar rendición"}
          </button>
        </Overlay>
      )}
    </GameLayout>
  );
}
