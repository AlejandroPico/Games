import GameLayout from "../../shared/GameLayout";
import CardFace from "../../shared/CardFace";
import PrivateHand from "../../shared/PrivateHand";
import { useMatch, useMatchAI, ScoreStrip } from "../../shared/useMatch";
import { initial, legal, bid, play, automatic } from "./rules";
import { label, suits } from "../../shared/cards";
export default function Belote() {
  const m = useMatch(initial, 4),
    s = m.state,
    ai = useMatchAI(m, s.turn, s.winner !== null, automatic),
    opts = legal(s);
  return (
    <GameLayout
      id="belote"
      started={m.started}
      onStart={m.start}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      roomPlayers={4}
      privateTable
      status={
        s.winner !== null
          ? `Gana el equipo ${s.winner + 1}`
          : `J${s.turn + 1} · ${s.phase === "bid" ? `elegir triunfo, vuelta ${s.bid < 4 ? 1 : 2}` : `triunfo ${suits[s.trump]}`}`
      }
      rules="Belote de cuatro, equipos J1/J3 y J2/J4, sin anuncios salvo belote-rebelote. Asiste al palo, corta al rival y sube el triunfo cuando sea obligatorio."
      menu={
        <>
          <p>
            Cuatro puestos · equipos alternos · objetivo 501 puntos · giro
            horario.
          </p>
          {m.seats}
        </>
      }
    >
      <div className="card-game-table">
        <ScoreStrip scores={s.scores} />
        <small>Equipos J1 + J3 / J2 + J4 · {s.summary}</small>
        <div className="repertoire-hand table-cards">
          {(s.phase === "bid"
            ? [{ player: -1, card: s.up }]
            : s.trick.length
              ? s.trick
              : s.lastTrick
          ).map((t) => (
            <div key={t.card.id}>
              <small>
                {t.player >= 0 ? `J${t.player + 1}` : "Carta vuelta"}
              </small>
              <CardFace card={t.card} />
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
                disabled={
                  ai ||
                  s.phase !== "play" ||
                  !opts.includes(i) ||
                  s.winner !== null
                }
                aria-label={label(c)}
                onClick={() => m.setState((x) => play(x, i))}
              >
                <CardFace card={c} />
              </button>
            ))}
          </div>
          {s.phase === "bid" && (
            <div className="action-row">
              <button
                disabled={ai}
                onClick={() => m.setState((x) => bid(x, -1))}
              >
                Pasar
              </button>
              {(s.bid < 4
                ? [s.up.suit]
                : [0, 1, 2, 3].filter((t) => t !== s.up.suit)
              ).map((t) => (
                <button
                  key={t}
                  disabled={ai}
                  onClick={() => m.setState((x) => bid(x, t))}
                >
                  Tomar {suits[t]}
                </button>
              ))}
            </div>
          )}
        </PrivateHand>
      </div>
    </GameLayout>
  );
}
