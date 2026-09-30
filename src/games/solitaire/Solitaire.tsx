import { useState } from "react";
import { RotateCcw, Lightbulb } from "lucide-react";
import GameLayout from "../../shared/GameLayout";
import {
  initial,
  drawCards,
  move,
  moving,
  hint,
  won,
  red,
  type State,
  type Source,
  type Target,
  type Card,
} from "./rules";
const suits = ["♠", "♥", "♦", "♣"],
  rank = (n: number) =>
    (({ 1: "A", 11: "J", 12: "Q", 13: "K" }) as Record<number, string>)[n] || n;
export default function Solitaire() {
  const [state, setState] = useState<State>(initial),
    [started, setStarted] = useState(false),
    [draw, setDraw] = useState<1 | 3>(1),
    [selected, setSelected] = useState<Source | null>(null),
    [history, setHistory] = useState<State[]>([]),
    [message, setMessage] = useState(""),
    [moves, setMoves] = useState(0);
  const win = won(state);
  const update = (next: State) => {
    setHistory((h) => [...h, state].slice(-100));
    setState(next);
    setSelected(null);
    setMessage("");
    setMoves((m) => m + 1);
  };
  const place = (target: Target) => {
    if (!selected) return;
    const next = move(state, selected, target);
    if (next) update(next);
    else setMessage("Esa pila no admite las cartas seleccionadas.");
  };
  const choose = (source: Source) => {
    if (!started || win) return;
    if (
      selected &&
      source.kind === "column" &&
      (selected.kind !== "column" || selected.pile !== source.pile)
    ) {
      const next = move(state, selected, { kind: "column", pile: source.pile });
      if (next) {
        update(next);
        return;
      }
    }
    if (selected && source.kind === "foundation") {
      place({ kind: "foundation", pile: source.pile });
      return;
    }
    if (moving(state, source).length) setSelected(source);
  };
  const auto = (source: Source) => {
    const cards = moving(state, source);
    if (cards.length !== 1) return;
    const next = move(state, source, {
      kind: "foundation",
      pile: cards[0].suit,
    });
    if (next) update(next);
  };
  const help = () => {
    const h = hint(state);
    if (!h) {
      setMessage(
        "No encontramos más movimientos. Puedes deshacer o probar otra partida.",
      );
      return;
    }
    if (typeof h === "string") {
      setMessage(
        h === "draw"
          ? "Roba cartas del mazo."
          : "Recicla el descarte para volver a recorrer el mazo.",
      );
      return;
    }
    setSelected(h.source);
    setMessage(
      "Mueve la selección a " +
        (h.target.kind === "foundation"
          ? "la base de " + suits[h.target.pile]
          : "la columna " + (h.target.pile + 1)) +
        ".",
    );
  };
  const card = (c: Card, source: Source, offset?: number) => (
    <button
      key={source.index}
      disabled={!started || !c.up || win}
      className={
        "playing-card " +
        (red(c) ? "red" : "black") +
        (!c.up ? " face-down" : "") +
        (selected?.kind === source.kind &&
        selected.pile === source.pile &&
        selected.index <= source.index
          ? " selected"
          : "")
      }
      style={offset !== undefined ? { top: offset + "px" } : undefined}
      aria-label={
        c.up
          ? rank(c.rank) +
            " de " +
            ["picas", "corazones", "diamantes", "tréboles"][c.suit] +
            " en " +
            (source.kind === "column"
              ? "columna " + (source.pile + 1)
              : source.kind === "waste"
                ? "descarte"
                : "base")
          : "Carta boca abajo"
      }
      onClick={() => choose(source)}
      onDoubleClick={() => auto(source)}
    >
      {c.up ? (
        <>
          <span className="card-index">
            {rank(c.rank)}
            <small>{suits[c.suit]}</small>
          </span>
          <span className="card-suit">{suits[c.suit]}</span>
          <span className="card-index bottom">
            {rank(c.rank)}
            <small>{suits[c.suit]}</small>
          </span>
        </>
      ) : (
        <span>g.</span>
      )}
    </button>
  );
  return (
    <GameLayout
      id="solitaire"
      started={started}
      onStart={() => {
        setState(initial(draw));
        setStarted(true);
      }}
      onReset={() => {
        setState(initial(draw));
        setStarted(false);
        setSelected(null);
        setHistory([]);
        setMoves(0);
        setMessage("");
      }}
      menu={
        <label className="field-label">
          Robo de cartas
          <select
            value={draw}
            onChange={(e) => setDraw(Number(e.target.value) as 1 | 3)}
          >
            <option value={1}>Una carta · clásico</option>
            <option value={3}>Tres cartas · más exigente</option>
          </select>
        </label>
      }
      status={
        win
          ? "¡Las cuatro bases están completas!"
          : message || "Construye tus cuatro bases."
      }
      stats={
        <div className="score-pair">
          <span>
            En las bases{" "}
            <b>{state.foundations.reduce((n, f) => n + f.length, 0)}/52</b>
          </span>
          <span>
            Jugadas <b>{moves}</b>
          </span>
        </div>
      }
      controls={
        <div className="game-actions">
          <button
            disabled={!history.length}
            onClick={() => {
              setState(history.at(-1)!);
              setHistory((h) => h.slice(0, -1));
              setSelected(null);
              setMoves((m) => Math.max(0, m - 1));
              setMessage("");
            }}
          >
            <RotateCcw size={15} /> Deshacer
          </button>
          <button disabled={win} onClick={help}>
            <Lightbulb size={15} /> Pista
          </button>
        </div>
      }
      rules="Solitario Klondike: forma columnas descendentes alternando rojo y negro. Puedes mover secuencias descubiertas completas y solo un rey puede ocupar una columna vacía. Las bases se construyen por palo, del as al rey. Haz clic en una carta o secuencia y luego en su destino; doble clic envía una carta a su base cuando es posible. El mazo roba una o tres cartas y se puede reciclar sin límite. Las cartas de base pueden volver al tablero. Algunas reparticiones no tienen solución."
    >
      <div className="solitaire-table">
        <div className="solitaire-top">
          <div>
            <button
              className={
                "stock-pile " + (state.stock.length ? "face-down" : "")
              }
              disabled={
                !started || win || (!state.stock.length && !state.waste.length)
              }
              aria-label={
                state.stock.length
                  ? "Robar " + draw + " carta" + (draw === 3 ? "s" : "")
                  : "Reciclar descarte"
              }
              onClick={() => update(drawCards(state))}
            >
              {state.stock.length ? <span>g.</span> : <RotateCcw size={24} />}
              <small>{state.stock.length}</small>
            </button>
          </div>
          <div className="waste-pile">
            {state.waste.length ? (
              card(state.waste.at(-1)!, {
                kind: "waste",
                pile: 0,
                index: state.waste.length - 1,
              })
            ) : (
              <span className="card-placeholder">Descarte</span>
            )}
          </div>
          <div className="spacer" />
          {state.foundations.map((f, pile) => (
            <div key={pile} className="foundation-pile">
              {f.length ? (
                card(f.at(-1)!, {
                  kind: "foundation",
                  pile,
                  index: f.length - 1,
                })
              ) : (
                <button
                  disabled={!started}
                  className="card-placeholder"
                  aria-label={
                    "Base de " +
                    ["picas", "corazones", "diamantes", "tréboles"][pile]
                  }
                  onClick={() => place({ kind: "foundation", pile })}
                >
                  {suits[pile]}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="solitaire-columns">
          {state.columns.map((col, pile) => (
            <div
              key={pile}
              className="solitaire-column"
              style={{
                minHeight: Math.max(145, (col.length - 1) * 25 + 110) + "px",
              }}
            >
              <button
                disabled={!started}
                className="card-placeholder"
                aria-label={"Columna " + (pile + 1) + " vacía"}
                onClick={() => place({ kind: "column", pile })}
              >
                K
              </button>
              {col.map((c, index) =>
                card(c, { kind: "column", pile, index }, index * 25),
              )}
            </div>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
