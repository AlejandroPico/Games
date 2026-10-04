import { useState } from "react";
import type { GameId } from "../games/registry";
import GameLayout from "./GameLayout";
import Overlay from "./Overlay";
import { useMatch, useMatchAI } from "./useMatch";
export interface LogicPosition {
  turn: number;
  winner: number | null;
  step: number;
  message: string;
  size: number;
}
export interface LogicCell {
  key: number;
  label: string;
  text: string;
  action?: string;
  kind?: string;
  top?: string;
  left?: string;
}
export interface LogicView {
  columns: number;
  cells: LogicCell[];
  notes: string[];
  tools?: { key: string; label: string }[];
  graph?: {
    width: number;
    height: number;
    nodes: {
      key: number;
      x: number;
      y: number;
      text: string;
      action?: string;
    }[];
    edges: { from: number; to: number; count: number; action?: string }[];
  };
}
export interface LogicEngine<T extends LogicPosition> {
  initial: (size: number) => T;
  apply: (s: T, key: string) => T;
  automatic: (s: T) => T;
  view: (s: T, tool: string) => LogicView;
}
export default function LogicTable<T extends LogicPosition>({
  id,
  engine,
  sizes,
  workerFactory,
}: {
  id: GameId;
  engine: LogicEngine<T>;
  sizes: number[];
  workerFactory: () => Worker;
}) {
  const [size, setSize] = useState(sizes[0]),
    [tool, setTool] = useState("1"),
    [details, setDetails] = useState(false);
  const m = useMatch(() => engine.initial(size), 1),
    s = m.state;
  const ai = useMatchAI(
      m,
      0,
      s.winner !== null,
      engine.automatic,
      workerFactory,
    ),
    v = engine.view(s, tool);
  const act = (key: string) => {
    if (m.started && !ai && s.winner === null)
      m.setState((x) => engine.apply(x, key));
  };
  return (
    <GameLayout
      id={id}
      started={m.started}
      onStart={() => {
        setTool("1");
        setDetails(false);
        m.start();
      }}
      onReset={m.reset}
      status={
        s.winner !== null
          ? "Resuelto · Nueva partida conserva tus ajustes"
          : `${s.message} · ${s.step} movimientos`
      }
      rules="Selecciona un tamaño y consulta las reglas y los ejemplos en la guía. La IA resuelve a partir de las pistas públicas."
      menu={
        <label>
          Tamaño / nivel
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {sizes.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      }
    >
      <div
        className="logic-table"
        onKeyDown={(e) => {
          if (v.tools?.some((t) => t.key === e.key.toUpperCase()))
            setTool(e.key.toUpperCase());
        }}
      >
        {v.tools && (
          <div className="logic-tools" aria-label="Herramientas">
            {v.tools.map((t) => (
              <button
                key={t.key}
                aria-pressed={
                  (v.tools?.some((t) => t.key === tool)
                    ? tool
                    : v.tools?.[0]?.key) === t.key
                }
                onClick={() => setTool(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        {v.graph ? (
          <svg
            className="logic-graph"
            viewBox={`-25 -25 ${v.graph.width + 50} ${v.graph.height + 50}`}
            role="group"
            aria-label="Islas y puentes"
          >
            {v.graph.edges.map((e, i) => {
              const a = v.graph!.nodes.find((n) => n.key === e.from)!,
                b = v.graph!.nodes.find((n) => n.key === e.to)!,
                dy = a.y === b.y ? 4 : 0,
                dx = a.x === b.x ? 4 : 0;
              return (
                <g key={i}>
                  {[0, ...(e.count === 2 ? [1] : [])].map((j) => (
                    <line
                      key={j}
                      x1={a.x + (j ? dx : -dx)}
                      y1={a.y + (j ? dy : -dy)}
                      x2={b.x + (j ? dx : -dx)}
                      y2={b.y + (j ? dy : -dy)}
                      stroke={e.count ? "var(--accent)" : "currentColor"}
                      strokeOpacity={e.count ? 1 : 0.12}
                      strokeWidth={e.count ? 4 : 1}
                    />
                  ))}
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="transparent"
                    strokeWidth="22"
                    role="button"
                    tabIndex={0}
                    aria-label={`Puente entre isla ${e.from + 1} e isla ${e.to + 1}, ${e.count}`}
                    onClick={() => e.action && act(e.action)}
                    onKeyDown={(k) => {
                      if (k.key === "Enter" || k.key === " ") {
                        k.preventDefault();
                        e.action && act(e.action);
                      }
                    }}
                  />
                </g>
              );
            })}
            {v.graph.nodes.map((n) => (
              <g key={n.key}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={17}
                  fill="var(--paper)"
                  stroke="var(--accent)"
                />
                <text
                  x={n.x}
                  y={n.y + 6}
                  textAnchor="middle"
                  fill="currentColor"
                >
                  {n.text}
                </text>
              </g>
            ))}
          </svg>
        ) : (
          <div
            className="logic-grid"
            style={{
              gridTemplateColumns: `repeat(${v.columns},minmax(0,1fr))`,
            }}
            aria-label="Tablero del puzle"
          >
            {v.cells.map((c) => (
              <button
                key={c.key}
                className={`logic-cell ${c.kind || ""}`}
                disabled={!c.action || ai || !m.started || s.winner !== null}
                aria-label={c.label}
                onClick={() => c.action && act(c.action)}
              >
                {c.top && <small className="clue-top">↓{c.top}</small>}
                {c.left && <small className="clue-left">→{c.left}</small>}
                <span>{c.text}</span>
              </button>
            ))}
          </div>
        )}
        <div className="logic-notes">
          {v.notes
            .slice(0, id === "crucigramas-interactivos" ? 5 : 2)
            .map((n, i) => (
              <p key={i}>{n}</p>
            ))}
          <button onClick={() => setDetails(true)}>Pistas y detalles</button>
        </div>
        {details && (
          <Overlay title="Pistas y detalles" onClose={() => setDetails(false)}>
            <div className="logic-notes">
              {v.notes.map((n, i) => (
                <p key={i}>{n}</p>
              ))}
            </div>
          </Overlay>
        )}
      </div>
    </GameLayout>
  );
}
