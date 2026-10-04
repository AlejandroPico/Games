import GameLayout from "../../shared/GameLayout";
import { useMatch, useMatchAI, PlayerSelect } from "../../shared/useMatch";
import {
  initial,
  track,
  position,
  options,
  toss,
  move,
  automatic,
} from "./rules";
export default function Patolli() {
  const m = useMatch(initial),
    s = m.state,
    ai = useMatchAI(m, s.turn, s.winner !== null, automatic),
    legal = options(s);
  return (
    <GameLayout
      id="patolli"
      started={m.started}
      onStart={m.start}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      roomPlayers={m.players}
      status={
        s.winner !== null
          ? `Gana J${s.winner + 1}`
          : `J${s.turn + 1} · ${s.roll === null ? "lanza los cinco frijoles" : `avanza ${s.roll}`}`
      }
      rules="Reconstrucción recreativa de Games, sin apuestas. Seis piedras, cinco frijoles, entrada con uno y llegada exacta."
      menu={
        <>
          <PlayerSelect value={m.players} onChange={m.setPlayers} />
          {m.seats}
        </>
      }
      controls={
        <>
          <button
            disabled={ai || s.roll !== null || s.winner !== null}
            onClick={() => m.setState(toss)}
          >
            Lanzar frijoles
          </button>
          <span className="beans">
            {s.beans.map((b, i) => (
              <i key={i} className={b ? "marked" : ""}>
                {b ? "●" : ""}
              </i>
            ))}
          </span>
          <div className="patolli-reserve">
            {s.pieces[s.turn].map((p, i) => (
              <button
                key={i}
                disabled={ai || !legal.includes(i)}
                onClick={() => m.setState((x) => move(x, i))}
              >
                {p < 0
                  ? `Entrar ${i + 1}`
                  : p === 52
                    ? "✓"
                    : `Piedra ${i + 1} · ${p}`}
              </button>
            ))}
          </div>
        </>
      }
    >
      <svg className="patolli-board" viewBox="-1 -1 15 15">
        <path
          d="M4.5-.5h4v5h5v4h-5v5h-4v-5h-5v-4h5Z"
          fill="#927040"
          stroke="#eacb81"
          strokeWidth=".12"
        />
        {track.map(([x, y], i) => (
          <g key={i}>
            <rect
              x={x - 0.4}
              y={y - 0.4}
              width=".8"
              height=".8"
              fill={i % 13 === 0 ? "#d5a351" : "#594629"}
              stroke="#c0a36f"
              strokeWidth=".04"
            />
            <text
              x={x}
              y={y + 0.15}
              fontSize=".28"
              textAnchor="middle"
              fill="#dec58e"
            >
              {i % 13 === 0 ? "◆" : i + 1}
            </text>
            {s.pieces.flatMap((row, p) =>
              row.map((v, k) =>
                v >= 0 && v < 52 && position(s, p, k) === i ? (
                  <circle
                    key={p + "," + k}
                    cx={x + (p % 2) * 0.16 - 0.08}
                    cy={y + Math.floor(p / 2) * 0.16 - 0.08}
                    r=".23"
                    fill={["#54bad3", "#dc7559", "#94ba6b", "#c996d0"][p]}
                    stroke="#fff"
                    strokeWidth=".03"
                  />
                ) : null,
              ),
            )}
          </g>
        ))}
        <text x="6.5" y="6.8" textAnchor="middle" fill="#e8d1a2" fontSize=".7">
          PATOLLI
        </text>
      </svg>
    </GameLayout>
  );
}
