import { useState, type ReactNode } from "react";
import GameLayout from "./GameLayout";
import { useMatch, useMatchAI, ScoreStrip, PlayerSelect } from "./useMatch";
import { usePieceDrag } from "./usePieceDrag";
import type { GameId } from "../games/registry";
export interface AbstractPosition {
  turn: number;
  winner: number | null;
  scores: number[];
  step: number;
  message: string;
}
export interface BoardCell {
  key: number;
  text: string;
  label: string;
  owner?: number;
  void?: boolean;
  bottom?: boolean;
  right?: boolean;
  color?: string;
  x?: number;
  y?: number;
}
export interface BoardAction {
  from: number;
  to: number;
  tool: number;
  label?: string;
}
export interface BoardEngine<T extends AbstractPosition> {
  initial: (players: number, size: number) => T;
  actions: (s: T) => BoardAction[];
  apply: (s: T, a: BoardAction) => T;
  automatic: (s: T) => T;
  board: (s: T) => {
    columns: number;
    cells: BoardCell[];
    hex?: boolean;
    graph?: {
      width: number;
      height: number;
      links: [number, number][];
      paths?: string[];
      radius?: number;
    };
  };
  tools: (s: T) => { key: number; label: string }[];
  preview?: (s: T, tool: number) => [number, number][];
  result?: (s: T) => string;
}
/** All legal moves are supplied by the independent engine, including special phases. */
export default function AbstractTable<T extends AbstractPosition>({
  id,
  engine,
  sizes = [0],
  choices = [2],
  detail,
  workerFactory,
}: {
  id: GameId;
  engine: BoardEngine<T>;
  sizes?: number[];
  choices?: number[];
  detail?: (s: T) => ReactNode;
  workerFactory?: () => Worker;
}) {
  const [size, setSize] = useState(sizes[0]),
    m = useMatch((n) => engine.initial(n, size), choices[0]),
    s = m.state;
  const ai = useMatchAI(
      m,
      s.turn,
      s.winner !== null,
      engine.automatic,
      workerFactory,
    ),
    [selected, select] = useState<number | null>(null),
    [tool, setTool] = useState(0);
  const all = engine.actions(s),
    tools = engine.tools(s),
    activeTool = tools.some((t) => t.key === tool)
      ? tool
      : (tools[0]?.key ?? 0);
  const possible = all.filter((a) => a.tool === activeTool),
    from =
      selected !== null && possible.some((a) => a.from === selected)
        ? selected
        : possible.length && possible.every((a) => a.from === possible[0].from)
          ? possible[0].from
          : -1;
  const targets = possible.filter((a) => a.from === from).map((a) => a.to),
    view = engine.board(s);
  const perform = (a: BoardAction) => {
    m.setState((x) => engine.apply(x, a));
    select(null);
  };
  const drag = usePieceDrag<number>({
    canDrag: (i) => m.started && !ai && possible.some((a) => a.from === i),
    onStart: select,
    onDrop: (i, e) => {
      const a = possible.find(
        (a) => a.from === i && a.to === Number(e?.dataset.drop),
      );
      if (a && e) {
        perform(a);
        return true;
      }
      return false;
    },
  });
  const click = (i: number) => {
    if (!m.started || ai || s.winner !== null || drag.suppressClick()) return;
    const a = possible.find((a) => a.from === from && a.to === i);
    if (a) perform(a);
    else select(possible.some((a) => a.from === i) ? i : null);
  };
  return (
    <GameLayout
      id={id}
      started={m.started}
      onStart={() => {
        select(null);
        setTool(0);
        m.start();
      }}
      onReset={m.reset}
      mode={m.mode}
      setMode={m.setMode}
      roomPlayers={m.players}
      roomTurn={s.turn}
      status={
        engine.result?.(s) ||
        (s.winner !== null
          ? s.winner < 0
            ? "Tablas"
            : `Gana J${s.winner + 1}`
          : `J${s.turn + 1} · ${s.message}`)
      }
      rules="Selecciona una acción y pulsa un destino iluminado. Consulta la guía para ver las reglas de esta edición."
      menu={
        <>
          <PlayerSelect
            choices={choices}
            value={m.players}
            onChange={m.setPlayers}
          />
          {sizes.length > 1 && (
            <label>
              Tamaño
              <select value={size} onChange={(e) => setSize(+e.target.value)}>
                {sizes.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          )}
          {m.seats}
        </>
      }
    >
      <div className="abstract-table">
        <ScoreStrip scores={s.scores} turn={s.turn} />
        <div className="abstract-controls">
          {tools.length > 0 && (
            <label>
              Acción{" "}
              <select
                aria-label="Tipo de acción"
                value={activeTool}
                onChange={(e) => {
                  setTool(+e.target.value);
                  select(null);
                }}
              >
                {tools.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {engine.preview && activeTool >= 0 && (
            <svg
              viewBox="0 0 55 55"
              width="55"
              height="55"
              role="img"
              aria-label="Forma y orientación de la pieza elegida"
            >
              {engine.preview(s, activeTool).map(([x, y], i) => (
                <rect
                  key={i}
                  x={x * 10 + 1}
                  y={y * 10 + 1}
                  width="9"
                  height="9"
                  fill="#5c9c94"
                  stroke="#365e59"
                />
              ))}
            </svg>
          )}
          {possible.some((a) => a.to < 0) && (
            <button
              disabled={ai || !m.started}
              onClick={() => perform(possible.find((a) => a.to < 0)!)}
            >
              {possible.find((a) => a.to < 0)?.label || "Pasar / avanzar"}
            </button>
          )}
          {detail?.(s)}
        </div>
        {view.graph ? (
          <svg
            className="traditional-graph"
            viewBox={`0 0 ${view.graph.width} ${view.graph.height}`}
            aria-label="Tablero de conexiones"
          >
            <rect
              width={view.graph.width}
              height={view.graph.height}
              fill="var(--board-paper, #ddc69e)"
            />
            {view.graph.links.map(([a, b], i) => {
              const p = view.cells.find((c) => c.key === a),
                q = view.cells.find((c) => c.key === b);
              return p && q ? (
                <line
                  key={i}
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  stroke="#86684c"
                  strokeWidth="2"
                />
              ) : null;
            })}
            {view.graph.paths?.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="#86684c"
                strokeWidth="2"
              />
            ))}
            {view.cells
              .filter((c) => !c.void)
              .map((c) => (
                <g
                  key={c.key}
                  role="button"
                  tabIndex={0}
                  data-drop={c.key}
                  aria-label={c.label}
                  {...drag.bind(c.key)}
                  onClick={() => click(c.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      click(c.key);
                    }
                  }}
                  className={
                    (targets.includes(c.key) ? "legal " : "") +
                    (selected === c.key ? "chosen " : "") +
                    (c.owner !== undefined ? "p" + (c.owner + 1) : "")
                  }
                >
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={view.graph!.radius || 13}
                    fill={
                      c.owner !== undefined
                        ? ["#437f82", "#b06458", "#9275a4", "#b29c4f"][
                            c.owner % 4
                          ]
                        : c.color || "#f1e1c6"
                    }
                    stroke={
                      selected === c.key
                        ? "#f7c543"
                        : targets.includes(c.key)
                          ? "#2c9b70"
                          : "#604c37"
                    }
                    strokeWidth={
                      targets.includes(c.key) || selected === c.key ? 4 : 1
                    }
                  />
                  <text
                    x={c.x}
                    y={(c.y || 0) + 4}
                    textAnchor="middle"
                    fill={c.owner !== undefined ? "#fff" : "#50432f"}
                    fontSize="12"
                    pointerEvents="none"
                  >
                    {c.text}
                  </text>
                </g>
              ))}
          </svg>
        ) : (
          <div
            className={"abstract-board " + (view.hex ? "hex-map" : "")}
            style={{
              gridTemplateColumns: `repeat(${view.columns},1fr)`,
              aspectRatio: `${view.columns}/${Math.ceil(view.cells.length / view.columns)}`,
            }}
          >
            {view.cells.map((c, i) => (
              <button
                key={i}
                data-drop={c.key}
                {...(!c.void ? drag.bind(c.key) : {})}
                style={{
                  borderBottom: c.bottom ? "4px solid #614f3a" : undefined,
                  borderRight: c.right ? "4px solid #614f3a" : undefined,
                  background: c.color,
                }}
                className={
                  (c.void ? "void " : "") +
                  (targets.includes(c.key) ? "legal " : "") +
                  (selected === c.key ? "chosen " : "") +
                  (c.owner !== undefined ? "p" + (c.owner + 1) : "")
                }
                disabled={c.void}
                aria-label={c.label}
                onClick={() => click(c.key)}
              >
                {c.text}
              </button>
            ))}
          </div>
        )}
        {m.started && s.winner === null && (
          <p className="table-message">
            {selected !== null ? "Elige un destino iluminado" : s.message}
          </p>
        )}
      </div>
    </GameLayout>
  );
}
