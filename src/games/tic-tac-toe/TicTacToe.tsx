import { useEffect, useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { winner, bestMove, type Board, type Mark } from "./rules";
export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null)),
    [turn, setTurn] = useState<Mark>("X"),
    [mode, setMode] = useState<"ai" | "local">("ai"),
    [started, setStarted] = useState(false);
  const win = winner(board),
    draw = board.every(Boolean) && !win,
    over = Boolean(win || draw);
  useEffect(() => {
    if (!started || mode !== "ai" || turn !== "O" || over) return;
    const timer = setTimeout(() => {
      const next = [...board];
      next[bestMove(board)] = "O";
      setBoard(next);
      setTurn("X");
    }, 250);
    return () => clearTimeout(timer);
  }, [board, turn, mode, started, over]);
  const reset = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setStarted(false);
  };
  return (
    <GameLayout
      id="tic-tac-toe"
      started={started}
      onStart={() => setStarted(true)}
      onReset={reset}
      mode={mode}
      setMode={setMode}
      status={
        win
          ? "Gana " + win.mark
          : draw
            ? "Empate: ¡bien defendido!"
            : turn === "O" && mode === "ai"
              ? "La IA está pensando…"
              : "Turno de " + turn
      }
      rules="Coloca tres marcas iguales en una línea horizontal, vertical o diagonal. X comienza. La IA calcula hasta el final y nunca pierde si juega correctamente."
    >
      <div className="tic-board">
        {board.map((mark, i) => (
          <button
            key={i}
            aria-label={"Casilla " + (i + 1) + (mark ? ", " + mark : ", vacía")}
            disabled={
              !started ||
              Boolean(mark) ||
              over ||
              (mode === "ai" && turn === "O")
            }
            className={(mark || "") + (win?.line.includes(i) ? " winning" : "")}
            onClick={() => {
              const next = [...board];
              next[i] = turn;
              setBoard(next);
              setTurn(turn === "X" ? "O" : "X");
            }}
          >
            {mark === "X" ? (
              <svg viewBox="0 0 100 100">
                <path d="M26 26l48 48m0-48L26 74" />
              </svg>
            ) : mark === "O" ? (
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="28" />
              </svg>
            ) : (
              <span />
            )}
          </button>
        ))}
      </div>
      <div className="stage-caption">Tres casillas. Una buena idea.</div>
    </GameLayout>
  );
}
