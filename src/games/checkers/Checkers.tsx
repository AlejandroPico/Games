import { useRoomState, useTableRoom } from "../../shared/TableRoom";
import { useObservation } from "../../shared/Observation";
import AIWorker from "./ai.worker?worker";
import { useMemo } from "react";
import GameLayout from "../../shared/GameLayout";
import { usePieceDrag } from "../../shared/usePieceDrag";
import { useAI } from "../../shared/useAI";
import { initial, moves, type Move } from "./rules";
export default function Checkers() {
  const room = useTableRoom();
  const { watching } = useObservation();
  const [board, setBoard] = useRoomState("board", initial),
    [turn, setTurn] = useRoomState("turn", 1),
    [started, setStarted] = useRoomState("started", false),
    [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai"),
    [path, setPath] = useRoomState<number[]>("path", []),
    [quiet, setQuiet] = useRoomState("quiet", 0),
    [seen, setSeen] = useRoomState<string[]>("seen", [
      initial().join(",") + "1",
    ]);
  const legal = useMemo(() => moves(board, turn), [board, turn]),
    key = board.join(",") + turn,
    draw = quiet >= 80 || seen.filter((s) => s === key).length >= 3,
    over = draw || !legal.length;
  const apply = (m: Move) => {
    const v = board[m.path[0]],
      nextTurn = 3 - turn;
    setBoard(m.board);
    setTurn(nextTurn);
    setPath([]);
    setQuiet(m.captures.length || v <= 2 ? 0 : quiet + 1);
    setSeen((s) => [...s, m.board.join(",") + nextTurn]);
  };
  const { busy, error } = useAI<{ board: number[]; turn: number }, Move | null>(
    AIWorker,
    useMemo(() => ({ board, turn }), [board, turn]),
    started &&
      (watching || room.machine(turn - 1, mode === "ai" && turn === 2)) &&
      !over,
    (m) => {
      if (m) apply(m);
    },
  );
  const candidates = legal.filter((m) => path.every((v, i) => m.path[i] === v));
  const targets = candidates.map((m) => m.path[path.length]);
  const choose = (i: number) => {
    if (!path.length || !targets.includes(i)) {
      if (path.length <= 1 && legal.some((m) => m.path[0] === i)) setPath([i]);
      else if (path.length <= 1) setPath([]);
      return;
    }
    const next = [...path, i],
      matching = legal.filter((m) => next.every((v, j) => m.path[j] === v));
    const complete = matching.find((m) => m.path.length === next.length);
    if (complete) apply(complete);
    else setPath(next);
  };
  const preview = [...board];
  if (path.length > 1) {
    const moving = preview[path[0]];
    preview[path[0]] = 0;
    for (let j = 1; j < path.length; j++) {
      const a = path[j - 1],
        b = path[j];
      preview[
        ((Math.floor(a / 8) + Math.floor(b / 8)) / 2) * 8 +
          ((a % 8) + (b % 8)) / 2
      ] = 0;
    }
    preview[path.at(-1)!] = moving;
  }
  const drag = usePieceDrag<number>({
    canDrag: (i) =>
      started &&
      !over &&
      !busy &&
      !(watching || room.machine(turn - 1, mode === "ai" && turn === 2)) &&
      (path.length > 1
        ? path.at(-1) === i
        : legal.some((m) => m.path[0] === i)),
    onStart: (i) => choose(i),
    elements: (_i, e) => [e.querySelector<HTMLElement>(".checkers-disc")!],
    onDrop: (_from, e) => {
      if (!e || !path.length || !targets.includes(Number(e.dataset.drop)))
        return false;
      choose(Number(e.dataset.drop));
      return true;
    },
  });
  return (
    <GameLayout
      roomTurn={turn - 1}
      id="checkers"
      started={started}
      onStart={() => setStarted(true)}
      onReset={() => {
        setBoard(initial());
        setTurn(1);
        setPath([]);
        setQuiet(0);
        setSeen([initial().join(",") + "1"]);
        setStarted(false);
      }}
      mode={mode}
      setMode={setMode}
      status={
        error ||
        (draw
          ? "Tablas"
          : !legal.length
            ? "Gana " +
              (turn === 1
                ? mode === "ai"
                  ? "la IA"
                  : "el jugador 2"
                : "el jugador 1")
            : busy
              ? "La IA está pensando…"
              : path.length > 1
                ? "Completa la captura múltiple"
                : "Turno de " +
                  (turn === 1 ? "rojas" : "verdes") +
                  (legal[0]?.captures.length ? " · captura obligatoria" : ""))
      }
      rules="Damas inglesas, tablero 8×8. Las piezas normales avanzan y capturan en diagonal hacia delante. Las damas mueven y capturan una casilla en ambas direcciones. Puedes arrastrar una pieza a su destino o seleccionar con clics; en una captura múltiple arrastra salto a salto. Capturar es obligatorio y hay que completar todos los saltos disponibles; puedes elegir cualquier cadena. Al coronar termina el turno. Ganas si el rival no puede mover. Tablas por triple repetición o 40 movimientos de cada jugador sin captura ni movimiento de pieza normal."
    >
      <div className="checkers-board">
        {preview.map((v, i) => (
          <button
            key={i}
            {...drag.bind(i)}
            data-draggable={v ? "" : undefined}
            data-drop={i}
            aria-label={
              "Casilla " +
              (i + 1) +
              (v
                ? ", " + (v % 2 ? "roja" : "verde") + (v > 2 ? " coronada" : "")
                : ", vacía")
            }
            disabled={
              !started ||
              over ||
              busy ||
              watching ||
              room.machine(turn - 1, mode === "ai" && turn === 2)
            }
            className={(Math.floor(i / 8) + (i % 8)) % 2 ? "dark" : "light"}
            onClick={() => {
              if (!drag.suppressClick()) choose(i);
            }}
          >
            {v && (
              <span
                className={
                  "checkers-disc " +
                  (v % 2 ? "red" : "green") +
                  (path.at(-1) === i ? " selected" : "")
                }
              >
                {v > 2 ? "♛" : ""}
              </span>
            )}
            {path.length > 0 && targets.includes(i) && (
              <i className="move-dot" />
            )}
          </button>
        ))}
      </div>
      <div className="stage-caption">
        Una captura puede abrir todo el tablero.
      </div>
    </GameLayout>
  );
}
