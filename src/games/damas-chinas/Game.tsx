import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useMatch, useMatchAI, PlayerSelect } from "../../shared/useMatch";
import { usePieceDrag } from "../../shared/usePieceDrag";
import { initial, cells, destinations, move, automatic } from "./rules";
export default function ChineseCheckers() {
  const m = useMatch(initial),
    s = m.state,
    [selected, select] = useState<number | null>(null);
  const ai = useMatchAI(m, s.turn, s.winner !== null || s.draw, automatic),
    legal = selected !== null ? destinations(s, selected) : [];
  const drag = usePieceDrag<number>({
    canDrag: (i) => m.started && !ai && s.board[i] === s.turn,
    onStart: select,
    onDrop: (a, e) => {
      if (e && destinations(s, a).includes(+e.dataset.drop!)) {
        m.setState((x) => move(x, a, +e.dataset.drop!));
        select(null);
        return true;
      }
      return false;
    },
  });
  return (
    <GameLayout
      id="damas-chinas"
      started={m.started}
      onStart={() => {
        select(null);
        m.start();
      }}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      roomPlayers={m.players}
      status={
        s.winner !== null
          ? `Gana J${s.winner + 1}`
          : s.draw
            ? "Tablas por repetición o límite de movimientos"
            : `J${s.turn + 1} · llega al triángulo opuesto`
      }
      rules="Diez canicas por jugador. Un paso o una cadena de saltos; los saltos no capturan."
      menu={
        <>
          <PlayerSelect
            value={m.players}
            onChange={m.setPlayers}
            choices={[2, 3, 4, 6]}
          />
          {m.seats}
        </>
      }
      controls={
        <button
          disabled={s.board.some(
            (v, i) => v === s.turn && destinations(s, i).length > 0,
          )}
          onClick={() => m.setState(automatic)}
        >
          Pasar si no hay movimiento
        </button>
      }
    >
      <svg
        className="chinese-board"
        viewBox="-9 -8 18 16"
        aria-label="Estrella de 121 casillas"
      >
        <defs>
          <radialGradient id="marble">
            <stop stopColor="white" stopOpacity=".65" />
            <stop offset=".35" stopColor="currentColor" />
            <stop offset="1" stopColor="black" stopOpacity=".5" />
          </radialGradient>
        </defs>
        <path
          d="M0-7.4 2.1-3.7 6.4-3.7 4.3 0 6.4 3.7 2.1 3.7 0 7.4-2.1 3.7-6.4 3.7-4.3 0-6.4-3.7-2.1-3.7Z"
          fill="#ad8a58"
          stroke="#efd397"
          strokeWidth=".2"
        />
        {cells.map((c, i) => {
          const x = c.q + c.r * 0.5,
            y = c.r * 0.866,
            owner = s.board[i];
          return (
            <g
              key={i}
              data-drop={i}
              {...drag.bind(i)}
              role="button"
              tabIndex={0}
              aria-label={`Casilla ${i + 1}${owner >= 0 ? `, J${owner + 1}` : ""}`}
              onClick={() => {
                if (ai || drag.suppressClick()) return;
                if (selected !== null && legal.includes(i)) {
                  m.setState((z) => move(z, selected, i));
                  select(null);
                } else select(owner === s.turn ? i : null);
              }}
              onKeyDown={(e) => {
                if (!ai && m.started && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  if (selected !== null && legal.includes(i)) {
                    m.setState((z) => move(z, selected, i));
                    select(null);
                  } else select(owner === s.turn ? i : null);
                }
              }}
            >
              <circle
                cx={x}
                cy={y}
                r=".33"
                fill={legal.includes(i) ? "#f7e4a9" : "#564635"}
                stroke={selected === i ? "white" : "#d8bd83"}
                strokeWidth=".05"
              />
              {owner >= 0 && (
                <circle
                  cx={x}
                  cy={y - 0.03}
                  r=".32"
                  fill="url(#marble)"
                  style={{
                    color: [
                      "#35b3d2",
                      "#ec7958",
                      "#83bd6b",
                      "#ac83d3",
                      "#f0c65a",
                      "#e98fae",
                    ][owner],
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </GameLayout>
  );
}
