import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useMatch, useMatchAI } from "../../shared/useMatch";
import { usePieceDrag } from "../../shared/usePieceDrag";
import { initial, place, walk, build, moves, builds } from "./rules";
import { automatic } from "./rules";
export default function Santorini() {
  const m = useMatch(initial),
    s = m.state,
    [selected, select] = useState<number | null>(null);
  const ai = useMatchAI(m, s.turn, s.winner !== null, automatic),
    legal =
      s.phase === "build"
        ? builds(s, s.builder)
        : selected !== null
          ? moves(s, selected)
          : [];
  const drag = usePieceDrag<number>({
    canDrag: (i) =>
      m.started && !ai && s.phase === "move" && s.workers[s.turn].includes(i),
    onStart: select,
    onDrop: (a, e) => {
      if (e && moves(s, a).includes(+e.dataset.drop!)) {
        m.setState((x) => walk(x, a, +e.dataset.drop!));
        select(null);
        return true;
      }
      return false;
    },
  });
  const click = (i: number) => {
    if (ai || !m.started || drag.suppressClick()) return;
    if (s.phase === "place") m.setState((x) => place(x, i));
    else if (s.phase === "build") m.setState((x) => build(x, i));
    else if (selected !== null && legal.includes(i)) {
      m.setState((x) => walk(x, selected, i));
      select(null);
    } else select(s.workers[s.turn].includes(i) ? i : null);
  };
  return (
    <GameLayout
      id="santorini"
      started={m.started}
      onStart={() => {
        select(null);
        m.start();
      }}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomTurn={s.turn}
      status={
        s.winner !== null
          ? `Gana J${s.winner + 1}`
          : `J${s.turn + 1} · ${s.phase === "place" ? "coloca tus dos trabajadores" : s.phase === "move" ? "mueve un trabajador" : "construye junto al trabajador"}`
      }
      rules="Reglas base para dos participantes, sin poderes. Sube desde el segundo al tercer nivel para ganar."
      menu={
        <p>
          Edición base · dos trabajadores por persona · sin poderes divinos.
        </p>
      }
    >
      <div className="santorini-board">
        {s.levels.map((level, i) => {
          const owner = s.workers.findIndex((w) => w.includes(i));
          return (
            <button
              key={i}
              data-drop={i}
              {...(owner === s.turn ? drag.bind(i) : {})}
              onClick={() => click(i)}
              aria-label={`Casilla ${i + 1}, nivel ${level}${owner >= 0 ? `, trabajador J${owner + 1}` : ""}`}
              className={
                (legal.includes(i) ? "legal " : "") +
                (selected === i ? "chosen" : "")
              }
            >
              <span className="tower">
                {Array.from({ length: level }, (_, k) => (
                  <span
                    className={k === 3 ? "dome" : "floor"}
                    key={k}
                    style={{ width: `${86 - k * 15}%`, bottom: `${k * 17}%` }}
                  />
                ))}
                {owner >= 0 && (
                  <span
                    className={`worker player-${owner}`}
                    style={{ bottom: `${level * 17 + 5}%` }}
                  >
                    ♟
                  </span>
                )}
              </span>
              <small>{level === 4 ? "Cúpula" : level || ""}</small>
            </button>
          );
        })}
      </div>
    </GameLayout>
  );
}
