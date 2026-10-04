import GameLayout from "../../shared/GameLayout";
import PrivateHand from "../../shared/PrivateHand";
import {
  useMatch,
  useMatchAI,
  PlayerSelect,
  ScoreStrip,
} from "../../shared/useMatch";
import {
  initial,
  cities,
  routes,
  colors,
  claimable,
  claim,
  draw,
  automatic,
  connected,
} from "./rules";
export default function Railways() {
  const m = useMatch(initial),
    s = m.state,
    ai = useMatchAI(m, s.turn, s.winner !== null, automatic);
  return (
    <GameLayout
      id="rutas-de-vapor"
      started={m.started}
      onStart={m.start}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      roomPlayers={m.players}
      privateTable
      status={
        s.winner
          ? `Victoria: ${s.winner.map((p) => `J${p + 1}`).join(", ")}`
          : `J${s.turn + 1} · ${s.draws ? "elige la segunda carta" : "roba cartas o reclama una vía"}${s.last !== null ? ` · ${s.last} turnos finales` : ""}`
      }
      rules="Adaptación original de rutas ferroviarias: reúne colores, conecta contratos y administra tus 24 trenes. No reproduce un reglamento comercial completo."
      menu={
        <>
          <PlayerSelect value={m.players} onChange={m.setPlayers} />
          {m.seats}
        </>
      }
    >
      <div className="rail-table">
        <ScoreStrip scores={s.scores} turn={s.turn} />
        <svg className="rail-map" viewBox="0 0 105 98">
          <defs>
            <pattern
              id="map-paper"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 4L4 0"
                stroke="#927851"
                strokeWidth=".1"
                opacity=".25"
              />
            </pattern>
          </defs>
          <rect width="105" height="98" fill="url(#map-paper)" />
          {routes.map((r, i) => {
            const a = cities[r.a],
              b = cities[r.b];
            return (
              <g
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Ruta ${a[0]} a ${b[0]}, ${r.n} ${colors[r.color]}`}
                onClick={() => {
                  if (!ai) m.setState((x) => claim(x, i));
                }}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !ai)
                    m.setState((x) => claim(x, i));
                }}
              >
                <line
                  x1={a[1]}
                  y1={a[2]}
                  x2={b[1]}
                  y2={b[2]}
                  stroke={
                    s.owners[i] >= 0
                      ? ["#f3c05f", "#64c6da", "#aa8be4", "#e57669"][
                          s.owners[i]
                        ]
                      : ["#ad585b", "#b79a50", "#68966b", "#627dae"][r.color]
                  }
                  strokeWidth={claimable(s, s.turn, i) ? 2.2 : 1.4}
                  strokeDasharray={s.owners[i] >= 0 ? "" : "3 1"}
                />
                <text
                  x={(a[1] + b[1]) / 2}
                  y={(a[2] + b[2]) / 2}
                  fontSize="3"
                  fill="currentColor"
                >
                  {r.n}
                  {s.owners[i] >= 0 ? ` · J${s.owners[i] + 1}` : ""}
                </text>
              </g>
            );
          })}
          {cities.map(([name, x, y], i) => (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="2.2"
                fill="#eee4c7"
                stroke="#756b52"
                strokeWidth=".4"
              />
              <text
                x={x}
                y={y - 4}
                textAnchor="middle"
                fontSize="3.8"
                fill="currentColor"
              >
                {name}
              </text>
            </g>
          ))}
        </svg>
        <PrivateHand
          token={String(s.ply)}
          conceal={m.mode === "local" && !m.room.online && !ai}
        >
          <div className="rail-contracts">
            {s.contracts[s.turn].map((c, i) => (
              <span key={i}>
                {cities[c.a][0]} ↔ {cities[c.b][0]} · {c.points}{" "}
                {connected(s, s.turn, c.a, c.b) ? "✓" : ""}
              </span>
            ))}
          </div>
          <div className="action-row">
            {colors.map((c, i) => (
              <span key={c}>
                {c}: <b>{s.hands[s.turn].filter((v) => v === i).length}</b>
              </span>
            ))}
          </div>
          <div className="action-row">
            <button
              disabled={ai || !!s.winner}
              onClick={() => m.setState((x) => draw(x))}
            >
              Robar a ciegas
            </button>
            {s.market.map((c, i) => (
              <button
                key={i}
                className={`train-card color-${c}`}
                disabled={ai || !!s.winner || (s.draws === 1 && c === 4)}
                onClick={() => m.setState((x) => draw(x, i))}
              >
                {colors[c]}
              </button>
            ))}
          </div>
        </PrivateHand>
      </div>
    </GameLayout>
  );
}
