import { useObservation } from "../../shared/Observation";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
import { useEffect, useState } from "react";
import { Lightbulb, RotateCcw, Eraser } from "lucide-react";
import GameLayout from "../../shared/GameLayout";
import { generate, valid, complete, type Puzzle } from "./rules";
export default function Sudoku() {
  const { watching } = useObservation();
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generate(36)),
    [board, setBoard] = useState(puzzle.givens),
    [selected, setSelected] = useState<number | null>(null),
    [started, setStarted] = useState(false),
    [holes, setHoles] = useState(36),
    [pencil, setPencil] = useState(false),
    [notes, setNotes] = useState<Record<number, number[]>>({}),
    [message, setMessage] = useState(""),
    [history, setHistory] = useState<
      { board: number[]; notes: Record<number, number[]> }[]
    >([]);
  const win = complete(board);
  const setNumber = (v: number) => {
    if (!started || win || selected === null || puzzle.givens[selected]) return;
    setHistory((h) => [...h, { board, notes }].slice(-100));
    if (pencil && v) {
      const list = notes[selected] || [];
      setNotes((n) => ({
        ...n,
        [selected]: list.includes(v)
          ? list.filter((x) => x !== v)
          : [...list, v].sort(),
      }));
    } else {
      setBoard((b) => b.map((n, i) => (i === selected ? v : n)));
      setNotes((n) => ({ ...n, [selected]: [] }));
    }
    setMessage("");
  };
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (
        watching ||
        !started ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement
      )
        return;
      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        setNumber(Number(e.key));
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        setNumber(0);
      }
      if (selected !== null) {
        const d = (
          { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -9, ArrowDown: 9 } as Record<
            string,
            number
          >
        )[e.key];
        if (d) {
          e.preventDefault();
          setSelected(Math.max(0, Math.min(80, selected + d)));
        }
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [started, board, selected, pencil, notes, win, puzzle, history]);
  const hint = () => {
    if (board.some((v, i) => v && v !== puzzle.solution[i])) {
      setMessage(
        "Hay un número que no encaja con la solución. Revisa tus entradas antes de pedir una pista.",
      );
      return;
    }
    const i =
      selected !== null && !board[selected]
        ? selected
        : board.findIndex((v) => !v);
    if (i < 0) return;
    setHistory((h) => [...h, { board, notes }]);
    setBoard((b) => b.map((v, j) => (j === i ? puzzle.solution[i] : v)));
    setSelected(i);
    setMessage("Pista: esta casilla contiene un " + puzzle.solution[i] + ".");
  };
  useAI(
    Worker,
    board,
    started && watching && !win,
    (next: { index: number; value: number } | null) => {
      if (next && next.index >= 0) {
        setBoard((b) => b.map((v, i) => (i === next.index ? next.value : v)));
        setSelected(next.index);
        setMessage("Deducción y búsqueda desde las pistas visibles.");
      } else
        setMessage(
          "La posición no admite solución: revisa las entradas o reinicia.",
        );
    },
  );
  return (
    <GameLayout
      id="sudoku"
      started={started}
      onStart={() => {
        const next = generate(holes);
        setPuzzle(next);
        setBoard(next.givens);
        setStarted(true);
      }}
      onReset={() => {
        setStarted(false);
        setSelected(null);
        setNotes({});
        setHistory([]);
        setMessage("");
      }}
      menu={
        <label className="field-label">
          Dificultad
          <select
            value={holes}
            onChange={(e) => setHoles(Number(e.target.value))}
          >
            <option value={36}>Suave · más números iniciales</option>
            <option value={44}>Medio · un reto equilibrado</option>
            <option value={50}>Exigente · menos pistas</option>
          </select>
        </label>
      }
      status={
        win ? "¡Sudoku resuelto!" : message || "Cada número tiene su lugar."
      }
      stats={
        <div className="score-pair">
          <span>
            Casillas completas <b>{board.filter(Boolean).length}/81</b>
          </span>
        </div>
      }
      controls={
        <>
          <div className="number-pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                disabled={win}
                onClick={() => setNumber(n)}
                aria-label={"Introducir " + n}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="segmented">
            <button
              className={!pencil ? "active" : ""}
              onClick={() => setPencil(false)}
            >
              Número
            </button>
            <button
              className={pencil ? "active" : ""}
              onClick={() => setPencil(true)}
            >
              Notas
            </button>
          </div>
          <div className="game-actions">
            <button onClick={() => setNumber(0)}>
              <Eraser size={15} /> Borrar
            </button>
            <button
              disabled={!history.length}
              onClick={() => {
                const h = history.at(-1)!;
                setBoard(h.board);
                setNotes(h.notes);
                setHistory((v) => v.slice(0, -1));
                setMessage("");
              }}
            >
              <RotateCcw size={15} /> Deshacer
            </button>
          </div>
          <button disabled={win} className="secondary full" onClick={hint}>
            <Lightbulb size={15} /> Una pista
          </button>
        </>
      }
      rules="Completa las filas, columnas y bloques de 3×3 con los números del 1 al 9, sin repetir. Cada tablero se genera con una única solución comprobada. Selecciona una casilla y usa los números o el teclado; puedes escribir notas. Los conflictos visibles se marcan en rojo. Las pistas revelan un número de la solución y no sobrescriben tus entradas."
    >
      <div className="sudoku-board">
        {board.map((v, i) => (
          <button
            key={i}
            disabled={!started || win}
            onClick={() => setSelected(i)}
            aria-label={
              "Fila " +
              (Math.floor(i / 9) + 1) +
              ", columna " +
              ((i % 9) + 1) +
              ": " +
              (v || "vacía") +
              (puzzle.givens[i] ? ", fija" : "")
            }
            className={
              (puzzle.givens[i] ? "given" : "") +
              (selected === i ? " selected" : "") +
              (v && !valid(board, i, v) ? " conflict" : "") +
              (i % 9 === 2 || i % 9 === 5 ? " block-right" : "") +
              (Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5
                ? " block-bottom"
                : "") +
              (selected !== null && v && v === board[selected] ? " same" : "")
            }
          >
            {v || (
              <span className="pencil-notes">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <i key={n}>{notes[i]?.includes(n) ? n : ""}</i>
                ))}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="stage-caption">
        Una solución. Todo el tiempo del mundo.
      </div>
    </GameLayout>
  );
}
