import { useMemo, useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useAI } from "../../shared/useAI";
import { usePieceDrag } from "../../shared/usePieceDrag";
import Worker from "./ai.worker?worker";
import { initial, moves, apply, result, owner, type Move } from "./rules";
export default function InternationalDraughts() {
  const [state, setState] = useState(initial),
    [started, setStarted] = useState(false),
    [mode, setMode] = useState<"ai" | "local">("ai"),
    [depth, setDepth] = useState(3),
    [path, setPath] = useState<number[]>([]);
  const legal = useMemo(() => moves(state.board, state.turn), [state]),
    over = result(state),
    input = useMemo(() => ({ state, depth }), [state, depth]);
  const commit = (m: Move) => {
    setState((s) => apply(s, m));
    setPath([]);
  };
  const { busy, error } = useAI(
    Worker,
    input,
    started && mode === "ai" && state.turn === 2 && !over,
    (m: Move | null) => {
      if (m) commit(m);
    },
  );
  const candidates = legal.filter((m) => path.every((v, i) => m.path[i] === v)),
    targets = candidates.map((m) => m.path[path.length]);
  const choose = (i: number) => {
    if (path.length && targets.includes(i)) {
      const next = [...path, i],
        options = legal.filter((m) => next.every((v, j) => m.path[j] === v)),
        done = options.find((m) => m.path.length === next.length);
      if (done) commit(done);
      else setPath(next);
    } else if (path.length <= 1)
      setPath(legal.some((m) => m.path[0] === i) ? [i] : []);
  };
  const preview = [...state.board],
    taken =
      path.length > 1
        ? candidates[0]?.captures.slice(0, path.length - 1) || []
        : [];
  if (path.length > 1) {
    preview[path[0]] = 0;
    preview[path.at(-1)!] = state.board[path[0]];
  }
  const canPlay =
    started && !over && !busy && !(mode === "ai" && state.turn === 2);
  const drag = usePieceDrag<number>({
    canDrag: (i) =>
      canPlay &&
      (path.length > 1
        ? path.at(-1) === i
        : legal.some((m) => m.path[0] === i)),
    onStart: choose,
    elements: (_, e) => [e.querySelector<HTMLElement>("span")!],
    onDrop: (_, e) => {
      if (!e || !targets.includes(Number(e.dataset.drop))) return false;
      choose(Number(e.dataset.drop));
      return true;
    },
  });
  return (
    <GameLayout
      id="damas-internacionales"
      started={started}
      onStart={() => setStarted(true)}
      onReset={() => {
        setState(initial());
        setPath([]);
        setStarted(false);
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
            <option value={2}>Iniciación</option>
            <option value={3}>Club</option>
            <option value={4}>Desafío</option>
          </select>
        </label>
      }
      status={
        error ||
        over ||
        (busy
          ? "La IA está pensando…"
          : path.length > 1
            ? "Completa la captura"
            : "Turno de " +
              (state.turn === 1 ? "blancas" : "negras") +
              (legal[0]?.captures.length ? " · toma máxima obligatoria" : ""))
      }
      rules="Damas internacionales en tablero 10×10: veinte piezas por color. Blancas comienzan. Las piezas avanzan en diagonal y capturan hacia delante y atrás. Las damas recorren diagonales y pueden aterrizar en cualquier casilla libre tras la pieza capturada. Es obligatorio tomar el mayor número de piezas, sin prioridad para las damas. Las capturas quedan bloqueando hasta completar la cadena; una pieza no puede capturarse dos veces. Corona solo al terminar en la última fila. Arrastra o selecciona cada salto. Tablas por triple repetición, 25 movimientos de cada jugador solo con damas sin captura y límites de finales reducidos de 16 o 5 movimientos por jugador. Sin reloj ni arbitraje de pieza tocada."
    >
      <div className="international-board">
        {preview.map((v, i) => (
          <button
            key={i}
            {...drag.bind(i)}
            data-drop={i}
            data-draggable={owner(v) === state.turn ? "" : undefined}
            disabled={!canPlay}
            aria-label={
              "Casilla " +
              (i + 1) +
              (v
                ? ", " +
                  (owner(v) === 1 ? "blanca" : "negra") +
                  (v > 2 ? " coronada" : "")
                : ", vacía")
            }
            className={
              ((Math.floor(i / 10) + (i % 10)) % 2 ? "dark" : "light") +
              (taken.includes(i) ? " captured-pending" : "")
            }
            onClick={() => {
              if (!drag.suppressClick()) choose(i);
            }}
          >
            {v ? (
              <span
                className={
                  "draught-piece " +
                  (owner(v) === 1 ? "ivory" : "ebony") +
                  (path.at(-1) === i ? " selected" : "")
                }
              >
                {v > 2 ? "♛" : ""}
              </span>
            ) : null}
            {path.length > 0 && targets.includes(i) && (
              <i className="move-dot" />
            )}
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
