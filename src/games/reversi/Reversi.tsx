import { useObservation } from "../../shared/Observation";
import AIWorker from "./ai.worker?worker";
import { useMemo, useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { usePieceDrag } from "../../shared/usePieceDrag";
import { useAI } from "../../shared/useAI";
import { initial, moves, play, count } from "./rules";
export default function Reversi() {
  const { watching } = useObservation();
  const [board, setBoard] = useState(initial),
    [turn, setTurn] = useState(1),
    [started, setStarted] = useState(false),
    [mode, setMode] = useState<"ai" | "local">("ai"),
    [passes, setPasses] = useState("");
  const legal = useMemo(() => moves(board, turn), [board, turn]);
  const over = !legal.length && !moves(board, 3 - turn).length;
  const place = (r: number, c: number) => {
    const next = play(board, r, c, turn);
    if (!next) return;
    const rival = moves(next, 3 - turn);
    setBoard(next);
    if (rival.length) {
      setTurn(3 - turn);
      setPasses("");
    } else {
      setPasses(
        (turn === 1 ? "Blancas" : "Negras") + " no tiene jugadas y pasa.",
      );
    }
  };
  const { busy, error } = useAI<
    { board: number[][]; turn: number },
    [number, number] | null
  >(
    AIWorker,
    useMemo(() => ({ board, turn }), [board, turn]),
    started && (watching || (mode === "ai" && turn === 2)) && !over,
    (m) => {
      if (m) place(...m);
    },
  );
  const drag = usePieceDrag<number>({
    canDrag: () =>
      started && !over && !busy && !(watching || (mode === "ai" && turn === 2)),
    onDrop: (_source, e) => {
      if (!e) return false;
      const i = Number(e.dataset.drop),
        r = Math.floor(i / 8),
        c = i % 8;
      if (!legal.some(([rr, cc]) => rr === r && cc === c)) return false;
      place(r, c);
      return true;
    },
  });
  return (
    <GameLayout
      id="reversi"
      started={started}
      onStart={() => setStarted(true)}
      onReset={() => {
        setBoard(initial());
        setTurn(1);
        setStarted(false);
        setPasses("");
      }}
      mode={mode}
      setMode={setMode}
      status={
        error ||
        (over
          ? count(board, 1) === count(board, 2)
            ? "Empate"
            : count(board, 1) > count(board, 2)
              ? "Ganan negras"
              : "Ganan blancas"
          : busy
            ? "La IA está pensando…"
            : (passes ? passes + " " : "") +
              "Turno de " +
              (turn === 1 ? "negras" : "blancas"))
      }
      controls={
        <div className="reversi-reserve">
          <button
            {...drag.bind(turn)}
            data-draggable=""
            className="reserve-piece"
            aria-label="Arrastrar nueva ficha"
            disabled={
              !started ||
              over ||
              busy ||
              watching ||
              (mode === "ai" && turn === 2)
            }
          >
            <span
              className={"reversi-disc " + (turn === 1 ? "black" : "white")}
            />
          </button>
          <span>Arrastra al tablero o pulsa una casilla.</span>
        </div>
      }
      stats={
        <div className="score-pair">
          <span>
            ● Negras <b>{count(board, 1)}</b>
          </span>
          <span>
            ○ Blancas <b>{count(board, 2)}</b>
          </span>
        </div>
      }
      rules="Coloca una ficha para encerrar fichas rivales entre ella y otra tuya. Se voltean todas las fichas encerradas, en las ocho direcciones. Si no hay jugadas, se pasa automáticamente. Cuando nadie puede jugar, gana quien tenga más fichas. Negras comienza."
    >
      <div className="reversi-board">
        {board.flatMap((row, r) =>
          row.map((v, c) => (
            <button
              key={r + "-" + c}
              data-drop={r * 8 + c}
              aria-label={
                "Fila " +
                (r + 1) +
                ", columna " +
                (c + 1) +
                (v
                  ? ", " + (v === 1 ? "negra" : "blanca")
                  : legal.some(([rr, cc]) => rr === r && cc === c)
                    ? ", jugada legal"
                    : ", vacía")
              }
              disabled={
                !started ||
                over ||
                busy ||
                watching ||
                (mode === "ai" && turn === 2) ||
                !legal.some(([rr, cc]) => rr === r && cc === c)
              }
              onClick={() => {
                if (!drag.suppressClick()) place(r, c);
              }}
            >
              {v ? (
                <span
                  className={"reversi-disc " + (v === 1 ? "black" : "white")}
                />
              ) : legal.some(([rr, cc]) => rr === r && cc === c) && started ? (
                <i className="move-dot" />
              ) : null}
            </button>
          )),
        )}
      </div>
      <div className="stage-caption">
        El tablero puede cambiar en una sola jugada.
      </div>
    </GameLayout>
  );
}
