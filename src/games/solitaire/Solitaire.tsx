import { useObservation } from "../../shared/Observation";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
import { publicKey } from "./autoplay";
import { useMemo, useState } from "react";
import { RotateCcw, Lightbulb } from "lucide-react";
import GameLayout from "../../shared/GameLayout";
import { usePieceDrag } from "../../shared/usePieceDrag";
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
  const { watching } = useObservation();
  const [visited, setVisited] = useState<string[]>([]);
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
  const input = useMemo(() => ({ state, visited }), [state, visited]);
  useAI(Worker, input, started && watching && !win, (n: State | null) => {
    if (n) {
      setVisited((v) => [...v, publicKey(state)].slice(-1500));
      update(n);
    } else
      setMessage(
        "La IA se ha detenido: no encuentra una continuación nueva. Puedes iniciar otra partida.",
      );
  });
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
  const drag = usePieceDrag<Source>({
    canDrag: (source) => started && !win && moving(state, source).length > 0,
    elements: (source, element) =>
      source.kind === "column"
        ? [
            ...element.parentElement!.querySelectorAll<HTMLElement>(
              "[data-card-index]",
            ),
          ].filter((e) => Number(e.dataset.cardIndex) >= source.index)
        : [element],
    onDrop: (source, element) => {
      if (!element) return false;
      const target = {
        kind: element.dataset.drop as Target["kind"],
        pile: Number(element.dataset.pile),
      };
      const next = move(state, source, target);
      if (!next) return false;
      update(next);
      return true;
    },
  });
  const card = (c: Card, source: Source, offset?: number) => (
    <button
      key={source.index}
      {...drag.bind(source)}
      data-draggable={c.up ? "" : undefined}
      data-card-index={source.index}
      data-drop={
        source.kind === "column" || source.kind === "foundation"
          ? source.kind
          : undefined
      }
      data-pile={source.pile}
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
      style={
        offset !== undefined
          ? { top: "calc(var(--card-step) * " + offset / 25 + ")" }
          : undefined
      }
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
      onClick={() => {
        if (!drag.suppressClick()) choose(source);
      }}
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
        setVisited([]);
        setState(initial(draw));
        setStarted(true);
      }}
      onReset={() => {
        setVisited([]);
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
      rules="Solitario Klondike: forma columnas descendentes alternando rojo y negro. Puedes mover secuencias descubiertas completas y solo un rey puede ocupar una columna vacía. Las bases se construyen por palo, del as al rey. Arrastra una carta o secuencia hasta su destino, o haz clic en la selección y después en el destino; doble clic envía una carta a su base cuando es posible. El mazo roba una o tres cartas y se puede reciclar sin límite. Las cartas de base pueden volver al tablero. Algunas reparticiones no tienen solución."
    >
      <div
        className="solitaire-table"
        style={
          {
            "--max-stack": Math.max(7, ...state.columns.map((c) => c.length)),
          } as React.CSSProperties
        }
      >
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
            <div
              key={pile}
              className="foundation-pile"
              data-drop="foundation"
              data-pile={pile}
            >
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
                  onClick={() => {
                    if (!drag.suppressClick())
                      place({ kind: "foundation", pile });
                  }}
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
              data-drop="column"
              data-pile={pile}
              style={{
                height:
                  "calc(var(--card-height) + var(--card-step) * " +
                  (col.length - 1) +
                  ")",
              }}
            >
              <button
                disabled={!started}
                className="card-placeholder"
                aria-label={"Columna " + (pile + 1) + " vacía"}
                onClick={() => {
                  if (!drag.suppressClick()) place({ kind: "column", pile });
                }}
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
