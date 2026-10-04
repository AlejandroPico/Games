import GameLayout from "../../shared/GameLayout";
import PrivateHand from "../../shared/PrivateHand";
import {
  useMatch,
  useMatchAI,
  PlayerSelect,
  ScoreStrip,
} from "../../shared/useMatch";
import { initial, choose, automatic, cost, scores } from "./rules";
export default function Wonders() {
  const m = useMatch(initial, 3),
    s = m.state,
    ai = useMatchAI(m, s.turn, !!s.winner, automatic),
    city = s.cities[s.turn];
  return (
    <GameLayout
      id="draft-de-maravillas"
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
          : `J${s.turn + 1} · era ${s.age} · elección ${s.pick + 1}/6`
      }
      rules="Draft original de Games: selecciona en secreto, pasa la mano y construye tu ciudad a lo largo de tres eras. No es el reglamento completo de una edición comercial."
      menu={
        <>
          <PlayerSelect
            value={m.players}
            onChange={m.setPlayers}
            choices={[3, 4]}
          />
          {m.seats}
        </>
      }
    >
      <div className="euro-table">
        <ScoreStrip scores={scores(s)} turn={s.turn} />
        <div className="city-panorama">
          {s.cities.map((c, p) => (
            <div key={p}>
              <span className="city-silhouette">▥ ▤ ▥</span>
              <b>J{p + 1}</b>
              <small>
                {c.coins} monedas · ejército {c.army} · maravilla {c.wonder}/3
              </small>
              <small>
                Madera {c.resources[1]} · piedra {c.resources[0]} · ciencia{" "}
                {c.science.join("/")}
              </small>
            </div>
          ))}
        </div>
        <PrivateHand
          token={String(s.ply)}
          conceal={m.mode === "local" && !m.room.online && !ai}
        >
          <div className="draft-hand">
            {s.hands[s.turn].map((c, i) => (
              <article key={c.id} className={"draft-card " + c.type}>
                <div className="draft-illustration">
                  {c.type === "resource"
                    ? "▧"
                    : c.type === "science"
                      ? "⚗"
                      : c.type === "army"
                        ? "⚔"
                        : c.type === "commerce"
                          ? "◉"
                          : "♜"}
                </div>
                <b>{c.name}</b>
                <small>
                  {c.type === "science"
                    ? `Símbolo ${c.symbol + 1}`
                    : c.type === "resource"
                      ? c.resource
                        ? "Madera"
                        : "Piedra"
                      : `${c.value} ${c.type === "army" ? "fuerza" : c.type === "commerce" ? "monedas" : "puntos"}`}
                </small>
                <button
                  disabled={ai || city.coins < cost(s, c) || !!s.winner}
                  onClick={() => m.setState((x) => choose(x, i, "build"))}
                >
                  Construir · {cost(s, c)} ◉
                </button>
                <button
                  disabled={ai || !!s.winner}
                  onClick={() => m.setState((x) => choose(x, i, "sell"))}
                >
                  Vender +3 ◉
                </button>
                <button
                  disabled={
                    ai ||
                    city.wonder >= 3 ||
                    city.coins < 4 + s.age ||
                    !!s.winner
                  }
                  onClick={() => m.setState((x) => choose(x, i, "wonder"))}
                >
                  Maravilla · {4 + s.age} ◉
                </button>
              </article>
            ))}
          </div>
        </PrivateHand>
      </div>
    </GameLayout>
  );
}
