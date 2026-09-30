import GameLayout from "../../shared/GameLayout";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Users,
  RotateCcw,
  Info,
} from "lucide-react";
import { emptyGrid, drop, winningLine, type Player } from "./rules";
export default function ConnectFour() {
  const [grid, setGrid] = useState(emptyGrid),
    [mode, setMode] = useState<"ai" | "local">("ai"),
    [turn, setTurn] = useState<Player>(1),
    [playing, setPlaying] = useState(false),
    [thinking, setThinking] = useState(false),
    [difficulty, setDifficulty] = useState(5),
    [moves, setMoves] = useState<number[][][]>([]);
  const win = winningLine(grid),
    draw = !win && grid[0].every(Boolean),
    over = Boolean(win || draw);
  const play = (col: number) => {
    if (!playing || over || thinking || (mode === "ai" && turn === 2)) return;
    const next = drop(grid, col, turn);
    if (next) {
      setMoves((m) => [...m, grid]);
      setGrid(next);
      setTurn(turn === 1 ? 2 : 1);
    }
  };
  useEffect(() => {
    if (!playing || mode !== "ai" || turn !== 2 || over) return;
    const worker = new Worker(new URL("./ai.worker.ts", import.meta.url), {
      type: "module",
    });
    setThinking(true);
    worker.onmessage = (e) => {
      const next = drop(grid, e.data, 2);
      if (next) {
        setMoves((m) => [...m, grid]);
        setGrid(next);
        setTurn(1);
      }
      setThinking(false);
    };
    worker.onerror = () => {
      const col = grid[0].findIndex((v) => !v),
        next = drop(grid, col, 2);
      if (next) {
        setMoves((m) => [...m, grid]);
        setGrid(next);
        setTurn(1);
      }
      setThinking(false);
    };
    worker.postMessage({ grid, depth: difficulty });
    return () => {
      worker.terminate();
    };
  }, [grid, mode, turn, playing, over, difficulty]);
  const start = () => {
    setGrid(emptyGrid());
    setTurn(1);
    setPlaying(true);
    setThinking(false);
    setMoves([]);
  };
  const undo = () => {
    if (!moves.length) return;
    const count = mode === "ai" && turn === 1 ? 2 : 1;
    setGrid(moves[Math.max(0, moves.length - count)]);
    setMoves((m) => m.slice(0, -count));
    setTurn(mode === "ai" ? 1 : turn === 1 ? 2 : 1);
    setThinking(false);
  };
  return (
    <GameLayout
      id="connect-four"
      started={playing}
      onStart={start}
      onReset={() => setPlaying(false)}
      mode={mode}
      setMode={setMode}
      status={
        win
          ? "Gana " +
            (win.player === 1
              ? mode === "ai"
                ? "el jugador"
                : "el jugador 1"
              : mode === "ai"
                ? "la IA"
                : "el jugador 2")
          : draw
            ? "Empate"
            : thinking
              ? "La IA está pensando…"
              : "Turno de " + (turn === 1 ? "rojas" : "doradas")
      }
      menu={
        mode === "ai" && (
          <label className="field-label">
            Dificultad
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
            >
              <option value={3}>Principiante</option>
              <option value={5}>Club</option>
              <option value={7}>Experto</option>
            </select>
          </label>
        )
      }
      controls={
        <button
          className="secondary"
          onClick={undo}
          disabled={!moves.length || thinking}
        >
          <RotateCcw size={16} /> Deshacer
        </button>
      }
      rules="Deja caer una ficha en una columna. Gana quien conecte cuatro fichas en horizontal, vertical o diagonal. Si se llena el tablero sin cuatro en línea, hay empate."
    >
      {" "}
      <div className="connect-stage-inner">
        <div className="connect-top">
          <span className={"connect-player " + (turn === 1 ? "active" : "")}>
            <i className="disc red" /> {mode === "ai" ? "Tú" : "Jugador 1"}
          </span>
          <span className={"connect-player " + (turn === 2 ? "active" : "")}>
            <i className="disc gold" /> {mode === "ai" ? "IA" : "Jugador 2"}
          </span>
        </div>
        <div className="connect-board">
          <div className="column-controls">
            {Array.from({ length: 7 }, (_, c) => (
              <button
                key={c}
                onClick={() => play(c)}
                disabled={
                  !playing ||
                  over ||
                  thinking ||
                  Boolean(grid[0][c]) ||
                  (mode === "ai" && turn === 2)
                }
                aria-label={"Soltar ficha en columna " + (c + 1)}
              >
                <ChevronIcon />
              </button>
            ))}
          </div>
          <div className="connect-grid">
            {grid.flatMap((row, r) =>
              row.map((v, c) => (
                <button
                  key={r + "-" + c}
                  onClick={() => play(c)}
                  disabled={
                    !playing ||
                    over ||
                    thinking ||
                    Boolean(grid[0][c]) ||
                    (mode === "ai" && turn === 2)
                  }
                  aria-label={
                    "Fila " +
                    (r + 1) +
                    ", columna " +
                    (c + 1) +
                    (v ? ", ficha " + (v === 1 ? "roja" : "dorada") : ", vacía")
                  }
                  className={
                    "connect-cell " +
                    (v === 1 ? "red" : v === 2 ? "gold" : "") +
                    (win?.cells.some(([rr, cc]) => rr === r && cc === c)
                      ? " winning"
                      : "")
                  }
                >
                  <span />
                </button>
              )),
            )}
          </div>
        </div>
        <div className="connect-legs">
          <i />
          <i />
        </div>
        <p className="connect-hint">
          Elige una columna. La gravedad hace el resto.
        </p>
      </div>
    </GameLayout>
  );
}
function ChevronIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 3v16m-6-6 6 6 6-6" />
    </svg>
  );
}
