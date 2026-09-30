import { useEffect, useState } from "react";
import GameLayout from "../../shared/GameLayout";
import {
  initial,
  roll,
  move,
  legalMoves,
  bestMove,
  physical,
  offset,
  safe,
} from "./rules";
const colors = ["#e2b530", "#368acc", "#d96353", "#469b70"],
  names = ["Amarillo", "Azul", "Rojo", "Verde"];
const quadrant = [
  ...Array.from({ length: 8 }, (_, i) => [10, 18 - i]),
  ...Array.from({ length: 8 }, (_, i) => [11 + i, 10]),
  [18, 9],
];
const rotate = (x: number, y: number, q: number): number[] =>
  q === 0 ? [x, y] : rotate(y, 18 - x, q - 1);
const track = Array.from({ length: 68 }, (_, i) =>
  rotate(quadrant[i % 17][0], quadrant[i % 17][1], Math.floor(i / 17)),
);
const homes = [
  [13, 14],
  [14, 4],
  [4, 4],
  [4, 14],
];
const colorIndex = (p: number, n: number) => (n === 2 ? p * 2 : p);
function position(progress: number, p: number, n: number, t: number): number[] {
  const color = colorIndex(p, n);
  if (progress === -1)
    return [
      homes[color][0] + (t % 2) * 2,
      homes[color][1] + Math.floor(t / 2) * 2,
    ];
  if (progress >= 71)
    return rotate(8.5 + (t % 2), 8.5 + Math.floor(t / 2), color);
  if (progress >= 64) return rotate(9, 15 - (progress - 64), color);
  return track[physical(progress, p, n)!];
}
function die() {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return (n[0] % 6) + 1;
}
export default function Parchis() {
  const [players, setPlayers] = useState(4),
    [humans, setHumans] = useState(1),
    [state, setState] = useState(() => initial()),
    [started, setStarted] = useState(false);
  const ai = started && state.turn >= humans && state.phase !== "over",
    legal = legalMoves(state);
  useEffect(() => {
    if (!ai) return;
    const timer = setTimeout(
      () =>
        setState((s) =>
          s.phase === "roll" ? roll(s, die()) : move(s, bestMove(s)!),
        ),
      600,
    );
    return () => clearTimeout(timer);
  }, [state, ai]);
  const label = names[colorIndex(state.turn, state.players)];
  return (
    <GameLayout
      id="ludo"
      started={started}
      onStart={() => {
        setState(initial(players));
        setStarted(true);
      }}
      onReset={() => setStarted(false)}
      menu={
        <>
          <label className="field-label">
            Colores en juego
            <select
              value={players}
              onChange={(e) => {
                const v = Number(e.target.value);
                setPlayers(v);
                setHumans((h) => Math.min(h, v));
              }}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </label>
          <label className="field-label">
            Jugadores humanos
            <select
              value={humans}
              onChange={(e) => setHumans(Number(e.target.value))}
            >
              {Array.from({ length: players }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                  {i + 1 === players ? " · todos locales" : ""}
                </option>
              ))}
            </select>
          </label>
          <p className="setup-note">
            Los humanos controlan los primeros colores; los demás son IA.
          </p>
        </>
      }
      status={
        state.phase === "over"
          ? "Gana " + names[colorIndex(state.winner!, state.players)]
          : label + (ai ? " · IA" : "") + " · " + state.message
      }
      controls={
        <>
          <span className="parchis-die" aria-label={"Dado: " + state.die}>
            {state.die ? ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][state.die] : "—"}
          </span>
          <button
            className="primary"
            disabled={ai || state.phase !== "roll"}
            onClick={() => setState(roll(state, die()))}
          >
            Tirar dado
          </button>
          {state.phase === "move" && (
            <span>
              {state.bonus
                ? "Premio: " + state.steps + " casillas"
                : "Mueve " + state.steps + " casillas"}
            </span>
          )}
        </>
      }
      rules="Parchís individual de un dado, 2–4 colores y cuatro fichas en casa. Un 5 obliga a sacar ficha si es posible. El 6 repite, obliga a abrir una barrera propia si puedes y cuenta 7 cuando no quedan fichas en casa. Dos fichas del mismo color forman una barrera que nadie puede atravesar. Los seguros permiten compartir casilla sin comer. En salida, una ficha nueva captura al rival si hay dos fichas; si hay dos rivales, se captura el último llegado. Comer da 20 y llegar a meta da 10 con otra ficha. Se necesita tirada exacta. El tercer 6 devuelve la ficha movida en el segundo 6, salvo que esté en el pasillo o meta. Gana el primer color que lleva las cuatro a meta."
    >
      <div className="parchis-board">
        <svg viewBox="-1 -1 21 21" aria-hidden="true">
          <rect x="-1" y="-1" width="21" height="21" fill="#f4f1e8" />
          {homes.map(([x, y], p) => (
            <g key={p}>
              <rect
                x={x - 1.5}
                y={y - 1.5}
                width="6"
                height="6"
                fill={colors[p]}
                fillOpacity=".25"
                stroke={colors[p]}
                strokeWidth=".05"
              />
              <text
                x={x + 1.5}
                y={y - 1.8}
                textAnchor="middle"
                fontSize=".55"
                fill={colors[p]}
              >
                {names[p]}
              </text>
            </g>
          ))}
          {track.map(([x, y], i) => (
            <g key={i}>
              <rect
                x={x - 0.48}
                y={y - 0.48}
                width=".96"
                height=".96"
                fill={i % 17 === 0 ? colors[Math.floor(i / 17)] : "#fffdf5"}
                stroke="#8a877b"
                strokeWidth=".025"
              />
              {safe.has(i) && (
                <circle
                  cx={x}
                  cy={y}
                  r=".23"
                  fill="none"
                  stroke="#a6a194"
                  strokeWidth=".03"
                />
              )}
              <text
                x={x}
                y={y + 0.15}
                textAnchor="middle"
                fontSize=".3"
                fill="#6d6a61"
              >
                {((i + 4) % 68) + 1}
              </text>
            </g>
          ))}
          {Array.from({ length: 4 }, (_, p) =>
            Array.from({ length: 7 }, (_, i) => {
              const [x, y] = rotate(9, 15 - i, p);
              return (
                <rect
                  key={p + "-" + i}
                  x={x - 0.45}
                  y={y - 0.45}
                  width=".9"
                  height=".9"
                  fill={colors[p]}
                  fillOpacity=".5"
                  stroke="#8a877b"
                  strokeWidth=".025"
                />
              );
            }),
          )}
        </svg>
        {state.tokens.flatMap((row, p) =>
          row.map((v, t) => {
            const [x, y] = position(v, p, state.players, t),
              same = row.filter((a) => a === v).length;
            const shift =
              v >= 0 && v < 71 && same > 1
                ? row.slice(0, t).filter((a) => a === v).length
                  ? 0.16
                  : -0.16
                : 0;
            return (
              <button
                key={p + "-" + t}
                className={
                  "parchis-token " +
                  (state.turn === p && legal.includes(t) ? "legal" : "")
                }
                style={{
                  left: ((x + 1 + shift) / 21) * 100 + "%",
                  top: ((y + 1) / 21) * 100 + "%",
                  background: colors[colorIndex(p, state.players)],
                }}
                aria-label={
                  names[colorIndex(p, state.players)] +
                  " ficha " +
                  (t + 1) +
                  ", " +
                  (v === -1 ? "en casa" : v === 71 ? "en meta" : "avance " + v)
                }
                disabled={
                  !started || ai || state.turn !== p || !legal.includes(t)
                }
                onClick={() => setState(move(state, t))}
              >
                {t + 1}
              </button>
            );
          }),
        )}
      </div>
    </GameLayout>
  );
}
