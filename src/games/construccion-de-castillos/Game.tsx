import { useState } from "react";
import { usePieceDrag } from "../../shared/usePieceDrag";
import GameLayout from "../../shared/GameLayout";
import {
  useMatch,
  useMatchAI,
  PlayerSelect,
  ScoreStrip,
} from "../../shared/useMatch";
import {
  initial,
  act,
  automatic,
  plots,
  terrainNames,
  legalPlace,
} from "./rules";
export default function Castles() {
  const m = useMatch(initial),
    s = m.state,
    e = s.estates[s.turn],
    [die, setDie] = useState(0),
    [tile, setTile] = useState(0),
    d = Math.min(die, s.dice.length - 1);
  const ai = useMatchAI(m, s.turn, !!s.winner, automatic);
  const drag = usePieceDrag<number>({
    canDrag: (i) => m.started && !ai && !s.winner && e.reserve[i] !== undefined,
    onStart: setTile,
    onDrop: (i, target) => {
      if (!target || !legalPlace(s, i, +target.dataset.drop!, d)) return false;
      m.setState((x) => act(x, "place", d, i, +target.dataset.drop!));
      return true;
    },
  });
  return (
    <GameLayout
      id="construccion-de-castillos"
      started={m.started}
      onStart={() => {
        setDie(0);
        setTile(0);
        m.start();
      }}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      roomPlayers={m.players}
      status={
        s.winner
          ? `Victoria: ${s.winner.map((p) => `J${p + 1}`).join(", ")}`
          : `J${s.turn + 1} · ronda ${s.round}/10 · ${e.workers} trabajadores`
      }
      rules="Adaptación original de construcción con dados. Obtén losetas, completa regiones y usa trabajadores para ajustar el valor al colocar."
      menu={
        <>
          <PlayerSelect value={m.players} onChange={m.setPlayers} />
          {m.seats}
        </>
      }
    >
      <div className="castle-table">
        <ScoreStrip scores={s.estates.map((e) => e.score)} turn={s.turn} />
        <div className="castle-workspace">
          <svg className="estate-board" viewBox="-4 -3.3 8 6.6">
            {plots.map((p, i) => {
              const x = p.q + p.r * 0.5,
                y = p.r * 0.866,
                type = e.board[i];
              return (
                <g
                  key={i}
                  data-drop={i}
                  role="button"
                  tabIndex={0}
                  aria-label={`Parcela ${i + 1}, ${terrainNames[p.terrain]}, valor ${p.pip}`}
                  onClick={() => {
                    if (!ai) m.setState((x) => act(x, "place", d, tile, i));
                  }}
                  onKeyDown={(event) => {
                    if ((event.key === "Enter" || event.key === " ") && !ai)
                      m.setState((x) => act(x, "place", d, tile, i));
                  }}
                >
                  <polygon
                    points={`${x - 0.48},${y - 0.277} ${x},${y - 0.554} ${x + 0.48},${y - 0.277} ${x + 0.48},${y + 0.277} ${x},${y + 0.554} ${x - 0.48},${y + 0.277}`}
                    fill={
                      [
                        "#8a8368",
                        "#7c985e",
                        "#847c6e",
                        "#b58865",
                        "#609cbb",
                        "#af9bc1",
                      ][type < 0 ? p.terrain : type]
                    }
                    opacity={type < 0 ? 0.35 : 1}
                    stroke={legalPlace(s, tile, i, d) ? "#f7d66b" : "#d3c6a5"}
                    strokeWidth=".06"
                  />
                  <text
                    x={x}
                    y={y + 0.1}
                    fontSize=".3"
                    textAnchor="middle"
                    fill="currentColor"
                  >
                    {type < 0 ? p.pip : ["♜", "♧", "◈", "▤", "≈", "✦"][type]}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="castle-depots">
            {s.market.map((items, depot) => (
              <div key={depot}>
                <b>Depósito {depot + 1}</b>
                <div className="action-row">
                  {items.map((t, i) => (
                    <button
                      key={i}
                      disabled={
                        ai ||
                        s.dice[d] !== depot + 1 ||
                        e.reserve.length >= 3 ||
                        !!s.winner
                      }
                      onClick={() => m.setState((x) => act(x, "take", d, i))}
                    >
                      {terrainNames[t]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="action-row">
          {s.dice.map((pip, i) => (
            <button
              key={i}
              aria-pressed={d === i}
              className={"dice-button " + (d === i ? "chosen" : "")}
              onClick={() => setDie(i)}
            >
              {["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][pip]}
            </button>
          ))}
          <button
            disabled={ai || !!s.winner}
            onClick={() => m.setState((x) => act(x, "workers", d))}
          >
            Cambiar dado por 2 trabajadores
          </button>
        </div>
        <div className="action-row">
          Reserva{" "}
          {e.reserve.map((t, i) => (
            <button
              key={i}
              {...drag.bind(i)}
              className={tile === i ? "chosen" : ""}
              onClick={() => setTile(i)}
            >
              {terrainNames[t]}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
