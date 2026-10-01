import {
  useRoomState,
  useTableRoom,
  SeatOptions,
} from "../../shared/TableRoom";
import GameLayout from "../../shared/GameLayout";
import Die from "../../shared/Die";
import { useObservation } from "../../shared/Observation";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
import {
  initial,
  build,
  roll,
  settlements,
  roads,
  cities,
  moveRobber,
  steal,
  discard,
  trade,
  endTurn,
  actor,
  points,
  resources,
  type State,
} from "./rules";
const colors = ["#bd5149", "#377cba", "#d0a333", "#48836d"],
  land = ["#52846a", "#b77759", "#9ea96c", "#cbb268", "#819099", "#d4b887"];
export default function Colonizers() {
  const room = useTableRoom();
  const { watching } = useObservation();
  const [state, setState] = useRoomState("state", initial),
    [started, setStarted] = useRoomState("started", false),
    [players, setPlayers] = useRoomState("players", 3),
    [humans, setHumans] = useRoomState("humans", 1),
    [mode, setMode] = useRoomState<"ai" | "local">("mode", "ai"),
    [tool, setTool] = useRoomState<"settlement" | "road" | "city">(
      "tool",
      "settlement",
    ),
    [give, setGive] = useRoomState("give", 0),
    [take, setTake] = useRoomState("take", 3),
    [discarded, setDiscarded] = useRoomState<number[]>(
      "discarded",
      Array(5).fill(0),
    ),
    [message, setMessage] = useRoomState("message", "");
  const active = actor(state),
    ai =
      watching ||
      room.machine(
        active,
        mode === "ai" && active >= Math.min(humans, players),
      ),
    hs = state.hands[active];
  const { busy, error } = useAI(
    Worker,
    state,
    started && ai && state.phase !== "over",
    (n: State) => {
      setState(n);
      setDiscarded(Array(5).fill(0));
    },
  );
  const commit = (n: State | null) => {
    if (n) {
      setState(n);
      setMessage("");
      setDiscarded(Array(5).fill(0));
    } else setMessage("Esa acción no cumple las condiciones.");
  };
  const actualTool =
      state.phase === "settlement"
        ? "settlement"
        : state.phase === "road"
          ? "road"
          : tool,
    vs = actualTool === "city" ? cities(state) : settlements(state),
    es = roads(state),
    pos = (x: number, y: number) => [280 + x * 55, 225 + y * 55];
  return (
    <GameLayout
      roomTurn={active}
      roomPlayers={players}
      id="colonizadores"
      started={started}
      mode={mode}
      setMode={(m) => {
        setMode(m);
        setHumans(m === "local" ? players : 1);
      }}
      onReset={() => setStarted(false)}
      onStart={() => {
        setState(initial(players));
        setDiscarded(Array(5).fill(0));
        setMessage("");
        setStarted(true);
      }}
      menu={
        <>
          {" "}
          <SeatOptions
            count={players}
            mode={watching ? "solo" : mode}
            humans={Math.min(humans, players)}
            onHumans={(n) => {
              setHumans(n);
              setMode(n === players ? "local" : "ai");
            }}
          />
          <p className="rules-copy">
            Variante original inspirada en los eurogames de colonización.
            Objetivo: 8 puntos. Producción, caminos, poblados, ciudades, ladrón
            y ruta más larga; sin cartas de desarrollo, puertos ni comercio
            directo entre participantes.
          </p>
          <label className="field-label">
            Participantes
            <select
              value={players}
              disabled={room.online}
              onChange={(e) => setPlayers(Number(e.target.value))}
            >
              {[3, 4].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </>
      }
      status={
        error ||
        (state.phase === "over"
          ? "Gana el jugador " + (state.winner + 1)
          : busy
            ? "La IA planifica…"
            : "Jugador " + (active + 1) + " · " + (message || state.message))
      }
      stats={<span className="small-score">Ronda {state.round}</span>}
      rules="Colonizadores es una variante propia inspirada en CATAN, sin afiliación oficial. Se juega a ocho puntos: poblado uno, ciudad dos y ruta más larga dos (mínimo cinco caminos). Preparación en orden de ida y vuelta: dos poblados y dos caminos por persona; el segundo poblado recibe recursos vecinos. Lanza, produce, comercia 4:1 con el banco, construye y termina el turno. El siete obliga a descartar la mitad si tienes más de siete cartas y mover al ladrón. Recursos y existencias son públicos en esta variante. No incluye cartas de desarrollo, puertos, ejército ni intercambios privados."
      controls={
        state.phase === "roll" ? (
          <button disabled={ai} onClick={() => commit(roll(state))}>
            Lanzar dados
          </button>
        ) : state.phase === "steal" ? (
          <>
            {state.victims.map((p) => (
              <button
                disabled={ai}
                key={p}
                onClick={() => commit(steal(state, p))}
              >
                Robar al jugador {p + 1}
              </button>
            ))}
          </>
        ) : state.phase === "discard" ? (
          <button
            disabled={ai}
            onClick={() => commit(discard(state, discarded))}
          >
            Descartar {discarded.reduce((n, v) => n + v, 0)} /{" "}
            {Math.floor(hs.reduce((n, v) => n + v, 0) / 2)}
          </button>
        ) : state.phase === "build" ? (
          <>
            <select
              aria-label="Construcción"
              value={tool}
              onChange={(e) => setTool(e.target.value as typeof tool)}
            >
              <option value="settlement">
                Poblado · madera, arcilla, lana, trigo
              </option>
              <option value="road">Camino · madera + arcilla</option>
              <option value="city">Ciudad · 2 trigo + 3 mineral</option>
            </select>
            <select
              aria-label="Recurso que entregas"
              value={give}
              onChange={(e) => setGive(Number(e.target.value))}
            >
              {resources.map((r, i) => (
                <option value={i} key={r}>
                  {r}
                </option>
              ))}
            </select>
            <span>4 → 1</span>
            <select
              aria-label="Recurso que recibes"
              value={take}
              onChange={(e) => setTake(Number(e.target.value))}
            >
              {resources.map((r, i) => (
                <option value={i} key={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              disabled={ai || !trade(state, give, take)}
              onClick={() => commit(trade(state, give, take))}
            >
              Comerciar
            </button>
            <button disabled={ai} onClick={() => commit(endTurn(state))}>
              Terminar turno
            </button>
          </>
        ) : undefined
      }
    >
      <div className="colonizer-table">
        <div className="colonizer-players">
          {state.hands.map((hand, p) => (
            <span
              key={p}
              style={{ color: colors[p] }}
              className={active === p ? "active" : ""}
            >
              J{p + 1} · {points(state, p)} pts ·{" "}
              {hand.reduce((n, v) => n + v, 0)} recursos
              {state.longest === p ? " · ruta " + state.lengths[p] : ""}
            </span>
          ))}
          {state.dice.map((n, i) => (
            <Die key={i} value={n} />
          ))}
        </div>
        <svg
          className="island-board"
          viewBox="0 0 560 450"
          aria-label="Isla de colonizadores"
        >
          {state.map.hexes.map((h, i) => {
            const [x, y] = pos(h.x, h.y);
            return (
              <g
                key={i}
                role="button"
                tabIndex={
                  started &&
                  !ai &&
                  state.phase === "robber" &&
                  state.robber !== i
                    ? 0
                    : -1
                }
                aria-label={
                  "Región " +
                  (i + 1) +
                  ": " +
                  (h.resource < 0 ? "Desierto" : resources[h.resource]) +
                  ", " +
                  h.number
                }
                onClick={() => {
                  if (!ai && state.phase === "robber")
                    commit(moveRobber(state, i));
                }}
                onKeyDown={(e) => {
                  if (
                    (e.key === "Enter" || e.key === " ") &&
                    !ai &&
                    state.phase === "robber"
                  ) {
                    e.preventDefault();
                    commit(moveRobber(state, i));
                  }
                }}
              >
                <polygon
                  fill={land[h.resource < 0 ? 5 : h.resource]}
                  points={h.vertices
                    .map((v) =>
                      pos(
                        state.map.vertices[v].x,
                        state.map.vertices[v].y,
                      ).join(","),
                    )
                    .join(" ")}
                />
                <text x={x} y={y - 12} className="island-resource">
                  {h.resource < 0 ? "Desierto" : resources[h.resource]}
                </text>
                {h.number > 0 && (
                  <>
                    <circle
                      className="production-number"
                      cx={x}
                      cy={y + 7}
                      r="16"
                    />
                    <text
                      x={x}
                      y={y + 12}
                      className={
                        h.number === 6 || h.number === 8
                          ? "high-production"
                          : ""
                      }
                    >
                      {h.number}
                    </text>
                  </>
                )}
                {state.robber === i && (
                  <path
                    className="robber"
                    d={
                      "M" +
                      (x + 22) +
                      " " +
                      (y + 15) +
                      "l-6 16h16l-6-16a5 5 0 1 0-4 0"
                    }
                  />
                )}
              </g>
            );
          })}
          {state.map.edges.map(([a, b], e) => {
            const v = state.map.vertices[a],
              w = state.map.vertices[b],
              [x1, y1] = pos(v.x, v.y),
              [x2, y2] = pos(w.x, w.y),
              owner = state.roads[e],
              legal = actualTool === "road" && es.includes(e);
            return (
              <g
                key={e}
                role="button"
                tabIndex={!ai && legal ? 0 : -1}
                aria-label={
                  "Camino " +
                  (e + 1) +
                  (owner >= 0 ? ", jugador " + (owner + 1) : "")
                }
                onClick={() => {
                  if (started && !ai && legal) commit(build(state, "road", e));
                }}
                onKeyDown={(event) => {
                  if (
                    (event.key === "Enter" || event.key === " ") &&
                    !ai &&
                    legal
                  ) {
                    event.preventDefault();
                    commit(build(state, "road", e));
                  }
                }}
              >
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    owner >= 0
                      ? colors[owner]
                      : legal
                        ? "#f5ebd4"
                        : "transparent"
                  }
                  strokeWidth={owner >= 0 ? 7 : legal ? 5 : 0}
                  className={legal ? "legal-road" : ""}
                />
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth="16"
                />
              </g>
            );
          })}
          {state.map.vertices.map((v, i) => {
            const [x, y] = pos(v.x, v.y),
              owner = state.owners[i],
              legal = actualTool !== "road" && vs.includes(i);
            return (
              <g
                key={i}
                role="button"
                tabIndex={!ai && legal ? 0 : -1}
                aria-label={
                  "Vértice " +
                  (i + 1) +
                  (owner >= 0
                    ? ", " +
                      (state.levels[i] === 2 ? "ciudad" : "poblado") +
                      " del jugador " +
                      (owner + 1)
                    : "")
                }
                onClick={() => {
                  if (started && !ai && legal)
                    commit(build(state, actualTool, i));
                }}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !ai && legal) {
                    e.preventDefault();
                    commit(build(state, actualTool, i));
                  }
                }}
              >
                {owner >= 0 ? (
                  <path
                    fill={colors[owner]}
                    className="island-building"
                    d={
                      state.levels[i] === 2
                        ? "M" + (x - 11) + " " + (y + 8) + "v-15h8v-5h13v20Z"
                        : "M" + (x - 8) + " " + (y + 7) + "v-9l8-7 8 7v9Z"
                    }
                  />
                ) : (
                  <circle
                    cx={x}
                    cy={y}
                    r={legal ? 6 : 2}
                    fill={legal ? "#fff8da" : "#324c49"}
                  />
                )}
                <circle cx={x} cy={y} r="12" fill="transparent" />
              </g>
            );
          })}
        </svg>
        <div className="colonizer-resources">
          {resources.map((r, i) => (
            <label key={r}>
              <i style={{ background: land[i] }} />
              {r}
              <b>{hs[i]}</b>
              {state.phase === "discard" && (
                <input
                  aria-label={"Descartar " + r}
                  type="number"
                  min={0}
                  max={hs[i]}
                  value={discarded[i]}
                  onChange={(e) =>
                    setDiscarded((d) =>
                      d.map((v, j) => (i === j ? Number(e.target.value) : v)),
                    )
                  }
                />
              )}
              <small>Banco {state.bank[i]}</small>
            </label>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
