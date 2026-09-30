import { useEffect, useState } from "react";
import { Flag, Lightbulb, MousePointer2 } from "lucide-react";
import GameLayout from "../../shared/GameLayout";
import { empty, generate, reveal, chord, won, hint } from "./rules";
export default function Minesweeper() {
  const [size, setSize] = useState(9),
    [mines, setMines] = useState(10),
    [cells, setCells] = useState(() => empty(9)),
    [started, setStarted] = useState(false),
    [generated, setGenerated] = useState(false),
    [flagMode, setFlagMode] = useState(false),
    [message, setMessage] = useState(""),
    [seconds, setSeconds] = useState(0);
  const lost = cells.some((c) => c.mine && c.open),
    win = generated && won(cells),
    over = lost || win,
    flags = cells.filter((c) => c.flag).length;
  useEffect(() => {
    if (!started || !generated || over) return;
    const timer = setInterval(() => setSeconds((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [started, generated, over]);
  const open = (i: number) => {
    if (!started || over) return;
    if (flagMode && !cells[i].open) {
      flag(i);
      return;
    }
    if (cells[i].flag) return;
    let next = cells;
    if (!generated) {
      next = generate(size, mines, i);
      next = next.map((c, j) => ({ ...c, flag: cells[j].flag }));
      setGenerated(true);
    }
    setCells(next[i].open ? chord(next, i, size) : reveal(next, i, size));
    setMessage("");
  };
  const flag = (i: number) => {
    if (!started || over || cells[i].open) return;
    setCells((c) => c.map((v, j) => (j === i ? { ...v, flag: !v.flag } : v)));
  };
  const help = () => {
    if (!generated) {
      const index = Math.floor((size * size) / 2);
      const next = generate(size, mines, index).map((c, j) => ({
        ...c,
        flag: j === index ? false : cells[j].flag,
      }));
      setCells(reveal(next, index, size));
      setGenerated(true);
      setMessage("Una apertura segura para empezar.");
      return;
    }
    const h = hint(cells, size);
    if (!h) {
      setMessage(
        "No hay una deducción sencilla segura con las banderas actuales. Revisa los números.",
      );
      return;
    }
    if (h.type === "mine") {
      flag(h.index);
      setMessage("Los números indican una mina: la hemos marcado.");
    } else {
      setCells(reveal(cells, h.index, size));
      setMessage(
        "Las banderas cubren ese número: sus otras casillas son seguras, si están bien marcadas.",
      );
    }
  };
  return (
    <GameLayout
      id="minesweeper"
      started={started}
      onStart={() => {
        setCells(empty(size));
        setStarted(true);
      }}
      onReset={() => {
        setCells(empty(size));
        setStarted(false);
        setGenerated(false);
        setSeconds(0);
        setMessage("");
      }}
      menu={
        <label className="field-label">
          Tamaño del reto
          <select
            value={size}
            onChange={(e) => {
              const n = Number(e.target.value);
              setSize(n);
              setMines(n === 9 ? 10 : n === 12 ? 24 : 40);
              setCells(empty(n));
            }}
          >
            <option value={9}>Principiante · 9×9 · 10 minas</option>
            <option value={12}>Intermedio · 12×12 · 24 minas</option>
            <option value={16}>Experto · 16×16 · 40 minas</option>
          </select>
        </label>
      }
      status={
        lost
          ? "Has encontrado una mina."
          : win
            ? "¡Campo despejado!"
            : message || "Busca todas las casillas seguras."
      }
      stats={
        <div className="score-pair">
          <span>
            Banderas{" "}
            <b>
              {flags}/{mines}
            </b>
          </span>
          <span>
            Tiempo <b>{seconds}s</b>
          </span>
        </div>
      }
      controls={
        <>
          <div className="segmented">
            <button
              className={!flagMode ? "active" : ""}
              onClick={() => setFlagMode(false)}
            >
              <MousePointer2 size={14} /> Abrir
            </button>
            <button
              className={flagMode ? "active" : ""}
              onClick={() => setFlagMode(true)}
            >
              <Flag size={14} /> Marcar
            </button>
          </div>
          <button disabled={over} className="secondary full" onClick={help}>
            <Lightbulb size={15} /> Una pista lógica
          </button>
        </>
      }
      rules="Abre todas las casillas sin minas. Los números indican minas en las ocho casillas vecinas. El primer clic y su entorno están libres de minas. Usa clic derecho o el modo Marcar para banderas. Toca un número abierto con todas sus minas marcadas para abrir sus vecinos; las banderas incorrectas pueden hacerte perder. Las pistas deducen a partir de números y banderas, sin mirar minas ocultas."
    >
      <div className="mine-wrap">
        <div
          className="mine-board"
          data-size={size}
          style={{ gridTemplateColumns: "repeat(" + size + ",1fr)" }}
        >
          {cells.map((c, i) => (
            <button
              key={i}
              aria-label={
                "Fila " +
                (Math.floor(i / size) + 1) +
                ", columna " +
                ((i % size) + 1) +
                ": " +
                (c.flag
                  ? "bandera"
                  : c.open
                    ? c.mine
                      ? "mina"
                      : c.number + " minas vecinas"
                    : "cerrada")
              }
              disabled={!started || over}
              className={
                (c.open ? "open" : "") +
                (c.mine && lost ? " exploded" : "") +
                " n" +
                (c.open ? c.number : 0)
              }
              onClick={() => open(i)}
              onContextMenu={(e) => {
                e.preventDefault();
                flag(i);
              }}
            >
              {c.flag ? (
                <Flag size={14} />
              ) : c.mine && lost ? (
                "✦"
              ) : c.open && c.number ? (
                c.number
              ) : (
                ""
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="stage-caption">
        {mines} minas. Cada número es una pista.
      </div>
    </GameLayout>
  );
}
