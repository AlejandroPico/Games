import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useMatch } from "../../shared/useMatch";
import { usePieceDrag } from "../../shared/usePieceDrag";
import { initial, legal, move, symbols, check } from "./rules";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
export default function Chaturanga() {
  const m = useMatch(initial),
    s = m.state,
    [selected, select] = useState<number | null>(null);
  const ai = m.machine(s.turn);
  useAI(Worker, s, m.started && ai && s.winner === null && !s.draw, m.setState);
  const options = legal(s),
    drop = (a: number, b: number) => {
      if (options.some((v) => v.from === a && v.to === b)) {
        m.setState((x) => move(x, { from: a, to: b }));
        select(null);
        return true;
      }
      return false;
    };
  const drag = usePieceDrag<number>({
    canDrag: (i) => m.started && !ai && s.board[i]?.side === s.turn,
    onStart: select,
    onDrop: (a, e) => !!e && drop(a, +e.dataset.drop!),
  });
  return (
    <GameLayout
      id="chaturanga"
      started={m.started}
      onStart={() => {
        select(null);
        m.start();
      }}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      status={
        s.winner !== null
          ? `Gana J${s.winner + 1} por mate`
          : s.draw
            ? "Tablas"
            : `J${s.turn + 1}${check(s.board, s.turn) ? " · jaque" : ""}`
      }
      rules="Reconstrucción para dos bandos: elefante salta dos diagonales, consejero una diagonal, peón un paso. Sin enroque ni doble avance."
      menu={
        <p>
          Variante histórica recreativa para dos jugadores. Las tablas modernas
          evitan partidas indefinidas.
        </p>
      }
    >
      <div className="chaturanga-board">
        {s.board.map((p, i) => (
          <button
            key={i}
            data-drop={i}
            {...drag.bind(i)}
            className={(Math.floor(i / 8) + (i % 8)) % 2 ? "dark" : "light"}
            aria-label={`Casilla ${String.fromCharCode(97 + (i % 8))}${8 - Math.floor(i / 8)}${p ? `, ${p.kind} J${p.side + 1}` : ""}`}
            onClick={() => {
              if (ai || drag.suppressClick()) return;
              if (selected !== null && drop(selected, i)) return;
              select(p?.side === s.turn ? i : null);
            }}
          >
            <span className={p?.side === 0 ? "ivory-piece" : "onyx-piece"}>
              {p ? symbols[p.kind] : ""}
            </span>
            {options.some((v) => v.from === selected && v.to === i) && (
              <i className="move-dot" />
            )}
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
