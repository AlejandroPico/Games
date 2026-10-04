import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import { useMatch, useMatchAI } from "../../shared/useMatch";
import { initial, reveal, flag, automatic } from "./rules";
export default function HexMines() {
  const [size, setSize] = useState(9),
    [density, setDensity] = useState(0.16),
    [flags, setFlags] = useState(false);
  const m = useMatch(() => initial(size, Math.floor(size * size * density)), 1),
    s = m.state;
  const ai = useMatchAI(m, 0, s.won || s.lost, automatic);
  return (
    <GameLayout
      id="buscaminas-hexagonal"
      started={m.started}
      onStart={m.start}
      onReset={m.reset}
      status={
        s.won
          ? "¡Campo despejado!"
          : s.lost
            ? "Una mina. Puedes volver a intentarlo."
            : `${s.flags.length} banderas · ${s.mines} minas`
      }
      rules="Cada hexágono tiene hasta seis vecinos. El número cuenta minas adyacentes, no diagonales de un tablero cuadrado."
      menu={
        <>
          <label>
            Tamaño
            <select value={size} onChange={(e) => setSize(+e.target.value)}>
              {[7, 9, 12, 16].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Densidad
            <select
              value={density}
              onChange={(e) => setDensity(+e.target.value)}
            >
              <option value={0.12}>Suave</option>
              <option value={0.16}>Normal</option>
              <option value={0.22}>Experta</option>
            </select>
          </label>
        </>
      }
      controls={
        <>
          <button aria-pressed={flags} onClick={() => setFlags(!flags)}>
            {flags ? "⚑ Marcar" : "Descubrir"}
          </button>
          <button onClick={() => m.setState(automatic)}>Paso de ayuda</button>
        </>
      }
    >
      <svg
        className="hex-mine-board"
        viewBox={`-1 -1 ${s.size * 1.5 + 1} ${s.size * 0.866 + 1}`}
        role="group"
        aria-label="Campo hexagonal"
      >
        {s.board.map((v, i) => {
          const r = Math.floor(i / s.size),
            c = i % s.size,
            x = c + r * 0.5,
            y = r * 0.866,
            opened = s.open.includes(i),
            mine = (s.lost && v === -1) || (opened && v === -1),
            mark = s.flags.includes(i);
          return (
            <g
              key={i}
              tabIndex={0}
              role="button"
              aria-label={`Casilla ${r + 1},${c + 1}: ${opened ? v : mark ? "bandera" : "oculta"}`}
              onClick={() => {
                if (!ai && m.started)
                  m.setState((z) => (flags ? flag(z, i) : reveal(z, i)));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!ai)
                    m.setState((z) => (flags ? flag(z, i) : reveal(z, i)));
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                if (!ai) m.setState((z) => flag(z, i));
              }}
            >
              <polygon
                points={`${x - 0.48},${y - 0.277} ${x},${y - 0.554} ${x + 0.48},${y - 0.277} ${x + 0.48},${y + 0.277} ${x},${y + 0.554} ${x - 0.48},${y + 0.277}`}
                className={mine ? "mine" : opened ? "open" : "closed"}
              />
              <text x={x} y={y + 0.12}>
                {mine ? "✹" : mark ? "⚑" : opened && v ? v : ""}
              </text>
            </g>
          );
        })}
      </svg>
    </GameLayout>
  );
}
