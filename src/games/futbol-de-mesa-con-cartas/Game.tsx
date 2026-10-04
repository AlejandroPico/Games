import GameLayout from "../../shared/GameLayout";
import PrivateHand from "../../shared/PrivateHand";
import { useMatch, useMatchAI, ScoreStrip } from "../../shared/useMatch";
import { initial, legal, play, automatic, names } from "./rules";
export default function Football() {
  const m = useMatch(initial),
    s = m.state,
    ai = useMatchAI(m, s.turn, !!s.winner, automatic),
    opts = legal(s);
  return (
    <GameLayout
      id="futbol-de-mesa-con-cartas"
      started={m.started}
      onStart={m.start}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      privateTable
      status={
        s.winner
          ? s.winner.length === 2
            ? "Empate"
            : `Gana J${s.winner[0] + 1}`
          : `J${s.turn + 1} · ${s.phase === "attack" ? "ataque" : "defensa"} · jugada ${s.round + 1}/20`
      }
      rules="Duelo original con cartas y dado. Pases y regates acercan a portería; el rival responde con presión, corte o portero. Tres goles o veinte ataques deciden el encuentro."
      menu={
        <p>
          Dos equipos · tres goles o veinte jugadas · cinco cartas por mano.
        </p>
      }
    >
      <div className="football-table">
        <ScoreStrip scores={s.scores} turn={s.possession} />
        <div className="football-pitch">
          <div className="goal left" />
          <div className="center-circle" />
          <div className="goal right" />
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              className="pitch-line"
              style={{ left: `${10 + i * 20}%` }}
              key={i}
            />
          ))}
          <span
            className="football-ball"
            style={{
              left: `${s.possession === 0 ? 10 + s.zone * 20 : 90 - s.zone * 20}%`,
            }}
          >
            ⚽
          </span>
          <span className="pitch-team left">J1</span>
          <span className="pitch-team right">J2</span>
        </div>
        <p className="match-comment">
          {s.log}
          {s.roll > 0 ? ` · Dado ${s.roll}` : ""}
        </p>
        <PrivateHand
          token={String(s.ply)}
          conceal={m.mode === "local" && !m.room.online && !ai}
        >
          <div className="football-hand">
            {s.hands[s.turn].map((type, i) => (
              <button
                key={i}
                disabled={ai || !opts.includes(i) || !!s.winner}
                onClick={() => m.setState((x) => play(x, i))}
              >
                <span>{["➜", "↝", "⚽", "⚔", "⤨", "▣"][type]}</span>
                <b>
                  {names[type]}
                  {type === 2 && s.phase === "attack" && s.zone < 2
                    ? " (pase)"
                    : ""}
                </b>
                <small>
                  {type >= 3
                    ? "Defensa; como ataque equivale a pase"
                    : "Ataque; como defensa no aporta bonus"}
                </small>
              </button>
            ))}
          </div>
        </PrivateHand>
      </div>
    </GameLayout>
  );
}
