import { useRoomState, useTableRoom } from "../../shared/TableRoom";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
import { useObservation } from "../../shared/Observation";
import GameLayout from "../../shared/GameLayout";
import { useMemo } from "react";
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
  const room = useTableRoom();
  const { watching } = useObservation();
  const [grid, setGrid] = useRoomState("grid", emptyGrid),
    [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai"),
    [turn, setTurn] = useRoomState<Player>("turn", 1),
    [playing, setPlaying] = useRoomState("playing", false),
    [difficulty, setDifficulty] = useRoomState("difficulty", 5),
    [moves, setMoves] = useRoomState<number[][][]>("moves", []);
  const win = winningLine(grid),
    draw = !win && grid[0].every(Boolean),
    over = Boolean(win || draw);
  const play = (col: number) => {
    if (
      !playing ||
      over ||
      thinking ||
      watching ||
      room.machine(turn - 1, mode === "ai" && turn === 2)
    )
      return;
    const next = drop(grid, col, turn);
    if (next) {
      setMoves((m) => [...m, grid]);
      setGrid(next);
      setTurn(turn === 1 ? 2 : 1);
    }
  };
  const input = useMemo(
    () => ({ grid, depth: difficulty, turn }),
    [grid, difficulty, turn],
  );
  const { busy: thinking, error } = useAI(
    Worker,
    input,
    playing &&
      !over &&
      (watching || room.machine(turn - 1, mode === "ai" && turn === 2)),
    (col: number) => {
      const next = drop(grid, col, turn);
      if (next) {
        setMoves((m) => [...m, grid]);
        setGrid(next);
        setTurn(turn === 1 ? 2 : 1);
      }
    },
  );
  const start = () => {
    setGrid(emptyGrid());
    setTurn(1);
    setPlaying(true);
    setMoves([]);
  };
  const undo = () => {
    if (room.online || !moves.length) return;
    const count = mode === "ai" && turn === 1 ? 2 : 1;
    setGrid(moves[Math.max(0, moves.length - count)]);
    setMoves((m) => m.slice(0, -count));
    setTurn(mode === "ai" ? 1 : turn === 1 ? 2 : 1);
  };
  return (
    <GameLayout
      roomTurn={turn - 1}
      id="connect-four"
      started={playing}
      onStart={start}
      onReset={() => setPlaying(false)}
      mode={mode}
      setMode={setMode}
      status={
        error ||
        (win
          ? "Gana " +
            (win.player === 1
              ? mode === "ai" && !watching
                ? "el jugador"
                : "el jugador 1"
              : mode === "ai" && !watching
                ? "la IA"
                : "el jugador 2")
          : draw
            ? "Empate"
            : thinking
              ? "La IA está pensando…"
              : "Turno de " + (turn === 1 ? "rojas" : "doradas"))
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
          disabled={room.online || !moves.length || thinking}
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
                  room.machine(turn - 1, mode === "ai" && turn === 2)
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
                    room.machine(turn - 1, mode === "ai" && turn === 2)
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
