import { useState } from "react";
import GameLayout from "../../shared/GameLayout";
import CardColumns from "../../shared/CardColumns";
import CardFace from "../../shared/CardFace";
import { label, suits } from "../../shared/cards";
import { usePieceDrag } from "../../shared/usePieceDrag";
import {
  initial,
  moving,
  move,
  hint,
  type State,
  type Source,
  type Target,
} from "./rules";
export default function FreeCell() {
  const [state, setState] = useState(initial),
    [started, setStarted] = useState(false),
    [selected, setSelected] = useState<Source | null>(null),
    [history, setHistory] = useState<State[]>([]),
    [message, setMessage] = useState("");
  const win = state.foundations.every((f) => f.length === 13);
  const update = (n: State) => {
    setHistory((h) => [...h.slice(-99), state]);
    setState(n);
    setSelected(null);
    setMessage("");
  };
  const place = (t: Target) => {
    if (!selected) return;
    const n = move(state, selected, t);
    if (n) update(n);
    else
      setMessage(
        "Destino no válido o faltan espacios libres para trasladar el grupo.",
      );
  };
  const choose = (s: Source) => {
    if (drag.suppressClick()) return;
    if (selected && move(state, selected, { kind: s.kind, pile: s.pile })) {
      place({ kind: s.kind, pile: s.pile });
      return;
    }
    setSelected(moving(state, s).length ? s : null);
  };
  const auto = (source: Source) => {
    const cs = moving(state, source);
    if (cs.length !== 1) return;
    const n = move(state, source, { kind: "foundation", pile: cs[0].suit });
    if (n) update(n);
  };
  const drag = usePieceDrag<Source>({
    canDrag: (s) => started && !win && moving(state, s).length > 0,
    onStart: setSelected,
    elements: (s, e) =>
      s.kind === "column"
        ? [
            ...e.parentElement!.querySelectorAll<HTMLElement>(
              "[data-card-index]",
            ),
          ].filter((e) => Number(e.dataset.cardIndex) >= s.index)
        : [e],
    onDrop: (s, e) => {
      if (!e) return false;
      const n = move(state, s, {
        kind: e.dataset.drop as Target["kind"],
        pile: Number(e.dataset.pile),
      });
      if (!n) return false;
      update(n);
      return true;
    },
  });
  return (
    <GameLayout
      id="solitario-carta-blanca-freecell"
      started={started}
      onStart={() => {
        setState(initial());
        setStarted(true);
      }}
      onReset={() => {
        setStarted(false);
        setSelected(null);
        setHistory([]);
        setMessage("");
      }}
      status={
        win
          ? "¡Todas las cartas están en las bases!"
          : message || "Cuatro celdas libres para planificar tus movimientos."
      }
      stats={
        <span className="small-score">
          Bases {state.foundations.reduce((n, f) => n + f.length, 0)}/52
        </span>
      }
      controls={
        <>
          <button
            disabled={!history.length}
            onClick={() => {
              setState(history.at(-1)!);
              setHistory((h) => h.slice(0, -1));
              setSelected(null);
              setMessage("");
            }}
          >
            Deshacer
          </button>
          <button
            disabled={win}
            onClick={() => {
              const h = hint(state);
              if (h) {
                setSelected(h.source);
                setMessage(
                  "Mueve a " +
                    (h.target.kind === "foundation"
                      ? "base"
                      : h.target.kind === "cell"
                        ? "celda"
                        : "columna") +
                    " " +
                    (h.target.pile + 1) +
                    ".",
                );
              } else setMessage("No quedan movimientos: puedes deshacer.");
            }}
          >
            Pista
          </button>
        </>
      }
      rules="Carta Blanca (FreeCell): todas las cartas se ven en ocho columnas. Construye secuencias descendentes alternando colores. Las cuatro celdas libres admiten una carta cada una. Las bases crecen por palo del as al rey. Cualquier carta puede ocupar una columna vacía. Arrastra o selecciona una secuencia: solo se permite trasladarla si podría moverse carta a carta usando los espacios libres. Capacidad: (celdas vacías + 1) multiplicado por 2 por cada columna vacía auxiliar; el destino vacío no cuenta. Doble clic envía una carta a su base cuando es legal. Reparticiones aleatorias sin garantía de solución; pistas y deshacer."
    >
      <div className="card-solitaire-table freecell-table">
        <div className="freecell-top">
          {state.cells.map((c, p) => (
            <div key={"c" + p} data-drop="cell" data-pile={p}>
              {c ? (
                <button
                  {...drag.bind({ kind: "cell", pile: p, index: 0 })}
                  data-draggable=""
                  data-drop="cell"
                  data-pile={p}
                  disabled={!started || win}
                  aria-label={label(c) + " en celda " + (p + 1)}
                  className={
                    "table-card " +
                    (selected?.kind === "cell" && selected.pile === p
                      ? "selected"
                      : "")
                  }
                  onClick={() => choose({ kind: "cell", pile: p, index: 0 })}
                  onDoubleClick={() =>
                    auto({ kind: "cell", pile: p, index: 0 })
                  }
                >
                  <CardFace card={c} />
                </button>
              ) : (
                <button
                  className="card-slot"
                  aria-label={"Celda " + (p + 1) + " vacía"}
                  onClick={() => {
                    if (!drag.suppressClick()) place({ kind: "cell", pile: p });
                  }}
                >
                  ◇
                </button>
              )}
            </div>
          ))}
          {state.foundations.map((col, p) => {
            const c = col.at(-1);
            return (
              <div key={"f" + p} data-drop="foundation" data-pile={p}>
                {c ? (
                  <button
                    {...drag.bind({
                      kind: "foundation",
                      pile: p,
                      index: col.length - 1,
                    })}
                    data-draggable=""
                    data-drop="foundation"
                    data-pile={p}
                    disabled={!started || win}
                    className="table-card"
                    aria-label={label(c) + " en base"}
                    onClick={() =>
                      choose({
                        kind: "foundation",
                        pile: p,
                        index: col.length - 1,
                      })
                    }
                  >
                    <CardFace card={c} />
                  </button>
                ) : (
                  <button
                    className="card-slot"
                    aria-label={
                      "Base de " +
                      ["picas", "corazones", "diamantes", "tréboles"][p]
                    }
                    onClick={() => {
                      if (!drag.suppressClick())
                        place({ kind: "foundation", pile: p });
                    }}
                  >
                    {suits[p]}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <CardColumns
          columns={state.columns}
          bind={(p, i) => drag.bind({ kind: "column", pile: p, index: i })}
          canSelect={() => started && !win}
          selected={(p, i) =>
            selected?.kind === "column" &&
            selected.pile === p &&
            i >= selected.index
          }
          choose={(p, i) => choose({ kind: "column", pile: p, index: i })}
          auto={(p, i) => auto({ kind: "column", pile: p, index: i })}
          empty={(p) => {
            if (!drag.suppressClick()) place({ kind: "column", pile: p });
          }}
        />
      </div>
    </GameLayout>
  );
}
