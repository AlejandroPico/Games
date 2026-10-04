import { useState, useEffect } from "react";
import GameLayout from "../../shared/GameLayout";
import PrivateHand from "../../shared/PrivateHand";
import { useMatch, useMatchAI } from "../../shared/useMatch";
import {
  initial,
  dictionary,
  encode,
  decode,
  automatic,
  validCode,
} from "./rules";
export default function Messages() {
  const m = useMatch(initial, 4),
    s = m.state,
    [clues, setClues] = useState(["", "", ""]),
    [code, setCode] = useState([1, 2, 3]);
  const ai = useMatchAI(m, s.turn, !!s.winner, automatic);
  useEffect(() => {
    setClues(["", "", ""]);
    setCode([1, 2, 3]);
  }, [s.ply]);
  return (
    <GameLayout
      id="mensajes-cruzados"
      started={m.started}
      onStart={m.start}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      roomPlayers={4}
      privateTable
      status={
        s.winner
          ? `Victoria: equipo${s.winner.length > 1 ? "s" : ""} ${s.winner.map((t) => t + 1).join(", ")}`
          : `J${s.turn + 1} · ${s.phase === "encode" ? "redactar pistas" : s.phase === "receive" ? "descifrar para tu equipo" : "interceptar al rival"} · ronda ${s.round + 1}/8`
      }
      rules="Variante original de códigos y pistas, para cuatro puestos en dos equipos. Protege tus palabras y aprende de las pistas públicas del rival."
      menu={
        <>
          <p>
            Equipos J1/J3 y J2/J4. Dos intercepciones, dos fallos o ocho
            mensajes deciden la partida.
          </p>
          {m.seats}
        </>
      }
    >
      <div className="messages-table">
        <div className="action-row">
          {[0, 1].map((t) => (
            <span key={t}>
              Equipo {t + 1} · {s.interceptions[t]} intercepciones ·{" "}
              {s.failures[t]} fallos
            </span>
          ))}
        </div>
        <PrivateHand
          token={String(s.ply)}
          conceal={m.mode === "local" && !m.room.online && !ai}
        >
          {s.phase !== "intercept" && (
            <div className="secret-keywords">
              {s.words[s.team].map((w, i) => (
                <span key={w}>
                  <small>{i + 1}</small>
                  {dictionary[w].word}
                </span>
              ))}
            </div>
          )}
          {s.phase === "encode" ? (
            <>
              <div className="cipher-code">
                Código privado: <b>{s.code.join(" · ")}</b>
              </div>
              <div className="message-inputs">
                {clues.map((c, i) => (
                  <label key={i}>
                    Pista {i + 1}
                    <input
                      value={c}
                      maxLength={40}
                      onChange={(e) =>
                        setClues(
                          clues.map((v, j) => (j === i ? e.target.value : v)),
                        )
                      }
                    />
                  </label>
                ))}
              </div>
              <button
                disabled={ai || encode(s, clues) === s}
                onClick={() => m.setState((x) => encode(x, clues))}
              >
                Enviar pistas
              </button>
            </>
          ) : (
            <>
              <div className="message-clues">
                {s.clues.map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </div>
              <div className="action-row">
                {code.map((v, i) => (
                  <select
                    aria-label={`Número ${i + 1}`}
                    key={i}
                    value={v}
                    onChange={(e) =>
                      setCode(
                        code.map((n, j) => (j === i ? +e.target.value : n)),
                      )
                    }
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                ))}
                <button
                  disabled={ai || !validCode(code) || !!s.winner}
                  onClick={() => m.setState((x) => decode(x, code))}
                >
                  {s.phase === "receive"
                    ? "Confirmar respuesta"
                    : "Interceptar"}
                </button>
              </div>
            </>
          )}
        </PrivateHand>
        <div className="message-history">
          {s.history.map((h, i) => (
            <p key={i}>
              Equipo {h.team + 1}: {h.clues.join(" / ")} →{" "}
              <b>{h.code.join("–")}</b> · respuesta {h.reply.join("–")} ·
              intercepción {h.intercept.join("–")}
            </p>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
