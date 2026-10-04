import GameLayout from "../../shared/GameLayout";
import CardFace from "../../shared/CardFace";
import PrivateHand from "../../shared/PrivateHand";
import { useMatch, useMatchAI, PlayerSelect } from "../../shared/useMatch";
import { initial, legal, move, automatic, order } from "./rules";
import { label } from "../../shared/cards";
export default function Cinquillo() {
  const m = useMatch(initial),
    s = m.state,
    ai = useMatchAI(m, s.turn, s.winner !== null, automatic),
    opts = legal(s);
  return (
    <GameLayout
      id="cinquillo"
      started={m.started}
      onStart={m.start}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      roomPlayers={m.players}
      privateTable
      status={
        s.winner !== null
          ? `Gana J${s.winner + 1}`
          : `J${s.turn + 1} · ${s.hands.map((h, i) => `J${i + 1}: ${h.length}`).join(" · ")}`
      }
      rules="Empieza el cinco de oros. Abre cada palo con su cinco y amplía las series sin huecos. Solo se pasa si no hay carta legal."
      menu={
        <>
          <PlayerSelect value={m.players} onChange={m.setPlayers} />
          {m.seats}
        </>
      }
      controls={
        <button
          disabled={ai || opts.length > 0 || s.winner !== null}
          onClick={() => m.setState((x) => move(x, -1))}
        >
          Pasar
        </button>
      }
    >
      <div className="card-game-table">
        <div className="cinquillo-series">
          {[0, 1, 2, 3].map((suit) => (
            <div key={suit}>
              {order.map((rank) => {
                const c = s.table.find(
                  (c) => c.suit === suit && c.rank === rank,
                );
                return (
                  <div key={rank} className="series-slot">
                    {c ? <CardFace card={c} spanish /> : <small>{rank}</small>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <PrivateHand
          token={String(s.ply)}
          conceal={m.mode === "local" && !m.room.online && !ai}
        >
          <div className="repertoire-hand">
            {s.hands[s.turn].map((c, i) => (
              <button
                key={c.id}
                disabled={ai || !opts.includes(i)}
                aria-label={label(c, true)}
                onClick={() => m.setState((x) => move(x, i))}
              >
                <CardFace card={c} spanish />
              </button>
            ))}
          </div>
        </PrivateHand>
      </div>
    </GameLayout>
  );
}
