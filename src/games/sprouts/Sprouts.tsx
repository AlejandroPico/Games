import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useObservation } from "../../shared/Observation";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
import { initial, route, play } from "./rules";
export default function Sprouts() {
  const { watching } = useObservation();
  const [state, setState] = useState(initial),
    [count, setCount] = useState(3),
    [started, setStarted] = useState(false),
    [mode, setMode] = useState<"ai" | "local">("ai"),
    [chosen, setChosen] = useState<number[]>([]),
    [variant, setVariant] = useState(0);
  const ai = watching || (mode === "ai" && state.turn === 2),
    preview =
      chosen.length === 2 ? route(state, chosen[0], chosen[1], variant) : null;
  const { busy, error } = useAI(
    Worker,
    state,
    started && ai && !state.winner,
    (m: [number, number] | null) => {
      if (m) setState((s) => play(s, ...m) || s);
    },
  );
  const poly = (line: number[]) =>
    line
      .map(
        (i) => (i % state.width) * 10 + "," + Math.floor(i / state.width) * 10,
      )
      .join(" ");
  return (
    <GameLayout
      id="sprouts-brotes"
      started={started}
      mode={mode}
      setMode={setMode}
      onReset={() => setStarted(false)}
      onStart={() => {
        setState(initial(count));
        setChosen([]);
        setVariant(0);
        setStarted(true);
      }}
      menu={
        <label className="field-label">
          Puntos iniciales
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          >
            {[2, 3, 4, 5].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      }
      status={
        error ||
        (state.winner
          ? "Gana el jugador " + state.winner
          : busy
            ? "La IA busca un trazado…"
            : "Jugador " +
              state.turn +
              " · selecciona dos puntos, o el mismo dos veces")
      }
      rules="Brotes sobre cuadrícula: adaptación digital de Sprouts. Cada conexión sigue celdas ortogonales libres, añade un punto en la línea y no cruza ni toca otras líneas salvo en los extremos elegidos. Cada punto admite tres conexiones; un lazo consume dos. El sistema propone el trazado. Cambiar trazado explora otros recorridos; confirma para jugar. Gana quien deja al rival sin ninguna conexión posible en esta cuadrícula finita."
      controls={
        <>
          <button
            disabled={ai || chosen.length !== 2}
            onClick={() => setVariant((v) => v + 1)}
          >
            Cambiar trazado
          </button>
          <button
            disabled={ai || !preview}
            onClick={() => {
              setState((s) => play(s, chosen[0], chosen[1], variant) || s);
              setChosen([]);
              setVariant(0);
            }}
          >
            Confirmar línea
          </button>
          <button onClick={() => setChosen([])}>Cancelar</button>
        </>
      }
    >
      <svg
        className="sprouts-board"
        viewBox="0 0 410 290"
        aria-label="Mesa de brotes"
      >
        <defs>
          <pattern
            id="sprouts-grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="0" cy="0" r=".7" fill="currentColor" />
          </pattern>
        </defs>
        <rect
          width="410"
          height="290"
          fill="url(#sprouts-grid)"
          opacity=".15"
        />
        {state.lines.map((line, i) => (
          <polyline
            className={"sprout-line p" + ((i % 2) + 1)}
            key={i}
            points={poly(line)}
          />
        ))}
        {preview && (
          <polyline className="sprout-preview" points={poly(preview)} />
        )}{" "}
        {state.nodes.map((n, i) => (
          <g
            key={i}
            role="button"
            tabIndex={started && !ai && !state.winner && n.degree < 3 ? 0 : -1}
            aria-disabled={n.degree === 3}
            aria-label={"Punto " + (i + 1) + ", " + n.degree + " conexiones"}
            onClick={() => {
              if (!started || ai || state.winner || n.degree >= 3) return;
              setChosen((c) => (c.length < 2 ? [...c, i] : [i]));
              setVariant(0);
            }}
            onKeyDown={(e) => {
              if (
                (e.key === "Enter" || e.key === " ") &&
                started &&
                !ai &&
                !state.winner &&
                n.degree < 3
              ) {
                e.preventDefault();
                setChosen((c) => (c.length < 2 ? [...c, i] : [i]));
                setVariant(0);
              }
            }}
          >
            <circle
              cx={(n.cell % 41) * 10}
              cy={Math.floor(n.cell / 41) * 10}
              r="9"
              className={
                (n.degree === 3 ? "exhausted" : "") +
                (chosen.includes(i) ? " selected" : "")
              }
            />
            <text x={(n.cell % 41) * 10} y={Math.floor(n.cell / 41) * 10 + 3}>
              {3 - n.degree}
            </text>
          </g>
        ))}
      </svg>
    </GameLayout>
  );
}
