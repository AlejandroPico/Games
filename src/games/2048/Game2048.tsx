import { useObservation, useAutoplay } from "../../shared/Observation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Lightbulb,
} from "lucide-react";
import GameLayout from "../../shared/GameLayout";
import {
  initial,
  slide,
  spawn,
  over,
  suggest,
  type Direction,
  type Grid,
} from "./rules";
export default function Game2048() {
  const { watching } = useObservation();
  const [board, setBoard] = useState(initial),
    [score, setScore] = useState(0),
    [started, setStarted] = useState(false),
    [history, setHistory] = useState<{ board: Grid; score: number }[]>([]),
    [message, setMessage] = useState("");
  const lost = over(board),
    won = board.flat().some((v) => v >= 2048),
    pointer = useRef<{ x: number; y: number } | null>(null);
  const move = (d: Direction) => {
    if (!started || lost) return;
    const result = slide(board, d);
    if (result.changed) {
      setHistory((h) => [...h, { board, score }].slice(-30));
      setBoard(spawn(result.board));
      setScore((s) => s + result.score);
      setMessage("");
    }
  };
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const keys: Record<string, Direction> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
        a: "left",
        d: "right",
        w: "up",
        s: "down",
      };
      if (
        !watching &&
        started &&
        keys[e.key] &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLSelectElement
        )
      ) {
        e.preventDefault();
        move(keys[e.key]);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [board, started, lost, score]);
  useAutoplay(started && watching && !lost, board, () => {
    const d = suggest(board);
    if (d) move(d);
  });
  return (
    <GameLayout
      id="2048"
      started={started}
      onStart={() => setStarted(true)}
      onReset={() => {
        setBoard(initial());
        setScore(0);
        setHistory([]);
        setStarted(false);
        setMessage("");
      }}
      status={
        lost
          ? "No quedan movimientos."
          : message ||
            (won
              ? "¡2048 conseguido! Puedes seguir jugando."
              : "Une números iguales.")
      }
      stats={
        <div className="score-pair">
          <span>
            Puntos <b>{score}</b>
          </span>
          <span>
            Ficha mayor <b>{Math.max(...board.flat())}</b>
          </span>
        </div>
      }
      controls={
        <>
          <div className="direction-pad">
            {(
              [
                { d: "up", icon: ArrowUp },
                { d: "left", icon: ArrowLeft },
                { d: "down", icon: ArrowDown },
                { d: "right", icon: ArrowRight },
              ] as const
            ).map(({ d, icon: Icon }) => (
              <button
                key={d}
                disabled={lost}
                aria-label={
                  "Mover " +
                  {
                    up: "arriba",
                    down: "abajo",
                    left: "izquierda",
                    right: "derecha",
                  }[d]
                }
                onClick={() => move(d)}
              >
                <Icon size={19} />
              </button>
            ))}
          </div>
          <div className="game-actions">
            <button
              disabled={!history.length}
              onClick={() => {
                const h = history.at(-1)!;
                setBoard(h.board);
                setScore(h.score);
                setHistory((v) => v.slice(0, -1));
                setMessage("");
              }}
            >
              <RotateCcw size={15} /> Deshacer
            </button>
            <button
              disabled={lost}
              onClick={() =>
                setMessage(
                  "Prueba hacia " +
                    {
                      up: "arriba",
                      down: "abajo",
                      left: "la izquierda",
                      right: "la derecha",
                    }[suggest(board)] +
                    ".",
                )
              }
            >
              <Lightbulb size={15} /> Sugerencia
            </button>
          </div>
        </>
      }
      rules="Desliza todas las fichas con las flechas, WASD, los botones o un gesto sobre el tablero. Dos números iguales se fusionan una sola vez por movimiento. Después de una jugada válida aparece un 2 o un 4. Consigue 2048; puedes continuar. La partida termina cuando no hay ningún movimiento posible."
    >
      <div
        className="tiles-board"
        onPointerDown={(e) => {
          pointer.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (!pointer.current) return;
          const dx = e.clientX - pointer.current.x,
            dy = e.clientY - pointer.current.y;
          pointer.current = null;
          if (Math.max(Math.abs(dx), Math.abs(dy)) > 25)
            move(
              Math.abs(dx) > Math.abs(dy)
                ? dx > 0
                  ? "right"
                  : "left"
                : dy > 0
                  ? "down"
                  : "up",
            );
        }}
      >
        {board.flat().map((v, i) => (
          <div
            key={i}
            className={"number-tile tile-" + Math.min(v, 2048)}
            aria-label={"Casilla " + (i + 1) + ": " + (v || "vacía")}
          >
            {v || ""}
          </div>
        ))}
      </div>
      <div className="stage-caption">Una suma pequeña. Un reto enorme.</div>
    </GameLayout>
  );
}
