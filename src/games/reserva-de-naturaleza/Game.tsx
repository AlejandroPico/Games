import { useState } from "react";
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
  scores,
  actions,
  terrains,
  power,
  animalTypes,
} from "./rules";
export default function Nature() {
  const m = useMatch(initial),
    s = m.state,
    z = s.zoos[s.turn],
    [terrain, setTerrain] = useState(0);
  const ai = useMatchAI(m, s.turn, !!s.winner, automatic);
  return (
    <GameLayout
      id="reserva-de-naturaleza"
      started={m.started}
      onStart={m.start}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      roomPlayers={m.players}
      status={
        s.winner
          ? `Victoria: ${s.winner.map((p) => `J${p + 1}`).join(", ")}`
          : `J${s.turn + 1} · ${z.coins} monedas · investigación ${z.research} · atractivo ${z.appeal} · conservación ${z.conservation}`
      }
      rules="Reserva original de Games. Las acciones ganan fuerza al esperar: construir hábitats, alojar animales y financiar conservación."
      menu={
        <>
          <PlayerSelect value={m.players} onChange={m.setPlayers} />
          {m.seats}
        </>
      }
    >
      <div className="nature-table">
        <ScoreStrip scores={scores(s)} turn={s.turn} />
        <div className="nature-workspace">
          <div className="zoo-land">
            {z.land.map((c, i) => (
              <button
                key={i}
                disabled={ai || !!s.winner || act(s, 2, i, terrain) === s}
                className={"biome-" + c.terrain}
                onClick={() => m.setState((x) => act(x, 2, i, terrain))}
                aria-label={`Parcela ${i + 1}, ${c.terrain < 0 ? "vacía" : terrains[c.terrain]}`}
              >
                <span>
                  {c.animal >= 0
                    ? ["🦊", "🐈", "🦌", "🐘", "🦦", "🦩", "🐻", "🦒", "🐧"][
                        c.animal
                      ]
                    : c.terrain < 0
                      ? "+"
                      : c.terrain === 0
                        ? "♣"
                        : c.terrain === 1
                          ? "❋"
                          : "≈"}
                </span>
              </button>
            ))}
          </div>
          <div className="animal-market">
            {s.market.map((type, i) => {
              const a = animalTypes[type];
              return (
                <button
                  key={i}
                  disabled={ai || !!s.winner || act(s, 3, i) === s}
                  onClick={() => m.setState((x) => act(x, 3, i))}
                >
                  <span className="animal-portrait">
                    {
                      ["🦊", "🐈", "🦌", "🐘", "🦦", "🦩", "🐻", "🦒", "🐧"][
                        type
                      ]
                    }
                  </span>
                  <b>{a.name}</b>
                  <small>
                    {terrains[a.terrain]} · {a.size} parcelas · {a.cost} ◉ ·
                    fuerza {a.power} · +{a.appeal} atractivo
                  </small>
                </button>
              );
            })}
          </div>
        </div>
        <div className="action-row">
          <label>
            Hábitat
            <select
              value={terrain}
              onChange={(e) => setTerrain(+e.target.value)}
            >
              {terrains.map((t, i) => (
                <option key={t} value={i}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <small>
            Construye {Math.min(power(z, 2), 4)} parcelas seguidas pulsando una
            parcela vacía.
          </small>
        </div>
        <div className="power-row">
          {z.row.map((a, i) => (
            <button
              key={a}
              disabled={
                ai || !!s.winner || a === 2 || a === 3 || act(s, a) === s
              }
              onClick={() => m.setState((x) => act(x, a))}
            >
              <strong>{i + 1}</strong>
              <span>{actions[a]}</span>
              <small>
                {a === 2
                  ? "En el terreno"
                  : a === 3
                    ? "En el mercado"
                    : "Usar acción"}
              </small>
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
