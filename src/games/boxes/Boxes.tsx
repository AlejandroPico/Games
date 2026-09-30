import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useObservation, useAutoplay } from "../../shared/Observation";
import { initial, play, finished, bestMove } from "./rules";
export default function Boxes() {
  const { watching } = useObservation();
  const [state, setState] = useState(initial),
    [started, setStarted] = useState(false),
    [size, setSize] = useState(4),
    [mode, setMode] = useState<"ai" | "local">("ai");
  const over = finished(state),
    ai = watching || (mode === "ai" && state.turn === 2);
  useAutoplay(started && ai && !over, state, () =>
    setState((s) => play(s, bestMove(s)) || s),
  );
  const max = Math.max(...state.scores),
    winners = state.scores.flatMap((s, i) => (s === max ? [i + 1] : [])),
    n = state.size,
    h = n * (n + 1);
  return (
    <GameLayout
      id="cajas-timbiriche-dots-and-boxes"
      started={started}
      mode={mode}
      setMode={setMode}
      onReset={() => setStarted(false)}
      onStart={() => {
        setState(initial(size));
        setStarted(true);
      }}
      menu={
        <label className="field-label">
          Cuadrados por lado
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {[3, 4, 5, 6].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      }
      status={
        over
          ? winners.length > 1
            ? "Empate"
            : "Gana el jugador " + winners[0]
          : "Jugador " + state.turn + " · cerrar una caja permite repetir"
      }
      stats={<span className="small-score">{state.scores.join(" / ")}</span>}
      rules="Traza un lado entre dos puntos vecinos. Si completas el cuarto lado de una caja, se marca a tu nombre y sigues jugando; una línea puede cerrar dos cajas a la vez. Al llenar todas las cajas gana quien tenga más. Edición para dos jugadores."
    >
      <div
        className="boxes-board"
        style={{
          gridTemplateColumns: "repeat(" + (n * 2 + 1) + ",1fr)",
          gridTemplateRows: "repeat(" + (n * 2 + 1) + ",1fr)",
        }}
      >
        {Array.from({ length: (n * 2 + 1) ** 2 }, (_, i) => {
          const r = Math.floor(i / (n * 2 + 1)),
            c = i % (n * 2 + 1);
          if (r % 2 === 0 && c % 2 === 0)
            return <i className="box-dot" key={i} />;
          if (r % 2 && c % 2) {
            const owner =
              state.boxes[Math.floor(r / 2) * n + Math.floor(c / 2)];
            return (
              <span className={"box-owner p" + owner} key={i}>
                {owner || ""}
              </span>
            );
          }
          const e =
            r % 2 === 0
              ? (r / 2) * n + Math.floor(c / 2)
              : h + Math.floor(r / 2) * (n + 1) + c / 2;
          return (
            <button
              key={i}
              aria-label={
                (r % 2 === 0 ? "Lado horizontal " : "Lado vertical ") + (e + 1)
              }
              disabled={!started || ai || over || !!state.edges[e]}
              className={
                "box-edge " +
                (r % 2 === 0 ? "horizontal" : "vertical") +
                " p" +
                state.edges[e]
              }
              onClick={() => setState((s) => play(s, e) || s)}
            />
          );
        })}
      </div>
    </GameLayout>
  );
}
