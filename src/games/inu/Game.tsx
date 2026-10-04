import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useMatch, useMatchAI } from "../../shared/useMatch";
import { initial, hide, ask, guess, automatic } from "./rules";
import { useObservation } from "../../shared/Observation";
import { useRoomState } from "../../shared/TableRoom";
export default function Inu() {
  const [n, setN] = useState(6),
    [type, setType] = useState("row"),
    [value, setValue] = useState(2),
    [shown, setShown] = useState(false);
  const m = useMatch(() => initial(n)),
    s = m.state;
  const [humanRole, setHumanRole] = useRoomState("humanRole", "seek"),
    observation = useObservation();
  const ai = useMatchAI(
    {
      ...m,
      machine: (actor) =>
        observation.watching ||
        m.room.machine(
          actor,
          m.mode === "ai" && actor === (humanRole === "seek" ? 0 : 1),
        ),
    },
    s.turn,
    s.winner !== null,
    automatic,
  );
  return (
    <GameLayout
      id="inu"
      started={m.started}
      onStart={() => {
        setShown(false);
        m.start();
      }}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      privateTable
      status={
        s.winner !== null
          ? `Gana J${s.winner + 1} · posición ${Math.floor(s.secret! / s.n) + 1},${(s.secret! % s.n) + 1}`
          : s.phase === "hide"
            ? "J1 · elige una posición secreta"
            : `J2 · ${s.limit - s.attempts} acciones restantes · ${s.candidates.length} candidatos`
      }
      rules="Variante original de Games: oculta una posición y localízala con preguntas binarias. No se atribuye a una tradición verificada."
      menu={
        <>
          <label>
            Tu papel contra la IA
            <select
              value={humanRole}
              onChange={(e) => setHumanRole(e.target.value)}
            >
              <option value="seek">Buscar</option>
              <option value="hide">Ocultar</option>
            </select>
          </label>
          <label>
            Tablero
            <select value={n} onChange={(e) => setN(+e.target.value)}>
              {[4, 6, 8].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </>
      }
      controls={
        s.phase === "seek" && s.winner === null ? (
          <>
            <select
              aria-label="Pregunta"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setValue(0);
              }}
            >
              <option value="row">¿Fila hasta…?</option>
              <option value="column">¿Columna hasta…?</option>
              <option value="parity">¿Paridad de fila + columna?</option>
            </select>
            <select
              aria-label="Umbral"
              value={value}
              onChange={(e) => setValue(+e.target.value)}
            >
              {Array.from({ length: type === "parity" ? 2 : s.n }, (_, i) => (
                <option value={i} key={i}>
                  {type === "parity" ? (i === 0 ? "Par" : "Impar") : i + 1}
                </option>
              ))}
            </select>
            <button
              disabled={ai}
              onClick={() => m.setState((x) => ask(x, type, value))}
            >
              Preguntar
            </button>
          </>
        ) : null
      }
    >
      <div className="inu-table">
        {s.phase === "seek" &&
        m.mode === "local" &&
        !m.room.online &&
        !ai &&
        !shown &&
        s.winner === null ? (
          <button className="handover" onClick={() => setShown(true)}>
            J1, aparta la vista · J2, empezar búsqueda
          </button>
        ) : (
          <div
            className="inu-board"
            style={{ gridTemplateColumns: `repeat(${s.n},1fr)` }}
          >
            {s.candidates.length >= 0 &&
              Array.from({ length: s.n * s.n }, (_, i) => (
                <button
                  key={i}
                  disabled={
                    ai ||
                    (s.phase === "seek" && !s.candidates.includes(i)) ||
                    s.winner !== null
                  }
                  className={
                    s.winner !== null && i === s.secret ? "secret" : ""
                  }
                  aria-label={`Posición ${Math.floor(i / s.n) + 1},${(i % s.n) + 1}`}
                  onClick={() =>
                    m.setState((x) =>
                      s.phase === "hide" ? hide(x, i) : guess(x, i),
                    )
                  }
                >
                  {s.winner !== null && i === s.secret
                    ? "◆"
                    : s.phase === "seek" && !s.candidates.includes(i)
                      ? "·"
                      : `${Math.floor(i / s.n) + 1}.${(i % s.n) + 1}`}
                </button>
              ))}
          </div>
        )}
        <div className="deduction-log">
          {s.clues.map((c, i) => (
            <p key={i}>
              {c.type === "row"
                ? "Fila"
                : c.type === "column"
                  ? "Columna"
                  : "Paridad"}{" "}
              {c.type === "parity" ? c.value : c.value + 1}:{" "}
              <b>{c.answer ? "sí" : "no"}</b>
            </p>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
