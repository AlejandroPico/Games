import { useObservation } from "../../shared/Observation";
import { useAI } from "../../shared/useAI";
import Worker from "./ai.worker?worker";
import { publicKey } from "./autoplay";
import { useMemo, useState } from "react";
import GameLayout from "../../shared/GameLayout";
import CardColumns from "../../shared/CardColumns";
import { usePieceDrag } from "../../shared/usePieceDrag";
import {
  initial,
  moving,
  move,
  deal,
  hint,
  type State,
  type Source,
} from "./rules";
export default function Spider() {
  const { watching } = useObservation();
  const [visited, setVisited] = useState<string[]>([]);
  const [state, setState] = useState(() => initial()),
    [suits, setSuits] = useState<1 | 2 | 4>(1),
    [started, setStarted] = useState(false),
    [selected, setSelected] = useState<Source | null>(null),
    [history, setHistory] = useState<State[]>([]),
    [message, setMessage] = useState("");
  const win = state.completed === 8;
  const update = (n: State) => {
    setHistory((h) => [...h.slice(-99), state]);
    setState(n);
    setSelected(null);
    setMessage("");
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
  const place = (pile: number) => {
    if (!selected) return;
    const n = move(state, selected, pile);
    if (n) update(n);
    else setMessage("Necesitas una carta un punto mayor o una columna vacía.");
  };
  const choose = (pile: number, index: number) => {
    if (drag.suppressClick()) return;
    if (selected && selected.pile !== pile && move(state, selected, pile)) {
      place(pile);
      return;
    }
    setSelected(moving(state, { pile, index }).length ? { pile, index } : null);
  };
  const drag = usePieceDrag<Source>({
    canDrag: (s) => started && !win && moving(state, s).length > 0,
    onStart: setSelected,
    elements: (s, e) =>
      [
        ...e.parentElement!.querySelectorAll<HTMLElement>("[data-card-index]"),
      ].filter((e) => Number(e.dataset.cardIndex) >= s.index),
    onDrop: (s, e) => {
      if (!e) return false;
      const n = move(state, s, Number(e.dataset.pile));
      if (!n) return false;
      update(n);
      return true;
    },
  });
  return (
    <GameLayout
      id="solitario-spider"
      started={started}
      onStart={() => {
        setVisited([]);
        setState(initial(suits));
        setStarted(true);
      }}
      onReset={() => {
        setVisited([]);
        setStarted(false);
        setSelected(null);
        setHistory([]);
        setMessage("");
      }}
      menu={
        <label className="field-label">
          Palos
          <select
            value={suits}
            onChange={(e) => setSuits(Number(e.target.value) as 1 | 2 | 4)}
          >
            <option value={1}>Un palo · iniciación</option>
            <option value={2}>Dos palos · intermedio</option>
            <option value={4}>Cuatro palos · clásico</option>
          </select>
        </label>
      }
      status={
        win
          ? "¡Has completado todas las secuencias!"
          : message || "Forma secuencias del rey al as del mismo palo."
      }
      stats={
        <span className="small-score">Secuencias {state.completed}/8</span>
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
                setMessage("Mueve la selección a columna " + (h.to + 1) + ".");
              } else
                setMessage(
                  state.stock.length
                    ? "Reparte otra fila cuando no haya columnas vacías."
                    : "No hay movimientos útiles: puedes deshacer.",
                );
            }}
          >
            Pista
          </button>
          <button
            disabled={win || !state.stock.length}
            onClick={() => {
              const n = deal(state);
              if (n) update(n);
              else setMessage("Ocupa todas las columnas antes de repartir.");
            }}
          >
            Repartir · {state.stock.length / 10}
          </button>
        </>
      }
      rules="Spider utiliza dos barajas y diez columnas. Ordena del rey al as. Una carta puede descansar sobre otra de valor inmediatamente superior, aunque el palo sea distinto; para arrastrar una secuencia sus cartas deben ser descendentes del mismo palo. Cualquier carta o secuencia válida puede ocupar una columna vacía. Al completar rey–as del mismo palo se retira la secuencia y se descubre la carta inferior. Repartir añade una carta por columna: no puede haber columnas vacías. Completa ocho secuencias. Las reparticiones son aleatorias y no se garantiza solución. Pistas de movimientos legales y deshacer disponibles."
    >
      <div className="card-solitaire-table spider-table">
        <div className="spider-goal">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className={i < state.completed ? "done" : ""}>
              K → A
            </span>
          ))}
        </div>
        <CardColumns
          columns={state.columns}
          bind={(p, i) => drag.bind({ pile: p, index: i })}
          canSelect={(_, i) => started && !win && i >= 0}
          selected={(p, i) => selected?.pile === p && i >= selected.index}
          choose={choose}
          empty={(p) => {
            if (!drag.suppressClick()) place(p);
          }}
        />
      </div>
    </GameLayout>
  );
}
