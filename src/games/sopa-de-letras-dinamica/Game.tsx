import { useState, useRef } from "react";
import GameLayout from "../../shared/GameLayout";
import { useMatch, useMatchAI } from "../../shared/useMatch";
import { initial, themes, find, automatic, trace } from "./rules";
export default function WordSearch() {
  const [n, setN] = useState(10),
    [theme, setTheme] = useState("Naturaleza"),
    [anchor, setAnchor] = useState<number | null>(null),
    [hover, setHover] = useState<number | null>(null),
    dragging = useRef(false),
    suppress = useRef(false);
  const m = useMatch(() => initial(n, theme), 1),
    s = m.state,
    won = s.found.length === s.words.length,
    ai = useMatchAI(m, 0, won, automatic);
  const finish = (a: number, b: number) => {
    m.setState((x) => find(x, a, b));
    setAnchor(null);
    setHover(null);
  };
  return (
    <GameLayout
      id="sopa-de-letras-dinamica"
      started={m.started}
      onStart={() => {
        setAnchor(null);
        m.start();
      }}
      onReset={m.reset}
      status={
        won
          ? "¡Todas las palabras encontradas!"
          : `${s.found.length} / ${s.words.length} palabras`
      }
      rules="Traza palabras en cualquiera de las ocho direcciones. El tablero se genera de nuevo al reiniciar."
      menu={
        <>
          <label>
            Tamaño
            <select value={n} onChange={(e) => setN(+e.target.value)}>
              {[8, 10, 12, 16].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Tema
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              {Object.keys(themes).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </>
      }
      controls={
        <button onClick={() => m.setState(automatic)}>
          Encontrar una palabra
        </button>
      }
    >
      <div className="wordsearch-table">
        <div
          className="letter-board"
          style={{ gridTemplateColumns: `repeat(${s.n},1fr)` }}
          onPointerUp={(e) => {
            if (!dragging.current) return;
            dragging.current = false;
            const target = document
              .elementFromPoint(e.clientX, e.clientY)
              ?.closest<HTMLElement>("[data-letter]");
            if (
              target &&
              anchor !== null &&
              +target.dataset.letter! !== anchor
            ) {
              finish(anchor, +target.dataset.letter!);
              suppress.current = true;
            }
          }}
        >
          {s.grid.map((c, i) => (
            <button
              key={i}
              data-letter={i}
              disabled={ai}
              className={
                s.found.some((f) => f.cells.includes(i))
                  ? "found"
                  : anchor !== null &&
                      hover !== null &&
                      trace(anchor, hover, s.n).includes(i)
                    ? "tracing"
                    : ""
              }
              aria-label={`Fila ${Math.floor(i / s.n) + 1}, columna ${(i % s.n) + 1}: ${c}`}
              onPointerDown={(e) => {
                if (e.pointerType === "mouse" && e.button !== 0) return;
                if (anchor === null) {
                  setAnchor(i);
                  setHover(i);
                }
                dragging.current = true;
              }}
              onPointerMove={(e) => {
                if (!dragging.current) return;
                const t = document
                  .elementFromPoint(e.clientX, e.clientY)
                  ?.closest<HTMLElement>("[data-letter]");
                if (t) setHover(+t.dataset.letter!);
              }}
              onClick={() => {
                if (suppress.current) {
                  suppress.current = false;
                  return;
                }
                if (anchor === null || anchor === i) {
                  setAnchor(i);
                  setHover(i);
                } else finish(anchor, i);
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="wordsearch-list">
          {s.words.map((w) => (
            <span
              key={w}
              className={s.found.some((f) => f.word === w) ? "done" : ""}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
